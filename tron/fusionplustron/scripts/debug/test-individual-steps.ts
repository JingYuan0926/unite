#!/usr/bin/env ts-node

/**
 * Test individual steps of the deploySrc function to isolate the issue
 */

import { ethers } from "ethers";
import { ConfigManager } from "../../src/utils/ConfigManager";

async function testIndividualSteps() {
  const config = new ConfigManager();
  const provider = new ethers.JsonRpcProvider(config.ETH_RPC_URL);
  const signer = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  console.log("🔍 Testing individual steps of deploySrc function");
  console.log("================================================");

  // Test 1: Check if we can call the EscrowFactory to compute an address
  console.log("\n1. Testing EscrowFactory.addressOfEscrowSrc...");

  const factoryABI = [
    "function addressOfEscrowSrc((bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) view returns (address)",
  ];

  const factory = new ethers.Contract(
    config.OFFICIAL_ESCROW_FACTORY_ADDRESS,
    factoryABI,
    provider
  );

  // Create test immutables
  const testImmutables = {
    orderHash: ethers.randomBytes(32),
    hashlock: ethers.randomBytes(32),
    maker: signer.address,
    taker: signer.address,
    token: ethers.ZeroAddress,
    amount: ethers.parseEther("0.001"),
    safetyDeposit: ethers.parseEther("0.01"),
    timelocks: BigInt(
      "0x000000000000ce4000003840000012c00001c2000000e10000007080000025800000000"
    ),
  };

  try {
    const computedAddress = await factory.addressOfEscrowSrc(testImmutables);
    console.log("✅ EscrowFactory.addressOfEscrowSrc succeeded");
    console.log("   Computed address:", computedAddress);

    // Test 2: Check if the computed address can receive ETH
    console.log("\n2. Testing ETH transfer to computed address...");

    const code = await provider.getCode(computedAddress);
    console.log("   Contract code length:", code.length);
    console.log("   Is contract deployed:", code !== "0x");

    if (code === "0x") {
      console.log(
        "⚠️  Computed address has no contract code - this might be the issue!"
      );
    }
  } catch (error: any) {
    console.error("❌ EscrowFactory.addressOfEscrowSrc failed:", error.message);
  }

  // Test 3: Check LimitOrderProtocol separately
  console.log("\n3. Testing LimitOrderProtocol accessibility...");

  const lopABI = ["function owner() view returns (address)"];

  const lop = new ethers.Contract(
    config.OFFICIAL_LOP_ADDRESS,
    lopABI,
    provider
  );

  try {
    const lopOwner = await lop.owner();
    console.log("✅ LimitOrderProtocol accessible");
    console.log("   LOP owner:", lopOwner);
  } catch (error: any) {
    console.error("❌ LimitOrderProtocol access failed:", error.message);
  }

  console.log("\n🎯 Analysis complete");
}

testIndividualSteps().catch(console.error);
