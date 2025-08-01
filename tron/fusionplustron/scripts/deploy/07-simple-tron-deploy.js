const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Simplified TRON deployment script
 * Deploy contracts to real TRON Nile testnet
 */

async function main() {
  console.log("🌉 SIMPLE TRON DEPLOYMENT TO NILE TESTNET");
  console.log("==========================================");

  // Initialize TronWeb
  const tronWeb = new TronWeb({
    fullHost: "https://nile.trongrid.io",
    privateKey: process.env.TRON_PRIVATE_KEY,
  });

  console.log("📝 Deploying with account:", tronWeb.defaultAddress.base58);

  try {
    // Get contract artifacts
    const factoryArtifact = getContractArtifact("TronEscrowFactory");

    console.log("\n🚀 Deploying TronEscrowFactory...");

    // Deploy factory contract
    const factoryContract = await tronWeb.contract().new({
      abi: factoryArtifact.abi,
      bytecode: factoryArtifact.bytecode,
      parameters: [
        "0x0000000000000000000000000000000000000000", // limitOrderProtocol
        "0x0000000000000000000000000000000000000000", // feeToken
        "0x0000000000000000000000000000000000000000", // accessToken
        tronWeb.defaultAddress.hex, // owner
        86400, // rescueDelaySrc
        86400, // rescueDelayDst
      ],
      feeLimit: 50000000, // 50 TRX (reduced from 1000)
      callValue: 0,
      userFeePercentage: 100, // Use maximum user fee percentage
      originEnergyLimit: 50000000, // Set origin energy limit
    });

    console.log("✅ TronEscrowFactory deployed to:", factoryContract.address);

    // Wait a bit for network propagation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get implementation addresses
    const srcImpl = await factoryContract.ESCROW_SRC_IMPLEMENTATION().call();
    const dstImpl = await factoryContract.ESCROW_DST_IMPLEMENTATION().call();

    console.log("✅ TronEscrowSrc Implementation:", srcImpl);
    console.log("✅ TronEscrowDst Implementation:", dstImpl);

    // Convert addresses to TRON format for explorer
    const factoryTronAddr = tronWeb.address.fromHex(factoryContract.address);
    const srcTronAddr = tronWeb.address.fromHex(srcImpl);
    const dstTronAddr = tronWeb.address.fromHex(dstImpl);

    console.log("\n🔍 TRON EXPLORER LINKS:");
    console.log(
      `Factory: https://nile.tronscan.org/#/contract/${factoryTronAddr}`
    );
    console.log(
      `Src Impl: https://nile.tronscan.org/#/contract/${srcTronAddr}`
    );
    console.log(
      `Dst Impl: https://nile.tronscan.org/#/contract/${dstTronAddr}`
    );

    // Save deployment info
    const deploymentInfo = {
      network: "tron-nile-real",
      timestamp: new Date().toISOString(),
      chainId: 3448148188,
      contracts: {
        TronEscrowFactory: factoryTronAddr,
        TronEscrowSrcImplementation: srcTronAddr,
        TronEscrowDstImplementation: dstTronAddr,
      },
      contractsHex: {
        TronEscrowFactory: factoryContract.address,
        TronEscrowSrcImplementation: srcImpl,
        TronEscrowDstImplementation: dstImpl,
      },
      deployer: tronWeb.defaultAddress.base58,
    };

    // Save to file
    const deploymentPath = path.join(
      __dirname,
      "../../contracts/deployments/tron-nile-real.json"
    );
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("====================================");
    console.log("📊 Deployment saved to:", deploymentPath);
    console.log(
      "\n✅ You can now verify these contracts on TRON Nile explorer!"
    );
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

/**
 * Get contract artifact from Hardhat compilation
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

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
