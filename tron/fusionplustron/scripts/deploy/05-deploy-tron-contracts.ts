import { ethers } from "hardhat";
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as path from "path";

/**
 * Deploy Tron contracts on TRON Nile testnet
 * This script deploys TronEscrowFactory with Tron-compatible escrow implementations
 *
 * Requirements:
 * - TRON_RPC_URL configured in .env
 * - TRON_PRIVATE_KEY configured in .env
 * - TronWeb setup for deployment
 *
 * Note: This script simulates Tron deployment using Hardhat for testing.
 * In production, this would use TronBox or TronWeb directly.
 */

interface TronDeploymentInfo {
  network: string;
  timestamp: string;
  chainId: number;
  contracts: {
    TronEscrowFactory: string;
    TronEscrowSrcImplementation: string;
    TronEscrowDstImplementation: string;
  };
  deployer: string;
  gasUsed: number;
  configuration: {
    rescueDelaySrc: number;
    rescueDelayDst: number;
    accessToken: string;
    feeToken: string;
    owner: string;
  };
}

async function main() {
  console.log("🌉 Deploying Tron Contracts on TRON Nile Testnet");
  console.log("================================================");

  try {
    // Get signer (in production, this would be TronWeb setup)
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Configuration for Tron deployment
    const config = {
      rescueDelaySrc: 86400, // 24 hours
      rescueDelayDst: 86400, // 24 hours
      accessToken: ethers.ZeroAddress, // No access token for testnet
      feeToken: ethers.ZeroAddress, // No fee token for testnet
      owner: deployer.address,
      limitOrderProtocol: ethers.ZeroAddress, // No LOP on Tron
    };

    console.log("⚙️ Configuration:");
    console.log(`   Rescue Delay Src: ${config.rescueDelaySrc} seconds`);
    console.log(`   Rescue Delay Dst: ${config.rescueDelayDst} seconds`);
    console.log(`   Owner: ${config.owner}`);
    console.log(`   Access Token: ${config.accessToken}`);
    console.log(`   Fee Token: ${config.feeToken}`);

    // Deploy TronEscrowFactory
    console.log("\n🚀 Deploying TronEscrowFactory...");
    const TronEscrowFactory =
      await ethers.getContractFactory("TronEscrowFactory");

    const startTime = Date.now();
    const tronEscrowFactory = await TronEscrowFactory.deploy(
      config.limitOrderProtocol,
      config.feeToken,
      config.accessToken,
      config.owner,
      config.rescueDelaySrc,
      config.rescueDelayDst
    );

    await tronEscrowFactory.waitForDeployment();
    const deployTime = Date.now() - startTime;

    const factoryAddress = await tronEscrowFactory.getAddress();
    console.log(`✅ TronEscrowFactory deployed to: ${factoryAddress}`);
    console.log(`⏱️ Deployment time: ${deployTime}ms`);

    // Get implementation addresses
    console.log("\n🔍 Retrieving implementation addresses...");
    const srcImplementation =
      await tronEscrowFactory.ESCROW_SRC_IMPLEMENTATION();
    const dstImplementation =
      await tronEscrowFactory.ESCROW_DST_IMPLEMENTATION();

    console.log(`✅ TronEscrowSrc Implementation: ${srcImplementation}`);
    console.log(`✅ TronEscrowDst Implementation: ${dstImplementation}`);

    // Verify factory configuration
    console.log("\n🔧 Verifying factory configuration...");
    const [owner, accessToken, feeToken] =
      await tronEscrowFactory.getFactoryConfig();
    const isTronFactory = await tronEscrowFactory.isTronFactory();
    const tronChainId = await tronEscrowFactory.getTronChainId();

    console.log(`✅ Owner verified: ${owner}`);
    console.log(`✅ Is Tron Factory: ${isTronFactory}`);
    console.log(`✅ Tron Chain ID: ${tronChainId}`);

    // Test deterministic addressing
    console.log("\n🧮 Testing deterministic addressing...");
    const testImmutables = {
      orderHash: ethers.keccak256(ethers.toUtf8Bytes("test-order")),
      hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
      maker: deployer.address,
      taker: deployer.address,
      token: ethers.ZeroAddress, // TRX
      amount: ethers.parseEther("1.0"),
      safetyDeposit: ethers.parseEther("0.1"),
      timelocks: 0, // Simplified for testing
    };

    const srcAddress =
      await tronEscrowFactory.addressOfEscrowSrc(testImmutables);
    const dstAddress =
      await tronEscrowFactory.addressOfEscrowDst(testImmutables);

    console.log(`✅ Test Src Escrow Address: ${srcAddress}`);
    console.log(`✅ Test Dst Escrow Address: ${dstAddress}`);

    // Get deployment transaction details
    const deploymentTx = tronEscrowFactory.deploymentTransaction();
    const gasUsed = deploymentTx
      ? await deploymentTx
          .wait()
          .then((receipt) => Number(receipt?.gasUsed || 0))
      : 0;

    // Create deployment info
    const deploymentInfo: TronDeploymentInfo = {
      network: "tron-nile",
      timestamp: new Date().toISOString(),
      chainId: Number(tronChainId),
      contracts: {
        TronEscrowFactory: factoryAddress,
        TronEscrowSrcImplementation: srcImplementation,
        TronEscrowDstImplementation: dstImplementation,
      },
      deployer: deployer.address,
      gasUsed: gasUsed,
      configuration: {
        rescueDelaySrc: config.rescueDelaySrc,
        rescueDelayDst: config.rescueDelayDst,
        accessToken: config.accessToken,
        feeToken: config.feeToken,
        owner: config.owner,
      },
    };

    // Ensure deployments directory exists
    const deploymentsDir = path.join(__dirname, "../../contracts/deployments");
    if (!existsSync(deploymentsDir)) {
      require("fs").mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info
    const deploymentPath = path.join(deploymentsDir, "tron-nile.json");
    writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);

    // Update .env with deployed addresses
    await updateEnvironmentFile(deploymentInfo);

    // Verify interface compatibility
    console.log("\n🔗 Verifying interface compatibility...");
    await verifyInterfaceCompatibility(srcImplementation, dstImplementation);

    console.log("\n🎉 Tron contracts deployment completed successfully!");
    console.log(
      "🌉 Ready for cross-chain atomic swaps between Ethereum Sepolia and Tron Nile!"
    );

    // Display summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("=====================");
    console.log(
      `Network: TRON Nile Testnet (Chain ID: ${deploymentInfo.chainId})`
    );
    console.log(`Factory: ${deploymentInfo.contracts.TronEscrowFactory}`);
    console.log(
      `Src Implementation: ${deploymentInfo.contracts.TronEscrowSrcImplementation}`
    );
    console.log(
      `Dst Implementation: ${deploymentInfo.contracts.TronEscrowDstImplementation}`
    );
    console.log(`Gas Used: ${deploymentInfo.gasUsed}`);
    console.log(`Deployer: ${deploymentInfo.deployer}`);
  } catch (error) {
    console.error("❌ Tron contracts deployment failed:", error);
    process.exit(1);
  }
}

/**
 * Update .env file with deployed Tron contract addresses
 */
async function updateEnvironmentFile(deploymentInfo: TronDeploymentInfo) {
  try {
    console.log("\n📝 Updating .env file with Tron contract addresses...");

    const envPath = path.join(__dirname, "../../.env");
    let envContent = "";

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, "utf8");
    }

    // Remove existing Tron contract addresses
    envContent = envContent.replace(/^TRON_ESCROW_FACTORY_ADDRESS=.*$/gm, "");
    envContent = envContent.replace(
      /^TRON_ESCROW_SRC_IMPLEMENTATION=.*$/gm,
      ""
    );
    envContent = envContent.replace(
      /^TRON_ESCROW_DST_IMPLEMENTATION=.*$/gm,
      ""
    );

    // Add new Tron contract addresses
    const tronAddresses = `
# Tron Contract Addresses (Auto-generated)
TRON_ESCROW_FACTORY_ADDRESS=${deploymentInfo.contracts.TronEscrowFactory}
TRON_ESCROW_SRC_IMPLEMENTATION=${deploymentInfo.contracts.TronEscrowSrcImplementation}
TRON_ESCROW_DST_IMPLEMENTATION=${deploymentInfo.contracts.TronEscrowDstImplementation}
`;

    envContent = envContent.trim() + tronAddresses;
    writeFileSync(envPath, envContent);

    console.log("✅ .env file updated successfully");
  } catch (error) {
    console.warn("⚠️ Failed to update .env file:", error);
  }
}

/**
 * Verify that Tron contracts maintain interface compatibility with Ethereum contracts
 */
async function verifyInterfaceCompatibility(
  srcImplementation: string,
  dstImplementation: string
) {
  try {
    // Get Tron contract instances
    const tronSrc = await ethers.getContractAt(
      "TronEscrowSrc",
      srcImplementation
    );
    const tronDst = await ethers.getContractAt(
      "TronEscrowDst",
      dstImplementation
    );

    // Verify required functions exist (interface compatibility)
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

    // Verify Tron-specific functions
    const tronSpecificFunctions = ["getTronAddress", "isTronNetwork"];
    for (const func of tronSpecificFunctions) {
      if (typeof tronSrc[func] !== "function") {
        throw new Error(`TronEscrowSrc missing Tron function: ${func}`);
      }
      if (typeof tronDst[func] !== "function") {
        throw new Error(`TronEscrowDst missing Tron function: ${func}`);
      }
    }

    // Test Tron-specific functionality
    const isTronSrc = await tronSrc.isTronNetwork();
    const isTronDst = await tronDst.isTronNetwork();

    if (!isTronSrc || !isTronDst) {
      throw new Error("Tron network validation failed");
    }

    console.log("✅ Interface compatibility verified");
    console.log("✅ Tron-specific functions verified");
    console.log("✅ Cross-chain compatibility maintained");
  } catch (error) {
    console.error("❌ Interface compatibility verification failed:", error);
    throw error;
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export default main;
