import { ethers } from "hardhat";

/**
 * Debug the LOP order structure to see if it's correct
 */
async function debugLOPOrderStructure() {
  console.log("🔍 DEBUGGING LOP ORDER STRUCTURE");
  console.log("=".repeat(50));

  const provider = ethers.provider;

  // Get the failed transaction
  const failedTx =
    "0xd6ed1efea4bf4e6cfd36bb1914e0c4c73c97fdf1522941e5f8873b5128ae5fd3";

  try {
    const tx = await provider.getTransaction(failedTx);

    if (!tx || !tx.data) {
      console.log("❌ Transaction not found or no data");
      return;
    }

    console.log("📊 TRANSACTION ANALYSIS:");
    console.log(`🔹 From: ${tx.from} (User B)`);
    console.log(`🔹 To: ${tx.to} (DemoResolver)`);
    console.log(
      `🔹 Value: ${ethers.formatEther(tx.value)} ETH (safety deposit)`
    );

    // Decode the function call
    const functionSelector = tx.data.slice(0, 10);
    console.log(`🔹 Function: ${functionSelector} (executeAtomicSwap)`);

    // Get User A's address to check their balance
    const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY!;
    const userA = new ethers.Wallet(userAPrivateKey, provider);

    console.log("\n👤 USER A ANALYSIS:");
    console.log(`🔹 Address: ${userA.address}`);

    const userABalance = await provider.getBalance(userA.address);
    console.log(`🔹 ETH Balance: ${ethers.formatEther(userABalance)} ETH`);

    const swapAmount = ethers.parseEther("0.001");
    console.log(`🔹 Swap Amount: ${ethers.formatEther(swapAmount)} ETH`);

    if (userABalance >= swapAmount) {
      console.log("✅ User A has sufficient ETH for the swap");
    } else {
      console.log("❌ User A has insufficient ETH for the swap");
    }

    // Check if the issue is with the order structure
    console.log("\n🎯 POSSIBLE ISSUES:");
    console.log("1. ❓ Order structure might be malformed");
    console.log("2. ❓ AllowedSender encoding might still be wrong");
    console.log("3. ❓ LOP might not be able to pull ETH from User A");
    console.log("4. ❓ Order signature might be invalid");

    console.log("\n💡 DEBUGGING SUGGESTIONS:");
    console.log("1. Check if User A's order signature is valid");
    console.log("2. Verify the allowedSender is correctly encoded");
    console.log("3. Test a simple LOP order without the resolver");
    console.log("4. Check if the order has expired");
  } catch (error) {
    console.log(`❌ Error analyzing transaction: ${error}`);
  }
}

debugLOPOrderStructure().catch(console.error);
