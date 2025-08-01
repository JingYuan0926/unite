// scripts/debug/check-tron-tx-status.ts
// Quick script to check TRON transaction status

async function checkTronTxStatus() {
  const txHash =
    "106ce0825c21f18110cd47a337cc14e07baf3f45b79702bf1ca037f13089ff15";

  console.log("🔍 CHECKING TRON TRANSACTION STATUS");
  console.log("====================================");
  console.log(`TX Hash: ${txHash}`);
  console.log(`Tronscan: https://nile.tronscan.org/#/transaction/${txHash}\n`);

  try {
    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    // Get transaction details
    const tx = await tronWeb.trx.getTransaction(txHash);
    console.log("📋 TRANSACTION DETAILS:");
    console.log("=======================");
    console.log(`Status: ${tx.ret[0].contractRet}`);
    console.log(`Contract Result: ${JSON.stringify(tx.ret[0])}`);

    if (tx.ret[0].contractRet === "SUCCESS") {
      console.log("\n🎉 TRANSACTION SUCCEEDED!");
      console.log("✅ TRON escrow creation is working!");
    } else if (tx.ret[0].contractRet === "REVERT") {
      console.log("\n❌ TRANSACTION REVERTED");
      console.log("Need to debug contract logic further");
    } else {
      console.log(`\n⚠️ UNKNOWN STATUS: ${tx.ret[0].contractRet}`);
    }

    // Get transaction info for more details
    try {
      const txInfo = await tronWeb.trx.getTransactionInfo(txHash);
      console.log("\n📋 TRANSACTION INFO:");
      console.log("====================");
      console.log(JSON.stringify(txInfo, null, 2));
    } catch (infoError: any) {
      console.log(`⚠️ Could not get transaction info: ${infoError.message}`);
    }
  } catch (error: any) {
    console.log(`❌ Error checking transaction: ${error.message}`);
  }
}

checkTronTxStatus().catch(console.error);
