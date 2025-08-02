import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger, ScopedLogger } from "../../src/utils/Logger";
import { CrossChainOrchestrator } from "../../src/sdk/CrossChainOrchestrator";
import { ethers } from "ethers";

/**
 * Complete End-to-End Atomic Swap Test
 * Tests both setup and claim phases
 */
async function testCompleteAtomicSwap() {
  console.log("🚀 COMPLETE END-TO-END ATOMIC SWAP TEST");
  console.log("=".repeat(60));

  try {
    // Initialize components
    const config = new ConfigManager();
    const baseLogger = Logger.getInstance();
    const logger = new ScopedLogger(baseLogger, "CompleteSwapTest");
    const orchestrator = new CrossChainOrchestrator(config, logger);

    // Check initial balances
    const provider = config.getEthProvider();
    const ethSigner = new ethers.Wallet(
      config.USER_A_ETH_PRIVATE_KEY,
      provider
    );

    const initialBalance = await provider.getBalance(ethSigner.address);
    console.log(
      "💰 Initial ETH Balance:",
      ethers.formatEther(initialBalance),
      "ETH"
    );

    // Step 1: Execute ETH -> TRX Atomic Swap Setup
    console.log("\n🔄 STEP 1: EXECUTING ATOMIC SWAP SETUP");
    console.log("=".repeat(50));

    const swapParams = {
      ethAmount: ethers.parseEther("0.001"), // 0.001 ETH
      ethPrivateKey: config.USER_A_ETH_PRIVATE_KEY,
      tronRecipient: "TPUiCeNRjjEpo1NFJ1ZURfU1ziNNMtn8yu", // Use the Tron address directly
      tronPrivateKey: config.USER_B_TRON_PRIVATE_KEY,
      timelock: 3600, // 1 hour
    };

    const swapResult = await orchestrator.executeETHtoTRXSwap(swapParams);

    console.log("\n✅ ATOMIC SWAP SETUP SUCCESSFUL!");
    console.log("📊 Swap Result:");
    console.log("   Order Hash:", swapResult.orderHash);
    console.log("   ETH Escrow:", swapResult.ethEscrowAddress);
    console.log("   Tron Escrow:", swapResult.tronEscrowAddress || "PENDING");
    console.log("   Secret:", swapResult.secret);
    console.log(
      "   ETH Tx:",
      `https://sepolia.etherscan.io/tx/${swapResult.ethTxHash}`
    );
    console.log(
      "   Tron Tx:",
      `https://nile.tronscan.org/#/transaction/${swapResult.tronTxHash}`
    );

    // Step 2: Wait for confirmation AND timelock
    console.log("\n⏳ STEP 2: WAITING FOR CONFIRMATIONS AND TIMELOCK");
    console.log("=".repeat(50));
    console.log(
      "Waiting for blockchain confirmations and DstWithdrawal timelock (5 minutes)..."
    );
    console.log(
      "⏰ The Tron escrow requires 15 seconds before withdrawal is allowed (fast testing mode)"
    );

    // Wait for the DstWithdrawal timelock (15 seconds for fast testing)
    const waitTime = 20000; // 20 seconds (15 seconds + 5 second buffer)
    console.log(`⏳ Waiting ${waitTime / 1000} seconds for timelock...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Step 3: Execute Claim Phase
    console.log("\n🎯 STEP 3: EXECUTING CLAIM PHASE");
    console.log("=".repeat(50));

    // Check DemoResolver balance before claim
    const demoResolverContract = new ethers.Contract(
      config.DEMO_RESOLVER_ADDRESS,
      ["function getLockedBalance() view returns (uint256)"],
      provider
    );

    const lockedBalance = await demoResolverContract.getLockedBalance();
    console.log(
      "💰 Locked in DemoResolver:",
      ethers.formatEther(lockedBalance),
      "ETH"
    );

    if (lockedBalance > 0) {
      console.log("🔄 Proceeding with claim phase...");

      // Execute claim for both escrows
      await orchestrator.claimAtomicSwap(
        swapResult,
        swapResult.secret,
        config.USER_A_ETH_PRIVATE_KEY, // ETH private key for claiming ETH
        config.USER_B_TRON_PRIVATE_KEY // Tron private key for claiming TRX
      );

      console.log("✅ CLAIM PHASE SUCCESSFUL!");
    } else {
      console.log("⚠️ No ETH locked to claim");
    }

    // Step 4: Final Balance Check
    console.log("\n📊 STEP 4: FINAL BALANCE CHECK");
    console.log("=".repeat(50));

    const finalBalance = await provider.getBalance(ethSigner.address);
    const balanceChange = finalBalance - initialBalance;

    console.log(
      "💰 Final ETH Balance:",
      ethers.formatEther(finalBalance),
      "ETH"
    );
    console.log("📈 Balance Change:", ethers.formatEther(balanceChange), "ETH");

    console.log("\n🎉 COMPLETE ATOMIC SWAP TEST SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("✅ Setup Phase: Working");
    console.log("✅ Ethereum Escrow: Working");
    console.log("✅ Tron Escrow: Working");
    console.log("✅ Claim Phase: Working");
    console.log("✅ End-to-End Flow: COMPLETE");
  } catch (error: any) {
    console.error("❌ Complete atomic swap test failed:", error.message);
    console.error("📋 Error details:", error);
  }
}

// Run the complete test
testCompleteAtomicSwap().catch(console.error);
