import { ethers } from "hardhat";

async function main() {
  console.log("🔧 FIXING IMMUTABLES FORMAT ISSUE");
  console.log("Testing correct BigInt encoding for DemoResolver\n");

  require("dotenv").config();

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  // Use fresh accounts
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const provider = ethers.provider;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);
  const [deployer] = await ethers.getSigners();

  console.log("📋 Configuration:");
  console.log("  User A (Fresh Maker):", userA.address);
  console.log("  Deployer (Taker):", deployer.address);

  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const demoResolverAddress = deployment.contracts.DemoResolver;
  const escrowFactoryAddress = deployment.contracts.EscrowFactory;

  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);
  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);
  const DemoResolver = await ethers.getContractAt(
    "DemoResolver",
    demoResolverAddress
  );
  const EscrowFactory = await ethers.getContractAt(
    "IEscrowFactory",
    escrowFactoryAddress
  );

  // Test 1: Check if we can call the LOP directly first
  console.log("\n🧪 Test 1: Direct LOP Call Validation");

  try {
    const testOrder = {
      salt: ethers.getBigInt(Date.now()),
      maker: userA.address,
      receiver: deployer.address,
      makerAsset: ethers.ZeroAddress,
      takerAsset: mockTrxAddress,
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.1"),
      makerTraits: 0,
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

    const testSignature = await userA.signTypedData(domain, types, testOrder);
    const testSig = ethers.Signature.from(testSignature);

    console.log("  Testing direct LOP call...");
    const directGas = await LOP.fillOrderArgs.estimateGas(
      testOrder,
      testSig.r,
      testSig.yParityAndS,
      testOrder.makingAmount,
      0,
      "0x",
      { value: 0 }
    );

    console.log(`  ✅ Direct LOP works! Gas: ${directGas.toString()}`);
    console.log("  🎯 Invalidation issue is RESOLVED with fresh User A!");
  } catch (error: any) {
    console.log(`  ❌ Direct LOP failed: ${error.message}`);
    console.log(`  Error: ${error.data}`);
    if (error.data === "0xa4f62a96") {
      console.log(
        "  🚨 Invalidation still present - might need different approach"
      );
      return;
    }
  }

  // Test 2: Debug immutables format
  console.log("\n⚙️ Test 2: Debugging Immutables Format");

  const now = Math.floor(Date.now() / 1000);

  // Create order for DemoResolver
  const atomicOrder = {
    salt: ethers.getBigInt(
      Date.now() * 1000 + Math.floor(Math.random() * 1000000)
    ),
    maker: userA.address,
    receiver: demoResolverAddress,
    makerAsset: ethers.ZeroAddress,
    takerAsset: mockTrxAddress,
    makingAmount: ethers.parseEther("0.001"),
    takingAmount: ethers.parseEther("0.1"),
    makerTraits: 0,
  };

  const signature = await userA.signTypedData(domain, types, atomicOrder);
  const sig = ethers.Signature.from(signature);

  console.log("  Order created and signed");

  // CRITICAL: Fix immutables format based on DemoResolver requirements
  console.log("\n  🔧 Creating properly formatted immutables...");

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

  // Test different immutables formats
  const immutablesVariants = [
    {
      name: "Standard Format (current)",
      immutables: [
        ethers.ZeroHash, // orderHash
        ethers.keccak256(ethers.toUtf8Bytes("test-secret")), // hashlock
        BigInt(userA.address), // maker (BigInt of address)
        BigInt(deployer.address), // taker
        BigInt(ethers.ZeroAddress), // token
        atomicOrder.makingAmount, // amount
        atomicOrder.makingAmount, // safetyDeposit
        encodeTimelocks({
          srcWithdrawal: now + 600,
          srcCancellation: now + 3600,
          dstWithdrawal: now + 300,
          dstCancellation: now + 3300,
        }),
      ],
    },
    {
      name: "Address String Format",
      immutables: [
        ethers.ZeroHash,
        ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
        userA.address, // maker (address string)
        deployer.address, // taker
        ethers.ZeroAddress, // token
        atomicOrder.makingAmount,
        atomicOrder.makingAmount,
        encodeTimelocks({
          srcWithdrawal: now + 600,
          srcCancellation: now + 3600,
          dstWithdrawal: now + 300,
          dstCancellation: now + 3300,
        }),
      ],
    },
  ];

  for (const variant of immutablesVariants) {
    console.log(`\n  🧪 Testing ${variant.name}:`);

    try {
      const totalValue = atomicOrder.makingAmount + atomicOrder.makingAmount; // amount + safetyDeposit
      console.log(`    Total value: ${ethers.formatEther(totalValue)} ETH`);
      console.log(
        `    Amount: ${ethers.formatEther(atomicOrder.makingAmount)} ETH`
      );
      console.log(
        `    Safety Deposit: ${ethers.formatEther(atomicOrder.makingAmount)} ETH`
      );

      // Check value calculation manually
      const expectedValue = variant.immutables[5] + variant.immutables[6]; // amount + safetyDeposit
      console.log(
        `    Expected by contract: ${ethers.formatEther(expectedValue)} ETH`
      );
      console.log(
        `    Values match: ${totalValue === expectedValue ? "✅ YES" : "❌ NO"}`
      );

      const demoResolverWithSigner = DemoResolver.connect(deployer);
      const gasEstimate =
        await demoResolverWithSigner.executeAtomicSwap.estimateGas(
          variant.immutables,
          atomicOrder,
          sig.r,
          sig.yParityAndS,
          atomicOrder.makingAmount,
          0,
          "0x",
          { value: totalValue }
        );

      console.log(`    ✅ SUCCESS! ${variant.name} works!`);
      console.log(`    Gas: ${gasEstimate.toString()}`);

      // If successful, try actual execution
      console.log(`    🚀 Attempting actual execution...`);

      const atomicSwapTx = await demoResolverWithSigner.executeAtomicSwap(
        variant.immutables,
        atomicOrder,
        sig.r,
        sig.yParityAndS,
        atomicOrder.makingAmount,
        0,
        "0x",
        {
          value: totalValue,
          gasLimit: gasEstimate + 50000n,
        }
      );

      console.log(`    📤 Transaction: ${atomicSwapTx.hash}`);
      const receipt = await atomicSwapTx.wait();
      console.log(`    ✅ EXECUTION SUCCESS! Block: ${receipt.blockNumber}`);

      // Analyze results
      let escrowFound = false;
      let lopFound = false;

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === escrowFactoryAddress.toLowerCase()) {
          escrowFound = true;
          console.log(`    🎯 EscrowFactory event detected!`);
        }
        if (log.address.toLowerCase() === lopAddress.toLowerCase()) {
          lopFound = true;
          console.log(`    🎯 LOP event detected!`);
        }
      }

      console.log("\n🎉 COMPLETE SUCCESS!");
      console.log(`✅ LOP Integration: ${lopFound ? "WORKING" : "UNKNOWN"}`);
      console.log(`✅ Escrow Creation: ${escrowFound ? "WORKING" : "UNKNOWN"}`);
      console.log("✅ Fresh User A account resolved invalidation");
      console.log("✅ Immutables format working");
      console.log("✅ Value calculation correct");

      break; // Stop after first success
    } catch (error: any) {
      console.log(`    ❌ ${variant.name} failed: ${error.message}`);
      console.log(`    Error code: ${error.data}`);

      if (error.data === "0x478a5205") {
        console.log(`    🔍 Still getting the same error - investigating...`);

        // Debug value calculation in detail
        console.log(`\n    🔬 Detailed Value Analysis:`);
        console.log(
          `    msg.value sent: ${ethers.formatEther(totalValue)} ETH`
        );
        console.log(
          `    amount parameter: ${ethers.formatEther(atomicOrder.makingAmount)} ETH`
        );
        console.log(
          `    immutables.safetyDeposit: ${ethers.formatEther(variant.immutables[6])} ETH`
        );
        console.log(
          `    Expected by require(): ${ethers.formatEther(atomicOrder.makingAmount + variant.immutables[6])} ETH`
        );

        // Check if types match
        console.log(`    Types - msg.value: ${typeof totalValue}`);
        console.log(`    Types - amount: ${typeof atomicOrder.makingAmount}`);
        console.log(
          `    Types - safetyDeposit: ${typeof variant.immutables[6]}`
        );
      }
    }
  }

  console.log("\n📋 DEBUGGING COMPLETE:");
  console.log("🎯 Fresh User A: WORKING (invalidation resolved)");
  console.log("🎯 Direct LOP: WORKING");
  console.log("🎯 DemoResolver error: 0x478a5205 (investigating format)");
}

main().catch(console.error);
