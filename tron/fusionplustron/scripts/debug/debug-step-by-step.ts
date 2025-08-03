import { ethers } from "hardhat";
import { DemoResolver__factory } from "../../typechain-types";

/**
 * 🔍 DEBUG STEP BY STEP
 *
 * This script tests each part of the DemoResolver.executeAtomicSwap logic individually
 */

async function main() {
  console.log("🔍 DEBUGGING STEP BY STEP");
  console.log("=".repeat(50));

  require("dotenv").config();

  const provider = ethers.provider;
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);

  const demoResolverAddress = "0x8E46D1688aCeF18Cae7b2af9C0e4f8dF7d9B6A7B";
  const escrowFactoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";

  console.log("📋 Configuration:");
  console.log(`  User A: ${userA.address}`);
  console.log(`  DemoResolver: ${demoResolverAddress}`);
  console.log(`  EscrowFactory: ${escrowFactoryAddress}`);

  // Get contract instances
  const DemoResolver = DemoResolver__factory.connect(
    demoResolverAddress,
    userA
  );
  const EscrowFactory = await ethers.getContractAt(
    "BaseEscrowFactory",
    escrowFactoryAddress
  );

  // Create test parameters
  const testSecret = ethers.hexlify(ethers.randomBytes(32));
  const testSecretHash = ethers.keccak256(testSecret);
  const testOrderHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

  const now = Math.floor(Date.now() / 1000);
  const timelocks =
    (BigInt(now) << BigInt(192)) | // deployedAt (64 bits at position 192)
    (BigInt(now + 600) << BigInt(128)) | // srcWithdrawal (64 bits at position 128)
    (BigInt(now + 3600) << BigInt(64)) | // srcCancellation (64 bits at position 64)
    (BigInt(now + 300) << BigInt(0)); // dstWithdrawal (64 bits at position 0)

  const immutables = [
    testOrderHash, // orderHash
    testSecretHash, // hashlock
    ethers.toBigInt(userA.address), // maker (encoded as uint256)
    ethers.toBigInt(userA.address), // taker (encoded as uint256)
    ethers.toBigInt(ethers.ZeroAddress), // token (ETH)
    ethers.parseEther("0.001"), // amount
    ethers.parseEther("0.001"), // safetyDeposit
    timelocks, // properly encoded timelocks
  ];

  const amount = ethers.parseEther("0.001");
  const safetyDeposit = ethers.parseEther("0.001");
  const totalValue = amount + safetyDeposit;

  console.log("\n🧪 STEP 1: Test EscrowFactory.addressOfEscrowSrc()");
  try {
    const computedAddress = await EscrowFactory.addressOfEscrowSrc(immutables);
    console.log(`  ✅ Computed escrow address: ${computedAddress}`);

    // Check if address has code
    const code = await provider.getCode(computedAddress);
    console.log(`  📋 Address code length: ${code.length - 2} bytes (${code})`);

    if (code === "0x") {
      console.log(
        "  📝 Address has no code (expected for pre-computed address)"
      );
    } else {
      console.log("  ⚠️ Address already has code!");
    }
  } catch (error: any) {
    console.log(`  ❌ addressOfEscrowSrc failed: ${error.message}`);
    return;
  }

  console.log("\n🧪 STEP 2: Test sending ETH to computed address");
  try {
    // Get computed address
    const computedAddress = await EscrowFactory.addressOfEscrowSrc(immutables);

    // Check balance before
    const balanceBefore = await provider.getBalance(computedAddress);
    console.log(
      `  📊 Balance before: ${ethers.formatEther(balanceBefore)} ETH`
    );

    // Try to send ETH directly (simulating line 81 in DemoResolver)
    const tx = await userA.sendTransaction({
      to: computedAddress,
      value: safetyDeposit,
      gasLimit: 100000,
    });
    await tx.wait();

    const balanceAfter = await provider.getBalance(computedAddress);
    console.log(
      `  ✅ Successfully sent ETH! Balance after: ${ethers.formatEther(balanceAfter)} ETH`
    );
  } catch (error: any) {
    console.log(`  ❌ Sending ETH failed: ${error.message}`);
    console.log(`  📋 This might be the root cause of the DemoResolver revert`);
  }

  console.log(
    "\n🧪 STEP 3: Test value validation (msg.value == amount + safetyDeposit)"
  );

  // Test different value scenarios
  const testValues = [
    { name: "Correct value", value: totalValue },
    { name: "Too little", value: totalValue - 1n },
    { name: "Too much", value: totalValue + 1n },
    { name: "Zero", value: 0n },
    { name: "Only amount", value: amount },
    { name: "Only safety deposit", value: safetyDeposit },
  ];

  for (const testCase of testValues) {
    console.log(
      `  🧪 Testing ${testCase.name}: ${ethers.formatEther(testCase.value)} ETH`
    );

    // This tests the first require statement in executeAtomicSwap
    const expectedSuccess = testCase.value === totalValue;

    if (expectedSuccess) {
      console.log(
        `    ✅ Should pass (${ethers.formatEther(testCase.value)} == ${ethers.formatEther(totalValue)})`
      );
    } else {
      console.log(
        `    ❌ Should fail (${ethers.formatEther(testCase.value)} != ${ethers.formatEther(totalValue)})`
      );
    }
  }

  console.log("\n🧪 STEP 4: Test minimal LOP order creation");

  // Create a minimal order that should be valid
  const order = [
    BigInt(Date.now()), // salt
    userA.address, // maker
    userA.address, // receiver
    ethers.ZeroAddress, // makerAsset (ETH)
    "0x74Fc932f869f088D2a9516AfAd239047bEb209BF", // takerAsset (MockTRX)
    amount, // makingAmount
    ethers.parseEther("2"), // takingAmount (2 TRX for 0.001 ETH)
    0n, // makerTraits
  ];

  console.log("  📋 Order details:");
  console.log(`    Maker: ${order[1]}`);
  console.log(`    Making: ${ethers.formatEther(order[5])} ETH`);
  console.log(`    Taking: ${ethers.formatEther(order[6])} TRX`);
  console.log(`    Maker Asset: ${order[3]}`);
  console.log(`    Taker Asset: ${order[4]}`);

  console.log("\n🧪 STEP 5: Test if the issue is in LOP integration");

  try {
    const { LimitOrderProtocol__factory } = await import(
      "../../typechain-types"
    );
    const LOP = LimitOrderProtocol__factory.connect(
      "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0",
      userA
    );

    // Check if we can call LOP functions
    const lopEpoch = await LOP.epoch(userA.address, 0);
    console.log(`  ✅ LOP accessible, user epoch: ${lopEpoch}`);

    // Test order hash calculation
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111, // Sepolia
      verifyingContract: "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0",
    };

    const types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" },
      ],
    };

    const orderStruct = {
      salt: order[0],
      maker: order[1],
      receiver: order[2],
      makerAsset: order[3],
      takerAsset: order[4],
      makingAmount: order[5],
      takingAmount: order[6],
      makerTraits: order[7],
    };

    const orderHash = ethers.TypedDataEncoder.hash(domain, types, orderStruct);
    console.log(`  ✅ Order hash calculated: ${orderHash}`);
  } catch (error: any) {
    console.log(`  ❌ LOP integration test failed: ${error.message}`);
  }

  console.log("\n🎯 ANALYSIS COMPLETE");
  console.log(
    "Review the step-by-step results to identify the exact failure point"
  );
}

main().catch(console.error);
