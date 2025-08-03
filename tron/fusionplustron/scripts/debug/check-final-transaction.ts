import { ethers } from "hardhat";

/**
 * Check the final transaction to see what's still failing
 */
async function checkFinalTransaction() {
  console.log("🔍 CHECKING FINAL TRANSACTION");
  console.log("=".repeat(40));

  const txHash =
    "0x31a5ad170df0e352782501a2634adf1e2189d7a8d9116a7c9c3a5ef413c294d7";
  console.log(`📝 Latest Transaction: ${txHash}`);

  const provider = ethers.provider;

  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log("❌ Transaction not found");
      return;
    }

    console.log(`💰 Gas used: ${tx.gasUsed} vs previous attempts:`);
    console.log(`   First attempt (PrivateOrder): 81,393`);
    console.log(`   Second attempt (Transfer failed): 110,727`);
    console.log(`   Current attempt (ETH-only): 109,072`);
    console.log(`📊 This shows we're getting very close to success!`);

    // Try to simulate the call to get the exact error
    try {
      await provider.call({
        to: tx.to,
        from: tx.from,
        value: tx.value,
        data: tx.data,
      });
      console.log(
        "✅ Call simulation succeeded (transaction should have worked)"
      );
    } catch (error: any) {
      console.log(`❌ Call simulation failed: ${error.message}`);
      console.log(`📊 Error data: ${error.data || "No specific error data"}`);

      if (error.data) {
        // Check common LOP errors
        const errorMap = {
          "0xa4f62a96": "PrivateOrder() - SOLVED ✅",
          "0x478a5205": "TransferFromTakerToMakerFailed() - SOLVED ✅",
          "0x4e487b71": "Panic (division by zero) - SOLVED ✅",
          "0x7f902a93": "TakingAmountExceeded()",
          "0x481ea392": "MakingAmountTooLow()",
          "0xfba5a276": "SwapWithZeroAmount()",
          "0x70a03f48": "TransferFromMakerToTakerFailed()",
        };

        const errorName = errorMap[error.data] || "Unknown error";
        console.log(`🎯 Error identified: ${errorName}`);

        if (error.data === "0x70a03f48") {
          console.log(
            "💡 TransferFromMakerToTakerFailed suggests ETH transfer from User A failed"
          );
          console.log(
            "🔧 This might be because DemoResolver is trying to transfer ETH back to User A"
          );
          console.log(
            "💰 Check if User A has sufficient ETH or if order amount is correct"
          );
        }
      } else {
        console.log(
          "🔍 No specific error data - might be a gas issue or contract state problem"
        );
      }
    }

    // Let's also check the transaction receipt for events
    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt && receipt.logs.length > 0) {
      console.log(
        `📋 Transaction generated ${receipt.logs.length} events - some progress was made!`
      );
    } else {
      console.log(`📋 No events in transaction - failed early in execution`);
    }
  } catch (error) {
    console.log(`❌ Failed to analyze transaction: ${error}`);
  }
}

checkFinalTransaction().catch(console.error);
