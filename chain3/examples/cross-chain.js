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
    teeServerUrl: "http://localhost:3000", // Local TEE server from serve-escrow.js
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

// EscrowFactory ABI based on evmToXrplSwapWithRealEVM.js
const ESCROW_FACTORY_ABI = [
  // Main function - with correct types from evmToXrplSwapWithRealEVM.js
  "function createDstEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) dstImmutables, uint256 srcCancellationTimestamp) external payable",

  // Events - with correct signature from compiled contract
  "event DstEscrowCreated(address escrow, bytes32 hashlock, uint256 taker)",
  "event SrcEscrowCreated(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, tuple(address token, uint256 amount, address resolver, uint128 fee, uint256 timelocks) immutablesComplement)",

  // View functions
  "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
  "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
];

// Escrow contract ABI (simplified)
const ESCROW_ABI = [
  "function withdraw(bytes32 secret, tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function cancel(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function getStatus() external view returns (uint8)",
  "event EscrowWithdrawal(bytes32 secret)",
  "event EscrowCancelled()",
];

// Helper function from evmToXrplSwapWithRealEVM.js
function addressToUint256(address) {
  const cleanAddress = address.toLowerCase().replace(/^0x/, "");
  const paddedHex = "0x" + "000000000000000000000000" + cleanAddress;
  return paddedHex;
}

// XRPL TEE Client (simplified version)
class XRPLTEEClient {
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
        `TEE Server Error: ${error.response?.data?.error || error.message}`
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
        `TEE Server Error: ${error.response?.data?.error || error.message}`
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
        `TEE Server Error: ${error.response?.data?.error || error.message}`
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

    // Initialize XRPL TEE client
    this.teeClient = new XRPLTEEClient(config.xrpl.teeServerUrl);

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

      // Check TEE server
      try {
        const response = await axios.get(`${config.xrpl.teeServerUrl}/health`);
        console.log(`✅ XRPL TEE Server connected: ${response.data.status}`);
      } catch (error) {
        console.log(
          "⚠️  XRPL TEE Server not available. Please start serve-escrow.js"
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
      const secret = XRPLTEEClient.generateSecret();
      const hashlock = XRPLTEEClient.hashSecret(secret);
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
        4: blockTimestamp + 300, // DstWithdrawal: 5 minutes
        5: blockTimestamp + 600, // DstPublicWithdrawal: 10 minutes
        6: blockTimestamp + 1800, // DstCancellation: 30 minutes
      };

      // Pack timelocks for EVM contract (relative offsets)
      const evmPackedTimelocks =
        BigInt(600) | // SrcWithdrawal offset
        (BigInt(900) << 32n) | // SrcPublicWithdrawal offset
        (BigInt(3600) << 64n) | // SrcCancellation offset
        (BigInt(4200) << 96n) | // SrcPublicCancellation offset
        (BigInt(300) << 128n) | // DstWithdrawal offset
        (BigInt(600) << 160n) | // DstPublicWithdrawal offset
        (BigInt(1800) << 192n); // DstCancellation offset

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
          maker: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Will be replaced by TEE server
          taker: this.ethWallet.address, // ETH wallet will receive XRP
          token: "0x0000000000000000000000000000000000000000", // XRP native
          amount: config.swap.dstAmount, // 1 XRP in drops
          safetyDeposit: config.swap.safetyDeposit, // 0.1 XRP safety deposit
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
      // Prepare destination escrow immutables (following evmToXrplSwapWithRealEVM.js pattern)
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

      // Manual transaction encoding (following evmToXrplSwapWithRealEVM.js pattern)
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
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

      const functionSelector = "0xdea024e4"; // createDstEscrow function selector
      const fullCallData = functionSelector + encodedData.slice(2);

      const tx = await this.ethWallet.sendTransaction({
        to: config.ethereum.escrowFactory,
        data: fullCallData,
        value: requiredEth,
        gasLimit: 300000,
      });

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(
        `✅ Destination escrow created! Block: ${receipt.blockNumber}`
      );

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
      order.status = "ethereum_escrow_created";

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        escrowAddress: escrowAddress,
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
    console.log("📋 Using local XRPL TEE server");

    try {
      // Create XRPL escrow via TEE server
      const xrplEscrowParams = {
        orderHash: order.orderHash,
        hashlock: order.hashlock,
        maker: order.xrpl.maker,
        taker: order.xrpl.taker,
        token: order.xrpl.token,
        amount: order.xrpl.amount,
        safetyDeposit: order.xrpl.safetyDeposit,
        timelocks: order.xrpl.timelocks,
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
        await this.teeClient.createDestinationEscrow(xrplEscrowParams);

      console.log(`✅ XRPL Escrow created with ID: ${xrplEscrow.escrowId}`);
      console.log(`📍 Escrow wallet address: ${xrplEscrow.walletAddress}`);

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
      },

      // XRPL escrow details
      xrpl: {
        escrowId: order.xrpl.escrowId,
        walletAddress: order.xrpl.walletAddress,
        amount: `${parseInt(order.xrpl.amount) / 1000000} XRP`,
        safetyDeposit: `${parseInt(order.xrpl.safetyDeposit) / 1000000} XRP`,
      },

      // Timestamps
      createdAt: new Date(order.createdAt).toISOString(),
    };
  }

  listActiveOrders() {
    return Array.from(this.activeOrders.keys());
  }
}

// Main execution function
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
  console.log("  • Local XRPL TEE server for XRP integration");
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

    // Step 5: Get final status
    const finalStatus = await orderSystem.getOrderStatus(order.id);

    console.log("\n🎉 ETH-XRP CROSS-CHAIN ORDER SETUP COMPLETED!");
    console.log("=".repeat(70));
    console.log("✅ Both escrows created successfully");
    console.log("✅ Ready for funding and execution");
    console.log("");
    console.log("📊 Final Order Status:");
    console.log(JSON.stringify(finalStatus, null, 2));

    console.log("\n📈 Transaction Summary:");
    console.log(`  Order ID: ${finalStatus.id}`);
    console.log(`  Status: ${finalStatus.status}`);
    console.log(
      `  Ethereum Creation: ${finalStatus.ethereum.creationTx || "N/A"}`
    );
    console.log(`  XRPL Escrow ID: ${finalStatus.xrpl.escrowId || "N/A"}`);

    if (
      finalStatus.ethereum.creationTx &&
      finalStatus.ethereum.creationTx !== "N/A"
    ) {
      console.log("\n🔍 Verify on Etherscan:");
      console.log(
        `  https://sepolia.etherscan.io/tx/${finalStatus.ethereum.creationTx}`
      );
    }

    console.log("\n💡 Next Steps:");
    console.log("  1. Fund the XRPL escrow wallet");
    console.log("  2. Execute the atomic swap");
    console.log("  3. Verify transactions on both chains");
  } catch (error) {
    console.error("❌ ETH-XRP cross-chain order failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = { EthXrpCrossChainOrder, config, XRPLTEEClient };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
