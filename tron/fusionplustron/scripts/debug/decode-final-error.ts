import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Decoding Final Error 0x1841b4e1");
  console.log(
    "Fresh account resolved invalidation issues - now debugging remaining error\n"
  );

  const errorCode = "0x1841b4e1";
  console.log("Error Code:", errorCode);

  // Common LOP and ERC20 errors
  const errorSignatures = [
    // Standard LOP errors
    "BadSignature()",
    "OrderExpired()",
    "PrivateOrder()",
    "SwapWithZeroAmount()",
    "PartialFillNotAllowed()",
    "TakingAmountTooHigh()",
    "MakingAmountTooLow()",
    "NotEnoughBalance()",
    "InsufficientBalance()",

    // ERC20 errors that might appear
    "ERC20InsufficientBalance(address,uint256,uint256)",
    "ERC20InvalidSender(address)",
    "ERC20InvalidReceiver(address)",
    "ERC20InsufficientAllowance(address,uint256,uint256)",
    "ERC20InvalidApprover(address)",
    "ERC20InvalidSpender(address)",

    // SafeERC20 errors
    "SafeERC20FailedOperation(address)",

    // Transfer errors
    "TransferFromMakerToTakerFailed()",
    "TransferFromTakerToMakerFailed()",

    // Balance/allowance specific
    "InsufficientMakerBalance()",
    "InsufficientTakerBalance()",
    "InsufficientAllowance()",
    "AllowanceExceeded()",

    // Generic errors
    "AccessDenied()",
    "InvalidMakerAsset()",
    "InvalidTakerAsset()",
    "InvalidAmount()",
    "ZeroAmount()",
    "InvalidReceiver()",
    "InvalidSender()",
    "TransferFailed()",
    "ApprovalFailed()",

    // Address errors
    "AddressInsufficientBalance(address)",
    "AddressEmptyCode(address)",
    "FailedInnerCall()",

    // Mock contract errors
    "MockInsufficientBalance()",
    "MockTransferFailed()",
    "MockInvalidReceiver()",
  ];

  console.log("\n🔍 Checking error signatures...");
  let found = false;

  for (const errorSig of errorSignatures) {
    try {
      const errorHash = ethers.id(errorSig).slice(0, 10);
      if (errorHash === errorCode) {
        console.log(`✅ FOUND MATCH: ${errorSig}`);
        console.log(`   Error Hash: ${errorHash}`);
        found = true;
        break;
      }
    } catch (e) {
      // Skip invalid signatures
    }
  }

  if (!found) {
    console.log("❌ Error signature not found in standard list");
  }

  // Let's also check for more specific balance/allowance issues
  console.log("\n🔍 Testing Balance and Allowance Scenarios");

  require("dotenv").config();
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const provider = ethers.provider;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);

  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";

  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);

  try {
    console.log("  User A Address:", userA.address);

    const ethBalance = await provider.getBalance(userA.address);
    console.log(`  ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    const trxBalance = await MockTRX.balanceOf(userA.address);
    console.log(`  MockTRX Balance: ${ethers.formatEther(trxBalance)} TRX`);

    const allowance = await MockTRX.allowance(userA.address, lopAddress);
    console.log(`  MockTRX Allowance: ${ethers.formatEther(allowance)} TRX`);

    // Test if we can transfer MockTRX
    console.log("\n  Testing MockTRX transfer capability...");
    const testAmount = ethers.parseEther("0.1");

    if (trxBalance >= testAmount) {
      // Try a small transfer to ourselves to test
      const MockTRXUserA = MockTRX.connect(userA);
      const transferGas = await MockTRXUserA.transfer.estimateGas(
        userA.address,
        testAmount
      );
      console.log(
        `  ✅ MockTRX transfer gas estimate: ${transferGas.toString()}`
      );
    } else {
      console.log(`  ⚠️ Insufficient MockTRX balance for transfer test`);
    }
  } catch (error: any) {
    console.log("  ❌ Balance/allowance test failed:", error.message);
    if (error.data) {
      console.log("  Error data:", error.data);
    }
  }

  // Test the order with different parameters
  console.log("\n🧪 Testing Modified Order Parameters");

  try {
    const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

    // Try with zero receiver (common pattern in 1inch)
    const modifiedOrder = {
      salt: ethers.getBigInt(Date.now()),
      maker: userA.address,
      receiver: ethers.ZeroAddress, // Use zero address as receiver
      makerAsset: ethers.ZeroAddress, // ETH
      takerAsset: mockTrxAddress, // MockTRX
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.1"), // Smaller amount
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

    const signature = await userA.signTypedData(domain, types, modifiedOrder);
    const sig = ethers.Signature.from(signature);

    console.log("  Testing with zero receiver and smaller amount...");

    const gasEstimate = await LOP.fillOrderArgs.estimateGas(
      modifiedOrder,
      sig.r,
      sig.yParityAndS,
      modifiedOrder.makingAmount,
      0,
      "0x",
      { value: modifiedOrder.makingAmount }
    );

    console.log(
      `  ✅ SUCCESS with modified parameters! Gas: ${gasEstimate.toString()}`
    );
  } catch (error: any) {
    console.log("  ❌ Modified order also failed:", error.message);
    if (error.data) {
      console.log("  Error data:", error.data);

      if (error.data === errorCode) {
        console.log("  🎯 Same error - parameter changes didn't help");
      } else {
        console.log("  ℹ️ Different error with modified parameters");
      }
    }
  }

  console.log("\n📋 ANALYSIS:");
  console.log("Progress made:");
  console.log("✅ Resolved invalidation issue (0xa4f62a96) with fresh account");
  console.log("✅ All bit invalidator slots are clean");
  console.log("✅ MockTRX properly minted and approved");
  console.log(`❌ New error: ${errorCode} needs investigation`);

  console.log("\n💡 LIKELY CAUSES:");
  console.log("1. Balance/allowance issue despite successful setup");
  console.log("2. Order parameter validation (amount ratios, etc.)");
  console.log("3. MockTRX contract compatibility issue");
  console.log("4. LOP v4 specific validation we haven't identified");
}

main().catch(console.error);
