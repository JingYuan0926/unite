import { ethers } from "hardhat";

/**
 * Deploy and validate Tron contracts in single script
 * This ensures contracts are deployed and validated on the same network state
 */

interface TronDeployment {
  factory: string;
  srcImplementation: string;
  dstImplementation: string;
}

async function main() {
  console.log("🌉 DEPLOY AND VALIDATE TRON CONTRACTS");
  console.log("====================================");

  try {
    // Deploy contracts
    const deployment = await deployTronContracts();

    // Validate functionality
    await validateTronContracts(deployment);

    console.log("\n🎉 DEPLOYMENT AND VALIDATION COMPLETED SUCCESSFULLY!");
    console.log("🏆 Phase 3 - TRON NILE EXTENSION DEVELOPMENT: COMPLETED");
    console.log("🚀 Ready for Phase 4: Fusion Extension Contract");
  } catch (error) {
    console.error("❌ Deploy and validate failed:", error);
    process.exit(1);
  }
}

/**
 * Deploy Tron contracts
 */
async function deployTronContracts(): Promise<TronDeployment> {
  console.log("\n🚀 Deploying Tron Contracts...");

  const [deployer] = await ethers.getSigners();

  const config = {
    rescueDelaySrc: 86400, // 24 hours
    rescueDelayDst: 86400, // 24 hours
    accessToken: ethers.ZeroAddress,
    feeToken: ethers.ZeroAddress,
    owner: deployer.address,
    limitOrderProtocol: ethers.ZeroAddress,
  };

  // Deploy TronEscrowFactory
  const TronEscrowFactory =
    await ethers.getContractFactory("TronEscrowFactory");
  const tronEscrowFactory = await TronEscrowFactory.deploy(
    config.limitOrderProtocol,
    config.feeToken,
    config.accessToken,
    config.owner,
    config.rescueDelaySrc,
    config.rescueDelayDst
  );

  await tronEscrowFactory.waitForDeployment();
  const factoryAddress = await tronEscrowFactory.getAddress();

  // Get implementation addresses
  const srcImplementation = await tronEscrowFactory.ESCROW_SRC_IMPLEMENTATION();
  const dstImplementation = await tronEscrowFactory.ESCROW_DST_IMPLEMENTATION();

  console.log(`✅ TronEscrowFactory: ${factoryAddress}`);
  console.log(`✅ Src Implementation: ${srcImplementation}`);
  console.log(`✅ Dst Implementation: ${dstImplementation}`);

  return {
    factory: factoryAddress,
    srcImplementation,
    dstImplementation,
  };
}

/**
 * Validate Tron contracts functionality
 */
async function validateTronContracts(deployment: TronDeployment) {
  console.log("\n🔍 Validating Tron Contracts...");

  // Test 1: Interface Compatibility
  await testInterfaceCompatibility(deployment);

  // Test 2: Deterministic Addressing
  await testDeterministicAddressing(deployment);

  // Test 3: Tron-Specific Functions
  await testTronSpecificFunctions(deployment);

  // Test 4: Cross-Chain Compatible Structure
  await testCrossChainStructure(deployment);

  console.log("✅ All validation tests passed");
}

/**
 * Test interface compatibility
 */
async function testInterfaceCompatibility(deployment: TronDeployment) {
  console.log("\n📋 Testing Interface Compatibility...");

  const factory = await ethers.getContractAt(
    "TronEscrowFactory",
    deployment.factory
  );
  const srcEscrow = await ethers.getContractAt(
    "TronEscrowSrc",
    deployment.srcImplementation
  );
  const dstEscrow = await ethers.getContractAt(
    "TronEscrowDst",
    deployment.dstImplementation
  );

  // Test factory functions
  const srcImpl = await factory.ESCROW_SRC_IMPLEMENTATION();
  const dstImpl = await factory.ESCROW_DST_IMPLEMENTATION();

  if (
    srcImpl !== deployment.srcImplementation ||
    dstImpl !== deployment.dstImplementation
  ) {
    throw new Error("Implementation addresses don't match");
  }

  // Test IBaseEscrow interface
  const rescueDelaySrc = await srcEscrow.RESCUE_DELAY();
  const rescueDelayDst = await dstEscrow.RESCUE_DELAY();
  const factorySrc = await srcEscrow.FACTORY();
  const factoryDst = await dstEscrow.FACTORY();

  console.log(`✅ Src Rescue Delay: ${rescueDelaySrc}`);
  console.log(`✅ Dst Rescue Delay: ${rescueDelayDst}`);
  console.log(`✅ Src Factory: ${factorySrc}`);
  console.log(`✅ Dst Factory: ${factoryDst}`);

  // Test IEscrow interface
  const srcBytecodeHash = await srcEscrow.PROXY_BYTECODE_HASH();
  const dstBytecodeHash = await dstEscrow.PROXY_BYTECODE_HASH();

  if (
    srcBytecodeHash === ethers.ZeroHash ||
    dstBytecodeHash === ethers.ZeroHash
  ) {
    throw new Error("PROXY_BYTECODE_HASH not working");
  }

  console.log("✅ Interface compatibility verified");
}

/**
 * Test deterministic addressing
 */
async function testDeterministicAddressing(deployment: TronDeployment) {
  console.log("\n🧮 Testing Deterministic Addressing...");

  const factory = await ethers.getContractAt(
    "TronEscrowFactory",
    deployment.factory
  );
  const [deployer] = await ethers.getSigners();

  const testImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("test-order")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
    maker: deployer.address,
    taker: deployer.address,
    token: ethers.ZeroAddress,
    amount: ethers.parseEther("1.0"),
    safetyDeposit: ethers.parseEther("0.1"),
    timelocks: 0,
  };

  // Test multiple calculations for determinism
  const srcAddr1 = await factory.addressOfEscrowSrc(testImmutables);
  const dstAddr1 = await factory.addressOfEscrowDst(testImmutables);
  const srcAddr2 = await factory.addressOfEscrowSrc(testImmutables);
  const dstAddr2 = await factory.addressOfEscrowDst(testImmutables);

  if (srcAddr1 !== srcAddr2 || dstAddr1 !== dstAddr2) {
    throw new Error("Deterministic addressing failed");
  }

  // Test different inputs produce different addresses
  const testImmutables2 = {
    ...testImmutables,
    amount: ethers.parseEther("2.0"),
  };
  const srcAddr3 = await factory.addressOfEscrowSrc(testImmutables2);
  const dstAddr3 = await factory.addressOfEscrowDst(testImmutables2);

  if (srcAddr1 === srcAddr3 || dstAddr1 === dstAddr3) {
    throw new Error("Different inputs produce same addresses");
  }

  console.log(`✅ Deterministic src address: ${srcAddr1}`);
  console.log(`✅ Deterministic dst address: ${dstAddr1}`);
  console.log("✅ Deterministic addressing working");
}

/**
 * Test Tron-specific functions
 */
async function testTronSpecificFunctions(deployment: TronDeployment) {
  console.log("\n🌉 Testing Tron-Specific Functions...");

  const srcEscrow = await ethers.getContractAt(
    "TronEscrowSrc",
    deployment.srcImplementation
  );
  const dstEscrow = await ethers.getContractAt(
    "TronEscrowDst",
    deployment.dstImplementation
  );
  const factory = await ethers.getContractAt(
    "TronEscrowFactory",
    deployment.factory
  );

  // Test Tron network detection
  const isTronSrc = await srcEscrow.isTronNetwork();
  const isTronDst = await dstEscrow.isTronNetwork();
  const isTronFactory = await factory.isTronFactory();

  if (!isTronSrc || !isTronDst || !isTronFactory) {
    throw new Error("Tron network detection failed");
  }

  // Test Tron address conversion
  const tronAddrSrc = await srcEscrow.getTronAddress();
  const tronAddrDst = await dstEscrow.getTronAddress();

  if (!tronAddrSrc.startsWith("T") || !tronAddrDst.startsWith("T")) {
    throw new Error("Tron address conversion failed");
  }

  // Test Tron chain ID
  const chainId = await factory.getTronChainId();
  if (chainId !== 3448148188n) {
    throw new Error("Incorrect Tron chain ID");
  }

  console.log(`✅ Tron chain ID: ${chainId}`);
  console.log(`✅ Src Tron address: ${tronAddrSrc}`);
  console.log(`✅ Dst Tron address: ${tronAddrDst}`);
  console.log("✅ Tron-specific functions working");
}

/**
 * Test cross-chain compatible structure
 */
async function testCrossChainStructure(deployment: TronDeployment) {
  console.log("\n🌉 Testing Cross-Chain Compatible Structure...");

  const factory = await ethers.getContractAt(
    "TronEscrowFactory",
    deployment.factory
  );
  const [deployer] = await ethers.getSigners();

  // Test that Tron contracts can handle standard cross-chain immutables
  const crossChainImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("cross-chain-test")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("shared-secret")),
    maker: deployer.address,
    taker: deployer.address,
    token: ethers.ZeroAddress, // Represents TRX
    amount: ethers.parseEther("5.0"),
    safetyDeposit: ethers.parseEther("0.5"),
    timelocks: 0, // Would be properly set in real usage
  };

  // These should work without errors, demonstrating cross-chain compatibility
  const srcAddress = await factory.addressOfEscrowSrc(crossChainImmutables);
  const dstAddress = await factory.addressOfEscrowDst(crossChainImmutables);

  // Verify addresses are valid
  if (srcAddress === ethers.ZeroAddress || dstAddress === ethers.ZeroAddress) {
    throw new Error("Invalid addresses computed");
  }

  // Test factory configuration for cross-chain setup
  const [owner, accessToken, feeToken] = await factory.getFactoryConfig();

  console.log(`✅ Cross-chain src address: ${srcAddress}`);
  console.log(`✅ Cross-chain dst address: ${dstAddress}`);
  console.log(`✅ Factory owner: ${owner}`);
  console.log("✅ Cross-chain structure compatibility verified");
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export default main;
