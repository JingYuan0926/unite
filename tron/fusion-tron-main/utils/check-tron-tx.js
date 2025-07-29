const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

async function checkTronTransaction(txId) {
  const tronWeb = new TronWeb({
    fullHost: process.env.TRON_RPC_URL,
  });

  try {
    console.log(`🔍 Checking TRON transaction: ${txId}`);

    const txInfo = await tronWeb.trx.getTransactionInfo(txId);

    if (txInfo && Object.keys(txInfo).length > 0) {
      console.log("📋 Transaction Info:");
      console.log(`   Status: ${txInfo.receipt?.result || "UNKNOWN"}`);
      console.log(`   Block Number: ${txInfo.blockNumber || "N/A"}`);
      console.log(`   Energy Used: ${txInfo.receipt?.energy_usage || "N/A"}`);
      console.log(`   Fee: ${txInfo.fee || "N/A"}`);

      if (txInfo.log && txInfo.log.length > 0) {
        console.log(`   Events: ${txInfo.log.length} emitted`);
        txInfo.log.forEach((log, i) => {
          console.log(`     Event ${i}: ${log.topics?.length || 0} topics`);
        });
      }

      if (txInfo.revert_info) {
        console.log(`   Revert Info: ${JSON.stringify(txInfo.revert_info)}`);
      }

      console.log(
        `🌐 TronScan: https://nile.tronscan.org/#/transaction/${txId}`
      );
    } else {
      console.log("❌ Transaction not found or no info available");
    }
  } catch (error) {
    console.error("❌ Error checking transaction:", error.message);
  }
}

const txId = process.argv[2];
if (!txId) {
  console.error("Usage: node check-tron-tx.js <transaction_id>");
  process.exit(1);
}

checkTronTransaction(txId);
