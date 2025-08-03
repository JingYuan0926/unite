import { ethers } from "hardhat";

/**
 * Check User A's ETH balance to ensure they can pay for the swap
 */
async function checkUserABalance() {
  console.log("💰 CHECKING USER A ETH BALANCE");
  console.log("=".repeat(50));

  const provider = ethers.provider;

  // Get User A's address from private key
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY!;
  const userA = new ethers.Wallet(userAPrivateKey, provider);

  console.log(`👤 User A Address: ${userA.address}`);

  // Check current balance
  const balance = await provider.getBalance(userA.address);
  console.log(`💰 Current Balance: ${ethers.formatEther(balance)} ETH`);

  // Check if sufficient for swap
  const swapAmount = ethers.parseEther("0.001"); // 0.001 ETH
  const gasEstimate = ethers.parseEther("0.002"); // Estimated gas costs
  const requiredTotal = swapAmount + gasEstimate;

  console.log(`\n📊 SWAP REQUIREMENTS:`);
  console.log(`🔹 Swap Amount: ${ethers.formatEther(swapAmount)} ETH`);
  console.log(`🔹 Estimated Gas: ${ethers.formatEther(gasEstimate)} ETH`);
  console.log(`🔹 Total Required: ${ethers.formatEther(requiredTotal)} ETH`);

  if (balance >= requiredTotal) {
    console.log(`✅ SUFFICIENT: User A has enough ETH for the swap`);
  } else {
    console.log(`❌ INSUFFICIENT: User A needs more ETH`);
    const needed = requiredTotal - balance;
    console.log(`💸 Additional needed: ${ethers.formatEther(needed)} ETH`);
  }

  console.log(`\n🎯 CORRECTED FLOW VERIFICATION:`);
  console.log(
    `✅ User A will pay: ${ethers.formatEther(swapAmount)} ETH (main amount)`
  );
  console.log(`✅ User B will pay: Safety deposit only (~0.01 ETH)`);
  console.log(`✅ LOP will pull ETH from User A's wallet when order is filled`);
}

checkUserABalance().catch(console.error);
