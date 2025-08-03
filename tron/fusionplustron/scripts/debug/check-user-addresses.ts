import { ethers } from "hardhat";

async function checkUserAddresses() {
  console.log("🔍 CHECKING USER ADDRESSES FROM PRIVATE KEYS");
  console.log("============================================");

  require("dotenv").config();

  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const userBPrivateKey = process.env.USER_B_ETH_PRIVATE_KEY;

  if (!userAPrivateKey || !userBPrivateKey) {
    console.error("❌ Missing private keys in .env");
    return;
  }

  const userA = new ethers.Wallet(userAPrivateKey);
  const userB = new ethers.Wallet(userBPrivateKey);

  console.log(`👤 User A Address: ${userA.address}`);
  console.log(`👤 User B Address: ${userB.address}`);

  // Check which one matches the transaction sender
  const txSender = "0xAe7C6fDB1d03E8bc73A32D2C8B7BafA057d30437";
  const testSender = "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F";

  console.log("\n🔍 ADDRESS MATCHING:");
  console.log(`Transaction sender: ${txSender}`);
  console.log(`Test output User B: ${testSender}`);
  console.log(
    `Matches User A: ${userA.address.toLowerCase() === txSender.toLowerCase()}`
  );
  console.log(
    `Matches User B: ${userB.address.toLowerCase() === txSender.toLowerCase()}`
  );

  // Check signers from hardhat
  const [deployer] = await ethers.getSigners();
  console.log(`\n🏗️ Hardhat deployer: ${deployer.address}`);
  console.log(
    `Matches tx sender: ${deployer.address.toLowerCase() === txSender.toLowerCase()}`
  );
  console.log(
    `Matches test User B: ${deployer.address.toLowerCase() === testSender.toLowerCase()}`
  );
}

checkUserAddresses().catch(console.error);
