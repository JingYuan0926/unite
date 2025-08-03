import { ethers } from "hardhat";
import { TronWeb } from "tronweb";

// Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 1000000000, // 1000 TRX
  shouldPollResponse: true,
  consumeUserResourcePercent: 100,
};

interface DeploymentResult {
  contractName: string;
  address: string;
  txHash: string;
  tronscanUrl: string;
  deploymentTimestamp: number;
}

interface TestResult {
  contractName: string;
  testFunction: string;
  success: boolean;
  result?: any;
  txHash?: string;
  gasUsed?: number;
  error?: string;
}

class TronEscrowDeploymentSuite {
  private tronWeb: any;
  private deploymentResults: DeploymentResult[] = [];
  private testResults: TestResult[] = [];

  constructor() {
    this.tronWeb = new TronWeb(
      TRON_CONFIG.fullHost,
      TRON_CONFIG.fullHost,
      TRON_CONFIG.fullHost,
      TRON_CONFIG.privateKey
    );

    // Set fee limit and other options
    this.tronWeb.setDefaultBlock("latest");
    this.tronWeb.transactionBuilder.setFeeLimit(TRON_CONFIG.feeLimit);
  }

  /**
   * Deploy a contract to Tron network
   */
  private async deployContract(
    contractName: string,
    bytecode: string,
    abi: any[],
    constructorParams: any[] = [],
    value: number = 0
  ): Promise<DeploymentResult> {
    console.log(`\n🚀 Deploying ${contractName}...`);

    try {
      // Create contract instance
      const contract = await this.tronWeb.contract().new({
        abi,
        bytecode,
        feeLimit: TRON_CONFIG.feeLimit,
        callValue: value,
        parameters: constructorParams,
      });

      const address = contract.address;
      const txHash = contract.transactionHash;

      console.log(`✅ ${contractName} deployed successfully!`);
      console.log(`   Address: ${address}`);
      console.log(`   TX Hash: ${txHash}`);

      const deploymentResult: DeploymentResult = {
        contractName,
        address,
        txHash,
        tronscanUrl: `https://nile.tronscan.org/#/transaction/${txHash}`,
        deploymentTimestamp: Date.now(),
      };

      this.deploymentResults.push(deploymentResult);
      return deploymentResult;
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractName}:`, error);
      throw error;
    }
  }

  /**
   * Execute a test function on a deployed contract
   */
  private async executeTest(
    contractName: string,
    contractAddress: string,
    abi: any[],
    testFunction: string,
    params: any[] = [],
    value: number = 0
  ): Promise<TestResult> {
    console.log(`\n🧪 Testing ${contractName}.${testFunction}()...`);

    try {
      const contract = await this.tronWeb.contract(abi, contractAddress);

      // Execute the test function
      const result = await contract[testFunction](...params).send({
        feeLimit: TRON_CONFIG.feeLimit,
        callValue: value,
        shouldPollResponse: true,
      });

      console.log(`✅ Test ${testFunction} passed!`);
      console.log(`   Result:`, result);

      const testResult: TestResult = {
        contractName,
        testFunction,
        success: true,
        result,
        txHash: result.transactionHash || result.txid,
        gasUsed: result.receipt?.energy_usage_total || 0,
      };

      this.testResults.push(testResult);
      return testResult;
    } catch (error) {
      console.error(`❌ Test ${testFunction} failed:`, error);

      const testResult: TestResult = {
        contractName,
        testFunction,
        success: false,
        error: error.message || error.toString(),
      };

      this.testResults.push(testResult);
      throw error;
    }
  }

  /**
   * Phase 1: Deploy and test TronCreate2Test
   */
  async executePhase1(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 PHASE 1: CREATE2 FUNCTIONALITY TEST");
    console.log("=".repeat(60));

    // Read compiled contract artifacts
    const TronCreate2Test = await ethers.getContractFactory("TronCreate2Test");
    const bytecode = TronCreate2Test.bytecode;
    const abi = TronCreate2Test.interface.format(
      ethers.utils.FormatTypes.json
    ) as any[];

    // Deploy TronCreate2Test
    const deployment = await this.deployContract(
      "TronCreate2Test",
      bytecode,
      JSON.parse(abi as any)
    );

    // Test CREATE2 address computation
    const salt = this.tronWeb.utils.padLeft(
      this.tronWeb.utils.toHex(Date.now()),
      64
    );
    const bytecodeHash = this.tronWeb.utils.keccak256("test-bytecode");

    await this.executeTest(
      "TronCreate2Test",
      deployment.address,
      JSON.parse(abi as any),
      "testComputeAddress",
      [salt, bytecodeHash]
    );

    // Test CREATE2 deployment
    await this.executeTest(
      "TronCreate2Test",
      deployment.address,
      JSON.parse(abi as any),
      "testDeployment",
      [salt]
    );

    // Test comparison between Tron and Ethereum CREATE2
    await this.executeTest(
      "TronCreate2Test",
      deployment.address,
      JSON.parse(abi as any),
      "compareCreate2Methods",
      [salt, bytecodeHash]
    );

    console.log("✅ Phase 1 completed successfully!");
  }

  /**
   * Phase 2: Deploy and test TronClonesTest
   */
  async executePhase2(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 PHASE 2: PROXY DEPLOYMENT TEST");
    console.log("=".repeat(60));

    const TronClonesTest = await ethers.getContractFactory("TronClonesTest");
    const bytecode = TronClonesTest.bytecode;
    const abi = TronClonesTest.interface.format(
      ethers.utils.FormatTypes.json
    ) as any[];

    // Deploy TronClonesTest
    const deployment = await this.deployContract(
      "TronClonesTest",
      bytecode,
      JSON.parse(abi as any)
    );

    const salt = this.tronWeb.utils.padLeft(
      this.tronWeb.utils.toHex(Date.now() + 1),
      64
    );

    // Test deterministic clone deployment
    await this.executeTest(
      "TronClonesTest",
      deployment.address,
      JSON.parse(abi as any),
      "testCloneDeterministic",
      [salt]
    );

    // Test address prediction vs actual deployment
    const salt2 = this.tronWeb.utils.padLeft(
      this.tronWeb.utils.toHex(Date.now() + 2),
      64
    );
    await this.executeTest(
      "TronClonesTest",
      deployment.address,
      JSON.parse(abi as any),
      "testAddressPrediction",
      [salt2]
    );

    // Test clone with TRX value
    const salt3 = this.tronWeb.utils.padLeft(
      this.tronWeb.utils.toHex(Date.now() + 3),
      64
    );
    await this.executeTest(
      "TronClonesTest",
      deployment.address,
      JSON.parse(abi as any),
      "testCloneWithValue",
      [salt3],
      1000000 // 1 TRX in sun
    );

    console.log("✅ Phase 2 completed successfully!");
  }

  /**
   * Phase 3: Deploy and test AddressLibTest
   */
  async executePhase3(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 PHASE 3: ADDRESSLIB COMPATIBILITY TEST");
    console.log("=".repeat(60));

    const AddressLibTest = await ethers.getContractFactory("AddressLibTest");
    const bytecode = AddressLibTest.bytecode;
    const abi = AddressLibTest.interface.format(
      ethers.utils.FormatTypes.json
    ) as any[];

    // Deploy AddressLibTest
    const deployment = await this.deployContract(
      "AddressLibTest",
      bytecode,
      JSON.parse(abi as any)
    );

    // Test address conversion
    const testAddress = this.tronWeb.address.toHex(
      "TLsV52sRDL79HXGGm9yzwKiVegTp5CVZiS"
    );
    const addressAsUint = this.tronWeb.utils
      .toBigNumber(testAddress)
      .toString();

    await this.executeTest(
      "AddressLibTest",
      deployment.address,
      JSON.parse(abi as any),
      "testAddressGet",
      [addressAsUint]
    );

    // Test round-trip conversion
    await this.executeTest(
      "AddressLibTest",
      deployment.address,
      JSON.parse(abi as any),
      "testRoundTripConversion",
      [testAddress]
    );

    // Test zero address handling
    await this.executeTest(
      "AddressLibTest",
      deployment.address,
      JSON.parse(abi as any),
      "testZeroAddress"
    );

    console.log("✅ Phase 3 completed successfully!");
  }

  /**
   * Phase 4: Deploy TronEscrowFactoryPatched
   */
  async executePhase4(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 PHASE 4: ESCROW FACTORY DEPLOYMENT");
    console.log("=".repeat(60));

    const TronEscrowFactoryPatched = await ethers.getContractFactory(
      "TronEscrowFactoryPatched"
    );
    const bytecode = TronEscrowFactoryPatched.bytecode;
    const abi = TronEscrowFactoryPatched.interface.format(
      ethers.utils.FormatTypes.json
    ) as any[];

    // Deploy with constructor parameters
    const constructorParams = [
      "0x0000000000000000000000000000000000000000", // limitOrderProtocol (zero for Tron)
      "0x0000000000000000000000000000000000000000", // feeToken (zero for testing)
      "0x0000000000000000000000000000000000000000", // accessToken (zero for testing)
      this.tronWeb.defaultAddress.hex, // owner
      86400, // rescueDelaySrc (24 hours)
      43200, // rescueDelayDst (12 hours)
    ];

    const deployment = await this.deployContract(
      "TronEscrowFactoryPatched",
      bytecode,
      JSON.parse(abi as any),
      constructorParams
    );

    // Test basic factory functions
    await this.executeTest(
      "TronEscrowFactoryPatched",
      deployment.address,
      JSON.parse(abi as any),
      "getTronChainId"
    );

    await this.executeTest(
      "TronEscrowFactoryPatched",
      deployment.address,
      JSON.parse(abi as any),
      "isTronFactory"
    );

    await this.executeTest(
      "TronEscrowFactoryPatched",
      deployment.address,
      JSON.parse(abi as any),
      "getFactoryConfig"
    );

    console.log("✅ Phase 4 completed successfully!");
  }

  /**
   * Execute the complete 4-phase test plan
   */
  async executeCompleteTestPlan(): Promise<void> {
    console.log("\n" + "🌟".repeat(30));
    console.log("🚀 STARTING TRON ESCROW FACTORY DEPLOYMENT & TEST SUITE");
    console.log("🌟".repeat(30));

    try {
      await this.executePhase1();
      await this.executePhase2();
      await this.executePhase3();
      await this.executePhase4();

      console.log("\n" + "🎉".repeat(30));
      console.log("🎊 ALL PHASES COMPLETED SUCCESSFULLY! 🎊");
      console.log("🎉".repeat(30));

      this.generateReport();
    } catch (error) {
      console.error("\n❌ DEPLOYMENT SUITE FAILED:", error);
      this.generateReport();
      throw error;
    }
  }

  /**
   * Generate deployment and test report
   */
  generateReport(): void {
    console.log("\n" + "📋".repeat(30));
    console.log("📊 DEPLOYMENT & TEST REPORT");
    console.log("📋".repeat(30));

    console.log("\n🏗️  DEPLOYED CONTRACTS:");
    console.log("-".repeat(50));
    this.deploymentResults.forEach((result) => {
      console.log(`${result.contractName}:`);
      console.log(`  Address: ${result.address}`);
      console.log(`  TX Hash: ${result.txHash}`);
      console.log(`  Tronscan: ${result.tronscanUrl}`);
      console.log("");
    });

    console.log("\n🧪 TEST RESULTS:");
    console.log("-".repeat(50));
    this.testResults.forEach((result) => {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.contractName}.${result.testFunction}()`);
      if (result.txHash) {
        console.log(`    TX: ${result.txHash}`);
      }
      if (result.gasUsed) {
        console.log(`    Gas: ${result.gasUsed}`);
      }
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      console.log("");
    });

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.success).length;
    console.log(`\n📈 SUMMARY: ${passedTests}/${totalTests} tests passed`);
  }

  /**
   * Get deployment results for external use
   */
  getDeploymentResults(): DeploymentResult[] {
    return this.deploymentResults;
  }

  /**
   * Get test results for external use
   */
  getTestResults(): TestResult[] {
    return this.testResults;
  }
}

// Main execution function
async function main() {
  const deploymentSuite = new TronEscrowDeploymentSuite();
  await deploymentSuite.executeCompleteTestPlan();

  // Save results to file
  const results = {
    deployments: deploymentSuite.getDeploymentResults(),
    tests: deploymentSuite.getTestResults(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Saving results to deployment-results.json");
  require("fs").writeFileSync(
    "./deployment-results.json",
    JSON.stringify(results, null, 2)
  );
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎯 Deployment suite completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Deployment suite failed:", error);
      process.exit(1);
    });
}

export { TronEscrowDeploymentSuite, DeploymentResult, TestResult };
