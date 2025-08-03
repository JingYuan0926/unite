import { ethers } from "hardhat";
import { readFileSync } from "fs";

async function main() {
  console.log("🪙 Minting MockTRX tokens to User B...");

  // Read deployment file to get MockTRX address
  const deployment = JSON.parse(
    readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
  );
  const mockTRXAddress = deployment.contracts.MockTRX;

  if (!mockTRXAddress) {
    throw new Error("MockTRX address not found in deployment file");
  }

  console.log("📋 MockTRX Address:", mockTRXAddress);

  // Get deployer (who has minting permissions)
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployer Address:", deployer.address);

  // User B's address (from env file)
  const userBAddress = process.env.USER_B_ETH_RECEIVE_ADDRESS;
  if (!userBAddress) {
    throw new Error("USER_B_ETH_RECEIVE_ADDRESS not found in .env file");
  }
  console.log("📋 User B Address:", userBAddress);

  // Get MockTRX contract
  const MockTRX = await ethers.getContractFactory("MockTRX");
  const mockTRX = MockTRX.attach(mockTRXAddress);

  // Amount to mint (equivalent to test swap amounts)
  const mintAmount = ethers.parseEther("1000"); // 1000 MockTRX for testing

  console.log(
    `🪙 Minting ${ethers.formatEther(mintAmount)} MockTRX to User B...`
  );

  // Mint tokens to User B
  const tx = await mockTRX.mint(userBAddress, mintAmount);
  await tx.wait();

  console.log("✅ MockTRX minted successfully!");
  console.log("📋 Transaction:", tx.hash);

  // Check balances
  const userBBalance = await mockTRX.balanceOf(userBAddress);
  const deployerBalance = await mockTRX.balanceOf(deployer.address);

  console.log("\n💰 Final Balances:");
  console.log(`   User B: ${ethers.formatEther(userBBalance)} MockTRX`);
  console.log(`   Deployer: ${ethers.formatEther(deployerBalance)} MockTRX`);

  console.log("\n🎉 MockTRX minting complete!");
  console.log("📋 User B now has MockTRX tokens to fill orders with");
}

main().catch(console.error);
