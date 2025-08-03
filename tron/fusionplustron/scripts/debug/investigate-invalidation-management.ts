import { ethers } from "hardhat";

/**
 * 🔍 INVESTIGATE LOP INVALIDATION MANAGEMENT
 *
 * This script investigates what invalidation management functions
 * are available in 1inch LOP v4 to help with continuous testing.
 */

async function main() {
  console.log("🔍 INVESTIGATING 1INCH LOP INVALIDATION MANAGEMENT");
  console.log("=".repeat(60));

  require("dotenv").config();

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const provider = ethers.provider;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);

  console.log("📋 Configuration:");
  console.log("  LOP Address:", lopAddress);
  console.log("  User A:", userA.address);

  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  // =================================================================
  // INVESTIGATE INVALIDATION STATE FUNCTIONS
  // =================================================================
  console.log("\n🔍 INVESTIGATING INVALIDATION STATE FUNCTIONS:");

  try {
    // Check what invalidation-related functions exist
    console.log("\n📋 Testing invalidation state queries...");

    // Check if we can read nonce
    try {
      const nonce = await LOP.nonce(userA.address);
      console.log(
        `  ✅ Current nonce for ${userA.address}: ${nonce.toString()}`
      );
    } catch (error) {
      console.log(`  ❌ nonce() function not available`);
    }

    // Check if we can read bit invalidator
    try {
      const bitInvalidator = await LOP.bitInvalidator(userA.address, 0);
      console.log(`  ✅ Bit invalidator slot 0: ${bitInvalidator.toString()}`);

      // Check multiple slots
      for (let i = 0; i < 5; i++) {
        const slot = await LOP.bitInvalidator(userA.address, i);
        console.log(`  📍 Bit invalidator slot ${i}: ${slot.toString()}`);
      }
    } catch (error) {
      console.log(
        `  ❌ bitInvalidator() function not available:`,
        error.message
      );
    }

    // Check if we can read epoch
    try {
      const epoch = await LOP.epoch(userA.address);
      console.log(
        `  ✅ Current epoch for ${userA.address}: ${epoch.toString()}`
      );
    } catch (error) {
      console.log(`  ❌ epoch() function not available`);
    }

    // Check remaining invalidator
    try {
      const remaining = await LOP.remainingInvalidator(userA.address);
      console.log(`  ✅ Remaining invalidator: ${remaining.toString()}`);
    } catch (error) {
      console.log(`  ❌ remainingInvalidator() function not available`);
    }
  } catch (error: any) {
    console.log(`❌ Error investigating state: ${error.message}`);
  }

  // =================================================================
  // INVESTIGATE INVALIDATION MANAGEMENT FUNCTIONS
  // =================================================================
  console.log("\n🔧 INVESTIGATING INVALIDATION MANAGEMENT FUNCTIONS:");

  try {
    // Check for nonce advancement functions
    const functions = [
      "increaseNonce",
      "advanceNonce",
      "incrementNonce",
      "invalidateOrder",
      "cancelOrder",
      "increaseEpoch",
      "advanceEpoch",
      "resetInvalidator",
      "clearBitInvalidator",
      "invalidateOrders",
      "massInvalidate",
    ];

    for (const funcName of functions) {
      try {
        // Check if function exists by trying to get its fragment
        const fragment = LOP.interface.getFunction(funcName);
        console.log(
          `  ✅ Found function: ${funcName}(${fragment.inputs.map((i) => i.type).join(", ")})`
        );

        // For some functions, try to estimate gas (without executing)
        if (
          ["increaseNonce", "advanceNonce", "incrementNonce"].includes(funcName)
        ) {
          try {
            const gasEstimate = await LOP[funcName].estimateGas();
            console.log(`    💰 Gas estimate: ${gasEstimate.toString()}`);
          } catch (gasError) {
            console.log(`    ⚠️ Gas estimation failed (might need parameters)`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Function ${funcName} not found`);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error investigating functions: ${error.message}`);
  }

  // =================================================================
  // TEST POTENTIAL SOLUTIONS
  // =================================================================
  console.log("\n🧪 TESTING POTENTIAL INVALIDATION SOLUTIONS:");

  try {
    // Try to advance nonce if function exists
    if (LOP.interface.hasFunction("increaseNonce")) {
      console.log("\n  🔄 Testing nonce advancement...");

      const nonceBefore = await LOP.nonce(userA.address);
      console.log(`    Nonce before: ${nonceBefore.toString()}`);

      // Test gas estimation first
      const gasEstimate = await LOP.increaseNonce.estimateGas();
      console.log(`    Gas needed: ${gasEstimate.toString()}`);

      console.log("    ⚠️ Ready to advance nonce (commented out for safety)");
      // Uncomment to actually advance nonce:
      // const tx = await LOP.increaseNonce();
      // await tx.wait();
      // const nonceAfter = await LOP.nonce(userA.address);
      // console.log(`    Nonce after: ${nonceAfter.toString()}`);
    } else {
      console.log("  ❌ No nonce advancement function found");
    }
  } catch (error: any) {
    console.log(`  ❌ Error testing solutions: ${error.message}`);
  }

  // =================================================================
  // RECOMMENDATIONS
  // =================================================================
  console.log("\n💡 RECOMMENDATIONS FOR CONTINUOUS TESTING:");
  console.log("=".repeat(50));

  console.log("\n🎯 IMMEDIATE SOLUTIONS:");
  console.log("1. ✅ Use Account Rotation System (see account-manager.ts)");
  console.log("2. ✅ Generate fresh accounts for each test session");
  console.log("3. ✅ Use higher entropy salts with timestamps");
  console.log("4. ✅ Test on local Hardhat fork for unlimited fresh state");

  console.log("\n🔧 ADVANCED SOLUTIONS:");
  console.log("1. 🔄 Advance nonce between tests (if function available)");
  console.log("2. 🔄 Use epoch management (if supported)");
  console.log("3. 🔄 Clear bit invalidators (if possible)");
  console.log("4. 🔄 Deploy your own LOP instance for testing");

  console.log("\n📋 TESTING BEST PRACTICES:");
  console.log("1. 🎯 Create account pools of 10-20 addresses");
  console.log("2. 🎯 Rotate accounts after each test");
  console.log("3. 🎯 Fund accounts in advance");
  console.log("4. 🎯 Track account usage to avoid invalidation");
  console.log("5. 🎯 Use local fork for development iterations");

  console.log("\n🚀 NEXT STEPS:");
  console.log("- Run account-manager.ts to set up account rotation");
  console.log("- Test with fresh accounts from the pool");
  console.log("- Consider local Hardhat fork for faster iterations");
}

main().catch(console.error);
