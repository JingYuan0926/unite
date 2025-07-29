const { TronWeb } = require("tronweb");
require("dotenv").config();

async function testWallet() {
  try {
    console.log("🔍 Testing Tron wallet setup...");

    if (!process.env.TRON_PRIVATE_KEY) {
      throw new Error("❌ TRON_PRIVATE_KEY not found in environment variables");
    }

    const tronWeb = new TronWeb({
      fullHost: "https://api.nileex.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const address = tronWeb.address.fromPrivateKey(
      process.env.TRON_PRIVATE_KEY
    );
    console.log(`📍 Address: ${address}`);

    const balance = await tronWeb.trx.getBalance(address);
    const balanceTrx = tronWeb.fromSun(balance);
    console.log(`💰 Balance: ${balanceTrx} TRX`);

    if (balanceTrx >= 100) {
      console.log("✅ Sufficient balance for deployment!");
      return true;
    } else {
      console.log(
        "⚠️  Insufficient balance for deployment. Need at least 100 TRX."
      );
      console.log("💡 Get free TRX from: https://nileex.io/join/getJoinPage");
      return false;
    }
  } catch (error) {
    console.error("❌ Wallet test failed:", error.message);
    return false;
  }
}

if (require.main === module) {
  testWallet().then((success) => {
    if (success) {
      console.log("\n🚀 Ready to deploy!");
    } else {
      console.log("\n❌ Please fix wallet issues before deploying");
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = testWallet;
