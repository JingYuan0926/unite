import { ethers } from "hardhat";

/**
 * Simulate the resolver call to get the exact revert reason
 */
async function simulateResolverCall() {
  console.log("🔍 SIMULATING RESOLVER CALL TO GET REVERT REASON");
  console.log("=".repeat(60));

  const provider = ethers.provider;

  // The failed transaction data
  const failedTx =
    "0x00e979202d20ea009af41ec28ee1e173527d4bda71885ae6df98d5e370868f68";

  try {
    const tx = await provider.getTransaction(failedTx);

    if (!tx) {
      console.log("❌ Transaction not found");
      return;
    }

    console.log("📊 TRANSACTION DETAILS:");
    console.log(`🔹 From: ${tx.from}`);
    console.log(`🔹 To: ${tx.to}`);
    console.log(`🔹 Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`🔹 Data: ${tx.data.slice(0, 50)}...`);

    // Try to simulate the call using provider.call
    console.log("\n🔄 SIMULATING CALL...");

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

      // Try to decode the error
      if (callError.data) {
        console.log(`🔍 Error data: ${callError.data}`);

        // Common error selectors
        const errorMap: { [key: string]: string } = {
          "0xa4f62a96": "PrivateOrder() - LOP invalidation error",
          "0x478a5205":
            "TransferFromTakerToMakerFailed() - Token transfer failed",
          "0x08c379a0": "Error(string) - Standard revert with message",
          "0x4e487b71": "Panic(uint256) - Solidity panic",
        };

        const selector = callError.data.slice(0, 10);
        const errorName = errorMap[selector] || "Unknown error";
        console.log(`🎯 Error type: ${selector} = ${errorName}`);

        if (selector === "0x08c379a0") {
          // Decode string error message
          try {
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
              ["string"],
              "0x" + callError.data.slice(10)
            );
            console.log(`📝 Error message: "${decoded[0]}"`);
          } catch (e) {
            console.log("❌ Could not decode error message");
          }
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error simulating call: ${error}`);
  }
}

simulateResolverCall().catch(console.error);
