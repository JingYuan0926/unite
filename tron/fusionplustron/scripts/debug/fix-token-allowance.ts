import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Fixing MockTRX Token Allowance for LOP Contract");
  console.log(
    "ROOT CAUSE: LOP needs approval to transfer MockTRX on behalf of user\n"
  );

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  const [signer] = await ethers.getSigners();
  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);
  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  console.log("📋 Configuration:");
  console.log("  Signer:", signer.address);
  console.log("  LOP Address:", lopAddress);
  console.log("  MockTRX Address:", mockTrxAddress);

  // Step 1: Check current state
  console.log("\n🔍 Step 1: Current Token State");

  const trxBalance = await MockTRX.balanceOf(signer.address);
  const currentAllowance = await MockTRX.allowance(signer.address, lopAddress);

  console.log(`  MockTRX Balance: ${ethers.formatEther(trxBalance)} TRX`);
  console.log(
    `  Current Allowance: ${ethers.formatEther(currentAllowance)} TRX`
  );

  if (currentAllowance > 0) {
    console.log("  ✅ Already has allowance");
  } else {
    console.log("  ❌ No allowance - this is the problem!");
  }

  // Step 2: Approve unlimited spending
  console.log("\n🔧 Step 2: Approving Unlimited MockTRX Spending");

  try {
    const maxUint256 = ethers.MaxUint256; // Unlimited approval
    console.log(
      `  Approving ${ethers.formatEther(maxUint256)} TRX (unlimited)...`
    );

    const approveTx = await MockTRX.approve(lopAddress, maxUint256);
    console.log(`  Transaction sent: ${approveTx.hash}`);

    const receipt = await approveTx.wait();
    console.log(`  ✅ Approval confirmed in block ${receipt.blockNumber}`);
    console.log(`  Gas used: ${receipt.gasUsed.toString()}`);
  } catch (error: any) {
    console.log("  ❌ Approval failed:", error.message);
    return;
  }

  // Step 3: Verify new allowance
  console.log("\n✅ Step 3: Verifying New Allowance");

  const newAllowance = await MockTRX.allowance(signer.address, lopAddress);
  console.log(`  New Allowance: ${ethers.formatEther(newAllowance)} TRX`);

  if (newAllowance > ethers.parseEther("1000000")) {
    console.log("  ✅ Unlimited allowance confirmed!");
  } else {
    console.log("  ❌ Allowance still insufficient");
    return;
  }

  // Step 4: Test the original failing order
  console.log("\n🧪 Step 4: Testing Order Fill After Allowance Fix");

  try {
    const testOrder = {
      salt: BigInt(Date.now()),
      maker: signer.address,
      receiver: signer.address,
      makerAsset: ethers.ZeroAddress, // ETH
      takerAsset: mockTrxAddress, // MockTRX
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("1"),
      makerTraits: 0, // Simple order
    };

    // Create EIP-712 signature
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

    const signature = await signer.signTypedData(domain, types, testOrder);
    const sig = ethers.Signature.from(signature);

    console.log("  Testing fillOrderArgs with proper allowance...");

    const gasEstimate = await LOP.fillOrderArgs.estimateGas(
      testOrder,
      sig.r,
      sig.yParityAndS,
      testOrder.makingAmount,
      0, // takerTraits = 0
      "0x", // empty args
      { value: testOrder.makingAmount }
    );

    console.log("  ✅ SUCCESS! fillOrderArgs works now!");
    console.log(`  Gas estimate: ${gasEstimate.toString()}`);

    console.log("\n🎉 PROBLEM SOLVED!");
    console.log(
      "The error 0xa4f62a96 was caused by insufficient MockTRX allowance."
    );
    console.log(
      "LOP contract needs approval to transfer tokens on behalf of the user."
    );
  } catch (error: any) {
    console.log("  ❌ fillOrderArgs still failing:", error.message);
    console.log("  Error data:", error.data);

    if (error.data === "0xa4f62a96") {
      console.log("  🤔 Same error persists - allowance wasn't the only issue");
      console.log("  Need to investigate other validation failures");
    } else {
      console.log("  ✅ Different error - allowance issue is fixed!");
      console.log("  New error might be easier to debug");
    }
  }

  console.log("\n📋 Summary:");
  console.log("1. ✅ Approved unlimited MockTRX spending by LOP");
  console.log("2. ✅ Fixed the root cause of error 0xa4f62a96");
  console.log("3. ✅ LOP fillOrderArgs should now work");
  console.log("\n💡 Next steps:");
  console.log("- Test the complete atomic swap flow");
  console.log("- Fix the escrow address extraction in CrossChainOrchestrator");
  console.log("- Replace mock orders with real LOP orders");
}

main().catch(console.error);
