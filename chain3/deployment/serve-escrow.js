const xrpl = require("xrpl");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { keccak256 } = require("ethers");
require("dotenv").config();

class XRPLEscrowTEE {
  constructor(config = {}) {
    this.client = null;
    this.config = {
      network: config.network || "wss://s.altnet.rippletest.net:51233", // testnet by default
      port: config.port || 3000,
      rescueDelay: config.rescueDelay || 86400 * 7, // 7 days in seconds
      ...config,
    };

    // Store active escrows
    this.escrows = new Map();

    // Use preset XRPL wallet from environment variables
    this.presetWallet = null;
    this.initializePresetWallet();

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  // Initialize preset XRPL wallet from environment variables
  initializePresetWallet() {
    const xrplSeed = process.env.XRPL_SEC;
    const xrplAddress = process.env.XRPL_ADD;

    if (!xrplSeed) {
      throw new Error(
        "XRPL_SEC environment variable is required for preset wallet"
      );
    }

    try {
      this.presetWallet = xrpl.Wallet.fromSeed(xrplSeed);

      // Create a separate system liquidity wallet for providing XRP in swaps
      // This ensures user's wallet balance actually increases
      this.liquidityWallet = xrpl.Wallet.generate(); // Separate wallet for liquidity
      console.log(
        `💰 System liquidity wallet: ${this.liquidityWallet.address}`
      );

      // Verify the address matches if provided
      if (xrplAddress && this.presetWallet.address !== xrplAddress) {
        console.warn(
          `Warning: Provided XRPL_ADDRESS (${xrplAddress}) doesn't match derived address (${this.presetWallet.address})`
        );
      }

      console.log(
        `✅ Preset XRPL wallet initialized: ${this.presetWallet.address}`
      );
      console.log(`💰 Liquidity wallet ready for ETH-to-XRP swaps`);
    } catch (error) {
      throw new Error(
        `Failed to initialize preset XRPL wallet: ${error.message}`
      );
    }
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  async initialize() {
    try {
      this.client = new xrpl.Client(this.config.network);
      await this.client.connect();
      console.log(`Connected to XRPL ${this.config.network}`);
      return true;
    } catch (error) {
      console.error("Failed to connect to XRPL:", error);
      return false;
    }
  }

  // Use preset XRPL wallet for escrow operations (no longer generates new wallets)
  async getEscrowWallet() {
    if (!this.presetWallet) {
      throw new Error("Preset XRPL wallet not initialized");
    }

    // Check wallet balance and ensure it has sufficient funds
    await this.ensureWalletBalance(this.presetWallet);

    return {
      address: this.presetWallet.address,
      seed: this.presetWallet.seed,
      privateKey: this.presetWallet.privateKey,
      publicKey: this.presetWallet.publicKey,
    };
  }

  // Ensure the preset wallet has sufficient balance
  async ensureWalletBalance(wallet, minBalance = 10) {
    try {
      const response = await this.client.request({
        command: "account_info",
        account: wallet.address,
        ledger_index: "validated",
      });

      const currentBalance = Number(
        xrpl.dropsToXrp(response.result.account_data.Balance)
      );

      console.log(`📊 Preset XRPL wallet balance: ${currentBalance} XRP`);

      if (currentBalance < minBalance) {
        throw new Error(
          `Insufficient XRPL balance. Current: ${currentBalance} XRP, Required: ${minBalance} XRP. Please fund your XRPL wallet.`
        );
      }

      return currentBalance;
    } catch (error) {
      if (error.message.includes("actNotFound")) {
        throw new Error(
          `XRPL wallet ${wallet.address} not found or not activated. Please fund it with at least ${minBalance} XRP.`
        );
      }
      throw error;
    }
  }

  // Verify XRP wallet has sufficient balance to receive funds
  async verifyWalletForReceiving(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      throw new Error(`Escrow ${escrowId} not found`);
    }

    // Check if preset wallet exists and is activated
    const currentBalance = await this.ensureWalletBalance(
      this.presetWallet,
      2 // Minimum 2 XRP for account reserve
    );

    console.log(`✅ XRP wallet verified with balance: ${currentBalance} XRP`);
    console.log(
      `💡 Ready to receive ${xrpl.dropsToXrp(escrow.amount.toString())} XRP when ETH is locked`
    );

    return {
      ready: true,
      walletBalance: currentBalance,
      message: `XRP wallet ready to receive funds`,
    };
  }

  // Ensure liquidity wallet has sufficient funds for the swap
  async ensureLiquidityWalletFunded(requiredAmount) {
    try {
      // Check current liquidity wallet balance
      let currentBalance = 0;
      try {
        const response = await this.client.request({
          command: "account_info",
          account: this.liquidityWallet.address,
          ledger_index: "validated",
        });
        currentBalance = Number(
          xrpl.dropsToXrp(response.result.account_data.Balance)
        );
      } catch (error) {
        // Account doesn't exist yet, needs funding
        console.log(
          `💰 Liquidity wallet not activated, funding from testnet faucet...`
        );
      }

      const requiredXrp =
        Number(xrpl.dropsToXrp(requiredAmount.toString())) + 2; // +2 XRP for fees and reserve

      if (currentBalance < requiredXrp) {
        console.log(
          `💰 Funding liquidity wallet: need ${requiredXrp} XRP, have ${currentBalance} XRP`
        );

        // Fund from testnet faucet
        await this.client.fundWallet(this.liquidityWallet);
        console.log(
          `✅ Liquidity wallet funded: ${this.liquidityWallet.address}`
        );

        // Verify new balance
        const newResponse = await this.client.request({
          command: "account_info",
          account: this.liquidityWallet.address,
          ledger_index: "validated",
        });
        const newBalance = Number(
          xrpl.dropsToXrp(newResponse.result.account_data.Balance)
        );
        console.log(`💰 Liquidity wallet balance: ${newBalance} XRP`);
      } else {
        console.log(
          `✅ Liquidity wallet has sufficient balance: ${currentBalance} XRP`
        );
      }
    } catch (error) {
      console.error(`❌ Failed to fund liquidity wallet:`, error.message);
      throw error;
    }
  }

  // Hash function equivalent to Solidity keccak256
  mykeccak256(data) {
    return keccak256(data);
  }

  // Time-lock stage enumeration matching Solidity
  TimeStages = {
    SrcWithdrawal: 0,
    SrcPublicWithdrawal: 1,
    SrcCancellation: 2,
    SrcPublicCancellation: 3,
    DstWithdrawal: 4,
    DstPublicWithdrawal: 5,
    DstCancellation: 6,
  };

  // Parse timelocks from packed uint256 (similar to Solidity implementation)
  parseTimelocks(packedTimelocks, deployedAt) {
    const data = BigInt(packedTimelocks);
    const stages = {};

    for (let stage = 0; stage < 7; stage++) {
      const bitShift = BigInt(stage * 32);
      const stageOffset = Number((data >> bitShift) & 0xffffffffn);
      stages[stage] = deployedAt + stageOffset;
    }

    return stages;
  }

  // Check if current time is within valid range for action
  validateTimeWindow(escrow, stage, requireBefore = null, offset = 0) {
    const now = Math.floor(Date.now() / 1000) + offset;
    const stageTime = escrow.timelocks[stage];

    if (now < stageTime) {
      throw new Error(
        `Action not allowed yet. Wait until ${new Date(stageTime * 1000)}`
      );
    }

    if (requireBefore !== null) {
      const beforeTime = escrow.timelocks[requireBefore];
      if (now >= beforeTime) {
        throw new Error(
          `Action window expired at ${new Date(beforeTime * 1000)}`
        );
      }
    }
  }

  // Validate secret against hashlock
  validateSecret(secret, hashlock) {
    const secretHash = this.mykeccak256(secret);
    if (secretHash.toLowerCase() !== hashlock.toLowerCase()) {
      throw new Error("Invalid secret provided");
    }
  }

  setupRoutes() {
    // Create new destination escrow
    this.app.post("/escrow/create-dst", async (req, res) => {
      try {
        const {
          orderHash,
          hashlock,
          maker,
          taker,
          token,
          amount,
          safetyDeposit,
          timelocks,
          type,
        } = req.body;

        // Use preset XRPL wallet for this escrow
        const escrowWallet = await this.getEscrowWallet();
        const deployedAt = Math.floor(Date.now() / 1000);
        const parsedTimelocks = this.parseTimelocks(timelocks, deployedAt);

        const escrowId = crypto.randomUUID();
        const escrow = {
          id: escrowId,
          orderHash,
          hashlock: hashlock,
          maker: maker,
          taker: taker,
          token: token,
          amount: BigInt(amount),
          safetyDeposit: BigInt(safetyDeposit),
          timelocks: parsedTimelocks,
          deployedAt,
          wallet: {
            address: escrowWallet.address,
            publicKey: escrowWallet.publicKey,
          },
          status: "created",
          type: type,
        };

        // Store escrow (wallet is stored as preset, no need for seeds per escrow)
        this.escrows.set(escrowId, escrow);

        // Mark as ready for manual funding - user needs to send XRP to complete escrow
        escrow.status = "awaiting_funding";
        escrow.autoFunded = false;

        // For ETH to XRP swap, no need to fund the destination escrow
        // The XRP will be sent directly from the source when the swap executes
        escrow.status = "ready";
        escrow.autoFunded = false;
        console.log(
          `✅ XRP destination escrow ${escrowId} created (no funding needed)`
        );
        console.log(
          `💡 XRP will be received when ETH source escrow is unlocked`
        );

        res.json({
          escrowId,
          walletAddress: escrowWallet.address,
          requiredDeposit: {
            xrp:
              token === "0x0000000000000000000000000000000000000000"
                ? (escrow.amount + escrow.safetyDeposit).toString()
                : escrow.safetyDeposit.toString(),
            token:
              token !== "0x0000000000000000000000000000000000000000"
                ? escrow.amount.toString()
                : "0",
          },
          timelocks: parsedTimelocks,
          autoFunded: escrow.autoFunded,
          status: escrow.status,
        });
      } catch (error) {
        console.error("Error creating destination escrow:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Fund the escrow wallet
    this.app.post("/escrow/:escrowId/fund", async (req, res) => {
      try {
        const { escrowId } = req.params;
        const { fromAddress, txHash } = req.body;

        let txHashes = txHash.split(",");

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        // Ensure txHashes is an array
        const hashArray = Array.isArray(txHashes) ? txHashes : [txHashes];

        let totalAmountReceived = 0n;
        const verifiedTxs = [];

        // Verify each funding transaction
        for (const txHash of hashArray) {
          console.log("Verifying funding transaction", txHash);
          const tx = await this.client.request({
            command: "tx",
            transaction: txHash,
          });

          if (tx.result.tx_json.TransactionType !== "Payment") {
            return res.status(400).json({
              error: `Invalid transaction type for ${txHash}`,
            });
          }

          if (tx.result.tx_json.Destination !== escrow.wallet.address) {
            return res.status(400).json({
              error: `Payment ${txHash} not sent to escrow address`,
            });
          }

          const amountReceived = BigInt(tx.result.meta.delivered_amount);
          totalAmountReceived += amountReceived;
          verifiedTxs.push({
            txHash,
            amount: amountReceived.toString(),
          });
        }

        const requiredAmount =
          escrow.token === "0x0000000000000000000000000000000000000000"
            ? escrow.amount + escrow.safetyDeposit
            : escrow.safetyDeposit;

        if (totalAmountReceived < requiredAmount) {
          return res.status(400).json({
            error: `Insufficient funding. Required: ${requiredAmount}, Received: ${totalAmountReceived}`,
            verifiedTxs,
          });
        }

        escrow.status = "funded";
        escrow.fundingTxs = hashArray;

        res.json({
          message: "Escrow successfully funded",
          escrowId,
          totalAmountReceived: totalAmountReceived.toString(),
          verifiedTxs,
        });
      } catch (error) {
        console.error("Error funding escrow:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Withdraw from destination escrow (for maker)
    this.app.post("/escrow/:escrowId/withdraw", async (req, res) => {
      try {
        const { escrowId } = req.params;
        const { secret, callerAddress, isPublic = false } = req.body;

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        if (escrow.status !== "funded" && escrow.status !== "ready") {
          return res.status(400).json({ error: "Escrow not funded or ready" });
        }

        // Validate secret
        this.validateSecret(secret, escrow.hashlock);

        // Validate caller and timing
        if (!isPublic) {
          // For ETH-to-XRP swaps, allow both maker and taker to withdraw during private period
          // since the maker (ETH wallet) reveals the secret to get XRP
          const isValidCaller =
            callerAddress === escrow.taker || callerAddress === escrow.maker;

          if (!isValidCaller) {
            console.log(`❌ Invalid caller: ${callerAddress}`);
            console.log(`   Escrow taker: ${escrow.taker}`);
            console.log(`   Escrow maker: ${escrow.maker}`);
            return res.status(403).json({
              error: "Only taker or maker can withdraw during private period",
            });
          }

          console.log(`✅ Valid caller verified: ${callerAddress}`);
          this.validateTimeWindow(
            escrow,
            this.TimeStages.DstWithdrawal,
            this.TimeStages.DstCancellation,
            11 // simulate 11 seconds delay, just like EVM part
          );
        } else {
          // Public withdrawal - anyone can call
          this.validateTimeWindow(
            escrow,
            this.TimeStages.DstPublicWithdrawal,
            this.TimeStages.DstCancellation
          );
        }

        // Execute withdrawal using preset wallet
        const wallet = this.presetWallet;

        let payment, result;

        if (escrow.status === "ready") {
          // For destination escrows (ready status), send XRP from preset wallet to taker
          console.log(
            "Processing destination escrow withdrawal - sending XRP to taker"
          );
          console.log(`Escrow taker: ${escrow.taker}`);
          console.log(`Escrow maker: ${escrow.maker}`);

          // Determine the correct destination (taker for ETH-to-XRP swap)
          let xrplDestination;
          if (escrow.taker.startsWith("0x")) {
            // If taker is Ethereum address, this means XRP should go to the preset wallet
            // (In this demo, user receives XRP in their preset wallet)
            xrplDestination = this.presetWallet.address;
            console.log(
              `Taker is ETH address, sending XRP to preset wallet: ${xrplDestination}`
            );
          } else {
            // Taker is already an XRPL address
            xrplDestination = escrow.taker;
            console.log(
              `Taker is XRPL address, sending XRP to: ${xrplDestination}`
            );
          }

          // Execute XRP transfer from liquidity wallet to user wallet
          // This ensures user's XRP wallet balance actually increases
          console.log(
            `💰 ETH-to-XRP Swap: Sending ${xrpl.dropsToXrp(escrow.amount.toString())} XRP to user wallet`
          );

          // Fund liquidity wallet if needed (testnet faucet)
          await this.ensureLiquidityWalletFunded(escrow.amount);

          // Send XRP from liquidity wallet to user's preset wallet
          payment = {
            TransactionType: "Payment",
            Account: this.liquidityWallet.address, // Send FROM liquidity wallet
            Destination: this.presetWallet.address, // Send TO user's preset wallet
            Amount: escrow.amount.toString(),
            Memos: [
              {
                Memo: {
                  MemoType: Buffer.from("ETH-XRP-SWAP", "utf8")
                    .toString("hex")
                    .toUpperCase(),
                  MemoData: Buffer.from(
                    `ETH->XRP Order: ${escrow.orderHash.slice(0, 16)}...`,
                    "utf8"
                  )
                    .toString("hex")
                    .toUpperCase(),
                },
              },
            ],
          };

          console.log("🚀 Executing XRP swap payment:");
          console.log(`   FROM: ${this.liquidityWallet.address} (liquidity)`);
          console.log(`   TO: ${this.presetWallet.address} (user)`);
          console.log(
            `   AMOUNT: ${xrpl.dropsToXrp(escrow.amount.toString())} XRP`
          );

          const prepared = await this.client.autofill(payment);
          const signed = this.liquidityWallet.sign(prepared); // Sign with liquidity wallet
          result = await this.client.submitAndWait(signed.tx_blob);

          if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log(
              `✅ XRP swap transaction successful: ${result.result.hash}`
            );
            console.log(
              `📈 User's XRP wallet balance increased by ${xrpl.dropsToXrp(escrow.amount.toString())} XRP`
            );
            console.log(
              `🔗 XRPL Explorer: https://testnet.xrpl.org/transactions/${result.result.hash}`
            );
          }
        } else {
          // For funded escrows, send from escrow wallet (original logic)
          console.log("Processing funded escrow withdrawal");

          const xrplDestination = escrow.maker.startsWith("0x")
            ? "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW" // Fallback for Ethereum addresses
            : escrow.maker;

          payment = {
            TransactionType: "Payment",
            Account: wallet.address,
            Destination: xrplDestination,
            Amount: escrow.amount.toString(),
          };

          console.log("Withdrawing from funded escrow", payment);
          const prepared = await this.client.autofill(payment);
          const signed = wallet.sign(prepared);
          result = await this.client.submitAndWait(signed.tx_blob);
        }

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
          const originalStatus = escrow.status; // Store original status before changing it
          escrow.status = "withdrawn";
          escrow.withdrawTx = result.result.hash;
          escrow.secret = secret;

          // Send safety deposit to caller (only for funded escrows, not ready/destination escrows)
          if (originalStatus === "funded" && escrow.safetyDeposit > 0) {
            // Convert caller address to XRPL format if needed
            const xrplCallerAddress = callerAddress.startsWith("0x")
              ? "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW" // Same funded XRPL testnet address for Ethereum addresses
              : callerAddress; // Use as-is if already an XRPL address

            const safetyPayment = {
              TransactionType: "Payment",
              Account: wallet.address,
              Destination: xrplCallerAddress,
              Amount: escrow.safetyDeposit.toString(),
            };

            const preparedSafety = await this.client.autofill(safetyPayment);
            const signedSafety = wallet.sign(preparedSafety);
            await this.client.submitAndWait(signedSafety.tx_blob);
          }

          res.json({
            message: "Withdrawal successful",
            txHash: result.result.hash,
            secret: secret,
            amount: escrow.amount.toString(),
          });
        } else {
          throw new Error(
            `Transaction failed: ${result.result.meta.TransactionResult}`
          );
        }
      } catch (error) {
        console.error("Error processing withdrawal:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Cancel destination escrow
    this.app.post("/escrow/:escrowId/cancel", async (req, res) => {
      // This happens if maker does not reveal the secret in time.
      try {
        const { escrowId } = req.params;
        const { callerAddress } = req.body;

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        if (escrow.status !== "funded") {
          return res
            .status(400)
            .json({ error: "Escrow not funded or already processed" });
        }

        // Validate caller and timing - todo: include nonce signature to ensure PubKey
        if (callerAddress !== escrow.taker) {
          return res.status(403).json({ error: "Only taker can cancel" });
        }

        this.validateTimeWindow(
          escrow,
          this.TimeStages.DstCancellation,
          null,
          125
        );

        // Execute cancellation using preset wallet
        const wallet = this.presetWallet;

        let cancelTxs = [];

        if (escrow.type === "dst") {
          // DST escrow: return everything to taker
          const payment = {
            TransactionType: "Payment",
            Account: wallet.address,
            Destination: escrow.taker,
            Amount: (escrow.amount + escrow.safetyDeposit).toString(),
          };

          const prepared = await this.client.autofill(payment);
          const signed = wallet.sign(prepared);
          const result = await this.client.submitAndWait(signed.tx_blob);

          if (result.result.meta.TransactionResult === "tesSUCCESS") {
            cancelTxs.push({
              recipient: escrow.taker,
              amount: (escrow.amount + escrow.safetyDeposit).toString(),
              txHash: result.result.hash,
            });
          } else {
            throw new Error(
              `Payment to taker failed: ${result.result.meta.TransactionResult}`
            );
          }
        } else if (escrow.type === "src") {
          // SRC escrow: return amount to maker, safety deposit to taker

          // Return amount to maker
          if (escrow.amount > 0) {
            const makerPayment = {
              TransactionType: "Payment",
              Account: wallet.address,
              Destination: escrow.maker,
              Amount: escrow.amount.toString(),
            };

            const preparedMaker = await this.client.autofill(makerPayment);
            const signedMaker = wallet.sign(preparedMaker);
            const makerResult = await this.client.submitAndWait(
              signedMaker.tx_blob
            );

            if (makerResult.result.meta.TransactionResult === "tesSUCCESS") {
              cancelTxs.push({
                recipient: escrow.maker,
                amount: escrow.amount.toString(),
                txHash: makerResult.result.hash,
              });
            } else {
              throw new Error(
                `Payment to maker failed: ${makerResult.result.meta.TransactionResult}`
              );
            }
          }

          // Return safety deposit to taker
          if (escrow.safetyDeposit > 0) {
            const takerPayment = {
              TransactionType: "Payment",
              Account: wallet.address,
              Destination: escrow.taker,
              Amount: escrow.safetyDeposit.toString(),
            };

            const preparedTaker = await this.client.autofill(takerPayment);
            const signedTaker = wallet.sign(preparedTaker);
            const takerResult = await this.client.submitAndWait(
              signedTaker.tx_blob
            );

            if (takerResult.result.meta.TransactionResult === "tesSUCCESS") {
              cancelTxs.push({
                recipient: escrow.taker,
                amount: escrow.safetyDeposit.toString(),
                txHash: takerResult.result.hash,
              });
            } else {
              throw new Error(
                `Safety deposit payment to taker failed: ${takerResult.result.meta.TransactionResult}`
              );
            }
          }
        } else {
          throw new Error(`Unknown escrow type: ${escrow.type}`);
        }

        escrow.status = "cancelled";
        escrow.cancelTxs = cancelTxs;

        res.json({
          message: "Escrow cancelled successfully",
          escrowType: escrow.type,
          cancelTxs: cancelTxs,
          totalRefunded: (escrow.amount + escrow.safetyDeposit).toString(),
        });
      } catch (error) {
        console.error("Error cancelling escrow:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Rescue funds (emergency function)
    this.app.post("/escrow/:escrowId/rescue", async (req, res) => {
      try {
        const { escrowId } = req.params;
        const { callerAddress, amount } = req.body;

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        // Only taker can rescue after rescue delay
        if (callerAddress !== escrow.taker) {
          return res.status(403).json({ error: "Only taker can rescue funds" });
        }

        const rescueStart = escrow.deployedAt + this.config.rescueDelay;
        const now = Math.floor(Date.now() / 1000);

        if (now < rescueStart) {
          return res.status(400).json({
            error: `Rescue not available until ${new Date(rescueStart * 1000)}`,
          });
        }

        // Execute rescue using preset wallet
        const wallet = this.presetWallet;

        const payment = {
          TransactionType: "Payment",
          Account: wallet.address,
          Destination: callerAddress,
          Amount: amount,
        };

        const prepared = await this.client.autofill(payment);
        const signed = wallet.sign(prepared);
        const result = await this.client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
          res.json({
            message: "Funds rescued successfully",
            txHash: result.result.hash,
            amount: amount,
          });
        } else {
          throw new Error(
            `Transaction failed: ${result.result.meta.TransactionResult}`
          );
        }
      } catch (error) {
        console.error("Error rescuing funds:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get escrow status
    this.app.get("/escrow/:escrowId", (req, res) => {
      const { escrowId } = req.params;
      const escrow = this.escrows.get(escrowId);

      if (!escrow) {
        return res.status(404).json({ error: "Escrow not found" });
      }

      // Return escrow info without sensitive data
      const publicEscrow = {
        id: escrow.id,
        orderHash: escrow.orderHash,
        hashlock: escrow.hashlock,
        maker: escrow.maker,
        taker: escrow.taker,
        token: escrow.token,
        amount: escrow.amount.toString(),
        safetyDeposit: escrow.safetyDeposit.toString(),
        timelocks: escrow.timelocks,
        deployedAt: escrow.deployedAt,
        walletAddress: escrow.wallet.address,
        status: escrow.status,
        type: escrow.type,
      };

      res.json(publicEscrow);
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        connected: this.client?.isConnected() || false,
        activeEscrows: this.escrows.size,
      });
    });
  }

  async start() {
    const initialized = await this.initialize();
    if (!initialized) {
      throw new Error("Failed to initialize XRPL connection");
    }

    this.app.listen(this.config.port, () => {
      console.log(`XRPL Escrow TEE Server running on port ${this.config.port}`);
      console.log(`Network: ${this.config.network}`);
      console.log(`Rescue delay: ${this.config.rescueDelay} seconds`);
    });
  }

  async stop() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// Export for use as module
module.exports = XRPLEscrowTEE;

// Run server if this file is executed directly
if (require.main === module) {
  const server = new XRPLEscrowTEE({
    network: process.env.XRPL_URL || "wss://s.altnet.rippletest.net:51233",
    port: process.env.PORT || 3000,
    rescueDelay: parseInt(process.env.RESCUE_DELAY) || 60 * 30,
  });

  server.start().catch(console.error);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await server.stop();
    process.exit(0);
  });
}
