import { ethers } from "hardhat";
import { readFileSync } from "fs";

async function main() {
  console.log("🔓 Approving MockTRX for LOP contract...");

  // Read deployment file to get addresses
  const deployment = JSON.parse(
    readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
  );
  const mockTRXAddress = deployment.contracts.MockTRX;
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0"; // Official LOP contract

  if (!mockTRXAddress) {
    throw new Error("MockTRX address not found in deployment file");
  }

  console.log("📋 MockTRX Address:", mockTRXAddress);
  console.log("📋 LOP Address:", lopAddress);

  // User B's address (who needs to approve)
  const userBAddress = process.env.USER_B_ETH_RECEIVE_ADDRESS;
  if (!userBAddress) {
    throw new Error("USER_B_ETH_RECEIVE_ADDRESS not found in .env file");
  }
  console.log("📋 User B Address:", userBAddress);

  // Get User B's private key to create signer
  const userBPrivateKey = process.env.USER_B_ETH_PRIVATE_KEY;
  if (!userBPrivateKey) {
    throw new Error("USER_B_ETH_PRIVATE_KEY not found in .env file");
  }

  // Create User B signer
  const provider = ethers.provider;
  const userBSigner = new ethers.Wallet(userBPrivateKey, provider);
  console.log(
    "💰 User B Balance:",
    ethers.formatEther(await provider.getBalance(userBAddress)),
    "ETH"
  );

  // Get MockTRX contract
  const MockTRX = await ethers.getContractFactory("MockTRX");
  const mockTRX = MockTRX.attach(mockTRXAddress);

  // Check current allowance
  const currentAllowance = await mockTRX.allowance(userBAddress, lopAddress);
  console.log(
    "🔍 Current Allowance:",
    ethers.formatEther(currentAllowance),
    "MockTRX"
  );

  if (currentAllowance > 0) {
    console.log("✅ LOP already has approval to spend MockTRX");
  } else {
    // Approve maximum amount
    const approvalAmount = ethers.MaxUint256;
    console.log("🔓 Approving LOP to spend unlimited MockTRX...");

    const approveTx = await mockTRX
      .connect(userBSigner)
      .approve(lopAddress, approvalAmount);
    await approveTx.wait();

    console.log("✅ Approval transaction successful!");
    console.log("📋 Transaction:", approveTx.hash);

    // Verify approval
    const newAllowance = await mockTRX.allowance(userBAddress, lopAddress);
    console.log("🔍 New Allowance:", newAllowance.toString());
  }

  // Check User B's MockTRX balance
  const userBBalance = await mockTRX.balanceOf(userBAddress);
  console.log(
    "💰 User B MockTRX Balance:",
    ethers.formatEther(userBBalance),
    "MockTRX"
  );

  console.log("\n🎉 MockTRX approval complete!");
  console.log("📋 LOP can now spend MockTRX on behalf of User B");
}

main().catch(console.error);
