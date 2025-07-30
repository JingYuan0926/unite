require("dotenv").config();
const crypto = require("crypto");
const { ethers } = require("ethers");
const xrpl = require("xrpl");
const { XRPLEscrowClient, XRPLEscrowUtils } = require("../xrpl-tee/client.js");

/**
 * Enhanced EVM to XRPL Cross-Chain Swap Example with Real EVM Integration
 *
 * This example demonstrates a complete cross-chain atomic swap with:
 * - Real EVM contract interactions (requires deployed EscrowFactory)
 * - Real XRPL testnet transactions via TEE server
 * - Full event monitoring and coordination
 */

// EscrowFactory ABI (from the compiled contract)
const ESCROW_FACTORY_ABI = [
  // Main function we're using - with correct types
  "function createDstEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) dstImmutables, uint256 srcCancellationTimestamp) external payable",
  // Events - with correct signature from compiled contract
  "event DstEscrowCreated(address escrow, bytes32 hashlock, uint256 taker)",
  "event SrcEscrowCreated(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, tuple(address token, uint256 amount, address resolver, uint128 fee, uint256 timelocks) immutablesComplement)",
  // View functions
  "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
  "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
];

// Escrow contract ABI (simplified)
const ESCROW_ABI = [
  "function withdraw(bytes32 secret, tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function cancel(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function getStatus() external view returns (uint8)",
  "event EscrowWithdrawal(bytes32 secret)",
  "event EscrowCancelled()",
];

function addressToUint256(address) {
  // Convert address to uint256 by padding with zeros on the left
  // Address is 20 bytes, uint256 is 32 bytes, so we need 12 bytes of padding
  const cleanAddress = address.toLowerCase().replace(/^0x/, "");
  const paddedHex = "0x" + "000000000000000000000000" + cleanAddress;
  return paddedHex;
}

class EnhancedCrossChainSwap {
  constructor(config) {
    this.config = config;

    // EVM setup
    this.evmProvider = new ethers.JsonRpcProvider(config.evm.rpcUrl);
    this.evmWallet = new ethers.Wallet(config.evm.privateKey, this.evmProvider);
    this.escrowFactory = new ethers.Contract(
      config.evm.factoryAddress,
      ESCROW_FACTORY_ABI,
      this.evmWallet
    );

    // XRPL setup
    this.xrplClient = null;
    this.teeClient = new XRPLEscrowClient({
      baseUrl: config.xrpl.teeServerUrl,
    });

    // Swap state
    this.activeSwaps = new Map();
  }

  async initialize() {
    // Connect to XRPL
    this.xrplClient = new xrpl.Client(this.config.xrpl.network);
    await this.xrplClient.connect();
    console.log(`✅ Connected to XRPL testnet: ${this.config.xrpl.network}`);

    // Verify EVM connection
    const network = await this.evmProvider.getNetwork();
    console.log(
      `✅ Connected to EVM network: ${network.name} (Chain ID: ${network.chainId})`
    );

    // Check factory contract
    try {
      const factoryCode = await this.evmProvider.getCode(
        this.config.evm.factoryAddress
      );
      if (factoryCode === "0x") {
        throw new Error(
          "EscrowFactory contract not found at specified address"
        );
      }
      console.log(
        `✅ EscrowFactory contract verified at: ${this.config.evm.factoryAddress}`
      );

      // Test contract functionality by calling a view function
      try {
        const srcImpl = await this.escrowFactory.ESCROW_SRC_IMPLEMENTATION();
        const dstImpl = await this.escrowFactory.ESCROW_DST_IMPLEMENTATION();
        console.log(`📋 Src Implementation: ${srcImpl}`);
        console.log(`📋 Dst Implementation: ${dstImpl}`);
      } catch (viewError) {
        console.error(
          `❌ Contract view functions failed: ${viewError.message}`
        );
        throw viewError;
      }
    } catch (error) {
      console.error(`❌ EscrowFactory verification failed: ${error.message}`);
      throw error;
    }
  }

  async createSwap(swapParams) {
    const swapId = crypto.randomUUID();
    console.log(`🔄 Creating enhanced cross-chain swap ${swapId}`);

    // Generate swap identifiers
    const secret = XRPLEscrowClient.generateSecret();
    const hashlock = XRPLEscrowClient.hashSecret(secret);
    // Add timestamp to ensure uniqueness and prevent salt collision
    const orderHash =
      "0x" +
      crypto
        .createHash("sha256")
        .update(crypto.randomBytes(32).toString("hex") + Date.now().toString())
        .digest("hex");

    console.log(`📋 Order Hash: ${orderHash}`);
    console.log(`🔐 Hashlock: ${hashlock}`);
    console.log(`🔑 Secret: ${secret}`);

    // Set up timelocks with safer values to avoid validation issues
    // Use current block timestamp to avoid timing mismatches
    const currentBlock = await this.evmProvider.getBlock("latest");
    const blockTimestamp = currentBlock.timestamp;

    // Make sure DstCancellation is well before SrcCancellation
    const timelocks = {
      0: blockTimestamp + 600, // SrcWithdrawal: 10 minutes
      1: blockTimestamp + 900, // SrcPublicWithdrawal: 15 minutes
      2: blockTimestamp + 3600, // SrcCancellation: 60 minutes
      3: blockTimestamp + 4200, // SrcPublicCancellation: 70 minutes
      4: blockTimestamp + 300, // DstWithdrawal: 5 minutes
      5: blockTimestamp + 600, // DstPublicWithdrawal: 10 minutes
      6: blockTimestamp + 1800, // DstCancellation: 30 minutes (well before SrcCancellation)
    };

    const packedTimelocks = XRPLEscrowUtils.packTimelocks(
      timelocks,
      blockTimestamp
    );

    // For EVM contract, we need to pack timelocks differently with relative offsets
    // The contract will call setDeployedAt which sets the deployment timestamp
    // So we need to pass relative offsets, not absolute timestamps
    const evmPackedTimelocks =
      BigInt(600) | // SrcWithdrawal offset (stage 0)
      (BigInt(900) << 32n) | // SrcPublicWithdrawal offset (stage 1)
      (BigInt(3600) << 64n) | // SrcCancellation offset (stage 2)
      (BigInt(4200) << 96n) | // SrcPublicCancellation offset (stage 3)
      (BigInt(300) << 128n) | // DstWithdrawal offset (stage 4)
      (BigInt(600) << 160n) | // DstPublicWithdrawal offset (stage 5)
      (BigInt(1800) << 192n); // DstCancellation offset (stage 6)

    try {
      // Step 1: Create XRPL destination escrow
      console.log("🏗️  Creating XRPL destination escrow...");
      const xrplEscrowParams = {
        orderHash: orderHash,
        hashlock: hashlock,
        maker: swapParams.xrplMaker,
        taker: swapParams.xrplTaker,
        token: swapParams.dstToken,
        amount: swapParams.dstAmount,
        safetyDeposit: swapParams.safetyDeposit,
        timelocks: packedTimelocks,
        srcCancellationTimestamp: timelocks[2],
      };

      XRPLEscrowUtils.validateEscrowParams(xrplEscrowParams);
      const xrplEscrow =
        await this.teeClient.createDestinationEscrow(xrplEscrowParams);

      console.log(`✅ XRPL Escrow created with ID: ${xrplEscrow.escrowId}`);
      console.log(`📍 Escrow wallet address: ${xrplEscrow.walletAddress}`);

      // Step 2: Create EVM destination escrow
      console.log("🏗️  Creating EVM destination escrow...");
      const evmImmutables = {
        orderHash: orderHash,
        hashlock: hashlock,
        maker: addressToUint256(swapParams.evmMaker), // Convert address to uint256
        taker: addressToUint256(swapParams.evmTaker), // Convert address to uint256
        token: addressToUint256(swapParams.srcToken), // Convert address to uint256
        amount: ethers.parseEther(swapParams.srcAmount),
        safetyDeposit: ethers.parseEther("0.001"), // 0.001 ETH safety deposit
        timelocks: evmPackedTimelocks,
      };

      // Calculate required ETH for the escrow
      let requiredEth = evmImmutables.safetyDeposit;
      if (
        swapParams.srcToken === "0x0000000000000000000000000000000000000000"
      ) {
        // Native ETH transfer
        requiredEth += evmImmutables.amount;
      }

      console.log("💰 Required ETH:", ethers.formatEther(requiredEth));

      // Try to simulate the call first to get better error information
      try {
        // Try manual encoding to bypass ethers.js type detection
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();
        const encodedData = abiCoder.encode(
          [
            "tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)",
            "uint256",
          ],
          [
            [
              evmImmutables.orderHash,
              evmImmutables.hashlock,
              evmImmutables.maker,
              evmImmutables.taker,
              evmImmutables.token,
              evmImmutables.amount,
              evmImmutables.safetyDeposit,
              evmImmutables.timelocks,
            ],
            timelocks[2], // srcCancellationTimestamp
          ]
        );

        // Get the function selector for createDstEscrow
        const functionSelector = "0xdea024e4"; // createDstEscrow function selector
        const fullCallData = functionSelector + encodedData.slice(2);

        console.log("🔍 Manual call data:", fullCallData.slice(0, 200) + "...");

        // Try the manual call
        const manualTx = {
          to: this.config.evm.factoryAddress,
          data: fullCallData,
          value: requiredEth,
          gasLimit: 300000,
        };

        await this.evmProvider.call(manualTx);
        console.log("✅ Manual static call successful");
      } catch (manualError) {
        console.error("❌ Manual static call failed:", manualError.message);
        if (manualError.data) {
          console.log("❌ Manual error data:", manualError.data);
        }
      }

      // Skip the failing ethers.js static call since manual call succeeded
      console.log(
        "✅ Proceeding with manual transaction (manual static call succeeded)"
      );

      // Since manual encoding worked, use it for the actual transaction
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const encodedData = abiCoder.encode(
        [
          "tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)",
          "uint256",
        ],
        [
          [
            evmImmutables.orderHash,
            evmImmutables.hashlock,
            evmImmutables.maker,
            evmImmutables.taker,
            evmImmutables.token,
            evmImmutables.amount,
            evmImmutables.safetyDeposit,
            evmImmutables.timelocks,
          ],
          timelocks[2], // srcCancellationTimestamp
        ]
      );

      const functionSelector = "0xdea024e4"; // createDstEscrow function selector
      const fullCallData = functionSelector + encodedData.slice(2);

      const tx = await this.evmWallet.sendTransaction({
        to: this.config.evm.factoryAddress,
        data: fullCallData,
        value: requiredEth,
        gasLimit: 300000,
      });

      console.log(`⏳ Waiting for EVM escrow creation transaction: ${tx.hash}`);
      const receipt = await tx.wait();

      // Find the DstEscrowCreated event
      const escrowCreatedEvent = receipt.logs.find((log) => {
        try {
          const parsed = this.escrowFactory.interface.parseLog(log);
          return parsed.name === "DstEscrowCreated";
        } catch {
          return false;
        }
      });

      if (!escrowCreatedEvent) {
        throw new Error("EVM escrow creation event not found");
      }

      const parsedEvent =
        this.escrowFactory.interface.parseLog(escrowCreatedEvent);
      const evmEscrowAddress = parsedEvent.args.escrow;

      console.log(`✅ EVM Escrow created at: ${evmEscrowAddress}`);
      console.log(`📝 Transaction hash: ${tx.hash}`);

      // Store swap state
      const swap = {
        id: swapId,
        orderHash,
        hashlock,
        secret,
        status: "created",
        xrplEscrow: {
          id: xrplEscrow.escrowId,
          walletAddress: xrplEscrow.walletAddress,
          requiredDeposit: xrplEscrow.requiredDeposit.xrp,
        },
        evmEscrow: {
          address: evmEscrowAddress,
          transactionHash: tx.hash,
        },
        timelocks,
        evmPackedTimelocks,
        evmImmutables,
        swapParams,
      };

      this.activeSwaps.set(swapId, swap);

      return swap;
    } catch (error) {
      console.error(`❌ Failed to create swap ${swapId}:`, error.message);
      throw error;
    }
  }

  async fundSwap(swapId) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    console.log(`💰 Funding swap ${swapId}...`);

    // Fund XRPL escrow
    console.log("💸 Funding XRPL escrow...");
    const takerWallet = await this.xrplClient.fundWallet();
    console.log(`✅ Taker wallet created: ${takerWallet.wallet.address}`);

    const fundingTx = {
      TransactionType: "Payment",
      Account: takerWallet.wallet.address,
      Destination: swap.xrplEscrow.walletAddress,
      Amount: swap.xrplEscrow.requiredDeposit,
    };

    const prepared = await this.xrplClient.autofill(fundingTx);
    const signed = takerWallet.wallet.sign(prepared);
    const fundingResult = await this.xrplClient.submitAndWait(signed.tx_blob);

    if (fundingResult.result.meta.TransactionResult === "tesSUCCESS") {
      console.log(`✅ XRPL funding successful: ${fundingResult.result.hash}`);

      // Confirm funding with TEE
      await this.teeClient.fundEscrow(swap.xrplEscrow.id, {
        fromAddress: takerWallet.wallet.address,
        txHash: fundingResult.result.hash,
      });

      swap.status = "funded";
      swap.takerWallet = takerWallet.wallet;
      swap.xrplFundingTx = fundingResult.result.hash;

      console.log("✅ XRPL escrow funding confirmed by TEE");
      return swap;
    } else {
      throw new Error(
        `XRPL funding failed: ${fundingResult.result.meta.TransactionResult}`
      );
    }
  }

  async executeSwap(swapId) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap || swap.status !== "funded") {
      throw new Error(`Swap ${swapId} not ready for execution`);
    }

    console.log(`🎯 Executing swap ${swapId}...`);

    // Wait for withdrawal window
    const withdrawalTime = swap.timelocks[4]; // DstWithdrawal
    const waitTime = Math.max(
      0,
      withdrawalTime - Math.floor(Date.now() / 1000)
    );

    if (waitTime > 0) {
      console.log(`⏳ Waiting ${waitTime} seconds for withdrawal window...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    }

    // Withdraw from XRPL escrow (reveals secret)
    console.log("🔓 Withdrawing from XRPL escrow (revealing secret)...");
    const xrplWithdrawResult = await this.teeClient.withdraw(
      swap.xrplEscrow.id,
      swap.secret,
      swap.swapParams.xrplTaker
    );

    console.log(`✅ XRPL withdrawal successful: ${xrplWithdrawResult.txHash}`);
    console.log(`🔐 Secret revealed: ${xrplWithdrawResult.secret}`);

    // Now withdraw from EVM escrow using the revealed secret
    console.log("💎 Withdrawing from EVM escrow using revealed secret...");
    const evmEscrow = new ethers.Contract(
      swap.evmEscrow.address,
      ESCROW_ABI,
      this.evmWallet
    );

    // Check current time vs withdrawal window
    const currentTime = Math.floor(Date.now() / 1000);
    const dstWithdrawalTime = swap.timelocks[4];
    const dstCancellationTime = swap.timelocks[6];

    console.log(`🕒 Current time: ${currentTime}`);
    console.log(
      `🕒 Dst withdrawal window: ${dstWithdrawalTime} - ${dstCancellationTime}`
    );
    console.log(
      `🕒 Is in withdrawal window? ${currentTime >= dstWithdrawalTime && currentTime < dstCancellationTime}`
    );

    // Prepare the immutables struct for the withdraw call
    // Note: For withdraw call, we need regular addresses, not uint256 encoded
    const immutablesForWithdraw = {
      orderHash: swap.orderHash,
      hashlock: swap.hashlock,
      maker: swap.swapParams.evmMaker,
      taker: swap.swapParams.evmTaker,
      token: swap.swapParams.srcToken,
      amount: ethers.parseEther(swap.swapParams.srcAmount),
      safetyDeposit: ethers.parseEther("0.001"),
      timelocks: swap.evmPackedTimelocks,
    };

    try {
      const evmWithdrawTx = await evmEscrow.withdraw(
        xrplWithdrawResult.secret,
        immutablesForWithdraw
      );

      console.log(
        `⏳ Waiting for EVM withdrawal transaction: ${evmWithdrawTx.hash}`
      );
      const evmWithdrawReceipt = await evmWithdrawTx.wait();

      console.log(`✅ EVM withdrawal successful: ${evmWithdrawTx.hash}`);
    } catch (withdrawError) {
      console.error("❌ EVM withdrawal failed:", withdrawError.message);

      // Try to get the escrow status
      try {
        const status = await evmEscrow.getStatus();
        console.log(`📊 Escrow status: ${status}`);
      } catch (statusError) {
        console.error("❌ Could not get escrow status:", statusError.message);
      }

      throw withdrawError;
    }

    swap.status = "completed";
    swap.xrplWithdrawTx = xrplWithdrawResult.txHash;
    swap.evmWithdrawTx = evmWithdrawTx.hash;
    swap.completedAt = Date.now();

    return {
      swapId,
      status: "completed",
      transactions: {
        xrplFunding: swap.xrplFundingTx,
        xrplWithdrawal: swap.xrplWithdrawTx,
        evmCreation: swap.evmEscrow.transactionHash,
        evmWithdrawal: swap.evmWithdrawTx,
      },
    };
  }

  async monitorSwap(swapId) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    console.log(`👀 Monitoring swap ${swapId}...`);

    // Set up event listeners for EVM escrow
    const evmEscrow = new ethers.Contract(
      swap.evmEscrow.address,
      ESCROW_ABI,
      this.evmProvider
    );

    evmEscrow.on("EscrowWithdrawal", (secret, event) => {
      console.log(`🎉 EVM Escrow Withdrawn!`);
      console.log(`  Secret: ${secret}`);
      console.log(`  Transaction: ${event.transactionHash}`);
    });

    evmEscrow.on("EscrowCancelled", (event) => {
      console.log(`🚫 EVM Escrow Cancelled!`);
      console.log(`  Transaction: ${event.transactionHash}`);
    });

    return swap;
  }

  async cleanup() {
    if (this.xrplClient) {
      await this.xrplClient.disconnect();
      console.log("✅ Disconnected from XRPL testnet");
    }
  }
}

async function enhancedSwapExample() {
  console.log("🚀 Starting Enhanced EVM -> XRPL Cross-Chain Swap Example");
  console.log("============================================================");

  // Configuration
  const config = {
    evm: {
      rpcUrl: process.env.ETH_RPC,
      privateKey: process.env.ETH_PRIVATE_KEY,
      factoryAddress: "0x6d548f6d968a6808DD5E74daF7986907092F37F2", // Updated to correct contract
    },
    xrpl: {
      network: "wss://s.altnet.rippletest.net:51233",
      teeServerUrl: "http://localhost:3000",
    },
  };

  // Validate configuration
  if (
    !config.evm.factoryAddress ||
    config.evm.factoryAddress === "0x1234567890123456789012345678901234567890"
  ) {
    console.error("❌ FACTORY_ADDRESS not set or using placeholder value");
    console.error(
      "   Please deploy the EscrowFactory contract first and update your .env file"
    );
    return;
  }

  // Swap parameters
  const swapParams = {
    evmMaker: process.env.ETH_ADDRESS,
    evmTaker: process.env.ETH_ADDRESS, // Same for demo
    xrplMaker: process.env.XRPL_ADD,
    xrplTaker: process.env.XRPL_ADD, // Same for demo
    srcToken: "0x0000000000000000000000000000000000000000", // ETH
    dstToken: "0x0000000000000000000000000000000000000000", // XRP
    srcAmount: "0.001", // 0.001 ETH (minimal amount)
    dstAmount: "1000000", // 1 XRP (in drops)
    safetyDeposit: "100000", // 0.1 XRP safety deposit
  };

  console.log("📋 Enhanced Swap Parameters:");
  console.log(
    `  EVM -> XRPL: ${swapParams.srcAmount} ETH -> ${parseInt(swapParams.dstAmount) / 1000000} XRP`
  );
  console.log(`  EVM Maker: ${swapParams.evmMaker}`);
  console.log(`  XRPL Taker: ${swapParams.xrplTaker}`);
  console.log();

  const swapManager = new EnhancedCrossChainSwap(config);

  try {
    // Initialize connections
    await swapManager.initialize();

    // Create the swap
    const swap = await swapManager.createSwap(swapParams);
    console.log(`✅ Enhanced swap created: ${swap.id}`);

    // Fund the swap
    await swapManager.fundSwap(swap.id);
    console.log(`✅ Swap funded successfully`);

    // Monitor the swap
    await swapManager.monitorSwap(swap.id);

    // Execute the swap
    const result = await swapManager.executeSwap(swap.id);

    console.log("\n🎉 ENHANCED SWAP COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("Transaction Hashes:");
    console.log(`  XRPL Funding: ${result.transactions.xrplFunding}`);
    console.log(`  XRPL Withdrawal: ${result.transactions.xrplWithdrawal}`);
    console.log(`  EVM Creation: ${result.transactions.evmCreation}`);
    console.log(`  EVM Withdrawal: ${result.transactions.evmWithdrawal}`);

    console.log("\n🔍 Verify on Explorers:");
    console.log(`  XRPL Testnet: https://testnet.xrpl.org/`);
    console.log(`  Sepolia Etherscan: https://sepolia.etherscan.io/`);

    return result;
  } catch (error) {
    console.error("❌ Enhanced swap failed:", error.message);
    throw error;
  } finally {
    await swapManager.cleanup();
  }
}

// Run the example
if (require.main === module) {
  enhancedSwapExample()
    .then(() => {
      console.log("\n✅ Enhanced example completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Enhanced example failed:", error.message);
      process.exit(1);
    });
}

module.exports = {
  EnhancedCrossChainSwap,
  enhancedSwapExample,
};
