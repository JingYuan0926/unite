import { ethers } from "hardhat";
import {
  DemoResolver__factory,
  LimitOrderProtocol__factory,
} from "../../typechain-types";

/**
 * 🎯 TEST DEMORESOLVER DIRECT CALL
 *
 * This script calls DemoResolver.executeAtomicSwap directly with the same
 * parameters the orchestrator uses to isolate the exact issue
 */

async function main() {
  console.log("🎯 TESTING DEMORESOLVER DIRECT CALL");
  console.log("=".repeat(50));

  require("dotenv").config();

  const provider = ethers.provider;
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);

  const demoResolverAddress = "0xf80c9EAAd4a37a3782ECE65df77BFA24614294fC"; // Fresh resolver

  console.log("🎯 TESTING WITH ALLOWEDSENDER CONFIGURATION");
  console.log(
    "Updated makerTraits to authorize DemoResolver as allowed taker."
  );
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  console.log("📋 Configuration:");
  console.log(`  User A: ${userA.address}`);
  console.log(`  DemoResolver: ${demoResolverAddress}`);
  console.log(`  LOP: ${lopAddress}`);

  // Get contract instances
  const DemoResolver = DemoResolver__factory.connect(
    demoResolverAddress,
    userA
  );
  const LOP = LimitOrderProtocol__factory.connect(lopAddress, userA);

  // Create realistic test parameters matching what orchestrator uses
  const testSecret = ethers.hexlify(ethers.randomBytes(32));
  const testSecretHash = ethers.keccak256(testSecret);

  // Create EIP-712 order hash like orchestrator does with allowedSender encoding
  const salt = BigInt(Date.now());

  // 🎯 Encode DemoResolver as allowedSender in makerTraits (same as orchestrator)
  const allowedSenderMask = (1n << 80n) - 1n; // type(uint80).max
  const encodedAllowedSender = BigInt(demoResolverAddress) & allowedSenderMask;
  console.log(
    `  📋 Encoded allowedSender: ${encodedAllowedSender.toString(16)}`
  );

  const orderForSigning = {
    salt: salt,
    maker: userA.address,
    receiver: userA.address,
    makerAsset: ethers.ZeroAddress, // ETH
    takerAsset: mockTrxAddress, // MockTRX
    makingAmount: ethers.parseEther("0.001"),
    takingAmount: ethers.parseEther("2"), // 2 TRX for 0.001 ETH
    makerTraits: encodedAllowedSender, // 🎯 Authorize DemoResolver as allowed taker
  };

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

  const orderHash = ethers.TypedDataEncoder.hash(
    domain,
    types,
    orderForSigning
  );
  console.log(`📋 Order hash: ${orderHash}`);

  // Create immutables like orchestrator does
  const now = Math.floor(Date.now() / 1000);
  const timelocks =
    (BigInt(now) << BigInt(192)) | // deployedAt (64 bits at position 192)
    (BigInt(now + 600) << BigInt(128)) | // srcWithdrawal (64 bits at position 128)
    (BigInt(now + 3600) << BigInt(64)) | // srcCancellation (64 bits at position 64)
    (BigInt(now + 300) << BigInt(0)); // dstWithdrawal (64 bits at position 0)

  const immutables = [
    orderHash, // orderHash
    testSecretHash, // hashlock
    ethers.toBigInt(userA.address), // maker (encoded as uint256)
    ethers.toBigInt(userA.address), // taker (encoded as uint256)
    ethers.toBigInt(ethers.ZeroAddress), // token (ETH)
    ethers.parseEther("0.001"), // amount
    ethers.parseEther("0.001"), // safetyDeposit
    timelocks,
  ];

  // Create order array like orchestrator does
  const orderForContractCall = [
    orderForSigning.salt,
    orderForSigning.maker,
    orderForSigning.receiver,
    orderForSigning.makerAsset,
    orderForSigning.takerAsset,
    orderForSigning.makingAmount,
    orderForSigning.takingAmount,
    orderForSigning.makerTraits,
  ];

  // Create signature like orchestrator does
  const signature = await userA.signTypedData(domain, types, orderForSigning);
  const sig = ethers.Signature.from(signature);
  const r = sig.r;
  const vs = sig.yParityAndS;

  const amount = ethers.parseEther("0.001");
  const safetyDeposit = ethers.parseEther("0.001");
  const totalValue = amount + safetyDeposit;

  console.log("\n📋 Call Parameters:");
  console.log(`  Amount: ${ethers.formatEther(amount)} ETH`);
  console.log(`  Safety Deposit: ${ethers.formatEther(safetyDeposit)} ETH`);
  console.log(`  Total Value: ${ethers.formatEther(totalValue)} ETH`);
  console.log(`  Order Salt: ${orderForSigning.salt}`);
  console.log(`  Maker: ${orderForSigning.maker}`);
  console.log(
    `  Making Amount: ${ethers.formatEther(orderForSigning.makingAmount)} ETH`
  );
  console.log(
    `  Taking Amount: ${ethers.formatEther(orderForSigning.takingAmount)} TRX`
  );

  // Test the exact call that's failing
  console.log("\n🎯 TESTING EXACT DEMORESOLVER CALL");

  try {
    console.log("⛽ Estimating gas...");
    const gasEstimate = await DemoResolver.executeAtomicSwap.estimateGas(
      immutables,
      orderForContractCall,
      r,
      vs,
      amount,
      0, // TakerTraits
      "0x", // args
      {
        value: totalValue,
      }
    );
    console.log(`  ✅ Gas estimate: ${gasEstimate.toString()}`);

    console.log("📞 Calling executeAtomicSwap...");
    const tx = await DemoResolver.executeAtomicSwap(
      immutables,
      orderForContractCall,
      r,
      vs,
      amount,
      0, // TakerTraits
      "0x", // args
      {
        value: totalValue,
        gasLimit: gasEstimate + 50000n, // Add buffer
      }
    );

    console.log(`  📝 Transaction submitted: ${tx.hash}`);
    console.log(`  🔗 Sepolia: https://sepolia.etherscan.io/tx/${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`  ✅ Transaction confirmed in block ${receipt!.blockNumber}`);
    console.log(`  ⛽ Gas used: ${receipt!.gasUsed.toString()}`);

    console.log("\n🎉 SUCCESS! DemoResolver.executeAtomicSwap worked!");
  } catch (error: any) {
    console.log(`  ❌ executeAtomicSwap failed: ${error.message}`);

    if (error.data) {
      console.log(`  🔍 Error data: ${error.data}`);

      // Try to decode revert reason
      try {
        if (error.data.startsWith("0x08c379a0")) {
          const reason = ethers.AbiCoder.defaultAbiCoder().decode(
            ["string"],
            "0x" + error.data.slice(10)
          )[0];
          console.log(`  💡 Decoded revert reason: "${reason}"`);
        } else if (error.data.startsWith("0x4e487b71")) {
          console.log(`  💡 Panic error (arithmetic overflow/underflow/etc)`);
        } else {
          console.log(`  💡 Custom error or unknown revert`);
        }
      } catch (decodeError) {
        console.log(`  ⚠️ Could not decode revert reason`);
      }
    }

    // Try static call for more details
    console.log("\n📞 Trying static call for more details...");
    try {
      await DemoResolver.executeAtomicSwap.staticCall(
        immutables,
        orderForContractCall,
        r,
        vs,
        amount,
        0,
        "0x",
        {
          value: totalValue,
        }
      );
      console.log("  ✅ Static call succeeded (this is unexpected!)");
    } catch (staticError: any) {
      console.log(`  ❌ Static call also failed: ${staticError.message}`);
      if (staticError.data) {
        console.log(`  🔍 Static call error data: ${staticError.data}`);
      }
    }
  }

  console.log("\n🎯 ANALYSIS COMPLETE");
}

main().catch(console.error);
