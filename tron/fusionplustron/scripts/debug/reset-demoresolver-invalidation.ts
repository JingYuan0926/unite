import { ethers } from "hardhat";
import { LimitOrderProtocol__factory } from "../../typechain-types";

/**
 * 🔧 RESET DEMORESOLVER INVALIDATION
 *
 * The issue is that DemoResolver contract itself calls LOP.fillOrderArgs(),
 * so the DemoResolver address also needs its invalidation state reset!
 */

async function main() {
  console.log("🔧 RESETTING DEMORESOLVER INVALIDATION");
  console.log("=".repeat(50));

  require("dotenv").config();

  const provider = ethers.provider;
  const [deployer] = await ethers.getSigners();

  const demoResolverAddress = "0x8E46D1688aCeF18Cae7b2af9C0e4f8dF7d9B6A7B";
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";

  console.log("📋 Configuration:");
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  DemoResolver: ${demoResolverAddress}`);
  console.log(`  LOP: ${lopAddress}`);

  // Get LOP contract
  const LOP = LimitOrderProtocol__factory.connect(lopAddress, deployer);

  console.log("\n🔍 CHECKING DEMORESOLVER INVALIDATION STATE");

  try {
    // Check DemoResolver's current epoch
    const demoResolverEpoch = await LOP.epoch(demoResolverAddress, 0);
    console.log(`  📊 DemoResolver epoch: ${demoResolverEpoch}`);

    // Check User A's current epoch for comparison
    const userAAddress = "0x7DAf99E5d4b52A9b37A31eC1feD22B5114337d27";
    const userAEpoch = await LOP.epoch(userAAddress, 0);
    console.log(`  📊 User A epoch: ${userAEpoch}`);

    if (demoResolverEpoch === userAEpoch) {
      console.log(
        "  ⚠️ Both accounts have same epoch - this might be causing conflicts"
      );
    }
  } catch (error: any) {
    console.log(`  ❌ Failed to check epochs: ${error.message}`);
  }

  console.log("\n💡 ROOT CAUSE ANALYSIS:");
  console.log(
    "The DemoResolver contract calls LOP.fillOrderArgs() with msg.sender = DemoResolver"
  );
  console.log(
    "But User A signs the order with their own account invalidation state"
  );
  console.log(
    "This creates a mismatch between order signer and LOP caller invalidation states"
  );

  console.log("\n🔧 SOLUTION APPROACHES:");
  console.log("1. ✅ Reset DemoResolver invalidation state (easy fix)");
  console.log(
    "2. ⚙️ Modify order structure to account for resolver pattern (complex)"
  );
  console.log("3. 🔄 Use delegate calls or different LOP integration pattern");

  console.log("\n🚀 IMPLEMENTING SOLUTION 1: Reset DemoResolver Invalidation");

  try {
    // The deployer can't directly call increaseEpoch for the DemoResolver
    // because increaseEpoch affects msg.sender's state
    console.log(
      "⚠️ IMPORTANT: DemoResolver contract itself would need to call increaseEpoch()"
    );
    console.log(
      "📝 We need to add a function to DemoResolver that calls LOP.increaseEpoch()"
    );

    // Check if DemoResolver has any admin functions
    console.log("\n🔍 Checking DemoResolver for admin functions...");

    const DemoResolver = await ethers.getContractAt(
      "DemoResolver",
      demoResolverAddress
    );

    // Try to call some read-only functions to see what's available
    try {
      const lopContract = await DemoResolver.LOP();
      const escrowFactory = await DemoResolver.ESCROW_FACTORY();
      console.log(`  ✅ DemoResolver.LOP(): ${lopContract}`);
      console.log(`  ✅ DemoResolver.ESCROW_FACTORY(): ${escrowFactory}`);

      // Check if there are any owner functions
      console.log(
        "  📋 DemoResolver interface confirmed - but no epoch management functions visible"
      );
    } catch (error: any) {
      console.log(`  ❌ Failed to read DemoResolver: ${error.message}`);
    }

    console.log("\n💡 ALTERNATIVE SOLUTION:");
    console.log(
      "Since we can't easily reset DemoResolver's epoch, let's try a different approach:"
    );
    console.log("1. 🎯 Use a different order salt/nonce that doesn't conflict");
    console.log(
      "2. 🎯 Check if the LOP validation logic has other bypass mechanisms"
    );
    console.log("3. 🎯 Deploy a new DemoResolver with clean state");
  } catch (error: any) {
    console.log(`❌ Solution failed: ${error.message}`);
  }

  console.log("\n🎯 IMMEDIATE ACTION PLAN:");
  console.log(
    "1. Try modifying the order salt to avoid invalidation conflicts"
  );
  console.log("2. Check if there's a way to bypass this LOP validation");
  console.log("3. Consider using a different resolver pattern");

  console.log("\n✅ ANALYSIS COMPLETE");
  console.log(
    "The invalidation error is caused by DemoResolver<->LOP interaction"
  );
  console.log(
    "We need to solve the resolver-level invalidation, not just user-level"
  );
}

main().catch(console.error);
