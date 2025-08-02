import { ethers } from "hardhat";

async function main() {
  console.log("🎯 DECODING THE REAL ERROR: 0x1841b4e1");
  console.log(
    "This is NOT Unauthenticated() - let's find what it actually is!\n"
  );

  const realError = "0x1841b4e1";
  console.log("Target Error:", realError);

  // Comprehensive error list for 1inch LOP and related contracts
  const errorSignatures = [
    // Standard Solidity errors
    "Error(string)",
    "Panic(uint256)",

    // Access control errors
    "AccessDenied()",
    "Unauthorized()",
    "Forbidden()",
    "NotAllowed()",
    "InvalidCaller()",
    "CallerNotAuthorized()",
    "OnlyOwner()",
    "OnlyAdmin()",

    // Order-related errors
    "OrderExpired()",
    "OrderCancelled()",
    "OrderFilled()",
    "InvalidOrder()",
    "BadOrder()",
    "OrderNotValid()",
    "OrderNotActive()",
    "OrderAlreadyFilled()",
    "OrderAlreadyCancelled()",

    // Signature errors
    "BadSignature()",
    "InvalidSignature()",
    "SignatureFailed()",
    "ECDSAInvalidSignature()",
    "InvalidSigner()",

    // Amount/balance errors
    "InsufficientBalance()",
    "InsufficientAllowance()",
    "InsufficientAmount()",
    "ZeroAmount()",
    "AmountTooLow()",
    "AmountTooHigh()",
    "SwapWithZeroAmount()",
    "TakingAmountTooHigh()",
    "MakingAmountTooLow()",
    "TakingAmountExceeded()",
    "PartialFillNotAllowed()",

    // Transfer errors
    "TransferFailed()",
    "TransferFromFailed()",
    "SafeTransferFailed()",
    "ERC20TransferFailed()",
    "TransferFromMakerToTakerFailed()",
    "TransferFromTakerToMakerFailed()",

    // ERC20 standard errors
    "ERC20InsufficientBalance(address,uint256,uint256)",
    "ERC20InvalidSender(address)",
    "ERC20InvalidReceiver(address)",
    "ERC20InsufficientAllowance(address,uint256,uint256)",
    "ERC20InvalidApprover(address)",
    "ERC20InvalidSpender(address)",

    // SafeERC20 errors
    "SafeERC20FailedOperation(address)",
    "SafeERC20FailedDecreaseAllowance(address,uint256,uint256)",

    // Time/deadline errors
    "DeadlineExpired()",
    "TimestampExpired()",
    "TooEarly()",
    "TooLate()",

    // Validation errors
    "InvalidInput()",
    "InvalidParameter()",
    "InvalidAddress()",
    "ZeroAddress()",
    "InvalidLength()",
    "ArrayLengthMismatch()",
    "MismatchArraysLengths()",

    // State errors
    "InvalidState()",
    "ContractPaused()",
    "ContractNotPaused()",
    "AlreadyInitialized()",
    "NotInitialized()",

    // Price/rate errors
    "SlippageTooHigh()",
    "PriceTooLow()",
    "PriceTooHigh()",
    "InvalidRate()",
    "RateTooLow()",
    "RateTooHigh()",

    // Nonce/replay errors
    "InvalidNonce()",
    "NonceAlreadyUsed()",
    "ReplayAttack()",

    // Gas/execution errors
    "InsufficientGas()",
    "ExecutionFailed()",
    "CallFailed()",
    "DelegateCallFailed()",
    "StaticCallFailed()",

    // Specific 1inch LOP errors
    "PrivateOrder()",
    "PredicateIsNotTrue()",
    "WrongSeriesNonce()",
    "EpochManagerAndBitInvalidatorsAreIncompatible()",
    "NotEnoughBalance()",
    "UnknownOrder()",
    "PreInteractionFailed()",
    "InteractionFailed()",
    "PostInteractionFailed()",
    "SimulationResults(bool,bytes)",

    // Mock contract errors (our custom ones)
    "MockError()",
    "TestError()",
    "DebugError()",
    "MockTransferFailed()",
    "MockInsufficientBalance()",

    // Common custom errors
    "NotSupported()",
    "NotImplemented()",
    "OperationNotAllowed()",
    "FeatureDisabled()",
    "MaintenanceMode()",
    "Emergency()",
    "Deprecated()",

    // Reentrancy
    "ReentrancyGuard()",
    "ReentrantCall()",

    // Math errors
    "Overflow()",
    "Underflow()",
    "DivisionByZero()",
    "MathError()",
    "SafeMathError()",

    // Address/library errors
    "AddressInsufficientBalance(address)",
    "AddressEmptyCode(address)",
    "FailedInnerCall()",

    // Ownable errors
    "OwnableUnauthorizedAccount(address)",
    "OwnableInvalidOwner(address)",

    // Pausable errors
    "EnforcedPause()",
    "ExpectedPause()",
  ];

  console.log(`\n🔍 Checking ${errorSignatures.length} error signatures...\n`);

  let found = false;

  for (const errorSig of errorSignatures) {
    try {
      const errorHash = ethers.id(errorSig).slice(0, 10);
      if (errorHash === realError) {
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
    console.log("❌ Error signature not found in comprehensive list");

    // Let's try some manual computation
    console.log("\n🔍 Manual Error Analysis:");
    console.log("Error bytes: 0x1841b4e1");
    console.log("As uint32:", parseInt(realError.slice(2), 16));
    console.log("As decimal:", parseInt(realError.slice(2), 16));

    // Try reverse lookup - maybe it's a custom error from our contracts
    console.log("\n🔍 Possible Sources:");
    console.log("1. Custom error in our deployed LOP");
    console.log("2. Error from MockTRX contract");
    console.log("3. Error from DemoResolver");
    console.log("4. Library error (SafeERC20, AddressLib, etc.)");
    console.log("5. Low-level EVM error");
  }

  // Test what happens when we try this error manually
  console.log("\n🧪 Testing Error Context");

  try {
    // Let's see what the LOP contract actually does when we call it
    const LOP = await ethers.getContractAt(
      "LimitOrderProtocol",
      "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0"
    );

    console.log("Testing what happens on a basic contract call...");

    // Try a simple view function first
    const owner = await LOP.owner();
    console.log(`✅ Basic view call works: owner = ${owner}`);
  } catch (error: any) {
    console.log("❌ Even basic LOP calls fail:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }

  console.log("\n📋 NEXT STEPS:");
  console.log("1. Need to identify what error 0x1841b4e1 actually represents");
  console.log("2. Check if it's from MockTRX, DemoResolver, or LOP");
  console.log("3. Might need to examine the actual contract code");
  console.log("4. Consider testing with a completely fresh LOP deployment");

  console.log("\n💡 BREAKTHROUGH:");
  console.log("We now know this ISN'T an authentication issue!");
  console.log("This is some other validation or execution error.");
  console.log("Once identified, should be easier to fix than auth issues.");
}

main().catch(console.error);
