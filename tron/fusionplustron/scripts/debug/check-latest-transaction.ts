import { ethers } from "hardhat";

/**
 * Check the latest transaction to see what error we're getting now
 */
async function checkLatestTransaction() {
  console.log("🔍 CHECKING LATEST TRANSACTION ERROR");
  console.log("=".repeat(40));

  const txHash =
    "0xd4deb59ea1b48c659d921fa377a82d5b37ef72b8f94f293716fd84d47faa25a9";
  console.log(`📝 Transaction: ${txHash}`);

  const provider = ethers.provider;

  try {
    // Try to simulate the call to get the revert reason
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log("❌ Transaction not found");
      return;
    }

    console.log(`💰 Gas used: ${tx.gasUsed} (vs previous 81,393)`);
    console.log(
      `📊 Progress: ${((110727 - 81393) / 81393) * 100}% more gas = more execution!`
    );

    // Try to simulate the call to get the error
    try {
      await provider.call({
        to: tx.to,
        from: tx.from,
        value: tx.value,
        data: tx.data,
      });
      console.log("✅ Call simulation succeeded (unexpected)");
    } catch (error: any) {
      console.log(`❌ Call simulation failed: ${error.message}`);
      console.log(`📊 Error data: ${error.data}`);

      if (error.data === "0x478a5205") {
        console.log("🎯 Still getting TransferFromTakerToMakerFailed()");
        console.log(
          "💡 This means DemoResolver doesn't have MockTRX to transfer to User A"
        );
        console.log(
          "🔧 SOLUTION: Fund DemoResolver with MockTRX or modify order structure"
        );
      } else if (error.data === "0xa4f62a96") {
        console.log("❌ Back to PrivateOrder error - fix didn't apply");
      } else {
        console.log(`🔍 New error code: ${error.data}`);
      }
    }
  } catch (error) {
    console.log(`❌ Failed to analyze transaction: ${error}`);
  }
}

checkLatestTransaction().catch(console.error);
