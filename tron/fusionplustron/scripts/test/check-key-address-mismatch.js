const TronWeb = require("tronweb");
require("dotenv").config();

async function checkKeyAddressMismatch() {
  console.log("🔍 KEY-ADDRESS MISMATCH CHECK");
  console.log("=".repeat(50));

  const privateKey = process.env.TRON_PRIVATE_KEY;
  console.log(`Private key length: ${privateKey.length}`);
  console.log(
    `Private key (first 10 chars): ${privateKey.substring(0, 10)}...`
  );

  // Generate address from private key
  const addressFromKey = TronWeb.address.fromPrivateKey(privateKey);
  console.log(`Address from private key: ${addressFromKey}`);

  // Initialize TronWeb and check default address
  const tronWeb = new TronWeb({
    fullHost: "https://nile.trongrid.io",
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
    privateKey: privateKey,
  });

  console.log(`TronWeb default address: ${tronWeb.defaultAddress.base58}`);
  console.log(`TronWeb default hex: ${tronWeb.defaultAddress.hex}`);

  // Check if they match
  const match = addressFromKey === tronWeb.defaultAddress.base58;
  console.log(`Addresses match: ${match}`);

  if (!match) {
    console.log("❌ ADDRESS MISMATCH DETECTED!");
    console.log("   This could cause signature validation errors");
  } else {
    console.log("✅ Addresses match correctly");
  }

  // Check account existence and balance
  try {
    const account1 = await tronWeb.trx.getAccount(addressFromKey);
    const account2 = await tronWeb.trx.getAccount(
      tronWeb.defaultAddress.base58
    );

    console.log(
      `\nAccount from key balance: ${tronWeb.fromSun(account1.balance || 0)} TRX`
    );
    console.log(
      `TronWeb default balance: ${tronWeb.fromSun(account2.balance || 0)} TRX`
    );

    // Try to get the problematic address from error message
    const errorAddress = "TKLQ7DuRiirNKvd6kLxv73T3wT6y6bGFof";
    console.log(`\nChecking error address: ${errorAddress}`);

    try {
      const errorAccount = await tronWeb.trx.getAccount(errorAddress);
      console.log(
        `Error address balance: ${tronWeb.fromSun(errorAccount.balance || 0)} TRX`
      );
      console.log(`Error address type: ${errorAccount.type || "Normal"}`);
    } catch (error) {
      console.log(`Error address check failed: ${error.message}`);
    }
  } catch (error) {
    console.log(`Account check failed: ${error.message}`);
  }
}

checkKeyAddressMismatch().catch(console.error);
