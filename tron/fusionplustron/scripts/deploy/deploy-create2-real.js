const TronWeb = require("tronweb");
const fs = require("fs");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 1000000000, // 1000 TRX
};

// Get compiled contract artifacts
const contractArtifact = require("../../artifacts/contracts/tron/test/TronCreate2Test.sol/TronCreate2Test.json");

async function deployTronCreate2Test() {
  console.log("🚀 REAL DEPLOYMENT: TronCreate2Test to Tron Nile Testnet");
  console.log("=".repeat(60));

  if (!process.env.TRON_PRIVATE_KEY || process.env.TRON_PRIVATE_KEY === "") {
    throw new Error("❌ TRON_PRIVATE_KEY not set in environment variables");
  }

  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  try {
    console.log("📋 Contract Details:");
    console.log(
      `   Bytecode Length: ${contractArtifact.bytecode.length} characters`
    );
    console.log(`   ABI Functions: ${contractArtifact.abi.length}`);
    console.log(`   Deployer: ${tronWeb.defaultAddress.base58}`);

    // Check balance before deployment
    const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
    console.log(`   Balance: ${balance / 1000000} TRX`);

    if (balance < 100000000) {
      // Less than 100 TRX
      throw new Error(
        "❌ Insufficient TRX balance. Need at least 100 TRX for deployment."
      );
    }

    console.log("\n🔄 Deploying contract...");

    // REAL deployment to Tron Nile testnet
    const contract = await tronWeb.contract().new({
      abi: contractArtifact.abi,
      bytecode: contractArtifact.bytecode,
      feeLimit: TRON_CONFIG.feeLimit,
      userFeePercentage: 100,
      originEnergyLimit: 10000000,
      parameters: [], // No constructor parameters
    });

    const address = contract.address;
    const txHash = contract.transactionHash;

    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log(`   Contract Address: ${address}`);
    console.log(`   Transaction Hash: ${txHash}`);
    console.log(
      `   Tronscan: https://nile.tronscan.org/#/transaction/${txHash}`
    );

    // Wait for transaction confirmation
    console.log("\n⏳ Waiting for transaction confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get transaction info for gas usage
    let gasUsed = 0;
    try {
      const txInfo = await tronWeb.trx.getTransactionInfo(txHash);
      gasUsed = txInfo.receipt?.energy_usage_total || 0;
      console.log(`   Gas Used: ${gasUsed} energy`);
      console.log(`   Status: ${txInfo.receipt?.result || "SUCCESS"}`);
    } catch (error) {
      console.log(
        "⚠️ Could not fetch transaction info, but deployment seems successful"
      );
    }

    const result = {
      contractName: "TronCreate2Test",
      address,
      txHash,
      tronscanUrl: `https://nile.tronscan.org/#/transaction/${txHash}`,
      deploymentTimestamp: new Date().toISOString(),
      gasUsed,
      success: true,
    };

    // Save deployment result
    fs.writeFileSync(
      "./real-deployment-results.json",
      JSON.stringify(
        { phase1: result, timestamp: new Date().toISOString() },
        null,
        2
      )
    );

    console.log("\n💾 Deployment result saved to real-deployment-results.json");

    return result;
  } catch (error) {
    console.error("❌ DEPLOYMENT FAILED:", error.message);
    throw error;
  }
}

// Execute deployment
async function main() {
  try {
    const result = await deployTronCreate2Test();
    console.log("\n🎯 Phase 1 Deployment Complete!");
    console.log("📋 Next Step: Run test-create2-real.js");
    process.exit(0);
  } catch (error) {
    console.error("💥 Phase 1 Deployment Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { deployTronCreate2Test };
