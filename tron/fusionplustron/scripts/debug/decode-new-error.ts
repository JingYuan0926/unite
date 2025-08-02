import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Decoding New Error 0xaa3eef95");
  console.log(
    "This appeared when we switched from bit invalidator to remaining invalidator\n"
  );

  const errorCode = "0xaa3eef95";
  console.log("Error Code:", errorCode);

  // Try to decode this new error
  const possibleErrors = [
    "OrderExpired()",
    "OrderCancelled()",
    "OrderFilled()",
    "InsufficientBalance()",
    "BadSignature()",
    "PrivateOrder()",
    "WrongSeriesNonce()",
    "EpochManagerAndBitInvalidatorsAreIncompatible()",
    "NotEnoughBalance()",
    "OrderIsNotActive()",
    "OrderIsFilled()",
    "OrderIsCancelled()",
    "UnknownOrder()",
    "MismatchArraysLengths()",
    "SwapWithZeroAmount()",
    "PartialFillNotAllowed()",
    "TakingAmountTooHigh()",
    "TakingAmountExceeded()",
    "MakingAmountTooLow()",
    "ERC20InsufficientBalance(address,uint256,uint256)",
    "ERC20InvalidSender(address)",
    "ERC20InvalidReceiver(address)",
    "SafeERC20FailedOperation(address)",
    "TransferFromMakerToTakerFailed()",
    "TransferFromTakerToMakerFailed()",
    "AccessDenied()",
    "InvalidMakerAsset()",
    "InvalidTakerAsset()",
    "InvalidAmount()",
    "ReentrantCall()",
  ];

  console.log("\n🔍 Checking error signatures...");
  let found = false;

  for (const errorSig of possibleErrors) {
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
    console.log("❌ Error signature not found in list");
  }

  // Let's try a fresh account approach
  console.log("\n💡 RECOMMENDED SOLUTION:");
  console.log(
    "The current account appears to have complex invalidation state."
  );
  console.log("For testing purposes, let's try:");
  console.log("1. Use a fresh account that hasn't interacted with LOP");
  console.log("2. Or reset the invalidation state if possible");
  console.log("3. Or find the exact invalidation pattern");

  // Check if we can create a simple test with mock data
  console.log("\n🧪 Testing with Mock Order (no actual execution)");

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const [signer] = await ethers.getSigners();
  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  try {
    // Create a very simple order
    const simpleOrder = {
      salt: ethers.getBigInt(999999), // Fixed salt
      maker: signer.address,
      receiver: ethers.ZeroAddress, // Zero receiver to avoid receiver issues
      makerAsset: ethers.ZeroAddress, // ETH
      takerAsset: "0x74Fc932f869f088D2a9516AfAd239047bEb209BF", // MockTRX
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("1"),
      makerTraits: 0, // Simplest possible traits
    };

    // Just hash the order (no execution)
    const orderHash = await LOP.hashOrder(simpleOrder);
    console.log(
      "✅ Order hash calculation works:",
      orderHash.slice(0, 10) + "..."
    );

    // Check remaining invalidator for this specific order
    const remaining = await LOP.remainingInvalidatorForOrder(
      signer.address,
      orderHash
    );
    console.log("Remaining invalidator for this order:", remaining.toString());

    if (remaining > 0) {
      console.log("🚨 This specific order hash already has remaining amount!");
      console.log("This means the order was already created/filled before.");
    }
  } catch (error: any) {
    console.log("❌ Even simple order operations fail:", error.message);
  }

  console.log("\n📋 ANALYSIS:");
  console.log("Error progression:");
  console.log("- 0xa4f62a96: Bit invalidator slot invalidation");
  console.log("- 0xaa3eef95: New error when using remaining invalidator");
  console.log("");
  console.log(
    "This suggests the account has complex invalidation state that affects"
  );
  console.log("both bit invalidator AND remaining invalidator systems.");
  console.log("");
  console.log("🔧 SOLUTIONS:");
  console.log("1. Use a fresh account for testing");
  console.log("2. Investigate account-specific invalidation reset");
  console.log("3. Use a different taker/resolver account");
  console.log("4. Check if there's a way to clear invalidation state");
}

main().catch(console.error);
