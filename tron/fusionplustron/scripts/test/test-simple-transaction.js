const TronWeb = require("tronweb");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 200000000,
};

const FACTORY_ADDRESS = "TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH";

async function testSimpleTransaction() {
  console.log("🔍 SIMPLE TRANSACTION TEST");
  console.log("=".repeat(50));

  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  try {
    // Test 1: Simple TRX transfer to ourselves (should work)
    console.log("🔍 Test 1: Simple TRX Transfer");
    const myAddress = tronWeb.defaultAddress.base58;
    console.log(`   From: ${myAddress}`);
    console.log(`   To: ${myAddress}`);
    console.log(`   Amount: 0.000001 TRX`);

    try {
      const transferResult = await tronWeb.trx.sendTransaction(
        myAddress,
        tronWeb.toSun(0.000001), // 0.000001 TRX
        TRON_CONFIG.privateKey
      );

      console.log(`✅ Transfer successful!`);
      console.log(
        `   TX Hash: ${transferResult.txid || transferResult.transaction?.txID || "unknown"}`
      );

      if (transferResult.txid) {
        const txInfo = await tronWeb.trx.getTransactionInfo(
          transferResult.txid
        );
        console.log(`   Status: ${txInfo.receipt?.result || "PENDING"}`);
      }
    } catch (error) {
      console.log(`❌ Transfer failed: ${error.message}`);
      return false;
    }

    // Test 2: Contract call with parameters
    console.log("\n🔍 Test 2: Contract Call Test");

    const factoryABI = [
      {
        inputs: [],
        name: "getTronChainId",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    try {
      const contract = await tronWeb.contract(factoryABI, FACTORY_ADDRESS);
      const chainId = await contract.getTronChainId().call();
      console.log(`✅ Contract call successful: Chain ID = ${chainId}`);
    } catch (error) {
      console.log(`❌ Contract call failed: ${error.message}`);
      return false;
    }

    // Test 3: Check transaction methods available
    console.log("\n🔍 Test 3: Available Transaction Methods");
    const contract = await tronWeb.contract([], FACTORY_ADDRESS);
    console.log(`   Contract object created: ${!!contract}`);
    console.log(
      `   Available methods: ${Object.keys(contract).slice(0, 5).join(", ")}...`
    );

    return true;
  } catch (error) {
    console.error("❌ Simple transaction test failed:", error.message);
    return false;
  }
}

// Execute test
async function main() {
  const success = await testSimpleTransaction();

  console.log("\n📊 RESULT:");
  console.log("=".repeat(30));

  if (success) {
    console.log("✅ TRANSACTION SYSTEM WORKING");
    console.log("   Ready to attempt factory transaction");
  } else {
    console.log("❌ TRANSACTION SYSTEM ISSUE");
    console.log("   Need to fix basic transaction capability first");
  }

  return success;
}

if (require.main === module) {
  main();
}

module.exports = { testSimpleTransaction };
