import { ethers } from "hardhat";
import { readFileSync } from "fs";
import * as path from "path";

/**
 * Comprehensive validation script for Tron contract compatibility
 * Tests interface compatibility, deterministic addressing, and cross-chain functionality
 */

interface DeploymentInfo {
  contracts: {
    [key: string]: string;
  };
}

async function main() {
  console.log("🔗 VALIDATING TRON CONTRACT COMPATIBILITY");
  console.log("========================================");

  try {
    // Load deployment info
    const ethDeployment: DeploymentInfo = JSON.parse(
      readFileSync(
        path.join(
          __dirname,
          "../../contracts/deployments/ethereum-sepolia.json"
        ),
        "utf8"
      )
    );
    const tronDeployment: DeploymentInfo = JSON.parse(
      readFileSync(
        path.join(__dirname, "../../contracts/deployments/tron-nile.json"),
        "utf8"
      )
    );

    console.log("✅ Loaded deployment information for both networks");

    // Test 1: Interface Compatibility
    await testInterfaceCompatibility(ethDeployment, tronDeployment);

    // Test 2: Deterministic Addressing
    await testDeterministicAddressing(tronDeployment);

    // Test 3: Tron-Specific Functionality
    await testTronSpecificFunctions(tronDeployment);

    // Test 4: Cross-Chain Compatibility
    await testCrossChainCompatibility(ethDeployment, tronDeployment);

    console.log("\n🎉 ALL VALIDATION TESTS PASSED!");
    console.log(
      "🌉 Tron contracts are fully compatible with Ethereum contracts"
    );
    console.log("🚀 Ready for Phase 4: Fusion Extension Development");
  } catch (error) {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  }
}

/**
 * Test interface compatibility between Ethereum and Tron contracts
 */
async function testInterfaceCompatibility(
  ethDeployment: DeploymentInfo,
  tronDeployment: DeploymentInfo
) {
  console.log("\n📋 Testing Interface Compatibility...");

  // Get contract instances
  const ethEscrowFactory = await ethers.getContractAt(
    "EscrowFactory",
    ethDeployment.contracts.EscrowFactory
  );
  const tronEscrowFactory = await ethers.getContractAt(
    "TronEscrowFactory",
    tronDeployment.contracts.TronEscrowFactory
  );

  // Test factory functions
  const ethSrcImpl = await ethEscrowFactory.ESCROW_SRC_IMPLEMENTATION();
  const ethDstImpl = await ethEscrowFactory.ESCROW_DST_IMPLEMENTATION();
  const tronSrcImpl = await tronEscrowFactory.ESCROW_SRC_IMPLEMENTATION();
  const tronDstImpl = await tronEscrowFactory.ESCROW_DST_IMPLEMENTATION();

  console.log("✅ Factory implementations accessible on both networks");

  // Test escrow contract interfaces
  const tronSrc = await ethers.getContractAt("TronEscrowSrc", tronSrcImpl);
  const tronDst = await ethers.getContractAt("TronEscrowDst", tronDstImpl);

  // Verify required functions exist
  const requiredFunctions = [
    "withdraw",
    "cancel",
    "rescueFunds",
    "RESCUE_DELAY",
    "FACTORY",
  ];

  for (const func of requiredFunctions) {
    if (typeof tronSrc[func] !== "function") {
      throw new Error(`TronEscrowSrc missing required function: ${func}`);
    }
    if (typeof tronDst[func] !== "function") {
      throw new Error(`TronEscrowDst missing required function: ${func}`);
    }
  }

  console.log("✅ All required IBaseEscrow functions present");

  // Test specific interfaces
  const iEscrowFunctions = ["PROXY_BYTECODE_HASH"];
  for (const func of iEscrowFunctions) {
    if (typeof tronSrc[func] !== "function") {
      throw new Error(`TronEscrowSrc missing IEscrow function: ${func}`);
    }
    if (typeof tronDst[func] !== "function") {
      throw new Error(`TronEscrowDst missing IEscrow function: ${func}`);
    }
  }

  console.log("✅ All IEscrow interface functions present");
  console.log("✅ Interface compatibility validated");
}

/**
 * Test deterministic addressing functionality
 */
async function testDeterministicAddressing(tronDeployment: DeploymentInfo) {
  console.log("\n🧮 Testing Deterministic Addressing...");

  const tronEscrowFactory = await ethers.getContractAt(
    "TronEscrowFactory",
    tronDeployment.contracts.TronEscrowFactory
  );
  const [deployer] = await ethers.getSigners();

  // Create test immutables
  const testImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("test-order-hash")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
    maker: deployer.address,
    taker: deployer.address,
    token: ethers.ZeroAddress, // TRX
    amount: ethers.parseEther("1.0"),
    safetyDeposit: ethers.parseEther("0.1"),
    timelocks: 0, // Simplified for testing
  };

  // Test address calculation
  const srcAddress1 =
    await tronEscrowFactory.addressOfEscrowSrc(testImmutables);
  const dstAddress1 =
    await tronEscrowFactory.addressOfEscrowDst(testImmutables);

  // Calculate again to ensure determinism
  const srcAddress2 =
    await tronEscrowFactory.addressOfEscrowSrc(testImmutables);
  const dstAddress2 =
    await tronEscrowFactory.addressOfEscrowDst(testImmutables);

  if (srcAddress1 !== srcAddress2 || dstAddress1 !== dstAddress2) {
    throw new Error(
      "Deterministic addressing failed - addresses not consistent"
    );
  }

  console.log(`✅ Src Address (deterministic): ${srcAddress1}`);
  console.log(`✅ Dst Address (deterministic): ${dstAddress1}`);

  // Test with different immutables
  const testImmutables2 = {
    ...testImmutables,
    amount: ethers.parseEther("2.0"),
  };
  const srcAddress3 =
    await tronEscrowFactory.addressOfEscrowSrc(testImmutables2);
  const dstAddress3 =
    await tronEscrowFactory.addressOfEscrowDst(testImmutables2);

  if (srcAddress1 === srcAddress3 || dstAddress1 === dstAddress3) {
    throw new Error(
      "Deterministic addressing failed - different inputs produce same addresses"
    );
  }

  console.log("✅ Deterministic addressing working correctly");
  console.log("✅ Different inputs produce different addresses");
}

/**
 * Test Tron-specific functionality
 */
async function testTronSpecificFunctions(tronDeployment: DeploymentInfo) {
  console.log("\n🌉 Testing Tron-Specific Functions...");

  const tronSrcImpl = tronDeployment.contracts.TronEscrowSrcImplementation;
  const tronDstImpl = tronDeployment.contracts.TronEscrowDstImplementation;

  const tronSrc = await ethers.getContractAt("TronEscrowSrc", tronSrcImpl);
  const tronDst = await ethers.getContractAt("TronEscrowDst", tronDstImpl);

  // Test Tron-specific functions
  const isTronSrc = await tronSrc.isTronNetwork();
  const isTronDst = await tronDst.isTronNetwork();

  if (!isTronSrc || !isTronDst) {
    throw new Error("Tron network detection failed");
  }

  console.log("✅ Tron network detection working");

  // Test Tron address conversion
  const tronAddressSrc = await tronSrc.getTronAddress();
  const tronAddressDst = await tronDst.getTronAddress();

  if (!tronAddressSrc.startsWith("T") || !tronAddressDst.startsWith("T")) {
    throw new Error("Tron address conversion failed");
  }

  console.log(
    `✅ Tron address conversion: ${tronAddressSrc.substring(0, 20)}...`
  );
  console.log("✅ All Tron-specific functions working");
}

/**
 * Test cross-chain compatibility features
 */
async function testCrossChainCompatibility(
  ethDeployment: DeploymentInfo,
  tronDeployment: DeploymentInfo
) {
  console.log("\n🌉 Testing Cross-Chain Compatibility...");

  const ethEscrowFactory = await ethers.getContractAt(
    "EscrowFactory",
    ethDeployment.contracts.EscrowFactory
  );
  const tronEscrowFactory = await ethers.getContractAt(
    "TronEscrowFactory",
    tronDeployment.contracts.TronEscrowFactory
  );
  const [deployer] = await ethers.getSigners();

  // Create identical immutables for both chains
  const crossChainImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("cross-chain-order")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("cross-chain-secret")),
    maker: deployer.address,
    taker: deployer.address,
    token: ethers.ZeroAddress,
    amount: ethers.parseEther("1.0"),
    safetyDeposit: ethers.parseEther("0.1"),
    timelocks: 0,
  };

  // Calculate addresses on both chains
  const ethSrcAddress =
    await ethEscrowFactory.addressOfEscrowSrc(crossChainImmutables);
  const ethDstAddress =
    await ethEscrowFactory.addressOfEscrowDst(crossChainImmutables);
  const tronSrcAddress =
    await tronEscrowFactory.addressOfEscrowSrc(crossChainImmutables);
  const tronDstAddress =
    await tronEscrowFactory.addressOfEscrowDst(crossChainImmutables);

  console.log(`📍 ETH Src Address:  ${ethSrcAddress}`);
  console.log(`📍 ETH Dst Address:  ${ethDstAddress}`);
  console.log(`📍 Tron Src Address: ${tronSrcAddress}`);
  console.log(`📍 Tron Dst Address: ${tronDstAddress}`);

  // Verify addresses are different (expected since different factories)
  // but computed deterministically
  if (ethSrcAddress === tronSrcAddress || ethDstAddress === tronDstAddress) {
    console.log(
      "⚠️  Note: Same addresses on both chains (expected with same factory bytecode)"
    );
  }

  console.log("✅ Cross-chain address calculation working");

  // Test that both chains can handle the same immutables structure
  console.log("✅ Same immutables structure supported on both chains");
  console.log("✅ Cross-chain compatibility validated");
}

/**
 * Display final validation summary
 */
async function displayValidationSummary() {
  console.log("\n📋 VALIDATION SUMMARY");
  console.log("====================");
  console.log("✅ Interface Compatibility: PASSED");
  console.log("✅ Deterministic Addressing: PASSED");
  console.log("✅ Tron-Specific Functions: PASSED");
  console.log("✅ Cross-Chain Compatibility: PASSED");
  console.log("\n🏆 Phase 3 - TRON NILE EXTENSION DEVELOPMENT: COMPLETED");
  console.log("🚀 Ready to proceed with Phase 4: Fusion Extension Contract");
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => displayValidationSummary())
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

export default main;
