const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Complete TRON deployment - Deploy all missing contracts
 * Current status: TronEscrowSrc deployed, need TronEscrowDst and TronEscrowFactory
 */

async function main() {
  console.log("🚀 COMPLETING TRON DEPLOYMENT");
  console.log("==============================");

  const tronWeb = new TronWeb({
    fullHost: "https://nile.trongrid.io",
    privateKey: process.env.TRON_PRIVATE_KEY,
  });

  console.log("📝 Deploying with account:", tronWeb.defaultAddress.base58);

  // Current deployment status
  const currentDeployment = {
    TronEscrowSrc: "TYMiH5nxemXdmRTLKVbZyBBdHuYrvB1yrj", // Already deployed
    TronEscrowDst: null, // Need to deploy
    TronEscrowFactory: null, // Need to deploy
  };

  console.log("\n📊 CURRENT STATUS:");
  console.log(`✅ TronEscrowSrc: ${currentDeployment.TronEscrowSrc}`);
  console.log(`❌ TronEscrowDst: Not deployed`);
  console.log(`❌ TronEscrowFactory: Not deployed`);

  try {
    // Step 1: Deploy TronEscrowDst
    console.log("\n🚀 Step 1: Deploying TronEscrowDst...");
    const dstContract = await deployContract(tronWeb, "TronEscrowDst", [
      86400, // rescueDelay (24 hours)
      "0x0000000000000000000000000000000000000000", // accessToken
    ]);

    currentDeployment.TronEscrowDst = tronWeb.address.fromHex(
      dstContract.address
    );
    console.log(
      `✅ TronEscrowDst deployed: ${currentDeployment.TronEscrowDst}`
    );

    // Step 2: Deploy TronEscrowFactory
    console.log("\n🚀 Step 2: Deploying TronEscrowFactory...");
    const factoryContract = await deployContract(tronWeb, "TronEscrowFactory", [
      "0x0000000000000000000000000000000000000000", // limitOrderProtocol
      "0x0000000000000000000000000000000000000000", // feeToken
      "0x0000000000000000000000000000000000000000", // accessToken
      tronWeb.defaultAddress.hex, // owner
      86400, // rescueDelaySrc
      86400, // rescueDelayDst
    ]);

    currentDeployment.TronEscrowFactory = tronWeb.address.fromHex(
      factoryContract.address
    );
    console.log(
      `✅ TronEscrowFactory deployed: ${currentDeployment.TronEscrowFactory}`
    );

    // Step 3: Verify all contracts
    console.log("\n🔍 Step 3: Verifying all contracts...");
    await verifyAllContracts(tronWeb, currentDeployment);

    // Step 4: Test factory functionality
    console.log("\n🧪 Step 4: Testing factory functionality...");
    await testFactoryFunctionality(
      tronWeb,
      currentDeployment.TronEscrowFactory
    );

    // Step 5: Save complete deployment info
    console.log("\n💾 Step 5: Saving deployment information...");
    await saveDeploymentInfo(currentDeployment);

    console.log("\n🎉 PHASE 3 DEPLOYMENT COMPLETED!");
    console.log("=================================");
    console.log("✅ All 3 Tron contracts successfully deployed:");
    console.log(`   TronEscrowSrc: ${currentDeployment.TronEscrowSrc}`);
    console.log(`   TronEscrowDst: ${currentDeployment.TronEscrowDst}`);
    console.log(`   TronEscrowFactory: ${currentDeployment.TronEscrowFactory}`);

    console.log("\n🔗 EXPLORER LINKS:");
    console.log(
      `Src: https://nile.tronscan.org/#/contract/${currentDeployment.TronEscrowSrc}`
    );
    console.log(
      `Dst: https://nile.tronscan.org/#/contract/${currentDeployment.TronEscrowDst}`
    );
    console.log(
      `Factory: https://nile.tronscan.org/#/contract/${currentDeployment.TronEscrowFactory}`
    );

    console.log("\n🏆 Phase 3 - TRON NILE EXTENSION DEVELOPMENT: COMPLETED!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

/**
 * Deploy a single contract
 */
async function deployContract(tronWeb, contractName, parameters = []) {
  try {
    console.log(`📦 Deploying ${contractName}...`);

    const artifact = getContractArtifact(contractName);

    const contract = await tronWeb.contract().new({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      parameters: parameters,
      feeLimit: 100000000, // 100 TRX
      callValue: 0,
    });

    console.log(`✅ ${contractName} deployed to: ${contract.address}`);

    // Wait for network confirmation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return contract;
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error);
    throw error;
  }
}

/**
 * Get contract artifact from compilation
 */
function getContractArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    `../../artifacts/contracts/tron/${contractName}.sol/${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Contract artifact not found: ${artifactPath}. Run 'npm run compile' first.`
    );
  }

  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

/**
 * Verify all contracts are deployed and accessible
 */
async function verifyAllContracts(tronWeb, deployment) {
  for (const [contractType, address] of Object.entries(deployment)) {
    if (!address) continue;

    try {
      const contractInfo = await tronWeb.trx.getContract(address);
      if (contractInfo && contractInfo.bytecode) {
        console.log(`✅ ${contractType} verified at ${address}`);
      } else {
        throw new Error(`Contract not found at ${address}`);
      }
    } catch (error) {
      console.error(`❌ ${contractType} verification failed:`, error.message);
      throw error;
    }
  }
}

/**
 * Test basic factory functionality
 */
async function testFactoryFunctionality(tronWeb, factoryAddress) {
  try {
    const artifact = getContractArtifact("TronEscrowFactory");
    const factory = await tronWeb.contract(artifact.abi, factoryAddress);

    // Test basic factory functions
    const isTronFactory = await factory.isTronFactory().call();
    const chainId = await factory.getTronChainId().call();

    console.log(`✅ Is Tron Factory: ${isTronFactory}`);
    console.log(`✅ Chain ID: ${chainId}`);

    if (!isTronFactory) {
      throw new Error("Factory not properly configured as Tron factory");
    }

    if (chainId != 3448148188) {
      throw new Error("Incorrect chain ID for Nile testnet");
    }

    console.log("✅ Factory functionality verified");
  } catch (error) {
    console.error("❌ Factory testing failed:", error.message);
    throw error;
  }
}

/**
 * Save complete deployment information
 */
async function saveDeploymentInfo(deployment) {
  const deploymentInfo = {
    network: "tron-nile-real",
    timestamp: new Date().toISOString(),
    chainId: 3448148188,
    phase: "Phase 3 - TRON NILE EXTENSION DEVELOPMENT",
    status: "COMPLETED",
    contracts: {
      TronEscrowSrc: deployment.TronEscrowSrc,
      TronEscrowDst: deployment.TronEscrowDst,
      TronEscrowFactory: deployment.TronEscrowFactory,
    },
    deployer: "TPUiCeNRjjEpo1NFJ1ZURfU1ziNNMtn8yu",
    verified: true,
    explorerLinks: {
      TronEscrowSrc: `https://nile.tronscan.org/#/contract/${deployment.TronEscrowSrc}`,
      TronEscrowDst: `https://nile.tronscan.org/#/contract/${deployment.TronEscrowDst}`,
      TronEscrowFactory: `https://nile.tronscan.org/#/contract/${deployment.TronEscrowFactory}`,
    },
  };

  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, "../../contracts/deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, "tron-nile-complete.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`✅ Complete deployment info saved to: ${deploymentPath}`);

  // Update .env file
  updateEnvFile(deployment);
}

/**
 * Update .env file with all contract addresses
 */
function updateEnvFile(deployment) {
  try {
    const envPath = path.join(__dirname, "../../.env");
    let envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, "utf8")
      : "";

    // Remove old Tron addresses
    envContent = envContent.replace(/^TRON_ESCROW_.*=.*$/gm, "");

    // Add complete Tron contract addresses
    const tronAddresses = `
# Tron Contract Addresses - Phase 3 Complete (Auto-generated)
TRON_ESCROW_SRC_ADDRESS=${deployment.TronEscrowSrc}
TRON_ESCROW_DST_ADDRESS=${deployment.TronEscrowDst}
TRON_ESCROW_FACTORY_ADDRESS=${deployment.TronEscrowFactory}
`;

    envContent = envContent.trim() + tronAddresses;
    fs.writeFileSync(envPath, envContent);

    console.log("✅ .env file updated with all contract addresses");
  } catch (error) {
    console.warn("⚠️ Failed to update .env file:", error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
