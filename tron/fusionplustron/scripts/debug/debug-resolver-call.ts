import { ethers } from "hardhat";
import { DemoResolver__factory } from "../../typechain-types";

/**
 * 🔍 DEBUG RESOLVER CALL
 *
 * This script helps debug the exact issue with the DemoResolver.executeAtomicSwap call
 */

async function main() {
  console.log("🔍 DEBUGGING RESOLVER CALL");
  console.log("=".repeat(50));

  require("dotenv").config();

  const provider = ethers.provider;
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);

  const demoResolverAddress = "0x8E46D1688aCeF18Cae7b2af9C0e4f8dF7d9B6A7B";
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  console.log("📋 Configuration:");
  console.log(`  User A: ${userA.address}`);
  console.log(`  DemoResolver: ${demoResolverAddress}`);
  console.log(`  LOP: ${lopAddress}`);
  console.log(`  MockTRX: ${mockTrxAddress}`);

  // Get contract instances
  const DemoResolver = DemoResolver__factory.connect(
    demoResolverAddress,
    userA
  );
  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);
  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);

  // Check basic contract state
  console.log("\n🔍 Contract State Checks:");

  try {
    const resolverLOP = await DemoResolver.LOP();
    const resolverFactory = await DemoResolver.ESCROW_FACTORY();
    console.log(`  ✅ DemoResolver.LOP(): ${resolverLOP}`);
    console.log(`  ✅ DemoResolver.ESCROW_FACTORY(): ${resolverFactory}`);

    if (resolverLOP !== lopAddress) {
      console.log(
        `  ⚠️ WARNING: DemoResolver LOP mismatch! Expected: ${lopAddress}`
      );
    }
  } catch (error) {
    console.log(`  ❌ Failed to read DemoResolver state: ${error}`);
  }

  // Check user balances and allowances
  console.log("\n💰 User State:");
  const ethBalance = await provider.getBalance(userA.address);
  const trxBalance = await MockTRX.balanceOf(userA.address);
  const trxAllowance = await MockTRX.allowance(userA.address, lopAddress);
  const epoch = await LOP.epoch(userA.address, 0);

  console.log(`  ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
  console.log(`  MockTRX Balance: ${ethers.formatEther(trxBalance)} TRX`);
  console.log(`  MockTRX Allowance: ${ethers.formatEther(trxAllowance)} TRX`);
  console.log(`  LOP Epoch: ${epoch}`);

  // Try a simple function call first
  console.log("\n🧪 Simple Function Test:");
  try {
    const balance = await DemoResolver.getLockedBalance();
    console.log(
      `  ✅ DemoResolver.getLockedBalance(): ${ethers.formatEther(balance)} ETH`
    );
  } catch (error: any) {
    console.log(`  ❌ Simple function call failed: ${error.message}`);
  }

  // Create minimal test parameters for executeAtomicSwap
  console.log("\n🔧 Testing executeAtomicSwap with minimal parameters:");

  // Create minimal valid immutables with proper timelock encoding
  const testSecret = ethers.hexlify(ethers.randomBytes(32));
  const testSecretHash = ethers.keccak256(testSecret);
  const testOrderHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

  // Encode timelocks properly (following TimelocksLib format)
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

  // Create minimal valid order
  const order = [
    BigInt(Date.now()), // salt
    userA.address, // maker
    userA.address, // receiver
    ethers.ZeroAddress, // makerAsset (ETH)
    mockTrxAddress, // takerAsset (MockTRX)
    ethers.parseEther("0.001"), // makingAmount
    ethers.parseEther("2"), // takingAmount (2 TRX for 0.001 ETH)
    0n, // makerTraits
  ];

  // Test signature (dummy)
  const testR = ethers.hexlify(ethers.randomBytes(32));
  const testVs = ethers.hexlify(ethers.randomBytes(32));

  console.log("  📋 Test Parameters:");
  console.log(`    Order Hash: ${testOrderHash}`);
  console.log(`    Amount: ${ethers.formatEther(immutables[5])} ETH`);
  console.log(`    Safety Deposit: ${ethers.formatEther(immutables[6])} ETH`);
  console.log(
    `    Total Value: ${ethers.formatEther(immutables[5] + immutables[6])} ETH`
  );

  // Try to estimate gas first
  try {
    console.log("\n⛽ Gas Estimation:");
    const gasEstimate = await DemoResolver.executeAtomicSwap.estimateGas(
      immutables,
      order,
      testR,
      testVs,
      ethers.parseEther("0.001"), // amount
      0, // takerTraits
      "0x", // args
      {
        value: ethers.parseEther("0.002"), // amount + safetyDeposit
      }
    );
    console.log(`  ✅ Gas Estimate: ${gasEstimate.toString()}`);

    // Try to call statically to get revert reason
    console.log("\n📞 Static Call Test:");
    try {
      await DemoResolver.executeAtomicSwap.staticCall(
        immutables,
        order,
        testR,
        testVs,
        ethers.parseEther("0.001"), // amount
        0, // takerTraits
        "0x", // args
        {
          value: ethers.parseEther("0.002"), // amount + safetyDeposit
        }
      );
      console.log("  ✅ Static call successful");
    } catch (staticError: any) {
      console.log(`  ❌ Static call failed: ${staticError.message}`);
      console.log(`  📋 Error details:`, staticError);

      // Check if it's a specific revert reason
      if (staticError.data) {
        console.log(`  🔍 Error data: ${staticError.data}`);

        // Try to decode common revert reasons
        try {
          if (staticError.data.startsWith("0x08c379a0")) {
            const reason = ethers.AbiCoder.defaultAbiCoder().decode(
              ["string"],
              "0x" + staticError.data.slice(10)
            )[0];
            console.log(`  💡 Decoded revert reason: "${reason}"`);
          }
        } catch (decodeError) {
          console.log(`  ⚠️ Could not decode revert reason`);
        }
      }
    }
  } catch (gasError: any) {
    console.log(`  ❌ Gas estimation failed: ${gasError.message}`);
    console.log(`  📋 Error details:`, gasError);
  }

  console.log("\n🎯 DEBUGGING COMPLETE");
  console.log("Check the output above for specific error details");
}

main().catch(console.error);
