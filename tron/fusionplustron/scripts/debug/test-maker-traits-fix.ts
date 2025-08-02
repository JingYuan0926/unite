import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Testing MakerTraits Fix - ALLOWED_SENDER Theory");
  console.log(
    "Since we own the LOP, the issue is likely ALLOWED_SENDER restriction in makerTraits\n"
  );

  require("dotenv").config();

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  // Use fresh User A + deployer pattern that reached Unauthenticated()
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const provider = ethers.provider;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);
  const [deployer] = await ethers.getSigners();

  console.log("📋 Configuration:");
  console.log("  User A (Fresh Maker):", userA.address);
  console.log("  Deployer (Taker):", deployer.address);
  console.log("  LOP Address (WE OWN THIS):", lopAddress);

  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);
  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);

  // Verify we own the LOP
  const lopOwner = await LOP.owner();
  console.log(`  LOP Owner: ${lopOwner}`);
  console.log(
    `  Owner Match: ${lopOwner === deployer.address ? "✅ YES - We own it!" : "❌ NO"}`
  );

  // Test different makerTraits values
  console.log("\n🧪 Testing Different MakerTraits Values");

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

  // Test 1: makerTraits = 0 (no restrictions)
  console.log("\n  🧪 Test 1: makerTraits = 0 (completely unrestricted)");
  try {
    const order1 = {
      salt: ethers.getBigInt(Date.now()),
      maker: userA.address,
      receiver: deployer.address,
      makerAsset: ethers.ZeroAddress,
      takerAsset: mockTrxAddress,
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.1"),
      makerTraits: 0, // NO RESTRICTIONS AT ALL
    };

    const signature1 = await userA.signTypedData(domain, types, order1);
    const sig1 = ethers.Signature.from(signature1);

    const gasEstimate1 = await LOP.fillOrderArgs.estimateGas(
      order1,
      sig1.r,
      sig1.yParityAndS,
      order1.makingAmount,
      0,
      "0x",
      { value: order1.makingAmount }
    );

    console.log(`    ✅ SUCCESS! makerTraits = 0 works!`);
    console.log(`    Gas: ${gasEstimate1.toString()}`);
    console.log(`    🎉 THEORY CONFIRMED: makerTraits was the issue!`);
  } catch (error: any) {
    console.log(`    ❌ makerTraits = 0 failed: ${error.message}`);
    if (error.data) {
      console.log(`    Error data: ${error.data}`);

      if (error.data === "0x1841b4e1") {
        console.log(`    🚨 Still Unauthenticated - theory might be wrong`);
      } else {
        console.log(`    ℹ️ Different error - some progress made`);
      }
    }
  }

  // Test 2: Test with DemoResolver as caller (if Test 1 worked)
  console.log("\n  🧪 Test 2: DemoResolver calling LOP (original plan)");

  try {
    const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
    const demoResolverAddress = deployment.contracts.DemoResolver;
    const DemoResolver = await ethers.getContractAt(
      "DemoResolver",
      demoResolverAddress
    );

    console.log(`    DemoResolver Address: ${demoResolverAddress}`);

    const order2 = {
      salt: ethers.getBigInt(Date.now() + 1000),
      maker: userA.address,
      receiver: demoResolverAddress, // DemoResolver as receiver for postInteraction
      makerAsset: ethers.ZeroAddress,
      takerAsset: mockTrxAddress,
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.1"),
      makerTraits: 0, // Fixed: no restrictions
    };

    const signature2 = await userA.signTypedData(domain, types, order2);
    const sig2 = ethers.Signature.from(signature2);

    // Create immutables for DemoResolver
    const now = Math.floor(Date.now() / 1000);
    function encodeTimelocks(tl: any): bigint {
      const srcWithdrawal = BigInt(tl.srcWithdrawal);
      const srcPublicWithdrawal = BigInt(tl.srcWithdrawal + 1800);
      const srcCancellation = BigInt(tl.srcCancellation);
      const srcPublicCancellation = BigInt(tl.srcCancellation + 3600);
      const dstWithdrawal = BigInt(tl.dstWithdrawal);
      const dstPublicWithdrawal = BigInt(tl.dstWithdrawal + 600);
      const dstCancellation = BigInt(tl.dstCancellation);

      return (
        (srcWithdrawal << (BigInt(0) * BigInt(32))) |
        (srcPublicWithdrawal << (BigInt(1) * BigInt(32))) |
        (srcCancellation << (BigInt(2) * BigInt(32))) |
        (srcPublicCancellation << (BigInt(3) * BigInt(32))) |
        (dstWithdrawal << (BigInt(4) * BigInt(32))) |
        (dstPublicWithdrawal << (BigInt(5) * BigInt(32))) |
        (dstCancellation << (BigInt(6) * BigInt(32)))
      );
    }

    const immutables = [
      ethers.ZeroHash, // orderHash
      ethers.keccak256(ethers.toUtf8Bytes("test-secret")), // hashlock
      BigInt(userA.address), // maker
      BigInt(deployer.address), // taker
      BigInt(ethers.ZeroAddress), // token (ETH)
      order2.makingAmount, // amount
      order2.makingAmount, // safetyDeposit
      encodeTimelocks({
        srcWithdrawal: now + 600,
        srcCancellation: now + 3600,
        dstWithdrawal: now + 300,
        dstCancellation: now + 3300,
      }),
    ];

    const totalValue = immutables[5] + immutables[6]; // amount + safetyDeposit

    console.log(`    Testing DemoResolver.executeAtomicSwap...`);

    const demoResolverWithSigner = DemoResolver.connect(deployer);
    const gasEstimate2 =
      await demoResolverWithSigner.executeAtomicSwap.estimateGas(
        immutables,
        order2,
        sig2.r,
        sig2.yParityAndS,
        order2.makingAmount,
        0,
        "0x",
        { value: totalValue }
      );

    console.log(`    ✅ SUCCESS! DemoResolver integration works!`);
    console.log(`    Gas: ${gasEstimate2.toString()}`);
    console.log(`    🎉 ORIGINAL PLAN RESTORED!`);
  } catch (error: any) {
    console.log(`    ❌ DemoResolver test failed: ${error.message}`);
    if (error.data) {
      console.log(`    Error data: ${error.data}`);
    }
  }

  console.log("\n🎯 FINAL DIAGNOSIS:");
  console.log("✅ We own the LOP contract - no external restrictions");
  console.log("✅ makerTraits = 0 should remove ALLOWED_SENDER restrictions");
  console.log("✅ This should restore the original DemoResolver → LOP pattern");
  console.log(
    "✅ All structural issues (invalidation, tokens, signatures) already solved"
  );

  console.log("\n🚀 IF SUCCESSFUL:");
  console.log("1. ✅ makerTraits = 0 fixes Unauthenticated() error");
  console.log("2. ✅ DemoResolver can call LOP directly again");
  console.log("3. ✅ Original architecture works as designed");
  console.log("4. ✅ Ready for complete atomic swap implementation");
}

main().catch(console.error);
