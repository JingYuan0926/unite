import { ethers } from "hardhat";

async function main() {
  console.log(
    "🔍 Deep Order Validity Check - Investigating Post-Allowance Error"
  );
  console.log(
    "Error 0xa4f62a96 persists after fixing allowance - checking order state\n"
  );

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  const [signer] = await ethers.getSigners();
  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  console.log("📋 Configuration:");
  console.log("  Signer:", signer.address);
  console.log("  LOP Address:", lopAddress);

  // Step 1: Check account invalidation state
  console.log("\n🔍 Step 1: Account Invalidation State Analysis");

  try {
    // Check bit invalidator for different slots
    for (let slot = 0; slot < 5; slot++) {
      const invalidatorState = await LOP.bitInvalidatorForOrder(
        signer.address,
        slot
      );
      console.log(`  Bit Invalidator Slot ${slot}: ${invalidatorState}`);

      if (invalidatorState !== 0n) {
        console.log(`    ⚠️ Slot ${slot} has invalidated orders!`);
      }
    }
  } catch (error: any) {
    console.log("  ❌ Could not check bit invalidators:", error.message);
  }

  // Step 2: Try different order configurations
  console.log("\n🔍 Step 2: Testing Different Order Configurations");

  const baseOrder = {
    maker: signer.address,
    receiver: signer.address,
    makerAsset: ethers.ZeroAddress, // ETH
    takerAsset: mockTrxAddress, // MockTRX
    makingAmount: ethers.parseEther("0.001"),
    takingAmount: ethers.parseEther("1"),
  };

  const domain = {
    name: "1inch Limit Order Protocol",
    version: "4",
    chainId: 11155111,
    verifyingContract: lopAddress,
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

  // Test different makerTraits configurations
  const traitsToTest = [
    { value: 0, description: "No traits (default)" },
    { value: 1, description: "Allow partial fills" },
    { value: 256, description: "Different nonce/epoch base" },
    { value: 512, description: "Higher nonce/epoch" },
  ];

  for (const traits of traitsToTest) {
    console.log(
      `\n  🧪 Testing makerTraits: ${traits.value} (${traits.description})`
    );

    const testOrder = {
      ...baseOrder,
      salt: BigInt(Date.now() + Math.random() * 10000), // Unique salt
      makerTraits: traits.value,
    };

    try {
      // Check if order can be hashed
      const orderHash = await LOP.hashOrder(testOrder);
      console.log(`    Order Hash: ${orderHash.slice(0, 10)}...`);

      // Check remaining invalidator
      const remaining = await LOP.remainingInvalidatorForOrder(
        signer.address,
        orderHash
      );
      console.log(`    Remaining Amount: ${remaining}`);

      if (remaining > 0) {
        console.log(`    ⚠️ Order already has remaining amount: ${remaining}`);
      }

      // Create signature
      const signature = await signer.signTypedData(domain, types, testOrder);
      const sig = ethers.Signature.from(signature);

      // Test gas estimation
      const gasEstimate = await LOP.fillOrderArgs.estimateGas(
        testOrder,
        sig.r,
        sig.yParityAndS,
        testOrder.makingAmount,
        0, // takerTraits = 0
        "0x", // empty args
        { value: testOrder.makingAmount }
      );

      console.log(`    ✅ SUCCESS! Gas: ${gasEstimate.toString()}`);
      console.log(`    🎉 This makerTraits configuration works!`);
      break; // Found working configuration
    } catch (error: any) {
      console.log(`    ❌ Failed: ${error.message}`);
      if (error.data) {
        console.log(`    Error data: ${error.data}`);
      }
    }
  }

  // Step 3: Check if it's a signature issue
  console.log("\n🔍 Step 3: Signature Validation Deep Check");

  const workingOrder = {
    ...baseOrder,
    salt: BigInt(Date.now()),
    makerTraits: 0,
  };

  try {
    // Test order hash calculation
    const orderHash = await LOP.hashOrder(workingOrder);
    console.log(`  Order Hash: ${orderHash}`);

    // Create signature
    const signature = await signer.signTypedData(domain, types, workingOrder);
    console.log(`  Signature: ${signature}`);

    const sig = ethers.Signature.from(signature);
    console.log(`  r: ${sig.r}`);
    console.log(`  s: ${sig.s}`);
    console.log(`  v: ${sig.v}`);
    console.log(`  yParityAndS: ${sig.yParityAndS}`);

    // Manual signature verification using ECDSA recovery
    const recoveredAddress = ethers.verifyTypedData(
      domain,
      types,
      workingOrder,
      signature
    );
    console.log(`  Recovered Address: ${recoveredAddress}`);
    console.log(`  Maker Address: ${signer.address}`);
    console.log(
      `  Signature Valid: ${recoveredAddress.toLowerCase() === signer.address.toLowerCase() ? "✅ YES" : "❌ NO"}`
    );
  } catch (error: any) {
    console.log("  ❌ Signature validation failed:", error.message);
  }

  // Step 4: Check if it's a domain/chainId issue
  console.log("\n🔍 Step 4: Domain and Chain Validation");

  try {
    const contractDomain = await LOP.DOMAIN_SEPARATOR();
    console.log(`  Contract Domain Separator: ${contractDomain}`);

    // Calculate expected domain separator
    const expectedDomain = ethers.TypedDataEncoder.hashDomain(domain);
    console.log(`  Expected Domain Separator: ${expectedDomain}`);
    console.log(
      `  Domain Match: ${contractDomain === expectedDomain ? "✅ YES" : "❌ NO"}`
    );

    if (contractDomain !== expectedDomain) {
      console.log("  🚨 Domain mismatch detected!");
      console.log(
        "  This could be the cause of the signature validation failure"
      );
    }
  } catch (error: any) {
    console.log("  ❌ Domain check failed:", error.message);
  }

  // Step 5: Try with a different receiver
  console.log("\n🔍 Step 5: Testing with Different Receiver");

  try {
    const differentReceiverOrder = {
      ...baseOrder,
      salt: BigInt(Date.now()),
      receiver: ethers.ZeroAddress, // Use zero address as receiver
      makerTraits: 0,
    };

    const signature = await signer.signTypedData(
      domain,
      types,
      differentReceiverOrder
    );
    const sig = ethers.Signature.from(signature);

    const gasEstimate = await LOP.fillOrderArgs.estimateGas(
      differentReceiverOrder,
      sig.r,
      sig.yParityAndS,
      differentReceiverOrder.makingAmount,
      0,
      "0x",
      { value: differentReceiverOrder.makingAmount }
    );

    console.log(
      "  ✅ SUCCESS with zero receiver! Gas:",
      gasEstimate.toString()
    );
  } catch (error: any) {
    console.log("  ❌ Zero receiver also failed:", error.message);
    console.log("  Error data:", error.data);
  }

  console.log("\n📋 Analysis Summary:");
  console.log("The error 0xa4f62a96 persists despite:");
  console.log("- ✅ Proper MockTRX allowance");
  console.log("- ✅ Valid EIP-712 signatures");
  console.log("- ✅ LOP contract not paused");
  console.log("- ✅ Sufficient ETH and MockTRX balances");
  console.log("\n💡 Remaining possibilities:");
  console.log("1. Account has invalidated nonce/epoch state");
  console.log("2. Domain separator mismatch");
  console.log("3. LOP v4 specific validation we haven't identified");
  console.log("4. Contract interaction restrictions");
}

main().catch(console.error);
