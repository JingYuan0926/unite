const TronWeb = require("tronweb");
require("dotenv").config();

/**
 * Check TRON account details and balance
 */

async function main() {
  console.log("🌉 CHECKING TRON ACCOUNT DETAILS");
  console.log("=================================");

  try {
    // Initialize TronWeb
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const address = tronWeb.defaultAddress.base58;
    console.log(`📍 TRON Address: ${address}`);
    console.log(`🔗 Explorer: https://nile.tronscan.org/#/address/${address}`);

    // Check balance
    const balance = await tronWeb.trx.getBalance(address);
    const trxBalance = tronWeb.fromSun(balance);
    console.log(`💰 TRX Balance: ${trxBalance} TRX`);

    if (balance < 1000) {
      console.log("\n⚠️  LOW BALANCE WARNING!");
      console.log("🔋 You need test TRX to deploy contracts.");
      console.log(
        "🎁 Get free test TRX from: https://nileex.io/join/getJoinPage"
      );
      console.log(`📋 Enter this address: ${address}`);
    } else {
      console.log("\n✅ Sufficient balance for deployment!");
    }

    // Check account activity
    const account = await tronWeb.trx.getAccount(address);
    if (account.create_time) {
      console.log(
        `📅 Account created: ${new Date(account.create_time).toLocaleString()}`
      );
    }
  } catch (error) {
    console.error("❌ Error checking TRON account:", error.message);

    if (error.message.includes("Invalid private key")) {
      console.log("\n💡 Fix: Check your TRON_PRIVATE_KEY in .env file");
      console.log("   - Should be 64 characters hex string");
      console.log("   - No 0x prefix needed");
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
