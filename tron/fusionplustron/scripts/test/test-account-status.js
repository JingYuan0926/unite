const TronWeb = require("tronweb");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 200000000, // 200 TRX for escrow creation tests
};

async function checkAccountStatus() {
  console.log("🔍 ACCOUNT STATUS CHECK");
  console.log("=".repeat(50));

  // Initialize TronWeb
  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  try {
    console.log(`📋 Network: ${TRON_CONFIG.fullHost}`);
    console.log(
      `🔑 API Key: ${TRON_CONFIG.headers["TRON-PRO-API-KEY"] ? "Configured" : "MISSING"}`
    );
    console.log(
      `🔐 Private Key: ${TRON_CONFIG.privateKey ? "Configured" : "MISSING"}`
    );

    // Get account info
    const address = tronWeb.defaultAddress.base58;
    console.log(`📍 Address: ${address}`);

    const account = await tronWeb.trx.getAccount(address);
    const balance = account.balance || 0;

    console.log(`💰 Balance: ${tronWeb.fromSun(balance)} TRX`);

    if (balance < tronWeb.toSun(2)) {
      console.log(
        "⚠️  WARNING: Insufficient balance for test (need at least 2 TRX)"
      );
      console.log(
        "   Visit: https://nileex.io/join/getJoinPage to get test TRX"
      );
    } else {
      console.log("✅ Sufficient balance for test");
    }

    // Test network connectivity
    const latestBlock = await tronWeb.trx.getCurrentBlock();
    console.log(`🔗 Latest Block: ${latestBlock.block_header.raw_data.number}`);
    console.log("✅ Network connectivity OK");

    return {
      hasApiKey: !!TRON_CONFIG.headers["TRON-PRO-API-KEY"],
      hasPrivateKey: !!TRON_CONFIG.privateKey,
      balance: tronWeb.fromSun(balance),
      sufficientBalance: balance >= tronWeb.toSun(2),
      networkConnected: true,
    };
  } catch (error) {
    console.error("❌ Account status check failed:", error.message);
    return {
      hasApiKey: !!TRON_CONFIG.headers["TRON-PRO-API-KEY"],
      hasPrivateKey: !!TRON_CONFIG.privateKey,
      balance: 0,
      sufficientBalance: false,
      networkConnected: false,
      error: error.message,
    };
  }
}

// Execute check
async function main() {
  const status = await checkAccountStatus();

  console.log("\n📊 SUMMARY:");
  console.log("=".repeat(30));
  console.log(`API Key: ${status.hasApiKey ? "✅" : "❌"}`);
  console.log(`Private Key: ${status.hasPrivateKey ? "✅" : "❌"}`);
  console.log(
    `Balance: ${status.sufficientBalance ? "✅" : "❌"} (${status.balance} TRX)`
  );
  console.log(`Network: ${status.networkConnected ? "✅" : "❌"}`);

  if (
    status.hasApiKey &&
    status.hasPrivateKey &&
    status.sufficientBalance &&
    status.networkConnected
  ) {
    console.log("\n🎯 READY FOR LIVE TEST!");
  } else {
    console.log("\n⚠️  NOT READY - Fix issues above first");
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkAccountStatus };
