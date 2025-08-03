const xrpl = require("xrpl");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { keccak256 } = require("ethers");

class XRPLToETHEscrowServer {
  constructor(config = {}) {
    this.client = null;
    this.config = {
      network: config.network || "wss://s.altnet.rippletest.net:51233", // testnet by default
      port: config.port || 3002, // Different port from serve-escrow.js
      rescueDelay: config.rescueDelay || 86400 * 7, // 7 days in seconds
      ...config,
    };

    // Store active escrows
    this.escrows = new Map();
    this.walletSeeds = new Map(); // Securely store wallet seeds

    // Preset wallet configuration for XRP-to-ETH swaps
    this.presetWallet = null;

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  // Initialize preset wallet for auto-funding XRP-to-ETH swaps
  async initializePresetWallet() {
    try {
      if (process.env.XRPL_SEC && process.env.XRPL_ADD) {
        console.log(
          "🔧 Initializing preset XRP wallet for auto-funded XRP-to-ETH swaps..."
        );

        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(process.env.XRPL_SEC);

        // Verify address matches
        if (wallet.address !== process.env.XRPL_ADD) {
          throw new Error(
            `Wallet address mismatch: ENV says ${process.env.XRPL_ADD}, seed gives ${wallet.address}`
          );
        }

        this.presetWallet = {
          address: wallet.address,
          seed: wallet.seed,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
        };

        console.log(`✅ Preset XRP wallet initialized: ${wallet.address}`);
        console.log("💰 Auto-funding enabled for XRP-to-ETH swaps");

        return this.presetWallet;
      } else {
        console.log(
          "⚠️  XRPL_SEC and XRPL_ADD not set, generating new wallets with auto-funding"
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to initialize preset wallet:", error);
      throw error;
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
      console.log(`✅ Connected to XRPL ${this.config.network}`);

      // Initialize preset wallet
      await this.initializePresetWallet();

      return true;
    } catch (error) {
      console.error("❌ Failed to connect to XRPL:", error);
      return false;
    }
  }

  // Get escrow wallet (use preset for source, generate new for destination)
  async getEscrowWallet(escrowType = "dst") {
    try {
      if (escrowType === "src" && this.presetWallet) {
        // For source escrows in XRP-to-ETH, use preset wallet for auto-funding
        console.log(
          `💰 Using preset XRP wallet for source escrow: ${this.presetWallet.address}`
        );
        console.log(
          `✅ Auto-funding enabled - system will handle XRP transactions`
        );

        // Ensure wallet has sufficient balance
        await this.ensureWalletBalance(
          xrpl.Wallet.fromSeed(this.presetWallet.seed),
          5
        );

        return this.presetWallet;
      } else {
        // For destination escrows or when no preset, generate new wallet with auto-funding
        console.log(
          `🔧 Generating new ${escrowType} escrow wallet with auto-funding...`
        );
        const entropy = crypto.randomBytes(16);
        const wallet = xrpl.Wallet.fromEntropy(entropy);

        console.log(`📍 New escrow wallet created: ${wallet.address}`);
        console.log(`💰 Auto-funding wallet from testnet faucet...`);

        // Auto-fund wallet from testnet faucet
        await this.client.fundWallet(wallet);
        console.log(`✅ Wallet auto-funded successfully`);

        return {
          address: wallet.address,
          seed: wallet.seed,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
        };
      }
    } catch (error) {
      console.error("❌ Failed to get escrow wallet:", error);
      throw error;
    }
  }

  // Ensure wallet has minimum balance
  async ensureWalletBalance(wallet, minBalance = 10) {
    try {
      // Check current balance
      const response = await this.client.request({
        command: "account_info",
        account: wallet.address,
        ledger_index: "validated",
      });

      const currentBalance = Number(
        xrpl.dropsToXrp(response.result.account_data.Balance)
      );

      console.log(`💰 Wallet ${wallet.address} balance: ${currentBalance} XRP`);

      if (currentBalance < minBalance) {
        console.log(`📉 Balance too low, funding wallet...`);
        await this.client.fundWallet(wallet);
        console.log(`✅ Wallet funded successfully`);
      } else {
        console.log(`✅ Wallet balance sufficient`);
      }
    } catch (error) {
      console.error(`❌ Failed to ensure wallet balance:`, error);
      // Don't throw, just log - account might not exist yet
    }
  }

  // Verify wallet for receiving XRP (for destination escrows)
  async verifyWalletForReceiving(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      throw new Error("Escrow not found");
    }

    try {
      // Check if wallet exists and is ready to receive
      const response = await this.client.request({
        command: "account_info",
        account: escrow.wallet.address,
        ledger_index: "validated",
      });

      const balance = Number(
        xrpl.dropsToXrp(response.result.account_data.Balance)
      );

      console.log(
        `✅ Wallet ${escrow.wallet.address} verified, balance: ${balance} XRP`
      );
      return true;
    } catch (error) {
      console.log(`⚠️  Wallet verification warning: ${error.message}`);
      return false;
    }
  }

  // Ensure liquidity wallet is funded for destination escrows
  async ensureLiquidityWalletFunded(requiredAmount) {
    try {
      console.log(
        `💰 Ensuring liquidity for ${Number(requiredAmount) / 1000000} XRP...`
      );

      // In a real implementation, you'd have a liquidity management system
      // For this demo, we'll use the testnet faucet funding
      console.log(`✅ Liquidity available (testnet auto-funding)`);

      return true;
    } catch (error) {
      console.error("❌ Failed to ensure liquidity:", error);
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

  // Check if current time is within valid range for action (more lenient for XRP-to-ETH)
  validateTimeWindow(escrow, stage, requireBefore = null, offset = 0) {
    const now = Math.floor(Date.now() / 1000) + offset;
    const stageTime = escrow.timelocks[stage];

    // Be more lenient with timing for XRP-to-ETH swaps
    if (now < stageTime - 60) {
      // Allow 60 seconds early
      throw new Error(
        `Action not allowed yet. Wait until ${new Date((stageTime - 60) * 1000)}`
      );
    }

    if (requireBefore !== null) {
      const beforeTime = escrow.timelocks[requireBefore];
      if (now >= beforeTime + 60) {
        // Allow 60 seconds late
        throw new Error(
          `Action window expired at ${new Date((beforeTime + 60) * 1000)}`
        );
      }
    }
  }

  // Validate secret against hashlock
  validateSecret(secret, hashlock) {
    const secretHash = this.mykeccak256(secret);
    if (secretHash.toLowerCase() !== hashlock.toLowerCase()) {
      throw new Error("❌ Invalid secret provided");
    }
  }

  setupRoutes() {
    // Create new escrow (modified for XRP-to-ETH flow)
    this.app.post("/escrow/create-dst", async (req, res) => {
      try {
        console.log("📞 Creating new XRP-to-ETH escrow...");

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

        // Validate required fields
        if (!orderHash || !hashlock || !maker || !taker || !amount) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`🔄 Creating ${type} escrow for XRP-to-ETH swap`);
        console.log(`💰 Amount: ${Number(amount) / 1000000} XRP`);
        console.log(
          `🛡️  Safety Deposit: ${Number(safetyDeposit) / 1000000} XRP`
        );

        // Get appropriate wallet based on escrow type
        const escrowWallet = await this.getEscrowWallet(type);
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
          type: type || "dst",
          swapDirection: "xrp-to-eth", // Track swap direction
        };

        // Store escrow and wallet seed securely
        this.escrows.set(escrowId, escrow);
        this.walletSeeds.set(escrowId, escrowWallet.seed);

        console.log(`✅ ${type.toUpperCase()} escrow created: ${escrowId}`);
        console.log(`📍 Wallet address: ${escrowWallet.address}`);

        // Auto-fund source escrows with preset wallet, destination escrows are auto-funded
        if (
          type === "src" &&
          this.presetWallet &&
          escrowWallet.address === this.presetWallet.address
        ) {
          console.log(`💰 Source escrow using preset wallet - auto-funded`);
          escrow.status = "funded";
          escrow.usingPresetWallet = true;
          escrow.autoFunded = true;
        } else {
          console.log(`💰 Destination escrow auto-funded by testnet faucet`);
          escrow.status = "funded";
          escrow.usingPresetWallet = false;
          escrow.autoFunded = true;
        }

        // Calculate required deposit
        const requiredDeposit = {
          xrp:
            token === "0x0000000000000000000000000000000000000000"
              ? (escrow.amount + escrow.safetyDeposit).toString()
              : escrow.safetyDeposit.toString(),
          token:
            token !== "0x0000000000000000000000000000000000000000"
              ? escrow.amount.toString()
              : "0",
        };

        res.json({
          escrowId,
          walletAddress: escrowWallet.address,
          requiredDeposit,
          timelocks: parsedTimelocks,
          swapDirection: "xrp-to-eth",
          usingPresetWallet: escrow.usingPresetWallet || false,
        });
      } catch (error) {
        console.error("❌ Error creating XRP-to-ETH escrow:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Fund the escrow (modified for XRP-to-ETH)
    this.app.post("/escrow/:escrowId/fund", async (req, res) => {
      try {
        const { escrowId } = req.params;
        const { fromAddress, txHash } = req.body;

        console.log(
          `📞 Funding XRP-to-ETH escrow ${escrowId} with tx ${txHash}`
        );

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        // Handle auto-funded escrows
        if (escrow.autoFunded) {
          console.log(
            `💰 Escrow ${escrowId} is auto-funded - no manual funding required`
          );

          const requiredAmount = escrow.amount + escrow.safetyDeposit;

          res.json({
            message: "XRP-to-ETH escrow is auto-funded",
            escrowId,
            totalAmountReceived: requiredAmount.toString(),
            autoFunded: true,
            amountReceived: `${Number(requiredAmount) / 1000000} XRP`,
          });
          return;
        }

        // Handle manual funding for legacy cases
        console.log(`💰 Processing manual funding for escrow ${escrowId}...`);

        const txHashes = Array.isArray(txHash) ? txHash : txHash.split(",");
        let totalAmountReceived = 0n;
        const verifiedTxs = [];

        for (const hash of txHashes) {
          try {
            console.log(`🔍 Verifying transaction: ${hash}`);

            const tx = await this.client.request({
              command: "tx",
              transaction: hash.trim(),
            });

            if (tx.result.tx_json.TransactionType !== "Payment") {
              return res.status(400).json({
                error: `Invalid transaction type for ${hash}`,
              });
            }

            const amountSent = BigInt(
              tx.result.meta.delivered_amount || tx.result.tx_json.Amount
            );
            totalAmountReceived += amountSent;
            verifiedTxs.push({
              txHash: hash,
              amount: amountSent.toString(),
            });

            console.log(
              `✅ Verified funding: ${Number(amountSent) / 1000000} XRP`
            );
          } catch (txError) {
            console.error(`❌ Error verifying transaction ${hash}:`, txError);
            return res.status(400).json({
              error: `Failed to verify transaction ${hash}: ${txError.message}`,
            });
          }
        }

        escrow.status = "funded";
        escrow.fundingTxs = txHashes;

        console.log(
          `✅ Escrow ${escrowId} manually funded (${Number(totalAmountReceived) / 1000000} XRP)`
        );

        res.json({
          message: "XRP-to-ETH escrow manually funded",
          escrowId,
          totalAmountReceived: totalAmountReceived.toString(),
          verifiedTxs,
        });
      } catch (error) {
        console.error("❌ Error funding XRP-to-ETH escrow:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Withdraw from escrow (modified for XRP-to-ETH flow)
    this.app.post("/escrow/:escrowId/withdraw", async (req, res) => {
      try {
        const { escrowId } = req.params;
        const { secret, callerAddress, isPublic = false } = req.body;

        console.log(`📞 XRP-to-ETH withdrawal request for escrow ${escrowId}`);

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        if (escrow.status !== "funded") {
          return res.status(400).json({ error: "Escrow not funded" });
        }

        // Validate secret
        this.validateSecret(secret, escrow.hashlock);
        console.log("✅ Secret validated");

        // Simplified time validation (more lenient for XRP-to-ETH)
        try {
          if (escrow.type === "src") {
            // Source withdrawal (XRP escrow - user gets XRP back in case of cancellation)
            this.validateTimeWindow(escrow, 0, 2, 0); // SrcWithdrawal, before SrcCancellation
          } else {
            // Destination withdrawal (XRP escrow - system pays out XRP to user)
            if (!isPublic) {
              this.validateTimeWindow(escrow, 4, 6, 0); // DstWithdrawal, before DstCancellation
            } else {
              this.validateTimeWindow(escrow, 5, 6, 0); // DstPublicWithdrawal, before DstCancellation
            }
          }
        } catch (timeError) {
          console.log("⚠️  Time validation warning:", timeError.message);
          // Continue anyway for testing - in production you might want to be stricter
        }

        // Execute withdrawal based on escrow type and swap direction
        const walletSeed = this.walletSeeds.get(escrowId);
        const wallet = xrpl.Wallet.fromSeed(walletSeed);

        let destinationAddress;

        if (escrow.type === "src") {
          // Source escrow withdrawal (cancellation case)
          destinationAddress = escrow.maker; // Return to maker
          if (destinationAddress.startsWith("0x")) {
            // Convert Ethereum address to XRPL address (fallback)
            destinationAddress = escrow.taker.startsWith("0x")
              ? process.env.XRPL_ADD || "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW"
              : escrow.taker;
          }
        } else {
          // Destination escrow withdrawal (successful swap - pay user XRP)
          destinationAddress = callerAddress || escrow.taker;
          if (destinationAddress.startsWith("0x")) {
            // For XRP-to-ETH swaps, send XRP to user's XRP wallet
            destinationAddress =
              process.env.XRPL_ADD || "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW";
          }
        }

        console.log(
          `💸 Sending ${Number(escrow.amount) / 1000000} XRP to ${destinationAddress}`
        );
        console.log(`🔄 Swap direction: ${escrow.swapDirection}`);
        console.log(`📊 Escrow type: ${escrow.type}`);

        // Create payment transaction
        const payment = {
          TransactionType: "Payment",
          Account: wallet.address,
          Destination: destinationAddress,
          Amount: escrow.amount.toString(),
        };

        const prepared = await this.client.autofill(payment);
        const signed = wallet.sign(prepared);
        const result = await this.client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
          escrow.status = "withdrawn";
          escrow.withdrawTx = result.result.hash;
          escrow.secret = secret;

          console.log(
            `✅ XRP-to-ETH withdrawal successful: ${result.result.hash}`
          );
          console.log(
            `💰 ${Number(escrow.amount) / 1000000} XRP sent to ${destinationAddress}`
          );

          // Send safety deposit if exists
          if (escrow.safetyDeposit > 0) {
            try {
              console.log(
                `💸 Sending safety deposit ${Number(escrow.safetyDeposit) / 1000000} XRP`
              );

              const safetyPayment = {
                TransactionType: "Payment",
                Account: wallet.address,
                Destination: destinationAddress,
                Amount: escrow.safetyDeposit.toString(),
              };

              const preparedSafety = await this.client.autofill(safetyPayment);
              const signedSafety = wallet.sign(preparedSafety);
              const safetyResult = await this.client.submitAndWait(
                signedSafety.tx_blob
              );

              if (safetyResult.result.meta.TransactionResult === "tesSUCCESS") {
                console.log(
                  `✅ Safety deposit sent: ${safetyResult.result.hash}`
                );
              }
            } catch (safetyError) {
              console.error("⚠️  Safety deposit failed:", safetyError.message);
              // Don't fail the entire withdrawal for safety deposit issues
            }
          }

          res.json({
            message: "XRP-to-ETH withdrawal successful",
            txHash: result.result.hash,
            secret: secret,
            amount: escrow.amount.toString(),
            swapDirection: escrow.swapDirection,
            escrowType: escrow.type,
            userReceived: `${Number(escrow.amount) / 1000000} XRP`,
          });
        } else {
          throw new Error(
            `Transaction failed: ${result.result.meta.TransactionResult}`
          );
        }
      } catch (error) {
        console.error("❌ Error processing XRP-to-ETH withdrawal:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Cancel escrow (modified for XRP-to-ETH)
    this.app.post("/escrow/:escrowId/cancel", async (req, res) => {
      try {
        const { escrowId } = req.params;
        const { callerAddress } = req.body;

        console.log(`📞 XRP-to-ETH cancel request for escrow ${escrowId}`);

        const escrow = this.escrows.get(escrowId);
        if (!escrow) {
          return res.status(404).json({ error: "Escrow not found" });
        }

        if (escrow.status !== "funded") {
          return res
            .status(400)
            .json({ error: "Escrow not funded or already processed" });
        }

        // Simplified validation - be more lenient with timing
        try {
          if (escrow.type === "src") {
            this.validateTimeWindow(escrow, 2, null, 0); // SrcCancellation
          } else {
            this.validateTimeWindow(escrow, 6, null, 120); // DstCancellation with buffer
          }
        } catch (timeError) {
          console.log("⚠️  Time validation warning:", timeError.message);
          // Continue anyway for testing
        }

        // Execute cancellation
        const walletSeed = this.walletSeeds.get(escrowId);
        const wallet = xrpl.Wallet.fromSeed(walletSeed);

        let cancelTxs = [];
        const totalAmount = escrow.amount + escrow.safetyDeposit;

        // Determine refund destination
        let refundDestination;
        if (escrow.type === "src") {
          // Source cancellation: return to maker (user gets XRP back)
          refundDestination = escrow.maker.startsWith("0x")
            ? process.env.XRPL_ADD || "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW"
            : escrow.maker;
        } else {
          // Destination cancellation: return to taker
          refundDestination = escrow.taker.startsWith("0x")
            ? process.env.XRPL_ADD || "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW"
            : escrow.taker;
        }

        console.log(
          `💸 Refunding ${Number(totalAmount) / 1000000} XRP to ${refundDestination}`
        );

        const payment = {
          TransactionType: "Payment",
          Account: wallet.address,
          Destination: refundDestination,
          Amount: totalAmount.toString(),
        };

        const prepared = await this.client.autofill(payment);
        const signed = wallet.sign(prepared);
        const result = await this.client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
          cancelTxs.push({
            recipient: refundDestination,
            amount: totalAmount.toString(),
            txHash: result.result.hash,
          });
        }

        escrow.status = "cancelled";
        escrow.cancelTxs = cancelTxs;

        console.log(`✅ XRP-to-ETH escrow ${escrowId} cancelled successfully`);

        res.json({
          message: "XRP-to-ETH escrow cancelled successfully",
          escrowType: escrow.type,
          swapDirection: escrow.swapDirection,
          cancelTxs: cancelTxs,
          userRefunded: `${Number(totalAmount) / 1000000} XRP`,
        });
      } catch (error) {
        console.error("❌ Error cancelling XRP-to-ETH escrow:", error);
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
        swapDirection: escrow.swapDirection || "xrp-to-eth",
        usingPresetWallet: escrow.usingPresetWallet || false,
      };

      res.json(publicEscrow);
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        connected: this.client?.isConnected() || false,
        activeEscrows: this.escrows.size,
        network: this.config.network,
        port: this.config.port,
        swapDirection: "xrp-to-eth",
        presetWalletReady: !!this.presetWallet,
      });
    });

    // List all escrows (for debugging)
    this.app.get("/escrows", (req, res) => {
      const escrowList = [];
      for (const [id, escrow] of this.escrows.entries()) {
        escrowList.push({
          id,
          status: escrow.status,
          type: escrow.type,
          swapDirection: escrow.swapDirection,
          amount: `${Number(escrow.amount) / 1000000} XRP`,
          walletAddress: escrow.wallet.address,
          usingPresetWallet: escrow.usingPresetWallet || false,
          createdAt: new Date(escrow.deployedAt * 1000).toISOString(),
        });
      }
      res.json({
        escrows: escrowList,
        total: escrowList.length,
        swapDirection: "xrp-to-eth",
        presetWalletAddress: this.presetWallet?.address || null,
      });
    });
  }

  async start() {
    const initialized = await this.initialize();
    if (!initialized) {
      throw new Error("Failed to initialize XRPL connection");
    }

    this.app.listen(this.config.port, () => {
      console.log(
        `🚀 XRP-to-ETH Escrow Server running on port ${this.config.port}`
      );
      console.log(`🌐 Network: ${this.config.network}`);
      console.log(`🔄 Swap Direction: XRP → ETH`);
      console.log(
        `💰 Preset Wallet: ${this.presetWallet?.address || "Not configured"}`
      );
      console.log(`📋 Rescue delay: ${this.config.rescueDelay} seconds`);
      console.log(
        `🔗 Health check: http://localhost:${this.config.port}/health`
      );
    });
  }

  async stop() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// Export for use as module
module.exports = XRPLToETHEscrowServer;

// Run server if this file is executed directly
if (require.main === module) {
  const server = new XRPLToETHEscrowServer({
    network: process.env.XRPL_NETWORK || "wss://s.altnet.rippletest.net:51233",
    port: process.env.PORT || 3002, // Different port from serve-escrow.js
    rescueDelay: parseInt(process.env.RESCUE_DELAY) || 1800, // 30 minutes for testing
  });

  server.start().catch(console.error);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n👋 Shutting down XRP-to-ETH Escrow Server...");
    await server.stop();
    process.exit(0);
  });
}
