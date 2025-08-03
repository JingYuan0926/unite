import { ethers } from "hardhat";
import {
  InvalidationReset,
  quickInvalidationReset,
  prepareAccountForTesting,
} from "./invalidation-reset";

/**
 * 🧪 TEST INVALIDATION RESET FUNCTIONALITY
 *
 * This script demonstrates and tests the invalidation reset utilities.
 */

async function main() {
  console.log("🧪 TESTING INVALIDATION RESET FUNCTIONALITY");
  console.log("=".repeat(50));

  require("dotenv").config();

  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  if (!userAPrivateKey) {
    console.error("❌ USER_A_ETH_PRIVATE_KEY not found in .env");
    process.exit(1);
  }

  const provider = ethers.provider;
  const wallet = new ethers.Wallet(userAPrivateKey, provider);

  console.log("📋 Test Configuration:");
  console.log(`  Account: ${wallet.address}`);
  console.log(`  Network: ${(await provider.getNetwork()).name}`);

  // =================================================================
  // TEST 1: Basic Invalidation Reset
  // =================================================================
  console.log("\n🔧 TEST 1: Basic Invalidation Reset");
  console.log("-".repeat(40));

  try {
    const invalidationReset = new InvalidationReset(provider);

    // Check current state
    console.log("📊 Checking current invalidation state...");
    const stateCheck = await invalidationReset.checkInvalidationState(
      wallet.address
    );
    console.log(
      `  Current epoch: ${stateCheck.currentEpoch?.toString() || "unknown"}`
    );

    // Reset invalidation
    console.log("🔄 Resetting invalidation state...");
    const resetResult =
      await invalidationReset.resetInvalidationState(userAPrivateKey);

    if (resetResult.success) {
      console.log("✅ TEST 1 PASSED: Invalidation reset successful");
      console.log(`   Transaction: ${resetResult.txHash}`);
    } else {
      console.log("❌ TEST 1 FAILED:", resetResult.error);
    }
  } catch (error: any) {
    console.log("❌ TEST 1 ERROR:", error.message);
  }

  // =================================================================
  // TEST 2: Complete Account Preparation
  // =================================================================
  console.log("\n🛠️ TEST 2: Complete Account Preparation");
  console.log("-".repeat(40));

  try {
    console.log("🚀 Running complete account preparation...");
    await prepareAccountForTesting(userAPrivateKey);
    console.log("✅ TEST 2 PASSED: Account preparation successful");
  } catch (error: any) {
    console.log("❌ TEST 2 FAILED:", error.message);
  }

  // =================================================================
  // TEST 3: Quick Reset Function
  // =================================================================
  console.log("\n⚡ TEST 3: Quick Reset Function");
  console.log("-".repeat(40));

  try {
    console.log("🚀 Running quick invalidation reset...");
    await quickInvalidationReset(userAPrivateKey);
    console.log("✅ TEST 3 PASSED: Quick reset successful");
  } catch (error: any) {
    console.log("❌ TEST 3 FAILED:", error.message);
  }

  // =================================================================
  // TEST 4: Verify Account is Ready for Testing
  // =================================================================
  console.log("\n🧪 TEST 4: Verify Account Ready for Testing");
  console.log("-".repeat(40));

  try {
    const invalidationReset = new InvalidationReset(provider);
    const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
    const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

    // Check LOP epoch
    const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);
    const epoch = await LOP.epoch(wallet.address, 0);
    console.log(`  ✅ LOP epoch: ${epoch.toString()}`);

    // Check MockTRX allowance
    const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);
    const allowance = await MockTRX.allowance(wallet.address, lopAddress);
    console.log(`  ✅ MockTRX allowance: ${ethers.formatEther(allowance)} TRX`);

    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    console.log(`  ✅ ETH balance: ${ethers.formatEther(ethBalance)} ETH`);

    // Check MockTRX balance
    const trxBalance = await MockTRX.balanceOf(wallet.address);
    console.log(`  ✅ MockTRX balance: ${ethers.formatEther(trxBalance)} TRX`);

    if (allowance > 0n && ethBalance > ethers.parseEther("0.01")) {
      console.log(
        "✅ TEST 4 PASSED: Account is ready for atomic swap testing!"
      );
    } else {
      console.log("⚠️ TEST 4 WARNING: Account may need more setup");
      if (allowance === 0n) console.log("   - Need MockTRX approval");
      if (ethBalance <= ethers.parseEther("0.01"))
        console.log("   - Need more ETH for gas");
    }
  } catch (error: any) {
    console.log("❌ TEST 4 ERROR:", error.message);
  }

  // =================================================================
  // SUMMARY
  // =================================================================
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                        🎉 TEST COMPLETE                       ║"
  );
  console.log(
    "╠════════════════════════════════════════════════════════════════╣"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║  Your account should now be ready for continuous testing!     ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║  🚀 Next Steps:                                               ║"
  );
  console.log(
    "║  1. Run your atomic swap tests normally                       ║"
  );
  console.log(
    "║  2. If you get invalidation errors, run:                      ║"
  );
  console.log(
    "║     npx ts-node scripts/utils/invalidation-reset.ts prepare   ║"
  );
  console.log(
    "║  3. No more need for fresh accounts every time!               ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );

  console.log("\n💡 Pro Tips:");
  console.log(
    "- The invalidation reset is much faster than generating fresh accounts"
  );
  console.log("- You can run tests multiple times with the same account");
  console.log("- Use 'prepare' command before test sessions for best results");
  console.log("- Keep your .env file with the same private key");
}

main().catch(console.error);
