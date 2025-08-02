import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing EscrowFactory directly...");

  // Read deployment addresses
  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const escrowFactoryAddress = deployment.contracts.EscrowFactory;

  console.log("📋 EscrowFactory Address:", escrowFactoryAddress);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("📋 Signer Address:", signer.address);

  try {
    // Use minimal EscrowFactory ABI for testing
    const escrowFactoryABI = [
      "function addressOfEscrowSrc(tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) external view returns (address)",
      "function addressOfEscrowDst(tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) external view returns (address)",
      "function ESCROW_SRC_IMPLEMENTATION() external view returns (address)",
      "function ESCROW_DST_IMPLEMENTATION() external view returns (address)",
    ];

    const escrowFactory = new ethers.Contract(
      escrowFactoryAddress,
      escrowFactoryABI,
      signer
    );

    // Test basic calls first
    console.log("\n🔍 Step 1: Testing basic EscrowFactory calls...");
    const srcImplementation = await escrowFactory.ESCROW_SRC_IMPLEMENTATION();
    const dstImplementation = await escrowFactory.ESCROW_DST_IMPLEMENTATION();

    console.log("✅ SRC Implementation:", srcImplementation);
    console.log("✅ DST Implementation:", dstImplementation);

    // Test addressOfEscrowSrc with different immutables formats
    console.log(
      "\n🔍 Step 2: Testing addressOfEscrowSrc with different formats..."
    );

    // Format 1: Using BigInt for addresses (as I was doing)
    const immutables1 = {
      orderHash: ethers.ZeroHash,
      hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
      maker: BigInt(signer.address),
      taker: BigInt(escrowFactoryAddress),
      token: 0n,
      amount: ethers.parseEther("0.001"),
      safetyDeposit: ethers.parseEther("0.001"),
      timelocks: 0,
    };

    try {
      const address1 = await escrowFactory.addressOfEscrowSrc(immutables1);
      console.log("✅ Format 1 (BigInt addresses) works:", address1);
    } catch (error: any) {
      console.log("❌ Format 1 (BigInt addresses) failed:");
      console.log("   Error:", error.message);
      if (error.data) {
        console.log("   Error Data:", error.data);
      }
    }

    // Format 2: Using string addresses directly
    const immutables2 = {
      orderHash: ethers.ZeroHash,
      hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
      maker: signer.address,
      taker: escrowFactoryAddress,
      token: ethers.ZeroAddress,
      amount: ethers.parseEther("0.001"),
      safetyDeposit: ethers.parseEther("0.001"),
      timelocks: 0,
    };

    try {
      const address2 = await escrowFactory.addressOfEscrowSrc(immutables2);
      console.log("✅ Format 2 (string addresses) works:", address2);
    } catch (error: any) {
      console.log("❌ Format 2 (string addresses) failed:");
      console.log("   Error:", error.message);
      if (error.data) {
        console.log("   Error Data:", error.data);
      }
    }

    // Format 3: Using array format (tuple as array)
    const immutables3 = [
      ethers.ZeroHash, // orderHash
      ethers.keccak256(ethers.toUtf8Bytes("test-secret")), // hashlock
      BigInt(signer.address), // maker
      BigInt(escrowFactoryAddress), // taker
      0n, // token
      ethers.parseEther("0.001"), // amount
      ethers.parseEther("0.001"), // safetyDeposit
      0, // timelocks
    ];

    try {
      const address3 = await escrowFactory.addressOfEscrowSrc(immutables3);
      console.log("✅ Format 3 (array format) works:", address3);
    } catch (error: any) {
      console.log("❌ Format 3 (array format) failed:");
      console.log("   Error:", error.message);
      if (error.data) {
        console.log("   Error Data:", error.data);
      }
    }
  } catch (error: any) {
    console.error("❌ EscrowFactory test failed:", error.message);
  }
}

main().catch(console.error);
