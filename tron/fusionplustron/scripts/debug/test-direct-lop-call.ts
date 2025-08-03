import { ethers } from "hardhat";

/**
 * Test direct LOP.fillOrderArgs() call to isolate the validation issue
 */
async function testDirectLOPCall() {
  require("dotenv").config();

  console.log("🧪 TESTING DIRECT LOP CALL");
  console.log("=".repeat(40));

  const provider = ethers.provider;
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const userBPrivateKey = process.env.USER_B_ETH_PRIVATE_KEY;

  if (!userAPrivateKey || !userBPrivateKey) {
    throw new Error("Missing private keys in .env");
  }

  const userA = new ethers.Wallet(userAPrivateKey, provider);
  const userB = new ethers.Wallet(userBPrivateKey, provider);
  const demoResolverAddress = "0xf80c9EAAd4a37a3782ECE65df77BFA24614294fC";

  console.log(`👤 User A (Order Maker): ${userA.address}`);
  console.log(`👤 User B (Order Taker): ${userB.address}`);
  console.log(`🏭 DemoResolver: ${demoResolverAddress}`);

  // Get LOP contract
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  // Create a simple test order similar to what we're using
  const now = Math.floor(Date.now() / 1000);
  const ethAmount = ethers.parseEther("0.001");
  const trxAmount = ethers.parseEther("2"); // 1 ETH = 2000 TRX simplified

  // Test 1: Simple order without allowedSender restriction
  console.log("\n📝 TEST 1: Simple order without allowedSender");

  const simpleOrder = {
    salt: BigInt(Date.now()),
    maker: userA.address,
    receiver: userA.address,
    makerAsset: ethers.ZeroAddress, // ETH
    takerAsset: "0x74Fc932f869f088D2a9516AfAd239047bEb209BF", // MockTRX
    makingAmount: ethAmount,
    takingAmount: trxAmount,
    makerTraits: 0n, // No restrictions
  };

  // Create signature
  const domain = {
    name: "1inch Limit Order Protocol",
    version: "4",
    chainId: 11155111, // Sepolia
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

  const signature = await userA.signTypedData(domain, types, simpleOrder);
  const sig = ethers.Signature.from(signature);

  const orderArray = [
    simpleOrder.salt,
    simpleOrder.maker,
    simpleOrder.receiver,
    simpleOrder.makerAsset,
    simpleOrder.takerAsset,
    simpleOrder.makingAmount,
    simpleOrder.takingAmount,
    simpleOrder.makerTraits,
  ];

  try {
    // Try to call LOP.fillOrderArgs directly from User B (no value since it's ETH)
    console.log("📞 Calling LOP.fillOrderArgs() from User B...");

    const gasEstimate = await LOP.connect(userB).fillOrderArgs.estimateGas(
      orderArray,
      sig.r,
      sig.vs,
      ethAmount,
      0, // takerTraits
      "0x", // args
      { value: ethAmount }
    );

    console.log(`💰 Gas estimate: ${gasEstimate}`);
    console.log("✅ Simple LOP call should work!");
  } catch (error: any) {
    console.log("❌ Simple LOP call failed:");
    console.log(`Error: ${error.message}`);
    console.log(`Data: ${error.data}`);

    if (error.data === "0xa4f62a96") {
      console.log(
        "🎯 Same 0xa4f62a96 error! The issue is in basic LOP validation"
      );
    }
  }

  // Test 2: Order with allowedSender restriction
  console.log("\n📝 TEST 2: Order with DemoResolver allowedSender");

  const allowedSenderMask = (1n << 80n) - 1n;
  const encodedAllowedSender = BigInt(demoResolverAddress) & allowedSenderMask;

  const restrictedOrder = {
    ...simpleOrder,
    salt: BigInt(Date.now() + 1000),
    makerTraits: encodedAllowedSender, // Only DemoResolver can take
  };

  const restrictedSignature = await userA.signTypedData(
    domain,
    types,
    restrictedOrder
  );
  const restrictedSig = ethers.Signature.from(restrictedSignature);

  const restrictedOrderArray = [
    restrictedOrder.salt,
    restrictedOrder.maker,
    restrictedOrder.receiver,
    restrictedOrder.makerAsset,
    restrictedOrder.takerAsset,
    restrictedOrder.makingAmount,
    restrictedOrder.takingAmount,
    restrictedOrder.makerTraits,
  ];

  try {
    // This should fail when called by User B directly, but succeed when called by DemoResolver
    console.log("📞 Calling LOP.fillOrderArgs() from User B (should fail)...");

    const gasEstimate = await LOP.connect(userB).fillOrderArgs.estimateGas(
      restrictedOrderArray,
      restrictedSig.r,
      restrictedSig.vs,
      ethAmount,
      0, // takerTraits
      "0x", // args
      { value: ethAmount }
    );

    console.log("⚠️ This shouldn't succeed - User B is not allowed!");
  } catch (error: any) {
    console.log("✅ Expected failure - User B is not authorized");
    console.log(`Error data: ${error.data}`);

    if (error.data === "0xa4f62a96") {
      console.log("✅ Correct 0xa4f62a96 error for unauthorized caller");
    }
  }

  // Test 3: Check User A's current epoch
  console.log("\n📝 TEST 3: Check User A's current LOP epoch");

  try {
    const userAEpoch = await LOP.epoch(userA.address, 0);
    console.log(`📊 User A epoch: ${userAEpoch}`);

    // Try to see if there are any other series with different epochs
    for (let series = 0; series < 5; series++) {
      try {
        const epoch = await LOP.epoch(userA.address, series);
        if (epoch > 0) {
          console.log(`📊 User A epoch series ${series}: ${epoch}`);
        }
      } catch (e) {
        // Ignore series that don't exist
      }
    }
  } catch (error) {
    console.log(`❌ Could not read User A epoch: ${error}`);
  }
}

testDirectLOPCall().catch(console.error);
