import { ethers } from "hardhat";

/**
 * Debug the resolver call revert
 */
async function decodeResolverRevert() {
  console.log("🔍 DEBUGGING RESOLVER CALL REVERT");
  console.log("=".repeat(50));

  const provider = ethers.provider;

  // The failed resolver call
  const failedTx =
    "0x00e979202d20ea009af41ec28ee1e173527d4bda71885ae6df98d5e370868f68";

  console.log(`📝 Failed TX: ${failedTx}`);

  try {
    const tx = await provider.getTransaction(failedTx);
    const receipt = await provider.getTransactionReceipt(failedTx);

    if (!tx || !receipt) {
      console.log("❌ Transaction not found");
      return;
    }

    console.log("\n📊 TRANSACTION ANALYSIS:");
    console.log(`🔹 From: ${tx.from}`);
    console.log(`🔹 To: ${tx.to}`);
    console.log(`🔹 Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`🔹 Gas Used: ${receipt.gasUsed}`);
    console.log(`🔹 Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
    console.log(`🔹 Data Length: ${tx.data.length} bytes`);

    if (tx.data === "0x") {
      console.log("❌ PROBLEM: Empty transaction data!");
      console.log("💡 This means no function was called on the contract");
      console.log(
        "💡 The orchestrator might not be calling the right function"
      );
    } else {
      const functionSelector = tx.data.slice(0, 10);
      console.log(`🔹 Function selector: ${functionSelector}`);
    }

    // Check if it's a simple ETH transfer
    if (tx.data === "0x" && tx.value > 0n) {
      console.log("\n🎯 DIAGNOSIS:");
      console.log("❌ This is a simple ETH transfer, not a function call!");
      console.log(
        "💡 The orchestrator is sending ETH to the resolver without calling executeAtomicSwap"
      );
      console.log(
        "💡 This suggests the function call data is missing or incorrect"
      );
    }

    // Expected resolver address
    const expectedResolver = "0x97dBd3D0b836a824E34DBF3e06107b36EfF077F8";
    if (tx.to?.toLowerCase() === expectedResolver.toLowerCase()) {
      console.log("✅ Correct resolver contract called");
    } else {
      console.log(`❌ Wrong contract called! Expected: ${expectedResolver}`);
    }
  } catch (error) {
    console.log(`❌ Error analyzing transaction: ${error}`);
  }
}

decodeResolverRevert().catch(console.error);
