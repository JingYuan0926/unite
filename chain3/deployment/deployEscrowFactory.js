// require("dotenv").config();
// const { ethers } = require("ethers");
// const fs = require("fs");
// const path = require("path");

// /**
//  * Deploy EscrowFactory to Sepolia testnet
//  * This script deploys the 1inch EscrowFactory contract for cross-chain atomic swaps
//  */

// // Configuration
// const config = {
//   // Sepolia testnet configuration
//   chainId: 11155111,
//   rpcUrl: process.env.ETH_RPC,
//   privateKey: process.env.ETH_PRIVATE_KEY,

//   // Contract addresses (these are the 1inch protocol addresses)
//   LOP: "0x111111125421cA6dc452d289314280a0f8842A65", // Limit Order Protocol (all chains)
//   ACCESS_TOKEN: "0xACCe550000159e70908C0499a1119D04e7039C28", // Access token (all chains)

//   // For Sepolia, we'll use a test token or ETH as fee token
//   FEE_TOKEN: "0x0000000000000000000000000000000000000000", // Use ETH as fee token for testnet

//   // Rescue delay (8 days in seconds)
//   RESCUE_DELAY: 691200,
// };

// async function deployEscrowFactory() {
//   console.log("🚀 Starting EscrowFactory deployment to Sepolia testnet");
//   console.log("=".repeat(60));

//   // Validate environment variables
//   if (!config.privateKey) {
//     throw new Error("ETH_PRIVATE_KEY not set in environment variables");
//   }
//   if (!config.rpcUrl) {
//     throw new Error("ETH_RPC not set in environment variables");
//   }

//   // Setup provider and wallet
//   const provider = new ethers.JsonRpcProvider(config.rpcUrl);
//   const wallet = new ethers.Wallet(config.privateKey, provider);

//   console.log(`📍 Deployer address: ${wallet.address}`);
//   console.log(`🌐 Network: Sepolia (Chain ID: ${config.chainId})`);

//   // Check balance
//   const balance = await provider.getBalance(wallet.address);
//   console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

//   if (balance < ethers.parseEther("0.1")) {
//     console.warn("⚠️  Warning: Low balance. You might need more ETH for deployment.");
//   }

//   console.log("\n📋 Contract Configuration:");
//   console.log(`  Limit Order Protocol: ${config.LOP}`);
//   console.log(`  Fee Token: ${config.FEE_TOKEN} (ETH)`);
//   console.log(`  Access Token: ${config.ACCESS_TOKEN}`);
//   console.log(`  Owner: ${wallet.address}`);
//   console.log(`  Rescue Delay: ${config.RESCUE_DELAY} seconds (8 days)`);

//   // For now, we'll create a simplified deployment template
//   console.log("\n⚠️  Note: This is a template deployment script.");
//   console.log("To complete the deployment, you need to:");
//   console.log("1. Compile the EscrowFactory contract using Foundry or Hardhat");
//   console.log("2. Update this script with the compiled ABI and bytecode");
//   console.log("3. Run the deployment");

//   return null;
// }

// // Instructions for completing the deployment
// function printCompilationInstructions() {
//   console.log("\n📚 To complete the EscrowFactory deployment:");
//   console.log("=".repeat(60));
//   console.log("1. Install Foundry (if not already installed):");
//   console.log("   curl -L https://foundry.paradigm.xyz | bash");
//   console.log("   foundryup");
//   console.log("");
//   console.log("2. Navigate to the contracts directory:");
//   console.log("   cd chain3/contracts/lib/cross-chain-swap");
//   console.log("");
//   console.log("3. Install dependencies:");
//   console.log("   forge install");
//   console.log("");
//   console.log("4. Compile contracts:");
//   console.log("   forge build");
//   console.log("");
//   console.log("5. Deploy using Foundry (recommended):");
//   console.log("   forge script script/DeployEscrowFactory.s.sol --rpc-url $ETH_RPC --private-key $ETH_PRIVATE_KEY --broadcast");
//   console.log("");
//   console.log("6. Or update this script with compiled artifacts and run:");
//   console.log("   node chain3/deployment/deployEscrowFactory.js");
//   console.log("");
//   console.log("7. After deployment, update your .env file:");
//   console.log("   FACTORY_ADDRESS=your_deployed_contract_address");
// }

// // Run deployment if this file is executed directly
// if (require.main === module) {
//   deployEscrowFactory()
//     .then((address) => {
//       if (address) {
//         console.log("\n✅ Deployment completed successfully!");
//         console.log(`📍 Factory Address: ${address}`);
//       } else {
//         printCompilationInstructions();
//       }
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error("\n❌ Deployment failed:", error.message);
//       process.exit(1);
//     });
// }

// module.exports = {
//   deployEscrowFactory,
//   config,
// };
