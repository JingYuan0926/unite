import { ethers } from "hardhat";

/**
 * Debug script to check if withdrawal is ready for the latest swap
 */
async function main() {
  // Latest swap details from the test output
  const ethEscrowAddress = "0x815569669bb76ff0e56187c281f73e69a7dc049d";
  const secret =
    "0x1f8768068e00cc7d41e605e2930c2874ffbebdc809ce3614e5b620370e39f31d";

  console.log("🔍 DEBUGGING WITHDRAWAL READINESS");
  console.log("================================");

  const provider = ethers.provider;
  const [signer] = await ethers.getSigners();

  // Get current block timestamp
  const currentBlock = await provider.getBlock("latest");
  const currentTime = currentBlock?.timestamp || 0;
  console.log(`⏰ Current block time: ${currentTime}`);
  console.log(
    `⏰ Human readable: ${new Date(currentTime * 1000).toISOString()}`
  );

  // Check escrow balance
  const balance = await provider.getBalance(ethEscrowAddress);
  console.log(`💰 Escrow balance: ${ethers.formatEther(balance)} ETH`);

  // Try to call the escrow contract to check deployment time
  const escrowABI = [
    "function FACTORY() view returns (address)",
    "function withdraw(bytes32 secret, tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  ];

  const escrowContract = new ethers.Contract(
    ethEscrowAddress,
    escrowABI,
    signer
  );

  try {
    const factory = await escrowContract.FACTORY();
    console.log(`🏭 Factory address: ${factory}`);
  } catch (error) {
    console.log(`❌ Could not get factory: ${error}`);
  }

  // Check the TimelocksLib to decode timelocks
  console.log(
    "\n🔍 To check withdrawal window, we need the deployment timestamp from the contract"
  );
  console.log("The withdrawal window opens at: deployedAt + 60 seconds");
  console.log(
    "Current strategy: Wait longer and ensure proper timelock encoding"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
