import { ethers } from "hardhat";

/**
 * Analyze why User A didn't pay ETH in the escrow creation
 */
async function analyzeUserAPayment() {
  console.log("🔍 ANALYZING USER A PAYMENT ISSUE");
  console.log("=".repeat(50));

  const provider = ethers.provider;

  // The transaction where escrow was supposedly created
  const escrowCreationTx =
    "0xa590496a4370d4df42bdd2a8ea71f7173d4d2afba9eba9f7ee759bab8a5d9132";

  console.log(`📝 Escrow Creation TX: ${escrowCreationTx}`);

  try {
    const tx = await provider.getTransaction(escrowCreationTx);
    const receipt = await provider.getTransactionReceipt(escrowCreationTx);

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

    // Check who actually sent this transaction
    const userAAddress = process.env.USER_A_ETH_PRIVATE_KEY
      ? new ethers.Wallet(process.env.USER_A_ETH_PRIVATE_KEY).address
      : "Unknown";

    const userBAddress = process.env.USER_B_ETH_PRIVATE_KEY
      ? new ethers.Wallet(process.env.USER_B_ETH_PRIVATE_KEY).address
      : "Unknown";

    console.log("\n👥 USER ANALYSIS:");
    console.log(`👤 User A (should pay ETH): ${userAAddress}`);
    console.log(`👤 User B (resolver): ${userBAddress}`);
    console.log(`🔍 Transaction sender: ${tx.from}`);

    if (tx.from.toLowerCase() === userAAddress.toLowerCase()) {
      console.log("✅ Correct: User A sent the transaction");
    } else if (tx.from.toLowerCase() === userBAddress.toLowerCase()) {
      console.log(
        "❌ PROBLEM: User B sent the transaction, but User A should pay!"
      );
    } else {
      console.log("❌ PROBLEM: Unknown sender!");
    }

    console.log("\n💰 VALUE ANALYSIS:");
    if (tx.value === 0n) {
      console.log("❌ MAJOR ISSUE: Transaction sent 0 ETH!");
      console.log("🔧 User A should have sent ETH amount + safety deposit");
      console.log(
        "💡 The escrow creation should include msg.value for the ETH being swapped"
      );
    } else {
      console.log(`✅ ETH was sent: ${ethers.formatEther(tx.value)} ETH`);
    }

    // Analyze the function call
    console.log("\n🔍 FUNCTION CALL ANALYSIS:");
    console.log(`📋 Input data length: ${tx.data.length} bytes`);

    if (tx.data.length > 10) {
      const functionSelector = tx.data.slice(0, 10);
      console.log(`🔹 Function selector: ${functionSelector}`);

      // Known selectors
      const selectors = {
        "0x1f91a3a5": "executeAtomicSwap(...)",
        "0x441a3e70": "withdraw(...)",
        "0x64bf5447": "increaseEpoch(...)",
      };

      const functionName = selectors[functionSelector] || "Unknown function";
      console.log(`🔹 Function: ${functionName}`);
    }

    console.log("\n🎯 DIAGNOSIS:");

    if (tx.from.toLowerCase() !== userAAddress.toLowerCase()) {
      console.log("❌ ROOT CAUSE: Wrong caller!");
      console.log("💡 User A (maker) should call the function that sends ETH");
      console.log(
        "💡 User B (resolver) should only trigger actions, not pay ETH"
      );
    }

    if (tx.value === 0n) {
      console.log("❌ ROOT CAUSE: No ETH payment included!");
      console.log(
        "💡 The transaction should include { value: ethAmount + safetyDeposit }"
      );
    }

    console.log("\n🔧 SOLUTION NEEDED:");
    console.log("1. User A should call the function that creates escrow");
    console.log("2. User A should send ETH as msg.value");
    console.log(
      "3. User B should only facilitate/trigger after User A has paid"
    );
  } catch (error) {
    console.log(`❌ Error analyzing transaction: ${error}`);
  }
}

analyzeUserAPayment().catch(console.error);
