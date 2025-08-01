#!/usr/bin/env ts-node

/**
 * Test with simple, known-good immutables values
 */

import { ethers } from "ethers";
import { ConfigManager } from "../../src/utils/ConfigManager";

async function testSimpleImmutables() {
  const config = new ConfigManager();
  const provider = new ethers.JsonRpcProvider(config.ETH_RPC_URL);
  const signer = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  console.log("🧪 Testing with simple, known-good immutables");
  console.log("==============================================");

  // Create simple timelocks - all 1 hour (3600 seconds)
  const simpleTimelocks =
    (BigInt(3600) << (BigInt(0) * BigInt(32))) | // srcWithdrawal
    (BigInt(7200) << (BigInt(1) * BigInt(32))) | // srcPublicWithdrawal
    (BigInt(10800) << (BigInt(2) * BigInt(32))) | // srcCancellation
    (BigInt(14400) << (BigInt(3) * BigInt(32))) | // srcPublicCancellation
    (BigInt(3600) << (BigInt(4) * BigInt(32))) | // dstWithdrawal
    (BigInt(7200) << (BigInt(5) * BigInt(32))) | // dstPublicWithdrawal
    (BigInt(10800) << (BigInt(6) * BigInt(32))); // dstCancellation

  console.log("Simple timelocks:", "0x" + simpleTimelocks.toString(16));

  // Create simple immutables
  const simpleImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("test-order-hash")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
    maker: signer.address,
    taker: signer.address,
    token: ethers.ZeroAddress, // ETH
    amount: ethers.parseEther("0.001"), // 0.001 ETH
    safetyDeposit: ethers.parseEther("0.01"), // 0.01 ETH
    timelocks: simpleTimelocks,
  };

  console.log("Simple immutables:", {
    orderHash: simpleImmutables.orderHash,
    hashlock: simpleImmutables.hashlock,
    maker: simpleImmutables.maker,
    taker: simpleImmutables.taker,
    token: simpleImmutables.token,
    amount: simpleImmutables.amount.toString(),
    safetyDeposit: simpleImmutables.safetyDeposit.toString(),
    timelocks: "0x" + simpleImmutables.timelocks.toString(16),
  });

  // Test with EscrowFactory
  const factoryABI = [
    "function addressOfEscrowSrc((bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) view returns (address)",
  ];

  const factory = new ethers.Contract(
    config.OFFICIAL_ESCROW_FACTORY_ADDRESS,
    factoryABI,
    provider
  );

  try {
    const computedAddress = await factory.addressOfEscrowSrc(simpleImmutables);
    console.log(
      "✅ EscrowFactory.addressOfEscrowSrc succeeded with simple values!"
    );
    console.log("   Computed address:", computedAddress);

    // Check if the computed address can receive ETH
    const code = await provider.getCode(computedAddress);
    console.log("   Contract code length:", code.length);
    console.log("   Is contract deployed:", code !== "0x");
  } catch (error: any) {
    console.error(
      "❌ EscrowFactory.addressOfEscrowSrc still failed:",
      error.message
    );
  }
}

testSimpleImmutables().catch(console.error);
