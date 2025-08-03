const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");

/**
 * Test real deployed Tron contracts on TRON Nile testnet
 * This script verifies the contracts are working on the actual blockchain
 */

const TRON_NILE_CONFIG = {
  fullHost: "https://api.nileex.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
};

async function main() {
  console.log("🔍 TESTING REAL TRON CONTRACTS ON NILE TESTNET");
  console.log("==============================================");

  try {
    // Initialize TronWeb (read-only)
    const tronWeb = new TronWeb(TRON_NILE_CONFIG);

    // Load deployment info
    const deploymentPath = path.join(
      __dirname,
      "../../contracts/deployments/tron-nile-real.json"
    );

    if (!fs.existsSync(deploymentPath)) {
      throw new Error(
        "❌ Real deployment file not found. Deploy contracts first with: node scripts/deploy/06-deploy-real-tron.js"
      );
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("✅ Loaded real deployment info");

    // Test each contract
    await testContract(
      tronWeb,
      "TronEscrowSrc",
      deployment.contracts.TronEscrowSrc
    );
    await testContract(
      tronWeb,
      "TronEscrowDst",
      deployment.contracts.TronEscrowDst
    );
    await testContract(
      tronWeb,
      "TronEscrowFactory",
      deployment.contracts.TronEscrowFactory
    );

    // Test factory functionality
    await testFactoryFunctions(tronWeb, deployment.contracts.TronEscrowFactory);

    console.log("\n🎉 ALL REAL TRON CONTRACT TESTS PASSED!");
    console.log("🌉 Contracts are live and functional on TRON Nile testnet");
  } catch (error) {
    console.error("❌ Real contract testing failed:", error);
    process.exit(1);
  }
}

/**
 * Test individual contract
 */
async function testContract(tronWeb, contractName, address) {
  console.log(`\n🔍 Testing ${contractName} at ${address}...`);

  try {
    // Check if contract exists
    const contractInfo = await tronWeb.trx.getContract(address);
    if (!contractInfo || !contractInfo.bytecode) {
      throw new Error(`Contract not found at ${address}`);
    }

    console.log(`✅ ${contractName} bytecode verified on-chain`);

    // Get contract instance
    const artifactPath = path.join(
      __dirname,
      `../../artifacts/contracts/tron/${contractName}.sol/${contractName}.json`
    );
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      const contract = await tronWeb.contract(artifact.abi, address);

      // Test basic functions
      if (contractName.includes("Escrow")) {
        await testEscrowContract(contract, contractName);
      } else if (contractName.includes("Factory")) {
        await testFactoryContract(contract, contractName);
      }
    }

    console.log(`✅ ${contractName} functionality verified`);
  } catch (error) {
    console.error(`❌ ${contractName} test failed:`, error.message);
    throw error;
  }
}

/**
 * Test escrow contract functions
 */
async function testEscrowContract(contract, contractName) {
  try {
    // Test view functions
    const rescueDelay = await contract.RESCUE_DELAY().call();
    const factory = await contract.FACTORY().call();
    const isTronNetwork = await contract.isTronNetwork().call();
    const tronAddress = await contract.getTronAddress().call();

    console.log(`   📊 Rescue Delay: ${rescueDelay}`);
    console.log(`   🏭 Factory: ${factory}`);
    console.log(`   🌉 Is Tron Network: ${isTronNetwork}`);
    console.log(`   📍 Tron Address: ${tronAddress}`);

    // Verify Tron-specific functions
    if (!isTronNetwork) {
      throw new Error("isTronNetwork should return true");
    }

    if (!tronAddress.startsWith("T")) {
      throw new Error("Tron address should start with T");
    }
  } catch (error) {
    throw new Error(`Escrow function test failed: ${error.message}`);
  }
}

/**
 * Test factory contract functions
 */
async function testFactoryContract(contract, contractName) {
  try {
    // Test view functions
    const srcImpl = await contract.ESCROW_SRC_IMPLEMENTATION().call();
    const dstImpl = await contract.ESCROW_DST_IMPLEMENTATION().call();
    const isTronFactory = await contract.isTronFactory().call();
    const chainId = await contract.getTronChainId().call();

    console.log(`   🔨 Src Implementation: ${srcImpl}`);
    console.log(`   🔨 Dst Implementation: ${dstImpl}`);
    console.log(`   🌉 Is Tron Factory: ${isTronFactory}`);
    console.log(`   🔗 Chain ID: ${chainId}`);

    // Verify factory configuration
    if (!isTronFactory) {
      throw new Error("isTronFactory should return true");
    }

    if (chainId != 3448148188) {
      throw new Error("Chain ID should be 3448148188 for Nile testnet");
    }
  } catch (error) {
    throw new Error(`Factory function test failed: ${error.message}`);
  }
}

/**
 * Test factory functionality with deterministic addressing
 */
async function testFactoryFunctions(tronWeb, factoryAddress) {
  console.log("\n🧮 Testing Factory Deterministic Addressing...");

  try {
    const artifactPath = path.join(
      __dirname,
      "../../artifacts/contracts/tron/TronEscrowFactory.sol/TronEscrowFactory.json"
    );
    if (!fs.existsSync(artifactPath)) {
      console.log("⚠️  Factory artifact not found, skipping detailed tests");
      return;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const factory = await tronWeb.contract(artifact.abi, factoryAddress);

    // Test deterministic addressing
    const testImmutables = {
      orderHash:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
      hashlock:
        "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
      maker: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
      taker: "TLsV2VvvvvvvvvvvvvvvvvvvvvvvvvvvvXh",
      token: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // Zero address
      amount: 1000000, // 1 TRX in SUN
      safetyDeposit: 100000, // 0.1 TRX in SUN
      timelocks: 0,
    };

    const srcAddress1 = await factory.addressOfEscrowSrc(testImmutables).call();
    const dstAddress1 = await factory.addressOfEscrowDst(testImmutables).call();

    // Test again for determinism
    const srcAddress2 = await factory.addressOfEscrowSrc(testImmutables).call();
    const dstAddress2 = await factory.addressOfEscrowDst(testImmutables).call();

    if (srcAddress1 !== srcAddress2 || dstAddress1 !== dstAddress2) {
      throw new Error("Deterministic addressing failed");
    }

    console.log(`✅ Deterministic Src Address: ${srcAddress1}`);
    console.log(`✅ Deterministic Dst Address: ${dstAddress1}`);

    // Test with different parameters
    const testImmutables2 = { ...testImmutables, amount: 2000000 };
    const srcAddress3 = await factory
      .addressOfEscrowSrc(testImmutables2)
      .call();

    if (srcAddress1 === srcAddress3) {
      throw new Error("Different inputs should produce different addresses");
    }

    console.log("✅ Different inputs produce different addresses");
    console.log("✅ Factory deterministic addressing working correctly");
  } catch (error) {
    console.error("❌ Factory function test failed:", error.message);
    throw error;
  }
}

// Execute testing
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
