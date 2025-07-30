require("dotenv").config();
const { EthereumUser } = require("../src/users/EthereumUser");
const { TronUser } = require("../src/users/TronUser");
const {
  TwoUserSwapCoordinator,
} = require("../src/coordination/TwoUserSwapCoordinator");
const { ethers } = require("ethers");

/**
 * Demonstrates a real peer-to-peer cross-chain swap between two independent users
 * This is the core demonstration that shows true multi-user functionality
 */
async function demonstrateTwoUserSwap() {
  console.log("\n🎬 TWO-USER CROSS-CHAIN SWAP DEMONSTRATION");
  console.log("==========================================");
  console.log("🚀 Demonstrating TRUE peer-to-peer atomic swaps");
  console.log("💡 Two independent users exchanging ETH ↔ TRX\n");

  try {
    // Configuration from environment variables
    const config = {
      ethRpcUrl:
        process.env.ETH_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
      tronRpcUrl: process.env.TRON_RPC_URL || "https://api.nileex.io",
      contracts: {
        escrowFactory: process.env.ETH_ESCROW_FACTORY_ADDRESS,
        tronEscrowFactory: process.env.TRON_ESCROW_FACTORY_ADDRESS,
      },
    };

    // Validate configuration
    if (
      !config.contracts.escrowFactory ||
      !config.contracts.tronEscrowFactory
    ) {
      throw new Error("Missing contract addresses in environment variables");
    }

    console.log("🔧 CONFIGURATION");
    console.log("================");
    console.log(`📡 ETH RPC: ${config.ethRpcUrl}`);
    console.log(`📡 TRON RPC: ${config.tronRpcUrl}`);
    console.log(`📋 ETH Escrow Factory: ${config.contracts.escrowFactory}`);
    console.log(
      `📋 TRON Escrow Factory: ${config.contracts.tronEscrowFactory}\n`
    );

    // Initialize two independent users
    console.log("👥 INITIALIZING TWO INDEPENDENT USERS");
    console.log("=====================================");

    const userA = new EthereumUser(
      process.env.USER_A_ETH_PRIVATE_KEY,
      config.ethRpcUrl,
      config.contracts
    );

    const userB = new TronUser(
      process.env.USER_B_TRON_PRIVATE_KEY,
      config.tronRpcUrl,
      config.contracts
    );

    console.log(`👤 User A (ETH Holder): ${userA.getAddress()}`);
    console.log(`👤 User B (TRX Holder): ${userB.getAddress().base58}\n`);

    // Check and display user balances
    console.log("💰 CHECKING USER BALANCES");
    console.log("=========================");

    const [userABalance, userBBalance, userANetwork, userBNetwork] =
      await Promise.all([
        userA.getBalance(),
        userB.getBalance(),
        userA.getNetworkInfo(),
        userB.getNetworkInfo(),
      ]);

    console.log(
      `💳 User A ETH Balance: ${ethers.formatEther(userABalance)} ETH`
    );
    console.log(`💳 User B TRX Balance: ${userB.fromSun(userBBalance)} TRX`);
    console.log(
      `🌐 ETH Network: ${userANetwork.name} (Chain ID: ${userANetwork.chainId})`
    );
    console.log(`🌐 TRON Network: Block ${userBNetwork.blockNumber}\n`);

    // Validate minimum balances
    const ethAmount = ethers.parseEther(process.env.DEMO_ETH_AMOUNT || "0.001");
    const trxAmount = userB.toSun(process.env.DEMO_TRX_AMOUNT || "2");

    console.log("📊 SWAP PARAMETERS");
    console.log("==================");
    console.log(`🔄 ETH Amount: ${ethers.formatEther(ethAmount)} ETH`);
    console.log(`🔄 TRX Amount: ${userB.fromSun(trxAmount)} TRX`);
    console.log(`⏰ Timelock: 1 hour`);
    console.log(`🔐 Atomic: Yes (hashlock/timelock protected)\n`);

    // Create and configure the swap coordinator
    console.log("🤝 INITIALIZING SWAP COORDINATOR");
    console.log("================================");
    const coordinator = new TwoUserSwapCoordinator(userA, userB, config);
    console.log("✅ Coordinator ready with cryptographic parameters\n");

    // Execute the actual peer-to-peer swap
    console.log("🚀 EXECUTING ETH → TRX PEER-TO-PEER SWAP");
    console.log("========================================");
    console.log("⚡ This is a REAL atomic swap between two independent users!");
    console.log("⚡ Both users either succeed together or fail together\n");

    const startTime = Date.now();
    const result = await coordinator.coordinateETHtoTRXSwap(
      ethAmount,
      trxAmount
    );
    const endTime = Date.now();

    // Display comprehensive results
    console.log("\n🎉 TWO-USER SWAP COMPLETED SUCCESSFULLY!");
    console.log("========================================");
    console.log(
      `⏱️  Total Time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`
    );
    console.log(`🎭 Swap Type: ${result.swapType}`);
    console.log(`⏰ Timestamp: ${result.timestamp}\n`);

    console.log("📄 TRANSACTION EVIDENCE");
    console.log("=======================");
    console.log(`🔗 ETH Escrow Tx: ${result.ethEscrow}`);
    console.log(`🔗 TRX Escrow Tx: ${result.tronEscrow}`);
    console.log(`🔗 ETH Claim Tx: ${result.ethClaim}`);
    console.log(`🔗 TRX Claim Tx: ${result.trxClaim}\n`);

    console.log("🔐 CRYPTOGRAPHIC PROOF");
    console.log("======================");
    console.log(`🔑 Secret: ${result.secret}`);
    console.log(`🔒 Secret Hash: ${result.secretHash}\n`);

    console.log("👥 PARTICIPANT INFORMATION");
    console.log("==========================");
    console.log(`👤 User A (provided ETH): ${result.userA}`);
    console.log(`👤 User B (provided TRX): ${result.userB}\n`);

    // Verification links
    console.log("🔍 BLOCKCHAIN VERIFICATION");
    console.log("==========================");
    console.log(
      `🔎 Verify ETH transactions: https://sepolia.etherscan.io/tx/${result.ethEscrow}`
    );
    console.log(
      `🔎 Verify TRON transactions: https://nile.tronscan.org/#/transaction/${result.tronEscrow}\n`
    );

    console.log("✅ DEMONSTRATION COMPLETE");
    console.log("=========================");
    console.log(
      "🏆 Successfully demonstrated true peer-to-peer cross-chain atomic swaps!"
    );
    console.log("🏆 Two independent users successfully exchanged ETH ↔ TRX");
    console.log("🏆 All hashlock/timelock mechanisms preserved on both chains");
    console.log("🏆 Ready for hackathon submission!\n");

    return result;
  } catch (error) {
    console.error("\n❌ TWO-USER DEMO FAILED");
    console.error("=======================");
    console.error(`Error Type: ${error.constructor.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}\n`);

    // Provide debugging assistance
    console.log("🔧 DEBUGGING ASSISTANCE");
    console.log("=======================");
    console.log("1. Verify .env file contains all required variables");
    console.log("2. Check that both users have sufficient balances");
    console.log("3. Ensure contract addresses are correct and deployed");
    console.log("4. Verify network connectivity to both ETH and TRON RPCs");
    console.log("5. Check that private keys are valid and have permissions\n");

    throw error;
  }
}

/**
 * Utility function to display environment variable requirements
 */
function displayEnvironmentRequirements() {
  console.log("📋 REQUIRED ENVIRONMENT VARIABLES");
  console.log("=================================");
  console.log("USER_A_ETH_PRIVATE_KEY=0x[ETH_PRIVATE_KEY]");
  console.log("USER_B_TRON_PRIVATE_KEY=0x[TRON_PRIVATE_KEY]");
  console.log("ETH_RPC_URL=https://sepolia.infura.io/v3/[YOUR_KEY]");
  console.log("TRON_RPC_URL=https://api.nileex.io");
  console.log("ETH_ESCROW_FACTORY_ADDRESS=0x[ESCROW_FACTORY_ADDRESS]");
  console.log("TRON_ESCROW_FACTORY_ADDRESS=T[TRON_ESCROW_FACTORY_ADDRESS]");
  console.log("DEMO_ETH_AMOUNT=0.001");
  console.log("DEMO_TRX_AMOUNT=2\n");
}

/**
 * Main execution when script is run directly
 */
if (require.main === module) {
  // Check if required environment variables are present
  const requiredVars = [
    "USER_A_ETH_PRIVATE_KEY",
    "USER_B_TRON_PRIVATE_KEY",
    "ETH_ESCROW_FACTORY_ADDRESS",
    "TRON_ESCROW_FACTORY_ADDRESS",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    console.log("\n");
    displayEnvironmentRequirements();
    process.exit(1);
  }

  // Execute the demonstration
  demonstrateTwoUserSwap()
    .then((result) => {
      console.log("🎯 Demo completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("🚨 Demo failed:", error.message);
      process.exit(1);
    });
}

module.exports = { demonstrateTwoUserSwap, displayEnvironmentRequirements };
