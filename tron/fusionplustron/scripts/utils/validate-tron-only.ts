import { ethers } from "hardhat";
import { readFileSync } from "fs";
import * as path from "path";

/**
 * Validate Tron contracts independently
 * Tests interface compatibility, deterministic addressing, and Tron-specific functionality
 */

interface TronDeploymentInfo {
  contracts: {
    TronEscrowFactory: string;
    TronEscrowSrcImplementation: string;
    TronEscrowDstImplementation: string;
  };
}

async function main() {
  console.log("🌉 VALIDATING TRON CONTRACT FUNCTIONALITY");
  console.log("========================================");

  try {
    // Load Tron deployment info
    const tronDeployment: TronDeploymentInfo = JSON.parse(
      readFileSync(
        path.join(__dirname, "../../contracts/deployments/tron-nile.json"),
        "utf8"
      )
    );

    console.log("✅ Loaded Tron deployment information");

    // Test 1: Interface Compatibility
    await testTronInterfaceCompatibility(tronDeployment);

    // Test 2: Deterministic Addressing
    await testDeterministicAddressing(tronDeployment);

    // Test 3: Tron-Specific Functionality
    await testTronSpecificFunctions(tronDeployment);

    // Test 4: Factory Configuration
    await testFactoryConfiguration(tronDeployment);

    console.log("\n🎉 ALL TRON VALIDATION TESTS PASSED!");
    console.log("🌉 Tron contracts are fully functional and compatible");
    console.log("🏆 Phase 3 - TRON NILE EXTENSION DEVELOPMENT: COMPLETED");
  } catch (error) {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  }
}

/**
 * Test Tron contract interface compatibility
 */
async function testTronInterfaceCompatibility(
  tronDeployment: TronDeploymentInfo
) {
  console.log("\n📋 Testing Tron Interface Compatibility...");

  // Get contract instances
  const tronEscrowFactory = await ethers.getContractAt(
    "TronEscrowFactory",
    tronDeployment.contracts.TronEscrowFactory
  );
  const tronSrc = await ethers.getContractAt(
    "TronEscrowSrc",
    tronDeployment.contracts.TronEscrowSrcImplementation
  );
  const tronDst = await ethers.getContractAt(
    "TronEscrowDst",
    tronDeployment.contracts.TronEscrowDstImplementation
  );

  // Test factory functions
  const srcImpl = await tronEscrowFactory.ESCROW_SRC_IMPLEMENTATION();
  const dstImpl = await tronEscrowFactory.ESCROW_DST_IMPLEMENTATION();

  console.log(`✅ Factory Src Implementation: ${srcImpl}`);
  console.log(`✅ Factory Dst Implementation: ${dstImpl}`);

  // Verify implementations match deployment
  if (srcImpl !== tronDeployment.contracts.TronEscrowSrcImplementation) {
    throw new Error("Src implementation address mismatch");
  }
  if (dstImpl !== tronDeployment.contracts.TronEscrowDstImplementation) {
    throw new Error("Dst implementation address mismatch");
  }

  console.log("✅ Implementation addresses verified");

  // Test IBaseEscrow interface functions
  const baseEscrowFunctions = ["RESCUE_DELAY", "FACTORY"];

  for (const func of baseEscrowFunctions) {
    if (typeof tronSrc[func] !== "function") {
      throw new Error(`TronEscrowSrc missing IBaseEscrow function: ${func}`);
    }
    if (typeof tronDst[func] !== "function") {
      throw new Error(`TronEscrowDst missing IBaseEscrow function: ${func}`);
    }
  }

  console.log("✅ IBaseEscrow interface functions verified");

  // Test IEscrow interface functions
  const escrowFunctions = ["PROXY_BYTECODE_HASH"];
  for (const func of escrowFunctions) {
    if (typeof tronSrc[func] !== "function") {
      throw new Error(`TronEscrowSrc missing IEscrow function: ${func}`);
    }
    if (typeof tronDst[func] !== "function") {
      throw new Error(`TronEscrowDst missing IEscrow function: ${func}`);
    }
  }

  console.log("✅ IEscrow interface functions verified");

  // Test main escrow functions (we can't call them without proper setup, but we can verify they exist)
  const mainFunctions = ["withdraw", "cancel", "rescueFunds"];
  for (const func of mainFunctions) {
    if (typeof tronSrc[func] !== "function") {
      throw new Error(`TronEscrowSrc missing main function: ${func}`);
    }
    if (typeof tronDst[func] !== "function") {
      throw new Error(`TronEscrowDst missing main function: ${func}`);
    }
  }

  console.log("✅ Main escrow functions verified");
  console.log("✅ Interface compatibility validated");
}

/**
 * Test deterministic addressing functionality
 */
async function testDeterministicAddressing(tronDeployment: TronDeploymentInfo) {
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

  // Test address calculation multiple times
  const srcAddress1 =
    await tronEscrowFactory.addressOfEscrowSrc(testImmutables);
  const dstAddress1 =
    await tronEscrowFactory.addressOfEscrowDst(testImmutables);

  const srcAddress2 =
    await tronEscrowFactory.addressOfEscrowSrc(testImmutables);
  const dstAddress2 =
    await tronEscrowFactory.addressOfEscrowDst(testImmutables);

  // Verify determinism
  if (srcAddress1 !== srcAddress2 || dstAddress1 !== dstAddress2) {
    throw new Error(
      "Deterministic addressing failed - addresses not consistent"
    );
  }

  console.log(`✅ Src Address (deterministic): ${srcAddress1}`);
  console.log(`✅ Dst Address (deterministic): ${dstAddress1}`);

  // Test with different immutables should produce different addresses
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

  console.log("✅ Different inputs produce different addresses");
  console.log("✅ Deterministic addressing working correctly");
}

/**
 * Test Tron-specific functionality
 */
async function testTronSpecificFunctions(tronDeployment: TronDeploymentInfo) {
  console.log("\n🌉 Testing Tron-Specific Functions...");

  const tronSrc = await ethers.getContractAt(
    "TronEscrowSrc",
    tronDeployment.contracts.TronEscrowSrcImplementation
  );
  const tronDst = await ethers.getContractAt(
    "TronEscrowDst",
    tronDeployment.contracts.TronEscrowDstImplementation
  );

  // Test Tron network detection
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

  console.log(`✅ Src Tron Address: ${tronAddressSrc}`);
  console.log(`✅ Dst Tron Address: ${tronAddressDst}`);

  // Test PROXY_BYTECODE_HASH functions
  const srcBytecodeHash = await tronSrc.PROXY_BYTECODE_HASH();
  const dstBytecodeHash = await tronDst.PROXY_BYTECODE_HASH();

  if (
    srcBytecodeHash === ethers.ZeroHash ||
    dstBytecodeHash === ethers.ZeroHash
  ) {
    throw new Error("PROXY_BYTECODE_HASH not working correctly");
  }

  console.log(`✅ Src Bytecode Hash: ${srcBytecodeHash}`);
  console.log(`✅ Dst Bytecode Hash: ${dstBytecodeHash}`);
  console.log("✅ All Tron-specific functions working");
}

/**
 * Test factory configuration
 */
async function testFactoryConfiguration(tronDeployment: TronDeploymentInfo) {
  console.log("\n🔧 Testing Factory Configuration...");

  const tronEscrowFactory = await ethers.getContractAt(
    "TronEscrowFactory",
    tronDeployment.contracts.TronEscrowFactory
  );

  // Test factory configuration
  const [owner, accessToken, feeToken] =
    await tronEscrowFactory.getFactoryConfig();
  const isTronFactory = await tronEscrowFactory.isTronFactory();
  const tronChainId = await tronEscrowFactory.getTronChainId();

  console.log(`✅ Factory Owner: ${owner}`);
  console.log(`✅ Access Token: ${accessToken}`);
  console.log(`✅ Fee Token: ${feeToken}`);
  console.log(`✅ Is Tron Factory: ${isTronFactory}`);
  console.log(`✅ Tron Chain ID: ${tronChainId}`);

  if (!isTronFactory) {
    throw new Error("Factory not properly configured as Tron factory");
  }

  if (tronChainId !== 3448148188n) {
    // Nile Testnet ID
    throw new Error("Incorrect Tron chain ID");
  }

  console.log("✅ Factory configuration validated");
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export default main;
