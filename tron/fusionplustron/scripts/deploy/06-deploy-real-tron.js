const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Deploy Tron contracts to REAL TRON Nile testnet
 * This script uses TronWeb to deploy contracts to actual TRON blockchain
 */

// TRON Nile Testnet Configuration
const TRON_NILE_CONFIG = {
  fullHost: "https://api.nileex.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY,
};

async function main() {
  console.log("🌉 DEPLOYING TO REAL TRON NILE TESTNET");
  console.log("====================================");

  // Validate environment
  if (!TRON_NILE_CONFIG.privateKey) {
    throw new Error("❌ TRON_PRIVATE_KEY not set in .env file");
  }

  // Initialize TronWeb
  const tronWeb = new TronWeb(TRON_NILE_CONFIG);
  console.log("📝 Deploying with account:", tronWeb.defaultAddress.base58);

  // Check account balance
  const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
  console.log(`💰 Account balance: ${tronWeb.fromSun(balance)} TRX`);

  if (balance < 1000) {
    console.log(
      "⚠️  WARNING: Low TRX balance. Get test TRX from: https://nileex.io/join/getJoinPage"
    );
  }

  try {
    // Load compiled contract artifacts
    const contractsDir = path.join(__dirname, "../../artifacts/contracts/tron");

    // Deploy TronEscrowSrc
    console.log("\n🚀 Deploying TronEscrowSrc...");
    const srcContract = await deployContract(
      tronWeb,
      "TronEscrowSrc",
      [86400, "0x0000000000000000000000000000000000000000"] // rescueDelay, accessToken
    );

    // Deploy TronEscrowDst
    console.log("\n🚀 Deploying TronEscrowDst...");
    const dstContract = await deployContract(
      tronWeb,
      "TronEscrowDst",
      [86400, "0x0000000000000000000000000000000000000000"] // rescueDelay, accessToken
    );

    // Deploy TronEscrowFactory
    console.log("\n🚀 Deploying TronEscrowFactory...");
    const factoryContract = await deployContract(tronWeb, "TronEscrowFactory", [
      "0x0000000000000000000000000000000000000000", // limitOrderProtocol (not used on Tron)
      "0x0000000000000000000000000000000000000000", // feeToken
      "0x0000000000000000000000000000000000000000", // accessToken
      tronWeb.defaultAddress.hex, // owner
      86400, // rescueDelaySrc
      86400, // rescueDelayDst
    ]);

    // Verify deployments
    console.log("\n🔍 Verifying deployments...");
    await verifyContract(tronWeb, "TronEscrowSrc", srcContract.address);
    await verifyContract(tronWeb, "TronEscrowDst", dstContract.address);
    await verifyContract(tronWeb, "TronEscrowFactory", factoryContract.address);

    // Save deployment info
    const deploymentInfo = {
      network: "tron-nile-real",
      timestamp: new Date().toISOString(),
      chainId: 3448148188,
      contracts: {
        TronEscrowSrc: srcContract.address,
        TronEscrowDst: dstContract.address,
        TronEscrowFactory: factoryContract.address,
      },
      deployer: tronWeb.defaultAddress.base58,
      transactions: {
        TronEscrowSrc: srcContract.txid,
        TronEscrowDst: dstContract.txid,
        TronEscrowFactory: factoryContract.txid,
      },
    };

    // Save to file
    const deploymentPath = path.join(
      __dirname,
      "../../contracts/deployments/tron-nile-real.json"
    );
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 REAL TRON DEPLOYMENT COMPLETED!");
    console.log("================================");
    console.log(`TronEscrowSrc: ${srcContract.address}`);
    console.log(`TronEscrowDst: ${dstContract.address}`);
    console.log(`TronEscrowFactory: ${factoryContract.address}`);
    console.log("\n🔍 VERIFICATION LINKS:");
    console.log(
      `Src Contract: https://nile.tronscan.org/#/contract/${srcContract.address}`
    );
    console.log(
      `Dst Contract: https://nile.tronscan.org/#/contract/${dstContract.address}`
    );
    console.log(
      `Factory Contract: https://nile.tronscan.org/#/contract/${factoryContract.address}`
    );
    console.log(`\n📊 Deployment saved to: ${deploymentPath}`);
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

/**
 * Deploy a contract using TronWeb
 */
async function deployContract(tronWeb, contractName, parameters = []) {
  try {
    console.log(`📦 Deploying ${contractName}...`);

    // Load contract artifacts (you'll need to get these from Hardhat compilation)
    const artifactPath = path.join(
      __dirname,
      `../../artifacts/contracts/tron/${contractName}.sol/${contractName}.json`
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Contract artifact not found: ${artifactPath}`);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Deploy contract
    const contract = await tronWeb.contract().new({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      feeLimit: 1000000000, // 1000 TRX fee limit
      callValue: 0,
      parameters: parameters,
    });

    console.log(`✅ ${contractName} deployed to: ${contract.address}`);
    console.log(`📝 Transaction ID: ${contract.transaction.txid}`);

    // Wait for confirmation
    await waitForConfirmation(tronWeb, contract.transaction.txid);

    return {
      address: contract.address,
      txid: contract.transaction.txid,
      contract: contract,
    };
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
async function waitForConfirmation(tronWeb, txid) {
  console.log(`⏳ Waiting for confirmation of ${txid}...`);

  for (let i = 0; i < 30; i++) {
    // Wait up to 30 blocks
    try {
      const tx = await tronWeb.trx.getTransaction(txid);
      if (tx && tx.ret && tx.ret[0] && tx.ret[0].contractRet === "SUCCESS") {
        console.log(`✅ Transaction confirmed in block ${tx.blockNumber}`);
        return tx;
      }
    } catch (error) {
      // Transaction not yet confirmed
    }

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
  }

  throw new Error(`Transaction ${txid} not confirmed after 90 seconds`);
}

/**
 * Verify contract deployment
 */
async function verifyContract(tronWeb, contractName, address) {
  try {
    console.log(`🔍 Verifying ${contractName} at ${address}...`);

    // Check if contract exists
    const contract = await tronWeb.trx.getContract(address);
    if (!contract || !contract.bytecode) {
      throw new Error(`Contract not found at address ${address}`);
    }

    console.log(`✅ ${contractName} verified successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to verify ${contractName}:`, error.message);
    return false;
  }
}

// Execute deployment
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
