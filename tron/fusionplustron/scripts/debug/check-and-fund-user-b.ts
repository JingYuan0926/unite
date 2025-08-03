import { ethers } from "hardhat";

/**
 * Check User B's ETH balance and fund if needed
 */
async function checkAndFundUserB() {
  require("dotenv").config();

  console.log("🔍 CHECKING USER B FUNDING STATUS");
  console.log("=".repeat(40));

  const userBPrivateKey = process.env.USER_B_ETH_PRIVATE_KEY;
  if (!userBPrivateKey) {
    throw new Error("USER_B_ETH_PRIVATE_KEY not found in .env");
  }

  const provider = ethers.provider;
  const userB = new ethers.Wallet(userBPrivateKey, provider);
  const [deployer] = await ethers.getSigners();

  console.log(`👤 User B Address: ${userB.address}`);
  console.log(`👤 Deployer Address: ${deployer.address}`);

  // Check balances
  const userBBalance = await provider.getBalance(userB.address);
  const deployerBalance = await provider.getBalance(deployer.address);

  console.log(`💰 User B Balance: ${ethers.formatEther(userBBalance)} ETH`);
  console.log(
    `💰 Deployer Balance: ${ethers.formatEther(deployerBalance)} ETH`
  );

  // Calculate required amount for swap
  const swapAmount = ethers.parseEther("0.001"); // 0.001 ETH swap
  const safetyDeposit = ethers.parseEther("0.01"); // 0.01 ETH safety deposit
  const gasBuffer = ethers.parseEther("0.005"); // 0.005 ETH for gas
  const requiredTotal = swapAmount + safetyDeposit + gasBuffer;

  console.log(`📊 Required for swap: ${ethers.formatEther(requiredTotal)} ETH`);

  if (userBBalance < requiredTotal) {
    console.log(
      `⚠️ User B needs funding! Deficit: ${ethers.formatEther(requiredTotal - userBBalance)} ETH`
    );

    if (deployerBalance > requiredTotal) {
      console.log(`💸 Funding User B from deployer...`);

      const fundingAmount =
        requiredTotal - userBBalance + ethers.parseEther("0.01"); // Add buffer

      const tx = await deployer.sendTransaction({
        to: userB.address,
        value: fundingAmount,
        gasLimit: 21000,
      });

      console.log(`📝 Funding transaction: ${tx.hash}`);
      await tx.wait();

      const newBalance = await provider.getBalance(userB.address);
      console.log(
        `✅ User B funded! New balance: ${ethers.formatEther(newBalance)} ETH`
      );
    } else {
      console.log(`❌ Deployer doesn't have enough ETH to fund User B`);
      console.log(`💡 Please fund the deployer or User B manually`);
    }
  } else {
    console.log(`✅ User B has sufficient funds for swap operations`);
  }
}

checkAndFundUserB().catch(console.error);
