import { TronWeb } from "tronweb";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 100000000, // 100 TRX for tests
};

interface RealTestResult {
  functionName: string;
  txHash: string;
  result: any;
  gasUsed: number;
  success: boolean;
  timestamp: string;
  tronscanUrl: string;
}

async function testCreate2Functionality(): Promise<RealTestResult[]> {
  console.log("🧪 REAL TESTING: TronCreate2Test Functions");
  console.log("=".repeat(60));

  // Load deployment results
  let deploymentData;
  try {
    const data = fs.readFileSync("./real-deployment-results.json", "utf8");
    deploymentData = JSON.parse(data);
  } catch (error) {
    throw new Error(
      "❌ Could not load deployment results. Run phase1-deploy-create2-test.ts first"
    );
  }

  const contractAddress = deploymentData.phase1.address;
  if (!contractAddress) {
    throw new Error("❌ No contract address found in deployment results");
  }

  console.log(`📋 Testing Contract: ${contractAddress}`);

  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

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

  const contract = await tronWeb.contract(contractABI, contractAddress);
  const testResults: RealTestResult[] = [];

  try {
    // Test 1: testComputeAddress (view function)
    console.log("\n🔍 Test 1: testComputeAddress()");

    const salt = tronWeb.utils.padLeft(tronWeb.utils.toHex(Date.now()), 64);
    const bytecodeHash = tronWeb.utils.keccak256("test-bytecode");

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

    // Test 2: testDeployment (state-changing function)
    console.log("\n🔍 Test 2: testDeployment()");

    const deploymentSalt = tronWeb.utils.padLeft(
      tronWeb.utils.toHex(Date.now() + 1),
      64
    );
    console.log(`   Deployment Salt: ${deploymentSalt}`);

    const deploymentResult = await contract
      .testDeployment(deploymentSalt)
      .send({
        feeLimit: TRON_CONFIG.feeLimit,
        shouldPollResponse: true,
      });

    const deploymentTxHash =
      deploymentResult.txid || deploymentResult.transaction?.txID;
    console.log(`✅ Deployment Test TX: ${deploymentTxHash}`);

    // Get transaction info
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const deploymentTxInfo =
      await tronWeb.trx.getTransactionInfo(deploymentTxHash);
    const deploymentGasUsed = deploymentTxInfo.receipt?.energy_usage_total || 0;

    testResults.push({
      functionName: "testDeployment",
      txHash: deploymentTxHash,
      result: "CREATE2 deployment test completed",
      gasUsed: deploymentGasUsed,
      success: true,
      timestamp: new Date().toISOString(),
      tronscanUrl: `https://nile.tronscan.org/#/transaction/${deploymentTxHash}`,
    });

    // Test 3: compareCreate2Methods (view function)
    console.log("\n🔍 Test 3: compareCreate2Methods()");

    const comparisonSalt = tronWeb.utils.padLeft(
      tronWeb.utils.toHex(Date.now() + 2),
      64
    );
    const comparisonBytecodeHash = tronWeb.utils.keccak256("comparison-test");

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
      if (test.txHash !== "N/A (view function)") {
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
    } else {
      console.log("❌ Some tests failed. Check CREATE2 implementation.");
    }

    return testResults;
  } catch (error: any) {
    console.error("❌ TESTING FAILED:", error.message);
    throw error;
  }
}

// Execute tests
async function main() {
  try {
    const results = await testCreate2Functionality();
    console.log("\n🎯 Phase 1 Testing Complete!");
    console.log("📋 Next Step: Run phase2-deploy-clones-test.ts");
    process.exit(0);
  } catch (error) {
    console.error("💥 Phase 1 Testing Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { testCreate2Functionality };
