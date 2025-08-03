import { ethers } from "hardhat";

/**
 * Check the latest transaction error
 */
async function checkLatestError() {
  console.log("🔍 CHECKING LATEST TRANSACTION ERROR");
  console.log("=".repeat(50));

  const provider = ethers.provider;

  // The latest failed transaction
  const latestTx =
    "0x025e9bb5503aefd12e6202f2e051ee8dc58fee126c1c490d7c2838e237d02e79";

  try {
    const tx = await provider.getTransaction(latestTx);
    const receipt = await provider.getTransactionReceipt(latestTx);

    if (!tx || !receipt) {
      console.log("❌ Transaction not found");
      return;
    }

    console.log("📊 TRANSACTION DETAILS:");
    console.log(`🔹 Hash: ${latestTx}`);
    console.log(`🔹 From: ${tx.from}`);
    console.log(`🔹 To: ${tx.to}`);
    console.log(`🔹 Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`🔹 Gas Used: ${receipt.gasUsed}`);
    console.log(`🔹 Status: ${receipt.status === 1 ? "Success" : "Failed"}`);

    // Try to simulate the call to get the error
    console.log("\n🔄 SIMULATING CALL TO GET ERROR...");

    try {
      const result = await provider.call({
        to: tx.to,
        from: tx.from,
        value: tx.value,
        data: tx.data,
      });

      console.log("✅ Call succeeded in simulation!");
      console.log(`📄 Result: ${result}`);
    } catch (callError: any) {
      console.log("❌ Call failed in simulation");
      console.log(`📋 Error: ${callError.message}`);

      if (callError.data) {
        console.log(`🔍 Error data: ${callError.data}`);

        // Check for known error selectors
        const errorMap: { [key: string]: string } = {
          "0xa4f62a96": "PrivateOrder() - LOP invalidation error",
          "0x478a5205":
            "TransferFromTakerToMakerFailed() - Token transfer failed",
          "0x08c379a0": "Error(string) - Standard revert with message",
          "0x4e487b71":
            "Panic(uint256) - Solidity panic (division by zero = 0x12)",
        };

        const selector = callError.data.slice(0, 10);
        const errorName = errorMap[selector] || "Unknown error";
        console.log(`🎯 Error type: ${selector} = ${errorName}`);

        if (selector === "0x4e487b71") {
          // Decode panic code
          try {
            const panicCode = callError.data.slice(10);
            console.log(`🚨 Panic code: 0x${panicCode}`);
            if (panicCode === "12") {
              console.log(
                "💡 This is division by zero - likely caused by takingAmount: 0n"
              );
            }
          } catch (e) {
            console.log("❌ Could not decode panic code");
          }
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error checking transaction: ${error}`);
  }
}

checkLatestError().catch(console.error);
