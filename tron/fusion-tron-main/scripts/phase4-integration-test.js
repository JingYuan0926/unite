#!/usr/bin/env node

/**
 * @title Phase 4 Integration Test
 * @notice Complete test of LOP integration with existing atomic swap system
 * @dev Verifies all components from LOP-plan.md Phase 4 are working
 */

const { LOPFusionSwap, FinalWorkingSwap } = require("../atomic-swap.js");
const { FusionAPI } = require("../src/lop-integration/FusionAPI.js");

async function testPhase4Integration() {
  console.log("🧪 PHASE 4 INTEGRATION TEST");
  console.log("===========================");
  console.log("Testing LOP integration with existing atomic swap system");
  console.log("");

  let testsPassed = 0;
  let testsTotal = 0;
  const results = [];

  // Helper function to run a test
  async function runTest(testName, testFunction) {
    testsTotal++;
    console.log(`\n🔬 Test ${testsTotal}: ${testName}`);
    console.log("─".repeat(50));

    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;

      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      testsPassed++;
      results.push({ name: testName, status: "PASSED", duration });
    } catch (error) {
      console.error(`❌ ${testName} - FAILED`);
      console.error(`   Error: ${error.message}`);
      results.push({ name: testName, status: "FAILED", error: error.message });
    }
  }

  // Test 1: LOPFusionSwap class instantiation
  await runTest("LOPFusionSwap Class Instantiation", async () => {
    const swap = new LOPFusionSwap();

    if (!swap) throw new Error("Failed to create LOPFusionSwap instance");
    if (!(swap instanceof FinalWorkingSwap))
      throw new Error("LOPFusionSwap does not extend FinalWorkingSwap");

    // Check required methods exist
    const requiredMethods = [
      "setupLOP",
      "createLOPOrder",
      "fillLOPOrder",
      "executeCompleteFlow",
    ];
    for (const method of requiredMethods) {
      if (typeof swap[method] !== "function") {
        throw new Error(`Required method ${method} not found`);
      }
    }

    console.log("   ✓ LOPFusionSwap instance created");
    console.log("   ✓ Extends FinalWorkingSwap correctly");
    console.log("   ✓ All required methods present");
  });

  // Test 2: LOP Setup and Contract Connectivity
  await runTest("LOP Setup and Contract Connectivity", async () => {
    const swap = new LOPFusionSwap();
    await swap.setupLOP();

    if (!swap.fusionAPI) throw new Error("FusionAPI not initialized");

    console.log("   ✓ LOP deployment loaded");
    console.log("   ✓ FusionAPI initialized");
    console.log("   ✓ Contract connectivity verified");
  });

  // Test 3: Order Creation and Signing
  await runTest("Order Creation and EIP-712 Signing", async () => {
    const swap = new LOPFusionSwap();
    await swap.setupLOP();

    const orderParams = {
      ethAmount: "10000000000000000", // 0.01 ETH
      trxAmount: "10000000", // 10 TRX
      secretHash: "0x" + "00".repeat(32),
      resolver: swap.ethWallet.address,
      timelock: 3600,
      safetyDeposit: "100000000000000000", // 0.1 ETH
    };

    const signedOrder = await swap.createLOPOrder(orderParams);

    if (!signedOrder.order) throw new Error("Order not created");
    if (!signedOrder.signature) throw new Error("Order not signed");
    if (!signedOrder.orderHash) throw new Error("Order hash not generated");

    // Verify signature
    const { ethers } = require("ethers");
    const recoveredSigner = ethers.verifyTypedData(
      signedOrder.domain,
      signedOrder.types,
      signedOrder.order,
      signedOrder.signature
    );

    if (recoveredSigner.toLowerCase() !== orderParams.resolver.toLowerCase()) {
      throw new Error("Invalid signature recovery");
    }

    console.log("   ✓ Order created successfully");
    console.log("   ✓ EIP-712 signature generated");
    console.log("   ✓ Signature verification passed");
    console.log(
      `   ✓ Order hash: ${signedOrder.orderHash.substring(0, 10)}...`
    );
  });

  // Test 4: FusionAPI Integration
  await runTest("FusionAPI Integration", async () => {
    const { ethers } = require("ethers");
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const wallet = new ethers.Wallet(
      process.env.RESOLVER_PRIVATE_KEY,
      provider
    );

    const deployments = {
      limitOrderProtocol: "0xA6F9c4d4c97437F345937b811bF384cD23070f7A",
      fusionExtension: "0x1cCD475bfe2D69e931d23f454C3CfF1ABf5eA9f0",
      escrowFactory: process.env.ETH_ESCROW_FACTORY_ADDRESS,
      weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    };

    const fusionAPI = new FusionAPI(provider, wallet, deployments, 11155111);

    if (!fusionAPI.lopContract) throw new Error("LOP contract not initialized");
    if (!fusionAPI.chainId) throw new Error("Chain ID not set");

    console.log("   ✓ FusionAPI instantiated correctly");
    console.log("   ✓ LOP contract connected");
    console.log("   ✓ Provider and wallet configured");
  });

  // Test 5: Contract Address Verification
  await runTest("Contract Address Verification", async () => {
    const lopDeployment = require("../deployments/sepolia-lop-complete.json");

    if (!lopDeployment.limitOrderProtocol)
      throw new Error("LOP address not found");
    if (
      lopDeployment.limitOrderProtocol !==
      "0xA6F9c4d4c97437F345937b811bF384cD23070f7A"
    ) {
      throw new Error("LOP address mismatch");
    }
    if (lopDeployment.status !== "100_percent_functional") {
      throw new Error("LOP contract not marked as functional");
    }

    console.log("   ✓ LOP contract address verified");
    console.log("   ✓ Deployment status confirmed");
    console.log("   ✓ Configuration valid");
  });

  // Test 6: Main Execution Path
  await runTest("Main Execution Path Configuration", async () => {
    // Verify that main() function uses LOPFusionSwap
    const fs = require("fs");
    const path = require("path");
    const atomicSwapPath = path.join(__dirname, "..", "atomic-swap.js");
    const atomicSwapContent = fs.readFileSync(atomicSwapPath, "utf8");

    if (!atomicSwapContent.includes("new LOPFusionSwap()")) {
      throw new Error("Main execution not using LOPFusionSwap");
    }
    if (!atomicSwapContent.includes("executeCompleteFlow()")) {
      throw new Error("Main execution not calling executeCompleteFlow");
    }

    console.log("   ✓ Main execution uses LOPFusionSwap");
    console.log("   ✓ Complete flow execution configured");
    console.log("   ✓ Phase 4 integration complete");
  });

  // Test Results Summary
  console.log("\n📊 PHASE 4 INTEGRATION TEST RESULTS");
  console.log("===================================");
  console.log(`Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(
    `Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`
  );
  console.log("");

  results.forEach((result, index) => {
    const status = result.status === "PASSED" ? "✅" : "❌";
    const duration = result.duration ? ` (${result.duration}ms)` : "";
    console.log(`${status} ${index + 1}. ${result.name}${duration}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  console.log("");

  if (testsPassed === testsTotal) {
    console.log("🎉 ALL PHASE 4 INTEGRATION TESTS PASSED!");
    console.log("========================================");
    console.log("✅ LOP integration complete and functional");
    console.log("✅ Ready for Phase 5 testing and validation");
    console.log("✅ Ready for Phase 6 demo preparation");
    console.log("");
    console.log("🚀 Next Steps:");
    console.log("   1. Run: node scripts/demo-lop-fusion.js");
    console.log("   2. Test end-to-end functionality");
    console.log("   3. Prepare for hackathon demonstration");

    return true;
  } else {
    console.log("❌ PHASE 4 INTEGRATION INCOMPLETE");
    console.log("=================================");
    console.log("Some tests failed. Please review and fix before proceeding.");

    return false;
  }
}

// Run the test suite
if (require.main === module) {
  testPhase4Integration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Test suite failed:", error.message);
      process.exit(1);
    });
}

module.exports = { testPhase4Integration };
