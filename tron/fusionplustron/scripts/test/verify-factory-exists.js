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

async function verifyFactoryExists() {
  console.log("🔍 FACTORY EXISTENCE VERIFICATION");
  console.log("=".repeat(60));

  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  try {
    console.log(`📋 Factory Address: ${FACTORY_ADDRESS}`);

    // Check if the address exists as an account
    console.log("\n🔍 Step 1: Checking Account Existence");
    try {
      const account = await tronWeb.trx.getAccount(FACTORY_ADDRESS);
      if (account && Object.keys(account).length > 0) {
        console.log("✅ Account exists on blockchain");
        console.log(`   Account Type: ${account.type || "Unknown"}`);
        if (account.balance) {
          console.log(`   Balance: ${tronWeb.fromSun(account.balance)} TRX`);
        }
      } else {
        console.log("❌ Account does not exist");
        return false;
      }
    } catch (error) {
      console.log(`❌ Account check failed: ${error.message}`);
      return false;
    }

    // Check if it has contract bytecode
    console.log("\n🔍 Step 2: Checking Contract Bytecode");
    try {
      const contractInfo = await tronWeb.trx.getContract(FACTORY_ADDRESS);
      if (contractInfo && contractInfo.bytecode) {
        console.log("✅ Contract bytecode found");
        console.log(`   Contract exists with bytecode`);
      } else {
        console.log(
          "❌ No contract bytecode found - this is not a deployed contract"
        );
        return false;
      }
    } catch (error) {
      console.log(`❌ Bytecode check failed: ${error.message}`);
      return false;
    }

    // Try to call a simple function
    console.log("\n🔍 Step 3: Testing Contract Interaction");
    try {
      const simpleABI = [
        {
          inputs: [],
          name: "isTronFactory",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
      ];

      const contract = await tronWeb.contract(simpleABI, FACTORY_ADDRESS);
      const result = await contract.isTronFactory().call();
      console.log(`✅ Contract call successful: isTronFactory() = ${result}`);
      return true;
    } catch (error) {
      console.log(`❌ Contract interaction failed: ${error.message}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Factory verification failed:", error.message);
    return false;
  }
}

// Execute verification
async function main() {
  const exists = await verifyFactoryExists();

  console.log("\n📊 FINAL VERDICT:");
  console.log("=".repeat(40));

  if (exists) {
    console.log("✅ FACTORY IS VALID AND FUNCTIONAL");
    console.log("   The issue is likely in transaction submission logic");
  } else {
    console.log("❌ FACTORY DOES NOT EXIST OR IS NOT FUNCTIONAL");
    console.log("   Need to deploy the factory first or use correct address");
  }

  return exists;
}

if (require.main === module) {
  main();
}

module.exports = { verifyFactoryExists };
