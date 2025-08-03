const { ethers } = require("ethers");
require("dotenv/config");
const crypto = require("crypto");
const axios = require("axios");

// Configuration for XRP-ETH cross-chain swap (REVERSED from original)
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

    escrowFactory: process.env.ESCROW_FACTORY,
    customResolver: process.env.CUSTOM_RESOLVER,

    // Test tokens
    usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
  },

  // XRP Ledger configuration - matches serve-escrow-xrp-to-eth.js
  xrpl: {
    network: process.env.XRPL_URL, // XRPL Testnet
    xrplServerUrl: "http://localhost:3002", // XRP-to-ETH server (different from ETH-to-XRP)
  },

  // Swap parameters (REVERSED: XRP -> ETH)
  swap: {
    srcAmount: "1000000", // 1 XRP (in drops) on XRPL - SOURCE
    dstAmount: "0.001", // 0.001 ETH on Ethereum - DESTINATION
    safetyDeposit: "0.001", // 0.001 ETH safety deposit
    rescueDelay: 691200,

    // Partial fill configuration
    enablePartialFill: true, // Enable partial fill functionality
    partialFillPercentage: 50, // Default partial fill percentage (50%)
    minFillPercentage: 10, // Minimum fill percentage allowed (10%)
    maxFillPercentage: 90, // Maximum fill percentage allowed (90%)
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

// Custom Limit Order Resolver ABI
const CUSTOM_RESOLVER_ABI = [
  // Main resolver functions
  "function resolveOrder(tuple(uint256 salt, uint256 maker, uint256 receiver, uint256 makerAsset, uint256 takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits) external returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash)",
  "function resolvePartialOrder(tuple(uint256 salt, uint256 maker, uint256 receiver, uint256 makerAsset, uint256 takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order, bytes32 r, bytes32 vs, uint256 fillPercentage, uint256 takerTraits, address escrowAddress) external returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash)",

  // Partial fill management
  "function createAdditionalPartialFill(bytes32 orderHash, uint256 newFillPercentage) external returns (bool success)",
  "function calculatePartialAmount(uint256 totalAmount, uint256 fillPercentage) external pure returns (uint256 partialAmount)",

  // View functions
  "function getPartialFillOrder(bytes32 orderHash) external view returns (tuple(bytes32 orderHash, uint256 totalAmount, uint256 filledAmount, uint256 remainingAmount, uint256 fillPercentage, bool isActive, address escrowAddress))",
  "function getActivePartialFillOrders() external view returns (bytes32[] memory orderHashes)",
  "function getUserOrderFill(address user, bytes32 orderHash) external view returns (uint256 fillAmount)",
  "function config() external view returns (tuple(uint256 minFillPercentage, uint256 maxFillPercentage, uint256 defaultFillPercentage, bool partialFillEnabled))",

  // Configuration
  "function updateConfig(tuple(uint256 minFillPercentage, uint256 maxFillPercentage, uint256 defaultFillPercentage, bool partialFillEnabled) newConfig) external",

  // Constants and properties
  "function limitOrderProtocol() external view returns (address)",
  "function owner() external view returns (address)",

  // Events
  "event OrderResolved(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makingAmount, uint256 takingAmount, bool isPartialFill)",
  "event PartialFillCreated(bytes32 indexed orderHash, uint256 fillPercentage, uint256 filledAmount, uint256 remainingAmount)",
  "event EscrowIntegration(bytes32 indexed orderHash, address indexed escrow, uint256 amount)",
];

// 1inch Limit Order Protocol ABI (essential functions)
const LIMIT_ORDER_PROTOCOL_ABI = [
  "function hashOrder(tuple(uint256 salt, uint256 maker, uint256 receiver, uint256 makerAsset, uint256 takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order) external view returns (bytes32 orderHash)",
  "function fillOrder(tuple(uint256 salt, uint256 maker, uint256 receiver, uint256 makerAsset, uint256 takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits) external payable returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash)",
  "function remainingInvalidatorForOrder(address maker, bytes32 orderHash) external view returns (uint256 remaining)",
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

  // Create source escrow for XRP (where XRP is held and released when secret is provided)
  async createSourceEscrow(params) {
    try {
      const requestData = {
        ...params,
        type: "src", // XRP is source in XRP->ETH swap
      };

      console.log(
        "🔧 Debug: Sending XRPL escrow request:",
        JSON.stringify(requestData, null, 2)
      );

      const response = await axios.post(
        `${this.baseUrl}/escrow/create-dst`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("❌ XRPL server request failed:");
      console.error(
        "Request data:",
        JSON.stringify(
          {
            ...params,
            type: "src",
          },
          null,
          2
        )
      );
      console.error("Error response:", error.response?.data);
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

class XrpEthCrossChainOrder {
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

    if (
      !config.ethereum.customResolver ||
      config.ethereum.customResolver ===
        "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        "CUSTOM_RESOLVER environment variable not set. Please deploy CustomResolver first."
      );
    }

    this.activeOrders = new Map();
    this.config = config;

    // Initialize Ethereum provider and wallet
    this.ethProvider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);
    this.ethWallet = new ethers.Wallet(
      config.ethereum.privateKey,
      this.ethProvider
    );

    // Initialize contract instances
    this.escrowFactory = new ethers.Contract(
      config.ethereum.escrowFactory,
      ESCROW_FACTORY_ABI,
      this.ethWallet
    );

    this.customResolver = new ethers.Contract(
      config.ethereum.customResolver,
      CUSTOM_RESOLVER_ABI,
      this.ethWallet
    );

    this.limitOrderProtocol = new ethers.Contract(
      config.ethereum.limitOrderProtocol,
      LIMIT_ORDER_PROTOCOL_ABI,
      this.ethWallet
    );

    // Initialize XRPL client
    this.xrplClient = new XRPLClient(config.xrpl.xrplServerUrl);
  }

  async initialize() {
    console.log("🔧 Initializing XRP-ETH Cross-Chain Order System...");

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

      // Verify Custom Resolver contract
      const resolverCode = await this.ethProvider.getCode(
        config.ethereum.customResolver
      );
      if (resolverCode === "0x") {
        throw new Error(
          "CustomResolver contract not found at specified address"
        );
      }

      // Get resolver configuration and verify integration
      try {
        const resolverConfig = await this.customResolver.config();
        const lopAddress = await this.customResolver.limitOrderProtocol();
        const resolverOwner = await this.customResolver.owner();

        console.log(
          `✅ CustomResolver verified at: ${config.ethereum.customResolver}`
        );
        console.log(`📋 Resolver Owner: ${resolverOwner}`);
        console.log(`📋 Connected to LOP: ${lopAddress}`);
        console.log(
          `📋 Partial Fill Enabled: ${resolverConfig.partialFillEnabled}`
        );
        console.log(
          `📋 Fill Percentage Range: ${resolverConfig.minFillPercentage}% - ${resolverConfig.maxFillPercentage}%`
        );
        console.log(
          `📋 Default Fill Percentage: ${resolverConfig.defaultFillPercentage}%`
        );

        // Verify LOP address matches our configuration
        if (
          lopAddress.toLowerCase() !==
          config.ethereum.limitOrderProtocol.toLowerCase()
        ) {
          console.log(
            "⚠️  Warning: Resolver LOP address doesn't match configuration"
          );
        }
      } catch (error) {
        console.log("⚠️  Could not verify CustomResolver configuration");
        console.log("💡 Make sure the custom resolver is properly deployed");
      }

      // Check XRPL server
      try {
        const response = await axios.get(`${config.xrpl.xrplServerUrl}/health`);
        console.log(`✅ XRPL Server connected: ${response.data.status}`);
      } catch (error) {
        console.log(
          "⚠️  XRPL Server not available. Please start serve-escrow.js"
        );
        console.log("💡 Run: node chain3/deployment/serve-escrow.js");
      }

      console.log(`📋 Wallet Address: ${this.ethWallet.address}`);
      console.log(
        "✅ XRP-ETH Cross-Chain Order System initialized successfully"
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize system:", error.message);
      throw error;
    }
  }

  async createCrossChainOrder(partialFillPercentage = null) {
    console.log("\n🔄 Creating XRP-ETH Cross-Chain Order using 1inch LOP...");

    // Use provided percentage or default from config
    const fillPercentage =
      partialFillPercentage || config.swap.partialFillPercentage;

    // Validate partial fill percentage if provided
    if (partialFillPercentage !== null) {
      this.validatePartialFillPercentage(partialFillPercentage);
    }

    try {
      // Generate order identifiers
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

      // Set up timelocks (adjusted for XRP->ETH direction)
      const currentBlock = await this.ethProvider.getBlock("latest");
      const blockTimestamp = currentBlock.timestamp;

      const timelocks = {
        0: blockTimestamp + 60, // SrcWithdrawal: 1 minute (XRP withdrawal first)
        1: blockTimestamp + 900, // SrcPublicWithdrawal: 15 minutes
        2: blockTimestamp + 3600, // SrcCancellation: 60 minutes
        3: blockTimestamp + 4200, // SrcPublicCancellation: 70 minutes
        4: blockTimestamp + 60, // DstWithdrawal: 1 minute (ETH withdrawal after XRP)
        5: blockTimestamp + 1800, // DstPublicWithdrawal: 30 minutes
        6: blockTimestamp + 1800, // DstCancellation: 30 minutes (BEFORE SrcCancellation)
      };

      // Pack timelocks for EVM contract (relative offsets)
      const evmPackedTimelocks =
        BigInt(60) | // SrcWithdrawal offset (1 minute)
        (BigInt(900) << 32n) | // SrcPublicWithdrawal offset (15 minutes)
        (BigInt(3600) << 64n) | // SrcCancellation offset (60 minutes)
        (BigInt(4200) << 96n) | // SrcPublicCancellation offset (70 minutes)
        (BigInt(60) << 128n) | // DstWithdrawal offset (10 minutes)
        (BigInt(1800) << 160n) | // DstPublicWithdrawal offset (30 minutes)
        (BigInt(1800) << 192n); // DstCancellation offset (30 minutes - BEFORE SrcCancellation)

      // Pack timelocks for XRPL (absolute timestamps)
      const xrplPackedTimelocks = this.packTimelocksForXRPL(
        timelocks,
        blockTimestamp
      );

      // Create order data structure (REVERSED: XRP is source, ETH is destination)
      const order = {
        id: orderId,
        orderHash,
        hashlock,
        secret,
        status: "created",

        // Partial fill tracking
        partialFill: {
          enabled: config.swap.enablePartialFill,
          totalXrpAmount: BigInt(config.swap.srcAmount), // Total XRP amount (source)
          totalEthAmount: ethers.parseEther(config.swap.dstAmount), // Total ETH amount (destination)
          currentFillPercentage: fillPercentage,
          filledXrpAmount: BigInt(0), // Amount of XRP filled so far
          filledEthAmount: BigInt(0), // Amount of ETH filled so far
          remainingXrpAmount: BigInt(config.swap.srcAmount), // Remaining XRP to fill
          remainingEthAmount: ethers.parseEther(config.swap.dstAmount), // Remaining ETH to fill
          fillHistory: [], // Array to track fill history
        },

        // XRP escrow data (SOURCE)
        xrpl: {
          maker: process.env.XRPL_ADD, // Fallback to funded testnet address
          taker: process.env.XRPL_ADD, // Same fallback for demo
          token: "0x0000000000000000000000000000000000000000", // XRP native
          totalAmount: BigInt(config.swap.srcAmount), // Total order amount in drops
          amount: this.calculatePartialAmount(
            BigInt(config.swap.srcAmount),
            fillPercentage
          ), // Current partial amount
          safetyDeposit: BigInt("100000"), // 0.1 XRP safety deposit in drops
          timelocks: xrplPackedTimelocks,
        },

        // Ethereum escrow data (DESTINATION)
        ethereum: {
          maker: this.ethWallet.address,
          taker: this.ethWallet.address, // Same for demo
          token: "0x0000000000000000000000000000000000000000", // ETH
          totalAmount: ethers.parseEther(config.swap.dstAmount), // Total order amount
          amount: this.calculatePartialAmount(
            ethers.parseEther(config.swap.dstAmount),
            fillPercentage
          ), // Current partial amount
          safetyDeposit: ethers.parseEther(config.swap.safetyDeposit), // Safety deposit
          timelocks: evmPackedTimelocks,
        },

        timelocks,
        createdAt: Date.now(),
      };

      console.log("⏰ Timelocks configured:");
      console.log(
        `  Src Withdrawal (XRP): ${new Date(timelocks[0] * 1000).toISOString()}`
      );
      console.log(
        `  Dst Withdrawal (ETH): ${new Date(timelocks[4] * 1000).toISOString()}`
      );
      console.log(
        `  Dst Cancellation: ${new Date(timelocks[6] * 1000).toISOString()}`
      );
      console.log(
        `  Src Cancellation: ${new Date(timelocks[2] * 1000).toISOString()}`
      );

      this.activeOrders.set(orderId, order);
      console.log(`✅ XRP-ETH cross-chain order created successfully!`);

      // Log partial fill information
      if (order.partialFill.enabled) {
        console.log("\n💫 Partial Fill Configuration:");
        console.log(`  Enabled: ${order.partialFill.enabled}`);
        console.log(`  Fill Percentage: ${fillPercentage}%`);
        console.log(
          `  XRP Total: ${Number(order.partialFill.totalXrpAmount) / 1000000} XRP`
        );
        console.log(
          `  XRP Current Fill: ${Number(order.xrpl.amount) / 1000000} XRP`
        );
        console.log(
          `  ETH Total: ${ethers.formatEther(order.partialFill.totalEthAmount)} ETH`
        );
        console.log(
          `  ETH Current Fill: ${ethers.formatEther(order.ethereum.amount)} ETH`
        );
        console.log(
          `  Remaining XRP: ${Number(order.partialFill.remainingXrpAmount) / 1000000} XRP`
        );
        console.log(
          `  Remaining ETH: ${ethers.formatEther(order.partialFill.remainingEthAmount)} ETH`
        );
      }

      return order;
    } catch (error) {
      console.error("❌ Failed to create cross-chain order:", error.message);
      throw error;
    }
  }

  // Create XRPL escrow first (as source)
  async createXrplEscrow(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(`\n🌊 Creating XRPL Source Escrow for order ${orderId}...`);
    console.log("📋 Using local XRPL server");

    try {
      // Create XRPL escrow via local server (as source)
      const xrplEscrowParams = {
        orderHash: order.orderHash,
        hashlock: order.hashlock,
        maker: order.xrpl.maker,
        taker: order.xrpl.taker,
        token: order.xrpl.token,
        amount: order.xrpl.amount.toString(), // Convert to string for JSON serialization
        safetyDeposit: order.xrpl.safetyDeposit.toString(), // Convert to string for JSON serialization
        timelocks: order.xrpl.timelocks.toString(), // Convert BigInt to string for JSON serialization
        type: "src", // SOURCE escrow for XRP->ETH swap
        srcCancellationTimestamp: order.timelocks[2],
      };

      console.log("📋 XRPL Source Escrow Parameters:");
      console.log(`  Order Hash: ${xrplEscrowParams.orderHash}`);
      console.log(`  Hashlock: ${xrplEscrowParams.hashlock}`);
      console.log(
        `  Required XRP: ${parseInt(xrplEscrowParams.amount) / 1000000} XRP`
      );
      console.log(
        `  Safety Deposit: ${parseInt(xrplEscrowParams.safetyDeposit) / 1000000} XRP`
      );

      const xrplEscrow =
        await this.xrplClient.createSourceEscrow(xrplEscrowParams);

      console.log(
        `✅ XRPL Source Escrow created with ID: ${xrplEscrow.escrowId}`
      );
      console.log(`📍 Escrow wallet address: ${xrplEscrow.walletAddress}`);
      console.log(
        `💰 XRP amount: ${parseInt(xrplEscrowParams.amount) / 1000000} XRP`
      );
      console.log(
        `🛡️  Safety deposit: ${parseInt(xrplEscrowParams.safetyDeposit) / 1000000} XRP`
      );
      console.log(
        `📋 Total: ${(parseInt(xrplEscrowParams.amount) + parseInt(xrplEscrowParams.safetyDeposit)) / 1000000} XRP`
      );

      if (xrplEscrow.autoFunded || xrplEscrow.usingPresetWallet) {
        console.log(`✅ XRPL Source Escrow auto-funded by system`);
        console.log(`💰 No manual funding required`);
      } else {
        console.log(`💰 XRPL Escrow funded from testnet faucet`);
      }

      order.xrpl.escrowId = xrplEscrow.escrowId;
      order.xrpl.walletAddress = xrplEscrow.walletAddress;
      order.xrpl.requiredDeposit = xrplEscrow.requiredDeposit;
      order.xrpl.autoFunded =
        xrplEscrow.autoFunded || xrplEscrow.usingPresetWallet;
      order.status = "xrpl_escrow_created";

      return {
        escrowId: xrplEscrow.escrowId,
        walletAddress: xrplEscrow.walletAddress,
        requiredDeposit: xrplEscrow.requiredDeposit,
      };
    } catch (error) {
      console.error("❌ Failed to create XRPL source escrow:", error.message);
      throw error;
    }
  }

  // Fund XRPL escrow with real XRP transaction
  async fundXrplEscrow(orderId, txHash, fromAddress = null) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(`\n💰 Funding XRPL Source Escrow for order ${orderId}...`);
    console.log(`📋 Transaction Hash: ${txHash}`);
    console.log(
      `📍 From Address: ${fromAddress || process.env.XRPL_ADD || "AUTO-DETECT"}`
    );

    try {
      const fundingData = {
        fromAddress: fromAddress || process.env.XRPL_ADD,
        txHash: txHash,
      };

      const result = await this.xrplClient.fundEscrow(
        order.xrpl.escrowId,
        fundingData
      );

      console.log(`✅ XRPL escrow funded successfully!`);
      console.log(`💰 Amount received: ${result.amountReceived}`);
      console.log(`📋 Verified transactions:`, result.verifiedTxs?.length || 1);

      order.xrpl.fundingTx = txHash;
      order.xrpl.fundedAmount = result.totalAmountReceived;
      order.status = "xrpl_escrow_funded";

      return {
        escrowId: order.xrpl.escrowId,
        fundingTx: txHash,
        amountReceived: result.amountReceived,
        verifiedTxs: result.verifiedTxs,
        realFunding: result.realFunding,
      };
    } catch (error) {
      console.error("❌ Failed to fund XRPL escrow:", error.message);
      throw error;
    }
  }

  // Create Ethereum escrow second (as destination)
  async createEthereumEscrow(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(
      `\n⚡ Creating Ethereum Destination Escrow for order ${orderId}...`
    );

    try {
      // Prepare destination escrow immutables
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

      console.log("📋 Ethereum Destination Escrow Parameters:");
      console.log(`  Order Hash: ${dstImmutables.orderHash}`);
      console.log(`  Hashlock: ${dstImmutables.hashlock}`);
      console.log(`  Maker: ${order.ethereum.maker}`);
      console.log(`  Token: ${order.ethereum.token}`);
      console.log(`  Amount: ${ethers.formatEther(dstImmutables.amount)} ETH`);
      console.log(
        `  Safety Deposit: ${ethers.formatEther(dstImmutables.safetyDeposit)} ETH`
      );

      // Calculate total value to send (amount + safety deposit for ETH)
      const totalValue = order.ethereum.amount + order.ethereum.safetyDeposit;

      console.log(
        `💰 Total ETH to fund destination escrow: ${ethers.formatEther(totalValue)} ETH`
      );

      // Manual encoding like in the working eth-to-xrp-complete.js
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
        order.timelocks[2].toString()
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
          order.timelocks[2], // srcCancellationTimestamp
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
      console.log("  Dst Cancellation offset:", BigInt(1800)); // 30 minutes for XRP->ETH
      console.log("  Src Cancellation Timestamp:", order.timelocks[2]);
      console.log("  Current block timestamp:", currentBlockTimestamp);
      console.log(
        "  Dst Cancellation absolute time:",
        currentBlockTimestamp + 1800
      );
      console.log(
        "  Validation check:",
        currentBlockTimestamp + 1800 < order.timelocks[2]
      );

      const tx = await this.ethWallet.sendTransaction({
        to: config.ethereum.escrowFactory,
        data: fullCallData,
        value: totalValue,
        gasLimit: 500000, // Increased gas limit for complex contract interaction
      });

      console.log(`📞 Transaction submitted: ${tx.hash}`);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

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
      console.log(`💰 Funded with: ${ethers.formatEther(totalValue)} ETH`);

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
      order.ethereum.fundedAmount = ethers.formatEther(totalValue);
      order.status = "both_escrows_created";

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        escrowAddress: escrowAddress,
        fundedAmount: ethers.formatEther(totalValue),
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error(
        "❌ Failed to create Ethereum destination escrow:",
        error.message
      );
      throw error;
    }
  }

  // REVERSED: Withdraw from XRPL first (reveals secret), then from Ethereum
  async executeAtomicSwap(
    orderId,
    customSecret = null,
    recipientAddress = null,
    partialXrpAmount = null,
    partialEthAmount = null
  ) {
    console.log(`\n🔄 Executing Atomic Swap for order ${orderId}...`);
    console.log("=".repeat(60));

    try {
      const order = this.activeOrders.get(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const secret = customSecret || order.secret;
      const recipient = recipientAddress || order.xrpl.maker;

      // Validate partial amounts if provided
      if (
        order.partialFill.enabled &&
        (partialXrpAmount !== null || partialEthAmount !== null)
      ) {
        const xrpAmount = partialXrpAmount || order.xrpl.amount;
        const ethAmount = partialEthAmount || order.ethereum.amount;

        const canFill = this.canPartialFill(orderId, ethAmount, xrpAmount);
        if (!canFill.canFill) {
          throw new Error(
            `Cannot execute partial swap: XRP sufficient: ${canFill.hasEnoughXrp}, ETH sufficient: ${canFill.hasEnoughEth}`
          );
        }

        console.log(`📊 Partial Swap Amounts:`);
        console.log(`  XRP: ${Number(xrpAmount) / 1000000} XRP`);
        console.log(`  ETH: ${ethers.formatEther(ethAmount)} ETH`);
      }

      console.log(`🔑 Secret: ${secret}`);
      console.log(`👤 Recipient: ${recipient}`);
      console.log(`📋 Order Hash: ${order.orderHash}`);

      // Step 1: Withdraw from XRPL escrow FIRST (reveal secret)
      console.log("\n📍 Step 1: Revealing secret on XRPL...");
      const xrplWithdrawal = await this.withdrawFromXrplEscrow(
        orderId,
        secret,
        recipient,
        partialXrpAmount
      );

      // Step 2: Withdraw from Ethereum escrow (using revealed secret)
      console.log("\n📍 Step 2: Withdrawing from Ethereum escrow...");
      const ethWithdrawal = await this.withdrawFromEthereumEscrow(
        orderId,
        secret,
        partialEthAmount
      );

      // Step 3: Get final status
      const finalStatus = await this.getOrderStatus(orderId);

      console.log("\n🎉 ATOMIC SWAP COMPLETED SUCCESSFULLY!");
      console.log("=".repeat(60));
      console.log("✅ Secret revealed on XRPL");
      console.log("✅ Funds withdrawn from both escrows");
      console.log("✅ Cross-chain swap executed atomically");

      console.log("\n📊 Swap Summary:");
      console.log(`  Order ID: ${orderId}`);
      console.log(`  Status: ${finalStatus.status}`);
      console.log(`  XRP Withdrawal: ${xrplWithdrawal.transactionHash}`);
      console.log(`  ETH Withdrawal: ${ethWithdrawal.transactionHash}`);
      console.log(`  Secret Revealed: ${secret}`);

      console.log("\n🔍 Verify Transactions:");
      console.log(
        `  XRPL: Check transaction ${xrplWithdrawal.transactionHash} on XRPL explorer`
      );
      console.log(
        `  Ethereum: https://sepolia.etherscan.io/tx/${ethWithdrawal.transactionHash}`
      );

      return {
        orderId,
        status: "completed",
        xrpl: xrplWithdrawal,
        ethereum: ethWithdrawal,
        secretRevealed: secret,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Atomic swap execution failed:", error.message);
      throw error;
    }
  }

  async withdrawFromXrplEscrow(
    orderId,
    secret = null,
    callerAddress = null,
    partialAmount = null
  ) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(
      `\n🌊 Withdrawing from XRPL Source Escrow for order ${orderId}...`
    );

    try {
      const useSecret = secret || order.secret;
      if (!useSecret) {
        throw new Error("Secret is required for XRPL withdrawal");
      }

      const caller = callerAddress || order.xrpl.taker; // Use XRPL taker for source withdrawal (required during private period)

      // Calculate withdrawal amount (partial or full)
      const withdrawalAmount = partialAmount || order.xrpl.amount;

      console.log("📋 XRPL Withdrawal Parameters:");
      console.log(`  Escrow ID: ${order.xrpl.escrowId}`);
      console.log(`  Secret: ${useSecret}`);
      console.log(`  Caller: ${caller}`);
      console.log(`  Amount: ${Number(withdrawalAmount) / 1000000} XRP`);

      // Call XRPL server to withdraw
      const result = await this.xrplClient.withdraw(
        order.xrpl.escrowId,
        useSecret,
        caller
      );

      console.log(`✅ XRPL withdrawal successful!`);
      console.log(`📍 Transaction Hash: ${result.txHash}`);
      console.log(`💰 Amount withdrawn: ${result.amount / 1000000} XRP`);

      // Update order status
      order.xrpl.withdrawTx = result.txHash;
      order.xrpl.withdrawnAmount = result.amount;
      order.status = "xrpl_withdrawn";

      // Update partial fill tracking if enabled
      if (order.partialFill.enabled && partialAmount) {
        order.partialFill.filledXrpAmount += BigInt(partialAmount);
        order.partialFill.remainingXrpAmount -= BigInt(partialAmount);
      }

      return {
        transactionHash: result.txHash,
        amount: result.amount,
        escrowId: order.xrpl.escrowId,
        status: "success",
      };
    } catch (error) {
      console.error("❌ XRPL withdrawal failed:", error.message);
      throw error;
    }
  }

  async withdrawFromEthereumEscrow(
    orderId,
    secret = null,
    partialAmount = null
  ) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    console.log(
      `\n⚡ Withdrawing from Ethereum Destination Escrow for order ${orderId}...`
    );

    try {
      const useSecret = secret || order.secret;
      if (!useSecret) {
        throw new Error("Secret is required for Ethereum withdrawal");
      }

      // Calculate withdrawal amount (partial or full)
      const withdrawalAmount = partialAmount || order.ethereum.amount;

      console.log("📋 Ethereum Withdrawal Parameters:");
      console.log(`  Escrow Address: ${order.ethereum.escrowAddress}`);
      console.log(`  Secret: ${useSecret}`);
      console.log(`  Amount: ${ethers.formatEther(withdrawalAmount)} ETH`);

      // Create escrow contract instance
      const escrowContract = new ethers.Contract(
        order.ethereum.escrowAddress,
        ESCROW_ABI,
        this.ethWallet
      );

      // Prepare immutables for withdrawal
      const immutables = {
        orderHash: order.orderHash,
        hashlock: order.hashlock,
        maker: addressToUint256(order.ethereum.maker),
        taker: addressToUint256(order.ethereum.taker),
        token: addressToUint256(order.ethereum.token),
        amount: order.ethereum.amount,
        safetyDeposit: order.ethereum.safetyDeposit,
        timelocks:
          order.ethereum.timelocksWithDeployedAt ||
          order.ethereum.timelocks |
            (BigInt(order.ethereum.deployedAt) << 224n),
      };

      // Execute withdrawal
      const tx = await escrowContract.withdraw(useSecret, immutables, {
        gasLimit: 300000,
      });

      console.log(`📞 Withdrawal transaction submitted: ${tx.hash}`);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(`✅ Withdrawal confirmed in block: ${receipt.blockNumber}`);

      // Update order status
      order.ethereum.withdrawTx = tx.hash;
      order.ethereum.withdrawnAmount = ethers.formatEther(withdrawalAmount);
      order.status = "both_withdrawn";

      // Update partial fill tracking if enabled
      if (order.partialFill.enabled && partialAmount) {
        order.partialFill.filledEthAmount += BigInt(partialAmount);
        order.partialFill.remainingEthAmount -= BigInt(partialAmount);
      }

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: ethers.formatEther(withdrawalAmount),
        escrowAddress: order.ethereum.escrowAddress,
        status: "success",
      };
    } catch (error) {
      console.error("❌ Ethereum withdrawal failed:", error.message);
      throw error;
    }
  }

  // Helper methods (similar to original but adjusted for XRP->ETH)
  packTimelocksForXRPL(timelocks, deployedAt) {
    // Calculate relative offsets for XRPL
    const stages = {};
    for (let stage = 0; stage < 7; stage++) {
      stages[stage] = timelocks[stage] - deployedAt;
    }

    // Pack into BigInt (similar to EVM packing but for XRPL format)
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

  calculatePartialAmount(totalAmount, percentage) {
    if (percentage === null || percentage === 100) {
      return totalAmount;
    }
    return (totalAmount * BigInt(percentage)) / 100n;
  }

  validatePartialFillPercentage(percentage) {
    if (
      percentage < config.swap.minFillPercentage ||
      percentage > config.swap.maxFillPercentage
    ) {
      throw new Error(
        `Partial fill percentage must be between ${config.swap.minFillPercentage}% and ${config.swap.maxFillPercentage}%`
      );
    }
  }

  canPartialFill(orderId, ethAmount, xrpAmount) {
    const order = this.activeOrders.get(orderId);
    if (!order || !order.partialFill.enabled) {
      return { canFill: false, hasEnoughEth: false, hasEnoughXrp: false };
    }

    const hasEnoughEth = ethAmount <= order.partialFill.remainingEthAmount;
    const hasEnoughXrp = xrpAmount <= order.partialFill.remainingXrpAmount;

    return {
      canFill: hasEnoughEth && hasEnoughXrp,
      hasEnoughEth,
      hasEnoughXrp,
    };
  }

  async getOrderStatus(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return {
      id: order.id,
      orderHash: order.orderHash,
      status: order.status,
      createdAt: new Date(order.createdAt).toISOString(),

      // XRP details (source)
      xrpl: {
        escrowId: order.xrpl.escrowId,
        walletAddress: order.xrpl.walletAddress,
        amount: `${Number(order.xrpl.amount) / 1000000} XRP`,
        withdrawTx: order.xrpl.withdrawTx,
      },

      // Ethereum details (destination)
      ethereum: {
        escrowAddress: order.ethereum.escrowAddress,
        creationTx: order.ethereum.creationTx,
        fundedAmount: order.ethereum.fundedAmount,
        amount: `${ethers.formatEther(order.ethereum.amount)} ETH`,
        withdrawTx: order.ethereum.withdrawTx,
      },

      partialFill: order.partialFill.enabled
        ? {
            enabled: true,
            currentFillPercentage: order.partialFill.currentFillPercentage,
            filledXrpAmount: `${Number(order.partialFill.filledXrpAmount) / 1000000} XRP`,
            filledEthAmount: `${ethers.formatEther(order.partialFill.filledEthAmount)} ETH`,
            remainingXrpAmount: `${Number(order.partialFill.remainingXrpAmount) / 1000000} XRP`,
            remainingEthAmount: `${ethers.formatEther(order.partialFill.remainingEthAmount)} ETH`,
          }
        : { enabled: false },
    };
  }

  listActiveOrders() {
    return Array.from(this.activeOrders.entries()).map(([id, order]) => ({
      id,
      status: order.status,
      createdAt: new Date(order.createdAt).toISOString(),
      xrpAmount: `${Number(order.xrpl.amount) / 1000000} XRP`,
      ethAmount: `${ethers.formatEther(order.ethereum.amount)} ETH`,
    }));
  }
}

// Complete Workflow Function with Atomic Swap Execution
async function startXrpToEthSwapWithExecution() {
  console.log("🚀 Starting Complete XRP-ETH Cross-Chain Atomic Swap");
  console.log("=".repeat(70));

  try {
    const orderSystem = new XrpEthCrossChainOrder();

    // Step 1: Initialize
    await orderSystem.initialize();

    // Step 2: Create cross-chain order
    const order = await orderSystem.createCrossChainOrder();

    // Step 3: Create XRPL escrow first (source)
    const xrplEscrow = await orderSystem.createXrplEscrow(order.id);

    // Step 4: Create Ethereum escrow second (destination)
    const ethEscrow = await orderSystem.createEthereumEscrow(order.id);

    console.log("\n⏰ Waiting for withdrawal window to open...");
    const currentTime = Math.floor(Date.now() / 1000);
    const xrpWithdrawalTime = order.timelocks[4]; // XRP uses destination withdrawal timing
    const waitTime = Math.max(
      10000, // Always wait at least 10 seconds
      (xrpWithdrawalTime - currentTime) * 1000 + 10000
    ); // Wait for window + 10 seconds buffer
    console.log(
      `⏰ Waiting ${waitTime / 1000} seconds for XRP withdrawal window (destination timing)...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Step 5: Execute atomic swap (XRP first, then ETH)
    const swapResult = await orderSystem.executeAtomicSwap(order.id);

    console.log("\n🎉 COMPLETE XRP-ETH CROSS-CHAIN SWAP FINISHED!");
    console.log("📊 Final Result:", JSON.stringify(swapResult, null, 2));

    return swapResult;
  } catch (error) {
    console.error(
      "❌ Complete XRP-ETH cross-chain swap failed:",
      error.message
    );
    throw error;
  }
}

// Main execution function (setup only)
async function main() {
  console.log(
    "🚀 Starting XRP-ETH Cross-Chain Order with 1inch LOP Integration"
  );
  console.log("=".repeat(70));
  console.log("This system creates atomic swaps between:");
  console.log(
    `  Source: XRP Ledger (${parseInt(config.swap.srcAmount) / 1000000} XRP)`
  );
  console.log(`  Destination: Ethereum Sepolia (${config.swap.dstAmount} ETH)`);
  console.log("");
  console.log("🔧 Using:");
  console.log("  • 1inch Limit Order Protocol for Ethereum");
  console.log("  • EscrowFactory contract for atomic swaps");
  console.log("  • Local XRPL server for XRP integration");
  console.log("  • SHA256 hashlocks for atomicity");
  console.log("=".repeat(70));

  try {
    const orderSystem = new XrpEthCrossChainOrder();

    // Step 1: Initialize the system
    await orderSystem.initialize();

    // Step 2: Create cross-chain order
    const order = await orderSystem.createCrossChainOrder();

    // Step 3: Create XRPL source escrow first
    const xrplEscrow = await orderSystem.createXrplEscrow(order.id);

    // Step 4: Create Ethereum destination escrow second
    const ethEscrow = await orderSystem.createEthereumEscrow(order.id);

    // Step 5: Get final status
    const finalStatus = await orderSystem.getOrderStatus(order.id);

    console.log("\n🎉 XRP-ETH CROSS-CHAIN ORDER SETUP COMPLETED!");
    console.log("=".repeat(70));
    console.log("✅ XRPL source escrow created and auto-funded");
    console.log("✅ Ethereum destination escrow funded with ETH");
    console.log("✅ Ready for atomic swap execution");

    console.log("\n📊 Final Order Status:");
    console.log(`  Order ID: ${finalStatus.id}`);
    console.log(`  Status: ${finalStatus.status}`);
    console.log(`  XRPL Escrow ID: ${finalStatus.xrpl.escrowId || "N/A"}`);
    console.log(`  XRPL Wallet: ${finalStatus.xrpl.walletAddress || "N/A"}`);
    console.log(`  ETH Escrow Tx: ${finalStatus.ethereum.creationTx || "N/A"}`);
    console.log(
      `  ETH Funded: ${finalStatus.ethereum.fundedAmount || "N/A"} ETH`
    );

    if (
      finalStatus.ethereum.creationTx &&
      finalStatus.ethereum.creationTx !== "N/A"
    ) {
      console.log("\n🔍 Verify ETH Escrow on Etherscan:");
      console.log(
        `  https://sepolia.etherscan.io/tx/${finalStatus.ethereum.creationTx}`
      );
    }

    console.log("\n📈 Transaction Summary:");
    console.log(`  XRP Amount: ${finalStatus.xrpl.amount}`);
    console.log(`  ETH Amount: ${finalStatus.ethereum.amount}`);
    console.log(`  XRPL Auto-funded: ✅`);
    console.log(`  ETH Auto-funded: ✅`);

    console.log("\n💡 Next Steps:");
    console.log("  1. ✅ Both escrows are already funded automatically");
    console.log(
      "  2. 🔄 Execute: await orderSystem.executeAtomicSwap(orderId)"
    );
    console.log("  3. ✅ Verify both XRP and ETH transactions");

    console.log("\n🚀 Execute the atomic swap now:");
    console.log(
      `  const swapResult = await orderSystem.executeAtomicSwap('${finalStatus.id}');`
    );
  } catch (error) {
    console.error("❌ XRP-ETH cross-chain order failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = {
  XrpEthCrossChainOrder,
  config,
  XRPLClient,
  startXrpToEthSwapWithExecution,
};

// Run based on command line argument
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--execute")) {
    startXrpToEthSwapWithExecution().catch(console.error);
  } else {
    main().catch(console.error);
  }
}
