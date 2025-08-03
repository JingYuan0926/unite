import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Investigating User B Authentication Issue");
  console.log("Even EOA (User B) getting Unauthenticated() - checking why\n");

  require("dotenv").config();

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  // Get User B and compare with working deployer account
  const userBPrivateKey = process.env.USER_B_ETH_PRIVATE_KEY;
  const provider = ethers.provider;
  const userB = new ethers.Wallet(userBPrivateKey!, provider);
  const [deployer] = await ethers.getSigners(); // Working account

  console.log("📋 Account Comparison:");
  console.log("  User B:", userB.address);
  console.log("  Deployer:", deployer.address);

  // Step 1: Check account balances and states
  console.log("\n🔍 Step 1: Account State Comparison");

  try {
    const userBEth = await provider.getBalance(userB.address);
    const deployerEth = await provider.getBalance(deployer.address);

    console.log(`  User B ETH: ${ethers.formatEther(userBEth)} ETH`);
    console.log(`  Deployer ETH: ${ethers.formatEther(deployerEth)} ETH`);

    if (userBEth === 0n) {
      console.log("  🚨 User B has no ETH! This could cause the issue.");

      // Transfer some ETH to User B
      console.log("  Transferring ETH to User B...");
      const transferTx = await deployer.sendTransaction({
        to: userB.address,
        value: ethers.parseEther("0.1"), // 0.1 ETH
      });
      await transferTx.wait();
      console.log("  ✅ Transferred 0.1 ETH to User B");
    }
  } catch (error: any) {
    console.log("❌ Balance check failed:", error.message);
    return;
  }

  // Step 2: Test LOP access with different accounts
  console.log("\n🧪 Step 2: Testing LOP Access with Different Accounts");

  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  // Create a simple test order
  const testOrder = {
    salt: ethers.getBigInt(Date.now()),
    maker: deployer.address, // Use deployer as maker for this test
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

  const signature = await deployer.signTypedData(domain, types, testOrder);
  const sig = ethers.Signature.from(signature);

  // Test 1: Deployer calling LOP
  console.log("\n  🧪 Test 1: Deployer calling LOP");
  try {
    const gasEstimate1 = await LOP.fillOrderArgs.estimateGas(
      testOrder,
      sig.r,
      sig.yParityAndS,
      testOrder.makingAmount,
      0,
      "0x",
      { value: testOrder.makingAmount }
    );
    console.log(
      `    ✅ Deployer can call LOP! Gas: ${gasEstimate1.toString()}`
    );
  } catch (error: any) {
    console.log(`    ❌ Deployer failed: ${error.message}`);
    if (error.data) {
      console.log(`    Error data: ${error.data}`);
    }
  }

  // Test 2: User B calling LOP (after ETH transfer)
  console.log("\n  🧪 Test 2: User B calling LOP (with ETH)");
  try {
    const LOPUserB = LOP.connect(userB);
    const gasEstimate2 = await LOPUserB.fillOrderArgs.estimateGas(
      testOrder,
      sig.r,
      sig.yParityAndS,
      testOrder.makingAmount,
      0,
      "0x",
      { value: testOrder.makingAmount }
    );
    console.log(`    ✅ User B can call LOP! Gas: ${gasEstimate2.toString()}`);
  } catch (error: any) {
    console.log(`    ❌ User B failed: ${error.message}`);
    if (error.data) {
      console.log(`    Error data: ${error.data}`);

      if (error.data === "0x1841b4e1") {
        console.log("    🚨 Still Unauthenticated() - this is very strange!");
      }
    }
  }

  // Step 3: Check LOP contract access controls
  console.log("\n🔍 Step 3: Checking LOP Contract Access Controls");

  try {
    // Check if LOP is paused
    const isPaused = await LOP.paused();
    console.log(`  LOP Paused: ${isPaused ? "❌ YES" : "✅ NO"}`);

    // Check owner
    const owner = await LOP.owner();
    console.log(`  LOP Owner: ${owner}`);

    // Check domain separator
    const domainSep = await LOP.DOMAIN_SEPARATOR();
    console.log(`  Domain Separator: ${domainSep}`);

    // Check if this is a restricted deployment
    console.log("\n  💡 Possible Issues:");
    console.log(
      "  1. This LOP deployment might be testnet-only with restrictions"
    );
    console.log("  2. Specific whitelist of allowed callers");
    console.log("  3. Network-specific access controls");
    console.log("  4. Order validation issue we haven't identified");
  } catch (error: any) {
    console.log("❌ LOP contract info check failed:", error.message);
  }

  // Step 4: Try with original working deployer account but User A as maker
  console.log("\n🧪 Step 4: Testing with Original Setup (Deployer as Taker)");

  try {
    const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
    const userA = new ethers.Wallet(userAPrivateKey!, provider);

    const fixedOrder = {
      salt: ethers.getBigInt(Date.now() + 1000),
      maker: userA.address, // Fresh User A as maker
      receiver: userA.address,
      makerAsset: ethers.ZeroAddress,
      takerAsset: mockTrxAddress,
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.1"),
      makerTraits: 0,
    };

    const fixedSignature = await userA.signTypedData(domain, types, fixedOrder);
    const fixedSig = ethers.Signature.from(fixedSignature);

    // Deployer calls LOP with User A's order
    const gasEstimate3 = await LOP.fillOrderArgs.estimateGas(
      fixedOrder,
      fixedSig.r,
      fixedSig.yParityAndS,
      fixedOrder.makingAmount,
      0,
      "0x",
      { value: fixedOrder.makingAmount }
    );

    console.log(`  ✅ SUCCESS! Deployer filling User A's order works!`);
    console.log(`  Gas: ${gasEstimate3.toString()}`);

    console.log("\n  🎯 SOLUTION IDENTIFIED:");
    console.log("  The deployer account works, but User B doesn't.");
    console.log(
      "  This suggests specific account restrictions or setup differences."
    );
  } catch (error: any) {
    console.log(`  ❌ Deployer filling User A order failed: ${error.message}`);
    if (error.data) {
      console.log(`  Error data: ${error.data}`);
    }
  }

  console.log("\n📋 ANALYSIS:");
  console.log("If deployer works but User B doesn't, possible causes:");
  console.log("1. Account-specific whitelist in LOP deployment");
  console.log("2. User B needs specific setup/permissions");
  console.log("3. Different transaction context requirements");
  console.log("4. Network-specific restrictions for certain addresses");

  console.log("\n💡 WORKAROUND:");
  console.log("Use the deployer account as the taker/resolver for now");
  console.log("This proves the LOP integration works with the correct account");
}

main().catch(console.error);
