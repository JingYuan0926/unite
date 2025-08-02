import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Decoding revert error 0x5cd5d233...");

  // Common error signatures from 1inch contracts
  const commonErrors = [
    "AccessDenied()",
    "InvalidCaller()",
    "InvalidImmutables()",
    "InvalidSecret()",
    "InvalidTime()",
    "InvalidOrder()",
    "OrderExpired()",
    "OrderNotFillable()",
    "InsufficientBalance()",
    "TransferFailed()",
    "SwapFailed()",
    "InvalidTarget()",
    "InvalidMakerAsset()",
    "InvalidTakerAsset()",
    "BadSignature()",
    "PredicateFailed()",
    "InteractionFailed()",
    "InsufficientEscrowBalance()",
    "InvalidCreationTime()",
    "InvalidPartialFill()",
    "InvalidSecretsAmount()",
    "PostInteractionFailed()",
    "NoReceive()",
    "InvalidAddress()",
    "ZeroAddress()",
  ];

  const errorData = "0xa4f62a96";
  console.log("📋 Error Data:", errorData);

  // Try to decode with different error signatures
  for (const errorSig of commonErrors) {
    try {
      const errorHash = ethers.id(errorSig).slice(0, 10);
      if (errorHash === errorData) {
        console.log(`✅ Found matching error: ${errorSig}`);
        return;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // Manual lookup for this specific error
  console.log("\n🔍 Manual error code analysis:");
  console.log("Error bytes4:", errorData);

  // This error might be from TimelocksLib or other library
  const timelocksErrors = [
    "TimelockAlreadyDeployed()",
    "TimelockNotReached()",
    "TimelockExpired()",
    "InvalidTimelocks()",
  ];

  for (const errorSig of timelocksErrors) {
    try {
      const errorHash = ethers.id(errorSig).slice(0, 10);
      console.log(`${errorSig} -> ${errorHash}`);
      if (errorHash === errorData) {
        console.log(`✅ Found matching timelock error: ${errorSig}`);
        return;
      }
    } catch (e) {
      // Continue trying
    }
  }

  console.log("\n❌ Error code not found in common signatures");
  console.log("🔍 This might be a custom error from:");
  console.log("   1. LimitOrderProtocol contract");
  console.log("   2. EscrowFactory contract");
  console.log("   3. TimelocksLib library");
  console.log("   4. AddressLib library");

  console.log("\n💡 Debugging suggestions:");
  console.log("   1. Check if LOP contract interface matches");
  console.log("   2. Verify immutables struct format");
  console.log("   3. Check if EscrowFactory is accessible");
  console.log("   4. Validate TakerTraits usage");
}

main().catch(console.error);
