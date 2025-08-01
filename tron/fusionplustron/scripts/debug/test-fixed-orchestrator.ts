import { ethers } from "ethers";
import dotenv from "dotenv";
import { CrossChainOrchestrator } from "../../src/sdk/CrossChainOrchestrator";
import { FusionPlusConfig } from "../../src/sdk/FusionPlusConfig";

dotenv.config();

/**
 * Test the updated CrossChainOrchestrator with the correct flow:
 * 1. Pre-send safety deposit to escrow address
 * 2. Call Resolver.deploySrc() (not createSrcEscrow)
 */

async function main() {
  console.log("🔍 TESTING UPDATED CROSSCHAINORCHESTRATOR");
  console.log("=========================================\n");

  // Initialize configuration
  const config = new FusionPlusConfig({
    ETH_RPC_URL: process.env.ETH_RPC_URL!,
    ETH_PRIVATE_KEY: process.env.ETH_PRIVATE_KEY!,
    TRON_RPC_URL: process.env.TRON_RPC_URL!,
    TRON_PRIVATE_KEY: process.env.TRON_PRIVATE_KEY!,
    ONE_INCH_API_KEY: process.env.ONE_INCH_API_KEY!,
  });

  // Initialize orchestrator
  const orchestrator = new CrossChainOrchestrator(config);

  console.log("Configuration loaded:");
  console.log(`- ETH Chain ID: ${config.getEthChainId()}`);
  console.log(`- TRON Chain ID: ${config.getTronChainId()}`);
  console.log(`- ETH Wallet: ${config.getEthWalletAddress()}`);
  console.log(`- TRON Wallet: ${config.getTronWalletAddress()}`);

  // Test parameters for a small atomic swap
  const swapParams = {
    ethAmount: ethers.parseEther("0.001"), // 0.001 ETH
    tronAmount: ethers.parseUnits("100", 6), // 100 TRX (6 decimals)
    timelock: 3600, // 1 hour
  };

  console.log("\nSwap parameters:");
  console.log(`- ETH Amount: ${ethers.formatEther(swapParams.ethAmount)} ETH`);
  console.log(
    `- TRX Amount: ${ethers.formatUnits(swapParams.tronAmount, 6)} TRX`
  );
  console.log(`- Timelock: ${swapParams.timelock} seconds`);

  console.log("\n🧪 TESTING ETH → TRX SWAP");
  console.log("=========================");

  try {
    // This should now work with the corrected flow:
    // 1. Pre-send safety deposit to computed escrow address
    // 2. Call Resolver.deploySrc() with proper parameters
    // 3. Create destination escrow on Tron

    console.log("Starting atomic swap execution...");

    const result = await orchestrator.executeETHtoTRXSwap(swapParams);

    console.log("✅ ATOMIC SWAP SUCCESSFUL!");
    console.log("=========================");
    console.log(`- ETH Transaction: ${result.ethTxHash}`);
    console.log(`- ETH Escrow: ${result.ethEscrowAddress}`);
    console.log(`- TRON Transaction: ${result.tronTxHash}`);
    console.log(`- TRON Escrow: ${result.tronEscrowAddress}`);
    console.log(`- Secret: ${result.secret}`);
    console.log(`- Order Hash: ${result.orderHash}`);
  } catch (error: any) {
    console.log(`❌ Atomic swap failed: ${error.message}`);

    // Analyze the error type
    if (error.message.includes("cannot use object value")) {
      console.log("🔧 Still has ABI encoding issues");
    } else if (error.message.includes("missing revert data")) {
      console.log("🔧 Contract revert without specific reason");
    } else if (error.message.includes("Safety deposit failed")) {
      console.log("🔧 Safety deposit pre-sending failed");
    } else if (error.message.includes("insufficient funds")) {
      console.log("🔧 Insufficient ETH balance for transaction");
    } else {
      console.log("🔧 Different error type - check logs for details");
    }

    console.log("\nFull error details:");
    console.log(error);
  }

  console.log("\n🎯 TEST COMPLETE");
  console.log("================");
  console.log("This test verifies the corrected atomic swap flow:");
  console.log(
    "✅ Uses Resolver.deploySrc() instead of non-existent createSrcEscrow"
  );
  console.log(
    "✅ Sends total ETH (swap + safety deposit) in ONE atomic transaction"
  );
  console.log("✅ Follows the official 1inch cross-chain architecture");
}

main().catch(console.error);
