import { ethers } from "hardhat";

/**
 * Fix the PrivateOrder error (0xa4f62a96) by ensuring proper allowedSender encoding
 */
async function fixPrivateOrderError() {
  require("dotenv").config();

  console.log("🎯 FIXING PRIVATE ORDER ERROR (0xa4f62a96)");
  console.log("=".repeat(50));

  const provider = ethers.provider;
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY!;
  const userBPrivateKey = process.env.USER_B_ETH_PRIVATE_KEY!;

  const userA = new ethers.Wallet(userAPrivateKey, provider);
  const userB = new ethers.Wallet(userBPrivateKey, provider);
  const demoResolverAddress = "0xf80c9EAAd4a37a3782ECE65df77BFA24614294fC";

  console.log(`👤 User A (Maker): ${userA.address}`);
  console.log(`👤 User B (Resolver Caller): ${userB.address}`);
  console.log(`🏭 DemoResolver (AllowedSender): ${demoResolverAddress}`);

  // Step 1: Verify allowedSender encoding
  console.log("\n📊 STEP 1: Verify allowedSender encoding");

  const allowedSenderMask = (1n << 80n) - 1n; // 0xFFFFFFFFFFFFFFFFFFFF (bottom 80 bits)
  const demoResolverBigInt = BigInt(demoResolverAddress);
  const encodedAllowedSender = demoResolverBigInt & allowedSenderMask;

  console.log(`🔍 DemoResolver as BigInt: ${demoResolverBigInt}`);
  console.log(`🔍 AllowedSender mask: 0x${allowedSenderMask.toString(16)}`);
  console.log(
    `🔍 Encoded allowedSender: 0x${encodedAllowedSender.toString(16)}`
  );
  console.log(
    `🔍 Encoded length (should be ≤ 80 bits): ${encodedAllowedSender.toString(2).length} bits`
  );

  // Verify the encoding works both ways - FIXED: Use proper address formatting
  const decodedAddress = ethers.getAddress(
    "0x" + encodedAllowedSender.toString(16).padStart(40, "0")
  );
  console.log(`✅ Decoded back to address: ${decodedAddress}`);
  console.log(
    `✅ Matches DemoResolver: ${decodedAddress.toLowerCase() === demoResolverAddress.toLowerCase()}`
  );

  // CRITICAL FIX: Check if we're losing the upper bits
  console.log(`🔍 Original address: ${demoResolverAddress}`);
  console.log(`🔍 Should be same: ${decodedAddress}`);

  if (decodedAddress.toLowerCase() !== demoResolverAddress.toLowerCase()) {
    console.log(
      "❌ ENCODING ISSUE DETECTED! Using full address instead of bottom 80 bits"
    );
    console.log(
      "💡 LOP might expect full address in makerTraits, not just bottom 80 bits"
    );
  }

  // Step 2: Create a proper order with allowedSender
  console.log("\n📝 STEP 2: Create order with proper allowedSender encoding");

  const ethAmount = ethers.parseEther("0.001");
  const trxAmount = ethers.parseEther("2"); // 1 ETH = 2000 TRX

  // 🎯 CRITICAL FIX: Try both encoding approaches
  const useFullAddress =
    decodedAddress.toLowerCase() !== demoResolverAddress.toLowerCase();
  const finalMakerTraits = useFullAddress
    ? BigInt(demoResolverAddress)
    : encodedAllowedSender;

  console.log(
    `🔧 Using ${useFullAddress ? "FULL ADDRESS" : "BOTTOM 80 BITS"} encoding`
  );
  console.log(`🔧 Final makerTraits: 0x${finalMakerTraits.toString(16)}`);

  const order = {
    salt: BigInt(Date.now()),
    maker: userA.address,
    receiver: userA.address,
    makerAsset: ethers.ZeroAddress, // ETH (what maker is giving)
    takerAsset: ethers.ZeroAddress, // 🎯 ETH-ONLY: Both assets are ETH for cross-chain
    makingAmount: ethAmount,
    takingAmount: 1n, // 🎯 MINIMAL: Avoid division by zero, minimal amount
    makerTraits: finalMakerTraits, // 🎯 CRITICAL: Only DemoResolver can take this order
  };

  console.log(`📋 Order details (ETH-ONLY for cross-chain):`);
  console.log(`  Salt: ${order.salt}`);
  console.log(`  Maker: ${order.maker}`);
  console.log(`  MakerAsset: ${order.makerAsset} (ETH)`);
  console.log(`  TakerAsset: ${order.takerAsset} (ETH-ONLY)`);
  console.log(`  MakingAmount: ${ethers.formatEther(order.makingAmount)} ETH`);
  console.log(
    `  TakingAmount: ${order.takingAmount} wei (minimal to avoid division by zero)`
  );
  console.log(
    `  MakerTraits: 0x${order.makerTraits.toString(16)} (allowedSender)`
  );

  // Step 3: Sign the order properly
  console.log("\n✍️ STEP 3: Sign order with proper EIP-712");

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

  // Calculate order hash
  const orderHash = ethers.TypedDataEncoder.hash(domain, types, order);
  console.log(`🔑 Order hash: ${orderHash}`);

  // Sign by User A (maker) - FIXED: Proper signature handling
  const signature = await userA.signTypedData(domain, types, order);
  const sig = ethers.Signature.from(signature);
  console.log(`📝 Signature r: ${sig.r}`);
  console.log(`📝 Signature s: ${sig.s}`);
  console.log(`📝 Signature v: ${sig.v}`);
  console.log(`📝 Signature vs: ${sig.yParityAndS}`);

  // Ensure we have valid signature components
  if (!sig.r || !sig.yParityAndS) {
    throw new Error("Invalid signature components");
  }

  // Step 4: Test the call pattern
  console.log("\n🧪 STEP 4: Test DemoResolver call pattern");

  // Get DemoResolver contract
  const DemoResolver = await ethers.getContractAt(
    "DemoResolver",
    demoResolverAddress
  );

  // Prepare call parameters exactly as in our orchestrator
  const immutables = [
    orderHash, // bytes32 orderHash
    ethers.keccak256(ethers.randomBytes(32)), // bytes32 hashlock (dummy)
    BigInt(userA.address), // uint256 maker
    BigInt(userB.address), // uint256 taker
    BigInt(ethers.ZeroAddress), // uint256 token (ETH)
    ethAmount, // uint256 amount
    ethers.parseEther("0.01"), // uint256 safetyDeposit
    BigInt(Math.floor(Date.now() / 1000)), // uint256 timelocks (simplified)
  ];

  const orderArray = [
    order.salt,
    order.maker,
    order.receiver,
    order.makerAsset,
    order.takerAsset,
    order.makingAmount,
    order.takingAmount,
    order.makerTraits,
  ];

  const totalValue = ethAmount + ethers.parseEther("0.01");

  console.log(`💰 Total value to send: ${ethers.formatEther(totalValue)} ETH`);
  console.log(`🏭 Calling from User B: ${userB.address}`);
  console.log(
    `🎯 DemoResolver should be authorized as: ${demoResolverAddress}`
  );

  try {
    // Estimate gas first
    console.log("\n💰 Estimating gas for DemoResolver.executeAtomicSwap...");
    const gasEstimate = await DemoResolver.connect(
      userB
    ).executeAtomicSwap.estimateGas(
      immutables,
      orderArray,
      sig.r,
      sig.yParityAndS,
      ethAmount,
      0, // takerTraits
      "0x", // args
      { value: totalValue }
    );

    console.log(`✅ Gas estimate successful: ${gasEstimate}`);
    console.log("🎉 PRIVATE ORDER ERROR SHOULD BE FIXED!");

    // Optionally execute the transaction
    console.log("\n🚀 Executing the actual transaction...");
    const tx = await DemoResolver.connect(userB).executeAtomicSwap(
      immutables,
      orderArray,
      sig.r,
      sig.yParityAndS,
      ethAmount,
      0, // takerTraits
      "0x", // args
      { value: totalValue }
    );

    console.log(`📝 Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Transaction successful! Block: ${receipt?.blockNumber}`);
  } catch (error: any) {
    console.log("\n❌ Error still persists:");
    console.log(`Error message: ${error.message}`);
    console.log(`Error data: ${error.data}`);

    if (error.data === "0xa4f62a96") {
      console.log("🚨 Still getting PrivateOrder error!");
      console.log("💡 Possible issues:");
      console.log("   1. makerTraits encoding might be wrong");
      console.log("   2. DemoResolver address might not match exactly");
      console.log("   3. LOP version/interface mismatch");
      console.log("   4. Order structure doesn't match LOP v4 expectations");
    }
  }
}

fixPrivateOrderError().catch(console.error);
