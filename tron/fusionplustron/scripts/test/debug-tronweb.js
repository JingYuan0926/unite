const TronWeb = require("tronweb");
require("dotenv").config();

async function debugTronWeb() {
  console.log("🔍 TRONWEB DEBUG");
  console.log("=".repeat(40));

  console.log(`TronWeb version: ${TronWeb.version || "unknown"}`);
  console.log(
    `Private key length: ${process.env.TRON_PRIVATE_KEY?.length || 0}`
  );
  console.log(`API key configured: ${!!process.env.TRON_API_KEY}`);

  // Test different TronWeb initialization methods
  console.log("\n🔍 Testing TronWeb Initialization Methods:");

  // Method 1: Standard initialization
  try {
    const tronWeb1 = new TronWeb(
      "https://nile.trongrid.io",
      "https://nile.trongrid.io",
      "https://nile.trongrid.io",
      process.env.TRON_PRIVATE_KEY
    );
    console.log("✅ Method 1: Standard init successful");
    console.log(`   Address: ${tronWeb1.defaultAddress.base58}`);
  } catch (error) {
    console.log(`❌ Method 1 failed: ${error.message}`);
  }

  // Method 2: With headers
  try {
    const tronWeb2 = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
      privateKey: process.env.TRON_PRIVATE_KEY,
    });
    console.log("✅ Method 2: With headers successful");
    console.log(`   Address: ${tronWeb2.defaultAddress.base58}`);
  } catch (error) {
    console.log(`❌ Method 2 failed: ${error.message}`);
  }

  // Method 3: Check if private key is valid format
  try {
    const privateKey = process.env.TRON_PRIVATE_KEY;
    console.log(`\n🔍 Private Key Analysis:`);
    console.log(`   Length: ${privateKey.length}`);
    console.log(`   Starts with 0x: ${privateKey.startsWith("0x")}`);
    console.log(
      `   Is hex: ${/^[0-9a-fA-F]+$/.test(privateKey.replace("0x", ""))}`
    );

    // Try to create address from private key
    const address = TronWeb.address.fromPrivateKey(privateKey);
    console.log(`   Generated address: ${address}`);
  } catch (error) {
    console.log(`❌ Private key analysis failed: ${error.message}`);
  }

  // Method 4: Test basic TronWeb functions
  console.log(`\n🔍 Testing Basic Functions:`);
  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    // Test getCurrentBlock
    const block = await tronWeb.trx.getCurrentBlock();
    console.log(`✅ getCurrentBlock: ${block.block_header.raw_data.number}`);

    // Test getAccount
    const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);
    console.log(
      `✅ getAccount: Balance = ${tronWeb.fromSun(account.balance || 0)} TRX`
    );
  } catch (error) {
    console.log(`❌ Basic functions failed: ${error.message}`);
  }
}

debugTronWeb().catch(console.error);
