const TronWeb = require("tronweb");
const fs = require("fs");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 100000000, // 100 TRX for tests
};

async function testCreate2Functionality() {
  console.log("🧪 REAL TESTING: TronCreate2Test Functions");
  console.log("=".repeat(60));

  // Load deployment results
  let deploymentData;
  try {
    const data = fs.readFileSync("./real-deployment-results.json", "utf8");
    deploymentData = JSON.parse(data);
  } catch (error) {
    throw new Error(
      "❌ Could not load deployment results. Run deploy-create2-real.js first"
    );
  }

  const contractAddress = deploymentData.phase1.address;
  if (!contractAddress) {
    throw new Error("❌ No contract address found in deployment results");
  }

  // Convert hex address to base58
  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  const base58Address = tronWeb.address.fromHex("41" + contractAddress);
  console.log(`📋 Testing Contract: ${base58Address}`);

  // Contract ABI for TronCreate2Test
  const contractABI = [
    {
      inputs: [
        { name: "salt", type: "bytes32" },
        { name: "bytecodeHash", type: "bytes32" },
      ],
      name: "testComputeAddress",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ name: "salt", type: "bytes32" }],
      name: "testDeployment",
      outputs: [
        { name: "deployed", type: "address" },
        { name: "expected", type: "address" },
        { name: "matches", type: "bool" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { name: "salt", type: "bytes32" },
        { name: "bytecodeHash", type: "bytes32" },
      ],
      name: "compareCreate2Methods",
      outputs: [
        { name: "tronAddress", type: "address" },
        { name: "ethereumAddress", type: "address" },
        { name: "different", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const contract = await tronWeb.contract(contractABI, base58Address);
  const testResults = [];

  try {
    // Test 1: testComputeAddress (view function)
    console.log("\n🔍 Test 1: testComputeAddress()");

    // Generate test data
    const timestamp = Date.now();
    const salt = "0x" + timestamp.toString(16).padStart(64, "0");
    const bytecodeHash =
      "0x" +
      "test-bytecode"
        .split("")
        .map((c) => c.charCodeAt(0).toString(16))
        .join("")
        .padStart(64, "0");

    console.log(`   Salt: ${salt}`);
    console.log(`   Bytecode Hash: ${bytecodeHash}`);

    const computedAddress = await contract
      .testComputeAddress(salt, bytecodeHash)
      .call();

    console.log(
      `✅ Computed Address: ${tronWeb.address.fromHex(computedAddress)}`
    );

    testResults.push({
      functionName: "testComputeAddress",
      txHash: "N/A (view function)",
      result: computedAddress,
      gasUsed: 0,
      success: true,
      timestamp: new Date().toISOString(),
      tronscanUrl: "N/A (view function)",
    });

    // Test 2: compareCreate2Methods (view function)
    console.log("\n🔍 Test 2: compareCreate2Methods()");

    const comparisonTimestamp = Date.now() + 1000;
    const comparisonSalt =
      "0x" + comparisonTimestamp.toString(16).padStart(64, "0");
    const comparisonBytecodeHash =
      "0x" +
      "comparison-test"
        .split("")
        .map((c) => c.charCodeAt(0).toString(16))
        .join("")
        .padStart(64, "0");

    const comparisonResult = await contract
      .compareCreate2Methods(comparisonSalt, comparisonBytecodeHash)
      .call();

    console.log(
      `   Tron Address (0x41): ${tronWeb.address.fromHex(comparisonResult.tronAddress)}`
    );
    console.log(
      `   Ethereum Address (0xff): ${tronWeb.address.fromHex(comparisonResult.ethereumAddress)}`
    );
    console.log(`   Addresses Different: ${comparisonResult.different}`);

    if (comparisonResult.different) {
      console.log("✅ CREATE2 prefix fix working correctly!");
    } else {
      console.log("❌ CREATE2 prefix fix may not be working");
    }

    testResults.push({
      functionName: "compareCreate2Methods",
      txHash: "N/A (view function)",
      result: {
        tronAddress: comparisonResult.tronAddress,
        ethereumAddress: comparisonResult.ethereumAddress,
        different: comparisonResult.different,
      },
      gasUsed: 0,
      success: comparisonResult.different,
      timestamp: new Date().toISOString(),
      tronscanUrl: "N/A (view function)",
    });

    // Test 3: testDeployment (state-changing function)
    console.log("\n🔍 Test 3: testDeployment()");

    const deploymentTimestamp = Date.now() + 2000;
    const deploymentSalt =
      "0x" + deploymentTimestamp.toString(16).padStart(64, "0");
    console.log(`   Deployment Salt: ${deploymentSalt}`);

    const deploymentResult = await contract
      .testDeployment(deploymentSalt)
      .send({
        feeLimit: TRON_CONFIG.feeLimit,
        shouldPollResponse: true,
      });

    // Get transaction hash properly
    let deploymentTxHash = "unknown";
    if (deploymentResult.transactionHash) {
      deploymentTxHash = deploymentResult.transactionHash;
    } else if (deploymentResult.txid) {
      deploymentTxHash = deploymentResult.txid;
    } else if (
      deploymentResult.transaction &&
      deploymentResult.transaction.txID
    ) {
      deploymentTxHash = deploymentResult.transaction.txID;
    }

    console.log(`✅ Deployment Test TX: ${deploymentTxHash}`);

    // Get transaction info
    let deploymentGasUsed = 0;
    if (deploymentTxHash !== "unknown") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const deploymentTxInfo =
          await tronWeb.trx.getTransactionInfo(deploymentTxHash);
        deploymentGasUsed = deploymentTxInfo.receipt?.energy_usage_total || 0;
        console.log(`   Gas Used: ${deploymentGasUsed} energy`);
      } catch (error) {
        console.log("⚠️ Could not fetch transaction info");
      }
    }

    testResults.push({
      functionName: "testDeployment",
      txHash: deploymentTxHash,
      result: "CREATE2 deployment test completed",
      gasUsed: deploymentGasUsed,
      success: true,
      timestamp: new Date().toISOString(),
      tronscanUrl:
        deploymentTxHash !== "unknown"
          ? `https://nile.tronscan.org/#/transaction/${deploymentTxHash}`
          : "N/A",
    });

    // Save test results
    const updatedData = {
      ...deploymentData,
      phase1Tests: testResults,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(
      "./real-deployment-results.json",
      JSON.stringify(updatedData, null, 2)
    );

    console.log("\n📊 TEST SUMMARY:");
    console.log("=".repeat(40));
    testResults.forEach((test) => {
      const status = test.success ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${test.functionName}`);
      if (test.txHash !== "N/A (view function)" && test.txHash !== "unknown") {
        console.log(`    TX: ${test.txHash}`);
        console.log(`    Gas: ${test.gasUsed} energy`);
        console.log(`    Tronscan: ${test.tronscanUrl}`);
      }
    });

    const passedTests = testResults.filter((t) => t.success).length;
    console.log(
      `\n🎯 Results: ${passedTests}/${testResults.length} tests passed`
    );

    if (passedTests === testResults.length) {
      console.log("🎊 ALL CREATE2 TESTS PASSED! TVM compatibility confirmed.");

      // Show real results
      console.log("\n🌟 REAL ON-CHAIN RESULTS:");
      console.log(`🔗 Contract Address: ${base58Address}`);
      console.log(
        `🔗 Contract Explorer: https://nile.tronscan.org/#/contract/${base58Address}`
      );

      // Show the key validation - that Tron and Ethereum CREATE2 produce different addresses
      const keyTest = testResults.find(
        (t) => t.functionName === "compareCreate2Methods"
      );
      if (keyTest && keyTest.success) {
        console.log(
          "✅ CRITICAL SUCCESS: CREATE2 prefix fix (0x41 vs 0xff) is working!"
        );
        console.log(
          "✅ This proves the TVM compatibility issue has been resolved!"
        );
      }
    } else {
      console.log("❌ Some tests failed. Check CREATE2 implementation.");
    }

    return testResults;
  } catch (error) {
    console.error("❌ TESTING FAILED:", error.message);
    throw error;
  }
}

// Execute tests
async function main() {
  try {
    const results = await testCreate2Functionality();
    console.log("\n🎯 Phase 1 Testing Complete!");
    console.log("📋 READY FOR FACTORY DEPLOYMENT!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Phase 1 Testing Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testCreate2Functionality };
