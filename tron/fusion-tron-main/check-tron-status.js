const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

class TronStatusChecker {
  constructor() {
    let tronPrivateKey = process.env.TRON_PRIVATE_KEY;
    if (tronPrivateKey.startsWith("0x")) {
      tronPrivateKey = tronPrivateKey.slice(2);
    }

    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_RPC_URL,
      privateKey: tronPrivateKey,
    });
  }

  async checkTronTransaction() {
    console.log("🔍 TRON TRANSACTION STATUS CHECKER");
    console.log("==================================");
    console.log("Checking your TRON escrow creation transaction...");
    console.log("");

    const tronTxHash =
      "659336994ec3aedf446db29fc9253c083b46451811128e862d8a515ef92f7f63";

    console.log(`📋 TRON Transaction: ${tronTxHash}`);
    console.log(
      `🔗 Explorer: https://nile.tronscan.org/#/transaction/${tronTxHash}`
    );
    console.log("");

    try {
      // Try multiple times to get transaction info
      let attempts = 0;
      const maxAttempts = 5;
      let tronTxInfo = null;

      while (attempts < maxAttempts) {
        console.log(
          `⏳ Attempt ${
            attempts + 1
          }/${maxAttempts} - Checking TRON transaction...`
        );

        try {
          tronTxInfo = await this.tronWeb.trx.getTransactionInfo(tronTxHash);

          if (tronTxInfo && Object.keys(tronTxInfo).length > 0) {
            console.log("   ✅ Transaction info found!");
            break;
          } else {
            console.log("   ⏳ Transaction info not available yet...");
          }
        } catch (error) {
          console.log(`   ⚠️ Error: ${error.message}`);
        }

        attempts++;
        if (attempts < maxAttempts) {
          console.log("   🕐 Waiting 3 seconds...");
          await this.sleep(3000);
        }
      }

      if (!tronTxInfo || Object.keys(tronTxInfo).length === 0) {
        console.log("❌ TRANSACTION NOT FOUND OR STILL PROCESSING");
        console.log("");
        console.log("💡 This could mean:");
        console.log(
          "   • Transaction is still being processed (TRON can be slow)"
        );
        console.log("   • Transaction failed and wasn't included in a block");
        console.log("   • Network/RPC connectivity issues");
        console.log("");
        console.log("🔧 What to do:");
        console.log(
          `   1. Check manually: https://nile.tronscan.org/#/transaction/${tronTxHash}`
        );
        console.log("   2. Wait a bit longer and try again");
        console.log("   3. If it shows as failed, we can debug and retry");
        return;
      }

      // Analyze the transaction info
      this.analyzeTronTransaction(tronTxInfo, tronTxHash);
    } catch (error) {
      console.error(`❌ Failed to check TRON transaction: ${error.message}`);
      console.log("");
      console.log("🔧 Manual check:");
      console.log(
        `   Visit: https://nile.tronscan.org/#/transaction/${tronTxHash}`
      );
    }
  }

  analyzeTronTransaction(txInfo, txHash) {
    console.log("📊 TRON TRANSACTION ANALYSIS");
    console.log("============================");

    console.log(`🔗 Transaction Hash: ${txHash}`);
    console.log(`📦 Block Number: ${txInfo.blockNumber || "N/A"}`);
    console.log(`⏰ Block Timestamp: ${txInfo.blockTimeStamp || "N/A"}`);

    // Check receipt
    if (txInfo.receipt) {
      const result = txInfo.receipt.result || "UNKNOWN";
      console.log(`🎯 Receipt Result: ${result}`);
      console.log(`⚡ Energy Used: ${txInfo.receipt.energy_usage || 0}`);
      console.log(`💰 Energy Fee: ${txInfo.receipt.energy_fee || 0} sun`);
      console.log(`🌐 Net Usage: ${txInfo.receipt.net_usage || 0}`);

      if (result === "SUCCESS") {
        console.log("");
        console.log("🎉 TRON TRANSACTION SUCCESSFUL!");
        console.log("✅ Contract execution completed");

        // Check for events
        if (txInfo.log && txInfo.log.length > 0) {
          console.log(`📋 Events Emitted: ${txInfo.log.length}`);
          console.log("✅ Contract events were generated");

          // Try to decode events
          console.log("\n📝 Event Details:");
          txInfo.log.forEach((log, index) => {
            console.log(`   Event ${index + 1}:`);
            console.log(`      Address: ${log.address}`);
            console.log(`      Topics: ${log.topics?.length || 0} topics`);
            console.log(`      Data: ${log.data || "No data"}`);
          });

          console.log("\n🎯 EXCELLENT! TRON escrow creation succeeded!");
        } else {
          console.log("⚠️ No events emitted");
          console.log(
            "💡 This might indicate the contract call didn't execute as expected"
          );
        }
      } else if (result === "REVERT") {
        console.log("");
        console.log("❌ TRON TRANSACTION REVERTED");
        console.log("💡 The contract call failed and was reverted");

        if (txInfo.contractResult && txInfo.contractResult.length > 0) {
          console.log(`🔍 Contract Result: ${txInfo.contractResult[0]}`);
        }
      } else {
        console.log("");
        console.log(`⚠️ UNKNOWN TRANSACTION STATUS: ${result}`);
      }
    } else {
      console.log(
        "⚠️ No receipt available - transaction may still be processing"
      );
    }

    // Contract result analysis
    if (txInfo.contractResult && txInfo.contractResult.length > 0) {
      console.log("\n🔍 Contract Execution Result:");
      txInfo.contractResult.forEach((result, index) => {
        console.log(`   Result ${index + 1}: ${result}`);
      });
    }

    console.log("");
    console.log("🔗 Manual Verification:");
    console.log(`   Visit: https://nile.tronscan.org/#/transaction/${txHash}`);
    console.log("   Look for:");
    console.log("   • Status should be 'Success'");
    console.log("   • Events tab should show contract events");
    console.log("   • Energy usage should be reasonable");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("🚀 CHECKING TRON TRANSACTION STATUS");
  console.log("Verifying your TRON escrow creation...\n");

  const checker = new TronStatusChecker();
  await checker.checkTronTransaction();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TronStatusChecker };
