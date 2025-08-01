const { ethers } = require("ethers");
require("dotenv/config");
const crypto = require("crypto");
const axios = require("axios");

// Configuration for ETH-XRP cross-chain swap
const config = {
  // Ethereum (Sepolia) configuration - based on DeployEscrowFactory.s.sol
  ethereum: {
    chainId: 11155111, // Sepolia
    rpcUrl: process.env.ETH_RPC,
    privateKey: process.env.ETH_PK,

    // Contract addresses from DeployEscrowFactory.s.sol
    limitOrderProtocol: "0x111111125421cA6dc452d289314280a0f8842A65", // 1inch LOP on all chains
    accessToken: "0xACCe550000159e70908C0499a1119D04e7039C28", // Access token on all chains
    feeToken: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", // USDT testnet token on Sepolia

    // IMPORTANT: Set this in your .env file after deploying EscrowFactory
    escrowFactory: process.env.ESCROW_FACTORY,

    // Test tokens
    usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
  },

  // XRP Ledger configuration - matches serve-escrow.js
  xrpl: {
    network: process.env.XRPL_URL, // XRPL Testnet
    xrplServerUrl: "http://localhost:3000", // Local server from serve-escrow.js
  },

  // Swap parameters
  swap: {
    srcAmount: "0.001", // 0.001 ETH on Ethereum (using ETH instead of USDC for simplicity)
    dstAmount: "1000000", // 1 XRP (in drops) on XRPL
    safetyDeposit: "100000", // 0.1 XRP safety deposit
    rescueDelay: 691200, // 8 days (from DeployEscrowFactory.s.sol)
  },
};

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// EscrowFactory ABI based on deployed contract (Etherscan shows uint256 for addresses)
const ESCROW_FACTORY_ABI = [
  // Main function - with uint256 types for Address types as shown on Etherscan
  "function createDstEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) dstImmutables, uint256 srcCancellationTimestamp) external payable",

  // Events - with correct signature from compiled contract
  "event DstEscrowCreated(address escrow, bytes32 hashlock, uint256 taker)",
  "event SrcEscrowCreated(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, tuple(uint256 token, uint256 amount, uint256 resolver, uint128 fee, uint256 timelocks) immutablesComplement)",

  // View functions
  "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
  "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
];

// Escrow contract ABI (corrected)
const ESCROW_ABI = [
  "function withdraw(bytes32 secret, tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function cancel(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function getStatus() external view returns (uint8)",
  "event EscrowWithdrawal(bytes32 secret)",
  "event EscrowCancelled()",
];

// Helper function to convert address to uint256 format for Address type
function addressToUint256(address) {
  // Convert address to uint256 (Address type is uint256)
  return BigInt(address);
}

// XRPL Client (simplified version)
class XRPLClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async createDestinationEscrow(params) {
    try {
      const response = await axios.post(`${this.baseUrl}/escrow/create-dst`, {
        ...params,
        type: "dst",
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `local xrpl server Error: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async fundEscrow(escrowId, fundingData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/escrow/${escrowId}/fund`,
        fundingData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `local xrpl server Error: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async withdraw(escrowId, secret, callerAddress) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/escrow/${escrowId}/withdraw`,
        {
          secret,
          callerAddress,
          isPublic: false,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `local xrpl Server Error: ${error.response?.data?.error || error.message}`
      );
    }
  }

  static generateSecret() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  static hashSecret(secret) {
    return ethers.keccak256(secret);
  }
}

class EthXrpCrossChainOrder {
  constructor() {
    // Validate configuration first
    if (
      !config.ethereum.escrowFactory ||
      config.ethereum.escrowFactory ===
        "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        "ESCROW_FACTORY environment variable not set. Please deploy EscrowFactory first."
      );
    }

    // Initialize Ethereum provider and wallet
    this.ethProvider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);
    this.ethWallet = new ethers.Wallet(
      config.ethereum.privateKey,
      this.ethProvider
    );

    // Initialize contracts
    this.escrowFactory = new ethers.Contract(
      config.ethereum.escrowFactory,
      ESCROW_FACTORY_ABI,
      this.ethWallet
    );

    // Initialize XRPL  client
    this.xrplClient = new XRPLClient(config.xrpl.xrplServerUrl);

    // Active orders storage
    this.activeOrders = new Map();
  }

  async initialize() {
    console.log("🚀 Initializing ETH-XRP Cross-Chain Order System...");
    console.log("📋 Based on 1inch LOP SDK and EscrowFactory contract");

    try {
      // Check Ethereum connection
      const network = await this.ethProvider.getNetwork();
      console.log(
        `✅ Connected to Ethereum: ${network.name} (Chain ID: ${network.chainId})`
      );

      // Check wallet balance
      const ethBalance = await this.ethProvider.getBalance(
        this.ethWallet.address
      );
      console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

      // Verify EscrowFactory contract
      const factoryCode = await this.ethProvider.getCode(
        config.ethereum.escrowFactory
      );
      if (factoryCode === "0x") {
        throw new Error(
          "EscrowFactory contract not found at specified address"
        );
      }

      // Get implementation addresses
      try {
        const srcImpl = await this.escrowFactory.ESCROW_SRC_IMPLEMENTATION();
        const dstImpl = await this.escrowFactory.ESCROW_DST_IMPLEMENTATION();
        console.log(
          `✅ EscrowFactory verified at: ${config.ethereum.escrowFactory}`
        );
        console.log(`📋 Src Implementation: ${srcImpl}`);
        console.log(`📋 Dst Implementation: ${dstImpl}`);
      } catch (error) {
        console.log("⚠️  Could not verify EscrowFactory implementations");
        console.log("💡 Make sure the contract is properly deployed");
      }

      // Check xrpl server
      try {
        const response = await axios.get(`${config.xrpl.xrplServerUrl}/health`);
        console.log(`✅ XRPL Server connected: ${response.data.status}`);
      } catch (error) {
        console.log(
          "⚠️  XRPL Server not available. Please start serve-escrow.js"
        );
        console.log("💡 Run: node serve-escrow.js");
      }

      console.log(`📋 Wallet Address: ${this.ethWallet.address}`);
    } catch (error) {
      console.error("❌ Initialization failed:", error.message);
      throw error;
    }
  }

  async createCrossChainOrder() {
    console.log("\n🔄 Creating ETH-XRP Cross-Chain Order using 1inch LOP...");

    try {
      // Generate order identifiers using the pattern from evmToXrplSwapWithRealEVM.js
      const secret = XRPLClient.generateSecret();
      const hashlock = XRPLClient.hashSecret(secret);
      const orderHash =
        "0x" +
        crypto
          .createHash("sha256")
          .update(
            crypto.randomBytes(32).toString("hex") + Date.now().toString()
          )
          .digest("hex");
      const orderId = crypto.randomUUID();

      console.log(`📋 Order ID: ${orderId}`);
      console.log(`📋 Order Hash: ${orderHash}`);
      console.log(`🔐 Hashlock: ${hashlock}`);
      console.log(`🔑 Secret: ${secret}`);

      // Set up timelocks based on evmToXrplSwapWithRealEVM.js pattern
      const currentBlock = await this.ethProvider.getBlock("latest");
      const blockTimestamp = currentBlock.timestamp;

      const timelocks = {
        0: blockTimestamp + 600, // SrcWithdrawal: 10 minutes
        1: blockTimestamp + 900, // SrcPublicWithdrawal: 15 minutes
        2: blockTimestamp + 3600, // SrcCancellation: 60 minutes
        3: blockTimestamp + 4200, // SrcPublicCancellation: 70 minutes
        4: blockTimestamp + 60, // DstWithdrawal: 1 minute
        5: blockTimestamp + 1800, // DstPublicWithdrawal: 30 minutes
        6: blockTimestamp + 1800, // DstCancellation: 30 minutes (before SrcCancellation)
      };

      // Pack timelocks for EVM contract (relative offsets)
      const evmPackedTimelocks =
        BigInt(600) | // SrcWithdrawal offset
        (BigInt(900) << 32n) | // SrcPublicWithdrawal offset
        (BigInt(3600) << 64n) | // SrcCancellation offset
        (BigInt(4200) << 96n) | // SrcPublicCancellation offset
        (BigInt(60) << 128n) | // DstWithdrawal offset (1 minute)
        (BigInt(1800) << 160n) | // DstPublicWithdrawal offset (30 minutes)
        (BigInt(1800) << 192n); // DstCancellation offset (30 minutes)

      // Pack timelocks for XRPL (absolute timestamps)
      const xrplPackedTimelocks = this.packTimelocksForXRPL(
        timelocks,
        blockTimestamp
      );

      // Create order data structure
      const order = {
        id: orderId,
        orderHash,
        hashlock,
        secret,
        status: "created",

        // Ethereum escrow data
        ethereum: {
          maker: this.ethWallet.address,
          taker: this.ethWallet.address, // Same for demo
          token: "0x0000000000000000000000000000000000000000", // ETH
          amount: ethers.parseEther(config.swap.srcAmount),
          safetyDeposit: ethers.parseEther("0.001"), // 0.001 ETH safety deposit
          timelocks: evmPackedTimelocks,
        },

        // XRP escrow data
        xrpl: {
          maker: "raxrWpmoQzywhX2zD7RAk4FtEJENvNbmCW", // Funded XRPL testnet address for receiving XRP
          taker: this.ethWallet.address, // ETH wallet will receive XRP
          token: "0x0000000000000000000000000000000000000000", // XRP native
          amount: BigInt(config.swap.dstAmount), // 1 XRP in drops as BigInt
          safetyDeposit: BigInt(config.swap.safetyDeposit), // 0.1 XRP safety deposit as BigInt
          timelocks: xrplPackedTimelocks,
        },

        timelocks,
        createdAt: Date.now(),
      };

      console.log("⏰ Timelocks configured:");
      console.log(
        `  Src Withdrawal: ${new Date(timelocks[0] * 1000).toISOString()}`
      );
      console.log(
        `  Dst Withdrawal: ${new Date(timelocks[4] * 1000).toISOString()}`
      );
      console.log(
        `  Src Cancellation: ${new Date(timelocks[2] * 1000).toISOString()}`
      );

      this.activeOrders.set(orderId, order);
      console.log(`✅ ETH-XRP cross-chain order created successfully!`);

      return order;
    } catch (error) {
      console.error("❌ Failed to create cross-chain order:", error.message);
      throw error;
    }
  }

  async createEthereumEscrow(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(
      `\n🏗️  Creating Ethereum Destination Escrow for order ${orderId}...`
    );
    console.log("📋 Using EscrowFactory.createDstEscrow() function");

    try {
      // Prepare destination escrow immutables (following deployed contract format with uint256 addresses)
      const dstImmutables = {
        orderHash: order.orderHash,
        hashlock: order.hashlock,
        maker: addressToUint256(order.ethereum.maker),
        taker: addressToUint256(order.ethereum.taker),
        token: addressToUint256(order.ethereum.token),
        amount: order.ethereum.amount,
        safetyDeposit: order.ethereum.safetyDeposit,
        timelocks: order.ethereum.timelocks,
      };

      // Source cancellation timestamp (for validation)
      const srcCancellationTimestamp = order.timelocks[2];

      console.log("📤 Creating destination escrow with parameters:");
      console.log(`  Order Hash: ${dstImmutables.orderHash}`);
      console.log(`  Hashlock: ${dstImmutables.hashlock}`);
      console.log(`  Maker: ${dstImmutables.maker}`);
      console.log(`  Taker: ${dstImmutables.taker}`);
      console.log(`  Token: ${dstImmutables.token}`);
      console.log(`  Amount: ${ethers.formatEther(dstImmutables.amount)} ETH`);
      console.log(
        `  Safety Deposit: ${ethers.formatEther(dstImmutables.safetyDeposit)} ETH`
      );

      // Calculate required ETH
      let requiredEth = dstImmutables.safetyDeposit;
      if (
        order.ethereum.token === "0x0000000000000000000000000000000000000000"
      ) {
        requiredEth += dstImmutables.amount;
      }

      console.log("💰 Required ETH:", ethers.formatEther(requiredEth));

      // Manual encoding like in evmToXrplSwapWithRealEVM.js
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();

      console.log("🔧 Debug: Encoding parameters...");
      console.log("  Order Hash:", dstImmutables.orderHash);
      console.log("  Hashlock:", dstImmutables.hashlock);
      console.log("  Maker:", dstImmutables.maker.toString());
      console.log("  Taker:", dstImmutables.taker.toString());
      console.log("  Token:", dstImmutables.token.toString());
      console.log("  Amount:", dstImmutables.amount.toString());
      console.log("  Safety Deposit:", dstImmutables.safetyDeposit.toString());
      console.log("  Timelocks:", dstImmutables.timelocks.toString());
      console.log(
        "  Src Cancellation Timestamp:",
        srcCancellationTimestamp.toString()
      );

      const encodedData = abiCoder.encode(
        [
          "tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)",
          "uint256",
        ],
        [
          [
            dstImmutables.orderHash,
            dstImmutables.hashlock,
            dstImmutables.maker,
            dstImmutables.taker,
            dstImmutables.token,
            dstImmutables.amount,
            dstImmutables.safetyDeposit,
            dstImmutables.timelocks,
          ],
          srcCancellationTimestamp,
        ]
      );

      // Compute the correct function selector
      const functionSignature =
        "createDstEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256),uint256)";
      const functionSelector = ethers.id(functionSignature).substring(0, 10);
      const fullCallData = functionSelector + encodedData.slice(2);

      console.log("🔧 Debug: Function signature:", functionSignature);
      console.log("🔧 Debug: Computed function selector:", functionSelector);

      console.log("🔧 Debug: Encoded data length:", encodedData.length);
      console.log("🔧 Debug: Full call data length:", fullCallData.length);
      console.log(
        "🔧 Debug: Call data starts with:",
        fullCallData.substring(0, 20)
      );

      // Debug timelock validation
      const currentBlock = await this.ethProvider.getBlock("latest");
      const currentBlockTimestamp = currentBlock.timestamp;
      console.log("🔧 Debug: Timelock validation:");
      console.log("  Dst Cancellation offset:", BigInt(1800));
      console.log("  Src Cancellation Timestamp:", srcCancellationTimestamp);
      console.log("  Current block timestamp:", currentBlockTimestamp);
      console.log(
        "  Dst Cancellation absolute time:",
        currentBlockTimestamp + 1800
      );
      console.log(
        "  Validation check:",
        currentBlockTimestamp + 1800 < srcCancellationTimestamp
      );

      const tx = await this.ethWallet.sendTransaction({
        to: config.ethereum.escrowFactory,
        data: fullCallData,
        value: requiredEth,
        gasLimit: 500000, // Increased gas limit for complex contract interaction
      });

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(
        `✅ Destination escrow created and funded! Block: ${receipt.blockNumber}`
      );

      // Store deployedAt timestamp (block timestamp) for later immutables hashing
      const creationBlock = await this.ethProvider.getBlock(
        receipt.blockNumber
      );
      const deployedAt = BigInt(creationBlock.timestamp);

      // Timelocks with deployedAt in the top 32 bits (bits 224-255)
      const timelocksWithDeployedAt =
        dstImmutables.timelocks | (deployedAt << 224n);

      order.ethereum.deployedAt = Number(deployedAt);
      order.ethereum.timelocksWithDeployedAt = timelocksWithDeployedAt;
      console.log(`💰 Funded with: ${ethers.formatEther(requiredEth)} ETH`);

      // Find the DstEscrowCreated event
      const escrowEvent = receipt.logs.find((log) => {
        try {
          const parsed = this.escrowFactory.interface.parseLog(log);
          return parsed.name === "DstEscrowCreated";
        } catch {
          return false;
        }
      });

      let escrowAddress = null;
      if (escrowEvent) {
        const parsedEvent = this.escrowFactory.interface.parseLog(escrowEvent);
        escrowAddress = parsedEvent.args.escrow;
        console.log(`📍 Destination escrow deployed at: ${escrowAddress}`);
        order.ethereum.escrowAddress = escrowAddress;
      }

      order.ethereum.creationTx = tx.hash;
      order.ethereum.fundingTx = tx.hash; // Same transaction for creation and funding
      order.ethereum.fundedAmount = ethers.formatEther(requiredEth);
      order.status = "ethereum_escrow_created_and_funded";

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        escrowAddress: escrowAddress,
        fundedAmount: ethers.formatEther(requiredEth),
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Failed to create Ethereum escrow:", error.message);
      throw error;
    }
  }

  async createXrplEscrow(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(`\n🌊 Creating XRPL Source Escrow for order ${orderId}...`);
    console.log("📋 Using local XRPL server");

    try {
      // Create XRPL escrow via local server
      const xrplEscrowParams = {
        orderHash: order.orderHash,
        hashlock: order.hashlock,
        maker: order.xrpl.maker,
        taker: order.xrpl.taker,
        token: order.xrpl.token,
        amount: order.xrpl.amount.toString(), // Convert to string for JSON serialization
        safetyDeposit: order.xrpl.safetyDeposit.toString(), // Convert to string for JSON serialization
        timelocks: order.xrpl.timelocks.toString(), // Convert BigInt to string for JSON serialization
        type: "dst", // Required by local xrpl server
        srcCancellationTimestamp: order.timelocks[2],
      };

      console.log("📋 XRPL Escrow Parameters:");
      console.log(`  Order Hash: ${xrplEscrowParams.orderHash}`);
      console.log(`  Hashlock: ${xrplEscrowParams.hashlock}`);
      console.log(
        `  Required XRP: ${parseInt(xrplEscrowParams.amount) / 1000000} XRP`
      );
      console.log(
        `  Safety Deposit: ${parseInt(xrplEscrowParams.safetyDeposit) / 1000000} XRP`
      );

      const xrplEscrow =
        await this.xrplClient.createDestinationEscrow(xrplEscrowParams);

      console.log(`✅ XRPL Escrow created with ID: ${xrplEscrow.escrowId}`);
      console.log(`📍 Escrow wallet address: ${xrplEscrow.walletAddress}`);
      console.log(`💰 XRPL Escrow auto-funded by testnet faucet`);

      order.xrpl.escrowId = xrplEscrow.escrowId;
      order.xrpl.walletAddress = xrplEscrow.walletAddress;
      order.xrpl.requiredDeposit = xrplEscrow.requiredDeposit;
      order.status = "both_escrows_created";

      return {
        escrowId: xrplEscrow.escrowId,
        walletAddress: xrplEscrow.walletAddress,
        requiredDeposit: xrplEscrow.requiredDeposit,
      };
    } catch (error) {
      console.error("❌ Failed to create XRPL escrow:", error.message);
      throw error;
    }
  }

  // Helper function to pack timelocks for XRPL
  packTimelocksForXRPL(timelocks, deployedAt) {
    // Pack timelocks into a single uint256 for XRPL (similar to EVM format)
    const stages = {};
    for (let stage = 0; stage < 7; stage++) {
      const offset = timelocks[stage] - deployedAt;
      stages[stage] = offset;
    }

    return (
      BigInt(stages[0]) |
      (BigInt(stages[1]) << 32n) |
      (BigInt(stages[2]) << 64n) |
      (BigInt(stages[3]) << 96n) |
      (BigInt(stages[4]) << 128n) |
      (BigInt(stages[5]) << 160n) |
      (BigInt(stages[6]) << 192n)
    );
  }

  // ATOMIC SWAP EXECUTION METHODS

  // Method 1: Withdraw from Ethereum Escrow (reveal secret)
  async withdrawFromEthereumEscrow(orderId, secret = null) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!order.ethereum.escrowAddress) {
      throw new Error(`Ethereum escrow address not found for order ${orderId}`);
    }

    // Use the stored secret if none provided
    const withdrawSecret = secret || order.secret;

    console.log(
      `\n🔓 Withdrawing from Ethereum Escrow for order ${orderId}...`
    );
    console.log(`📍 Escrow Address: ${order.ethereum.escrowAddress}`);
    console.log(`🔑 Using Secret: ${withdrawSecret}`);

    try {
      // Create escrow contract instance
      const escrowContract = new ethers.Contract(
        order.ethereum.escrowAddress,
        ESCROW_ABI,
        this.ethWallet
      );

      // Prepare immutables structure for withdrawal
      const immutables = {
        orderHash: order.orderHash,
        hashlock: order.hashlock,
        maker: addressToUint256(order.ethereum.maker),
        taker: addressToUint256(order.ethereum.taker),
        token: addressToUint256(order.ethereum.token),
        amount: order.ethereum.amount,
        safetyDeposit: order.ethereum.safetyDeposit,
        timelocks: order.ethereum.timelocks,
      };

      // Patch timelocks to include deployedAt (top 32 bits)
      immutables.timelocks =
        order.ethereum.timelocksWithDeployedAt ||
        order.ethereum.timelocks | (BigInt(order.ethereum.deployedAt) << 224n);

      // Check timing constraints
      const currentTime = Math.floor(Date.now() / 1000);
      const dstWithdrawalTime = order.timelocks[4];
      const dstPublicWithdrawalTime = order.timelocks[5];

      console.log("⏰ Timing Check:");
      console.log(
        `  Current Time: ${new Date(currentTime * 1000).toISOString()}`
      );
      console.log(
        `  Dst Withdrawal Window: ${new Date(dstWithdrawalTime * 1000).toISOString()}`
      );
      console.log(
        `  Dst Public Withdrawal: ${new Date(dstPublicWithdrawalTime * 1000).toISOString()}`
      );

      if (currentTime < dstWithdrawalTime) {
        console.log("⚠️  Warning: Withdrawal might be too early");
      } else if (currentTime > dstPublicWithdrawalTime) {
        console.log("⚠️  Warning: Withdrawal might be too late");
      } else {
        console.log("✅ Timing looks good for withdrawal");
      }

      console.log("📤 Calling withdraw function with parameters:");
      console.log(`  Secret: ${withdrawSecret}`);
      console.log(`  Order Hash: ${immutables.orderHash}`);
      console.log(`  Hashlock: ${immutables.hashlock}`);

      // Try using the contract interface directly
      console.log("🔧 Debug: Using contract interface for withdrawal...");

      // Debug the function call data
      console.log("🔧 Debug: Function call parameters:");
      console.log("  Secret:", withdrawSecret);
      console.log("  Immutables array:", [
        immutables.orderHash,
        immutables.hashlock,
        immutables.maker.toString(),
        immutables.taker.toString(),
        immutables.token.toString(),
        immutables.amount.toString(),
        immutables.safetyDeposit.toString(),
        immutables.timelocks.toString(),
      ]);

      // Try to encode the function call manually to debug
      const functionSignature =
        "withdraw(bytes32,(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256))";
      const functionSelector = ethers.id(functionSignature).substring(0, 10);

      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const encodedData = abiCoder.encode(
        [
          "bytes32",
          "tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)",
        ],
        [
          withdrawSecret,
          [
            immutables.orderHash,
            immutables.hashlock,
            immutables.maker,
            immutables.taker,
            immutables.token,
            immutables.amount,
            immutables.safetyDeposit,
            immutables.timelocks,
          ],
        ]
      );

      const fullCallData = functionSelector + encodedData.slice(2);
      console.log("🔧 Debug: Manual encoding:");
      console.log("  Function selector:", functionSelector);
      console.log("  Encoded data length:", encodedData.length);
      console.log("  Full call data length:", fullCallData.length);
      console.log("  Call data starts with:", fullCallData.substring(0, 20));

      // Call withdraw function using manual encoding
      const transactionObject = {
        to: order.ethereum.escrowAddress,
        data: fullCallData,
        gasLimit: 300000, // Increased gas limit for complex withdrawal
      };

      console.log("🔧 Debug: Transaction object:");
      console.log("  To:", transactionObject.to);
      console.log("  Data length:", transactionObject.data.length);
      console.log(
        "  Data starts with:",
        transactionObject.data.substring(0, 20)
      );
      console.log("  Gas limit:", transactionObject.gasLimit);

      // Log the wallet and provider info
      console.log("🔧 Debug: Wallet info:");
      console.log("  Wallet address:", this.ethWallet.address);
      console.log("  Provider connected:", !!this.ethProvider);

      // Check if this is a smart contract
      const code = await this.ethProvider.getCode(transactionObject.to);
      console.log("🔧 Debug: Target contract info:");
      console.log("  Contract code length:", code.length);
      console.log("  Is contract:", code !== "0x");

      // Try to get current nonce
      const nonce = await this.ethProvider.getTransactionCount(
        this.ethWallet.address
      );
      console.log("🔧 Debug: Nonce:", nonce);

      // Add extra validation before sending
      console.log("🔧 Debug: Final validation before sending:");
      console.log("  Transaction object keys:", Object.keys(transactionObject));
      console.log("  Data field type:", typeof transactionObject.data);
      console.log(
        "  Data field content (first 50 chars):",
        transactionObject.data.substring(0, 50)
      );

      const tx = await this.ethWallet.sendTransaction(transactionObject);

      console.log(`⏳ Withdrawal transaction submitted: ${tx.hash}`);
      console.log("🔧 Debug: Submitted transaction details:");
      console.log("  TX data field:", tx.data || "EMPTY");
      console.log("  TX data length:", (tx.data || "").length);

      const receipt = await tx.wait();
      console.log(
        `✅ Ethereum withdrawal successful! Block: ${receipt.blockNumber}`
      );

      // Check for EscrowWithdrawal event
      const withdrawalEvent = receipt.logs.find((log) => {
        try {
          const parsed = escrowContract.interface.parseLog(log);
          return parsed.name === "EscrowWithdrawal";
        } catch {
          return false;
        }
      });

      if (withdrawalEvent) {
        const parsedEvent = escrowContract.interface.parseLog(withdrawalEvent);
        console.log(`🎉 Secret revealed: ${parsedEvent.args.secret}`);
      }

      // Update order status
      order.ethereum.withdrawalTx = tx.hash;
      order.ethereum.withdrawnAt = Date.now();
      order.status = "ethereum_withdrawn";

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        secretRevealed: withdrawSecret,
      };
    } catch (error) {
      console.error(
        "❌ Failed to withdraw from Ethereum escrow:",
        error.message
      );
      throw error;
    }
  }

  // Method 2: Withdraw from XRPL Escrow
  async withdrawFromXrplEscrow(orderId, secret = null, callerAddress = null) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!order.xrpl.escrowId) {
      throw new Error(`XRPL escrow ID not found for order ${orderId}`);
    }

    // Use stored secret and caller address if none provided
    const withdrawSecret = secret || order.secret;
    const caller = callerAddress || order.ethereum.maker; // ETH maker receives XRP

    console.log(`\n🌊 Withdrawing from XRPL Escrow for order ${orderId}...`);
    console.log(`📍 Escrow ID: ${order.xrpl.escrowId}`);
    console.log(`🔑 Using Secret: ${withdrawSecret}`);
    console.log(`👤 Caller Address: ${caller}`);

    try {
      // Call XRPL withdrawal via local server
      const withdrawalResult = await this.xrplClient.withdraw(
        order.xrpl.escrowId,
        withdrawSecret,
        caller
      );

      console.log(`✅ XRPL withdrawal successful!`);
      console.log(`📋 Transaction Hash: ${withdrawalResult.txHash}`);
      console.log(`💰 Amount: ${withdrawalResult.amount} drops`);

      // Update order status
      order.xrpl.withdrawalTx = withdrawalResult.txHash;
      order.xrpl.withdrawnAt = Date.now();
      order.status = "both_withdrawn";

      return {
        transactionHash: withdrawalResult.txHash,
        amount: withdrawalResult.amount,
        secretUsed: withdrawSecret,
        message: withdrawalResult.message,
      };
    } catch (error) {
      console.error("❌ Failed to withdraw from XRPL escrow:", error.message);
      throw error;
    }
  }

  // Method 3: Execute Complete Atomic Swap
  async executeAtomicSwap(
    orderId,
    customSecret = null,
    recipientAddress = null
  ) {
    console.log(`\n🔄 Executing Atomic Swap for order ${orderId}...`);
    console.log("=".repeat(60));

    try {
      const order = this.activeOrders.get(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const secret = customSecret || order.secret;
      const recipient = recipientAddress || order.ethereum.maker;

      console.log(`🔑 Secret: ${secret}`);
      console.log(`👤 Recipient: ${recipient}`);
      console.log(`📋 Order Hash: ${order.orderHash}`);

      // Step 1: Withdraw from Ethereum escrow (reveal secret)
      console.log("\n📍 Step 1: Revealing secret on Ethereum...");
      const ethWithdrawal = await this.withdrawFromEthereumEscrow(
        orderId,
        secret
      );

      // Step 2: Withdraw from XRPL escrow (using revealed secret)
      console.log("\n📍 Step 2: Withdrawing from XRPL escrow...");
      const xrplWithdrawal = await this.withdrawFromXrplEscrow(
        orderId,
        secret,
        recipient
      );

      // Step 3: Get final status
      const finalStatus = await this.getOrderStatus(orderId);

      console.log("\n🎉 ATOMIC SWAP COMPLETED SUCCESSFULLY!");
      console.log("=".repeat(60));
      console.log("✅ Secret revealed on Ethereum");
      console.log("✅ Funds withdrawn from both escrows");
      console.log("✅ Cross-chain swap executed atomically");

      console.log("\n📊 Swap Summary:");
      console.log(`  Order ID: ${orderId}`);
      console.log(`  Status: ${finalStatus.status}`);
      console.log(`  ETH Withdrawal: ${ethWithdrawal.transactionHash}`);
      console.log(`  XRP Withdrawal: ${xrplWithdrawal.transactionHash}`);
      console.log(`  Secret Revealed: ${secret}`);

      console.log("\n🔍 Verify Transactions:");
      console.log(
        `  Ethereum: https://sepolia.etherscan.io/tx/${ethWithdrawal.transactionHash}`
      );
      console.log(
        `  XRPL: Check transaction ${xrplWithdrawal.transactionHash} on XRPL explorer`
      );

      return {
        orderId,
        status: "completed",
        ethereum: ethWithdrawal,
        xrpl: xrplWithdrawal,
        secretRevealed: secret,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Atomic swap execution failed:", error.message);
      throw error;
    }
  }

  // Method 4: Monitor Transaction Status
  async getTransactionStatus(txHash, chain = "ethereum") {
    try {
      if (chain === "ethereum") {
        const receipt = await this.ethProvider.getTransactionReceipt(txHash);
        return {
          hash: txHash,
          status: receipt
            ? receipt.status === 1
              ? "success"
              : "failed"
            : "pending",
          blockNumber: receipt?.blockNumber || null,
          gasUsed: receipt?.gasUsed?.toString() || null,
        };
      } else if (chain === "xrpl") {
        // For XRPL, you would typically query the XRPL client
        // This is a simplified version
        return {
          hash: txHash,
          status: "success", // Assume success for now
          ledgerIndex: null,
        };
      }
    } catch (error) {
      console.error(
        `Failed to get transaction status for ${txHash}:`,
        error.message
      );
      return {
        hash: txHash,
        status: "error",
        error: error.message,
      };
    }
  }

  async getOrderStatus(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return {
      id: order.id,
      status: order.status,
      orderHash: order.orderHash,
      hashlock: order.hashlock,

      // Ethereum escrow details
      ethereum: {
        maker: order.ethereum.maker,
        token: order.ethereum.token,
        amount: ethers.formatEther(order.ethereum.amount),
        safetyDeposit: ethers.formatEther(order.ethereum.safetyDeposit),
        escrowAddress: order.ethereum.escrowAddress,
        creationTx: order.ethereum.creationTx,
        fundingTx: order.ethereum.fundingTx || null,
        fundedAmount: order.ethereum.fundedAmount || null,
        withdrawalTx: order.ethereum.withdrawalTx || null,
      },

      // XRPL escrow details
      xrpl: {
        escrowId: order.xrpl.escrowId,
        walletAddress: order.xrpl.walletAddress,
        amount: `${parseInt(order.xrpl.amount) / 1000000} XRP`,
        safetyDeposit: `${parseInt(order.xrpl.safetyDeposit) / 1000000} XRP`,
        withdrawalTx: order.xrpl.withdrawalTx || null,
      },

      // Timestamps
      createdAt: new Date(order.createdAt).toISOString(),
    };
  }

  listActiveOrders() {
    return Array.from(this.activeOrders.keys());
  }
}

// Complete Workflow Function with Atomic Swap Execution
async function startCrossChainSwapWithExecution() {
  console.log("🚀 Starting Complete ETH-XRP Cross-Chain Atomic Swap");
  console.log("=".repeat(70));

  try {
    const orderSystem = new EthXrpCrossChainOrder();

    // Step 1: Initialize
    await orderSystem.initialize();

    // Step 2: Create cross-chain order
    const order = await orderSystem.createCrossChainOrder();

    // Step 3: Create Ethereum escrow
    const ethEscrow = await orderSystem.createEthereumEscrow(order.id);

    // Step 4: Create XRPL escrow
    const xrplEscrow = await orderSystem.createXrplEscrow(order.id);

    console.log("\n⏰ Waiting for withdrawal window to open...");
    const currentTime = Math.floor(Date.now() / 1000);
    const dstWithdrawalTime = order.timelocks[4];
    const waitTime = Math.max(
      10000, // Always wait at least 10 seconds
      (dstWithdrawalTime - currentTime) * 1000 + 10000
    ); // Wait for window + 10 seconds buffer
    console.log(
      `⏰ Waiting ${waitTime / 1000} seconds for withdrawal window...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Step 5: Execute atomic swap
    const swapResult = await orderSystem.executeAtomicSwap(order.id);

    console.log("\n🎉 COMPLETE CROSS-CHAIN SWAP FINISHED!");
    console.log("📊 Final Result:", JSON.stringify(swapResult, null, 2));

    return swapResult;
  } catch (error) {
    console.error("❌ Complete cross-chain swap failed:", error.message);
    throw error;
  }
}

// Main execution function (original setup only)
async function main() {
  console.log(
    "🚀 Starting ETH-XRP Cross-Chain Order with 1inch LOP Integration"
  );
  console.log("=".repeat(70));
  console.log("This system creates atomic swaps between:");
  console.log(`  Source: Ethereum Sepolia (${config.swap.srcAmount} ETH)`);
  console.log(
    `  Destination: XRP Ledger (${parseInt(config.swap.dstAmount) / 1000000} XRP)`
  );
  console.log("");
  console.log("🔧 Using:");
  console.log("  • 1inch Limit Order Protocol for Ethereum");
  console.log("  • EscrowFactory contract for atomic swaps");
  console.log("  • Local XRPL server for XRP integration");
  console.log("  • SHA256 hashlocks for atomicity");
  console.log("=".repeat(70));

  try {
    const orderSystem = new EthXrpCrossChainOrder();

    // Step 1: Initialize the system
    await orderSystem.initialize();

    // Step 2: Create cross-chain order
    const order = await orderSystem.createCrossChainOrder();

    // Step 3: Create Ethereum destination escrow
    const ethEscrow = await orderSystem.createEthereumEscrow(order.id);

    // Step 4: Create XRPL source escrow
    const xrplEscrow = await orderSystem.createXrplEscrow(order.id);

    // Step 5: Get final status (Ethereum escrow already funded during creation)
    const finalStatus = await orderSystem.getOrderStatus(order.id);

    console.log("\n🎉 ETH-XRP CROSS-CHAIN ORDER SETUP COMPLETED!");
    console.log("=".repeat(70));
    console.log("✅ Both escrows created successfully");
    console.log("✅ Ethereum escrow funded automatically during creation");
    console.log("✅ XRPL escrow wallet automatically funded by testnet faucet");
    console.log("✅ Ready for atomic swap execution");

    console.log("\n📊 Final Order Status:");
    console.log(JSON.stringify(finalStatus, null, 2));

    console.log("\n📈 Transaction Summary:");
    console.log(`  Order ID: ${finalStatus.id}`);
    console.log(`  Status: ${finalStatus.status}`);
    console.log(
      `  Ethereum Creation & Funding: ${finalStatus.ethereum.creationTx || "N/A"}`
    );
    console.log(
      `  Funded Amount: ${finalStatus.ethereum.fundedAmount || "N/A"} ETH`
    );
    console.log(`  XRPL Escrow ID: ${finalStatus.xrpl.escrowId || "N/A"}`);

    if (
      finalStatus.ethereum.creationTx &&
      finalStatus.ethereum.creationTx !== "N/A"
    ) {
      console.log("\n🔍 Verify on Etherscan:");
      console.log(
        `  Creation & Funding: https://sepolia.etherscan.io/tx/${finalStatus.ethereum.creationTx}`
      );
    }

    console.log("\n💡 Next Steps:");
    console.log(
      "  1. XRPL escrow wallet automatically funded by testnet faucet"
    );
    console.log("  2. Execute the atomic swap by revealing the secret");
    console.log("  3. Verify transactions on both chains");
    console.log(
      `  4. XRPL Wallet Address: ${finalStatus.xrpl.walletAddress || "N/A"}`
    );

    console.log("\n🚀 To execute the atomic swap, run:");
    console.log(
      "  const swapResult = await orderSystem.executeAtomicSwap(order.id);"
    );
  } catch (error) {
    console.error("❌ ETH-XRP cross-chain order failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = {
  EthXrpCrossChainOrder,
  config,
  XRPLClient,
  startCrossChainSwapWithExecution,
};

// Run based on command line argument
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--execute")) {
    startCrossChainSwapWithExecution().catch(console.error);
  } else {
    main().catch(console.error);
  }
}
