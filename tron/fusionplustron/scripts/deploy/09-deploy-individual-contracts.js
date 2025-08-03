const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Deploy individual contracts one by one with detailed error handling
 */

async function main() {
  const contractName = process.argv[2];

  if (!contractName) {
    console.log(
      "❌ Usage: node deploy-individual-contracts.js <CONTRACT_NAME>"
    );
    console.log("Available contracts: TronEscrowDst, TronEscrowFactory");
    process.exit(1);
  }

  console.log(`🚀 DEPLOYING ${contractName}`);
  console.log("=".repeat(30 + contractName.length));

  const tronWeb = new TronWeb({
    fullHost: "https://nile.trongrid.io",
    privateKey: process.env.TRON_PRIVATE_KEY,
  });

  console.log("📝 Deploying with account:", tronWeb.defaultAddress.base58);

  try {
    // Load contract artifact
    const artifactPath = path.join(
      __dirname,
      `../../artifacts/contracts/tron/${contractName}.sol/${contractName}.json`
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Contract artifact not found: ${artifactPath}`);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    console.log(`✅ Loaded ${contractName} artifact`);
    console.log(
      `📋 Functions: ${artifact.abi.filter((f) => f.type === "function").length}`
    );

    // Determine constructor parameters
    let parameters = [];

    if (contractName === "TronEscrowDst") {
      parameters = [
        86400, // rescueDelay (24 hours)
        "0x0000000000000000000000000000000000000000", // accessToken
      ];
    } else if (contractName === "TronEscrowFactory") {
      parameters = [
        "0x0000000000000000000000000000000000000000", // limitOrderProtocol
        "0x0000000000000000000000000000000000000000", // feeToken
        "0x0000000000000000000000000000000000000000", // accessToken
        tronWeb.defaultAddress.hex, // owner
        86400, // rescueDelaySrc
        86400, // rescueDelayDst
      ];
    }

    console.log(`📋 Constructor parameters: ${parameters.length}`);
    parameters.forEach((param, i) => {
      console.log(`   ${i + 1}. ${param}`);
    });

    // Deploy contract
    console.log(`\n🚀 Deploying ${contractName}...`);

    // Set higher fee limit for factory deployment (deploys 2 contracts internally)
    const feeLimit =
      contractName === "TronEscrowFactory" ? 500000000 : 150000000; // 500 TRX for factory, 150 TRX for others

    const contract = await tronWeb.contract().new({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      parameters: parameters,
      feeLimit: feeLimit,
      callValue: 0,
    });

    const contractAddress = tronWeb.address.fromHex(contract.address);
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`📍 Address: ${contractAddress}`);
    console.log(
      `🔗 Explorer: https://nile.tronscan.org/#/contract/${contractAddress}`
    );

    // Wait for network confirmation
    console.log("⏳ Waiting for network confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const contractInfo = await tronWeb.trx.getContract(contractAddress);

    if (contractInfo && contractInfo.bytecode) {
      console.log("✅ Contract verified on blockchain");
      console.log(
        `📊 Functions: ${contractInfo.abi ? contractInfo.abi.entrys.filter((e) => e.type === "Function").length : "Unknown"}`
      );
    } else {
      throw new Error("Contract verification failed");
    }

    // Test basic functionality
    if (contractName === "TronEscrowDst" || contractName === "TronEscrowSrc") {
      console.log("🧪 Testing escrow functions...");
      try {
        const escrowContract = await tronWeb.contract(
          artifact.abi,
          contractAddress
        );
        const rescueDelay = await escrowContract.RESCUE_DELAY().call();
        const isTronNetwork = await escrowContract.isTronNetwork().call();

        console.log(`✅ Rescue Delay: ${rescueDelay}`);
        console.log(`✅ Is Tron Network: ${isTronNetwork}`);
      } catch (testError) {
        console.log(`⚠️ Function testing failed: ${testError.message}`);
      }
    }

    if (contractName === "TronEscrowFactory") {
      console.log("🧪 Testing factory functions...");
      try {
        const factoryContract = await tronWeb.contract(
          artifact.abi,
          contractAddress
        );
        const isTronFactory = await factoryContract.isTronFactory().call();
        const chainId = await factoryContract.getTronChainId().call();

        console.log(`✅ Is Tron Factory: ${isTronFactory}`);
        console.log(`✅ Chain ID: ${chainId}`);
      } catch (testError) {
        console.log(`⚠️ Function testing failed: ${testError.message}`);
      }
    }

    // Save individual deployment info
    const deploymentInfo = {
      contractName: contractName,
      address: contractAddress,
      network: "tron-nile",
      timestamp: new Date().toISOString(),
      deployer: tronWeb.defaultAddress.base58,
      explorer: `https://nile.tronscan.org/#/contract/${contractAddress}`,
      verified: true,
    };

    const deploymentPath = path.join(
      __dirname,
      `../../contracts/deployments/${contractName.toLowerCase()}-nile.json`
    );
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);

    console.log(`\n🎉 ${contractName} DEPLOYMENT COMPLETED!`);
  } catch (error) {
    console.error(`❌ ${contractName} deployment failed:`, error);

    // Additional error details
    if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
