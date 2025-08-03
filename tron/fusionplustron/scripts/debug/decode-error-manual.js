const { ethers } = require("ethers");

// Error data from the failed transaction
const errorData = "0xf4840e96";

async function decodeErrorManual() {
  console.log("🔍 Manual error selector calculation for:", errorData);

  // Try manual selector calculation for common errors
  const commonErrors = [
    "InvalidMsgValue()",
    "InvalidCreationTime()",
    "InvalidImmutables()",
    "InvalidParams()",
    "InsufficientBalance()",
    "InsufficientEscrowBalance()",
    "InvalidCaller()",
    "InvalidOrderHash()",
    "InvalidTimelock()",
    "InvalidAddress()",
    "DuplicateOrder()",
    "OrderAlreadyExists()",
    "EscrowAlreadyExists()",
    "InvalidMaker()",
    "InvalidTaker()",
    "InvalidToken()",
    "InvalidAmount()",
    "InvalidSafetyDeposit()",
    "TimelockExpired()",
    "TimelockNotExpired()",
    "InvalidTimelocks()",
    "AccessDenied()",
    "FailedDeployment()",
    "NotEnoughCredit()",
    "OnlyFeeBankAccess()",
    "OnlyLimitOrderProtocol()",
    "ResolverCanNotFillOrder()",
    "SafeTransferFromFailed()",
    "InvalidPartialFill()",
    "InvalidProof()",
    "InvalidSecretsAmount()",
    // Try with parameters
    "InsufficientBalance(uint256,uint256)",
    "InvalidCreationTime(uint256)",
    "InvalidMsgValue(uint256,uint256)",
    "InvalidTimelock(uint256,uint256)",
    "InvalidAmount(uint256)",
    "InvalidSafetyDeposit(uint256)",
  ];

  const targetSelector = errorData.slice(0, 10); // First 4 bytes (8 hex chars + 0x)
  console.log("Target selector:", targetSelector);

  let found = false;

  for (const errorSig of commonErrors) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(errorSig));
    const selector = hash.slice(0, 10);

    console.log(`${errorSig.padEnd(35)} -> ${selector}`);

    if (selector === targetSelector) {
      console.log(`\n🎯 ✅ MATCH FOUND: ${errorSig}`);
      console.log(`Selector: ${selector}`);
      console.log(`Full hash: ${hash}`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log("\n❌ No matches found in common error list");
    console.log(
      "The error might be from a different contract or a custom error not in our list"
    );

    // Show all selectors for comparison
    console.log("\n📋 All calculated selectors:");
    commonErrors.forEach((errorSig) => {
      const hash = ethers.keccak256(ethers.toUtf8Bytes(errorSig));
      const selector = hash.slice(0, 10);
      console.log(`${selector} = ${errorSig}`);
    });
  }
}

decodeErrorManual().catch(console.error);
