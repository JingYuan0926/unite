import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Comprehensive Error Code Decoder for 0xa4f62a96");

  const targetError = "0xa4f62a96";
  console.log("Target Error:", targetError);

  // All possible error signatures from 1inch contracts and dependencies
  const errorSignatures = [
    // LOP specific errors
    "BadSignature()",
    "OrderExpired()",
    "PrivateOrder()",
    "PredicateIsNotTrue()",
    "WrongSeriesNonce()",
    "EpochManagerAndBitInvalidatorsAreIncompatible()",
    "TakingAmountTooHigh()",
    "TakingAmountExceeded()",
    "MakingAmountTooLow()",
    "PartialFillNotAllowed()",
    "SwapWithZeroAmount()",
    "MismatchArraysLengths()",
    "UnknownOrder()",
    "PreInteractionFailed()",
    "InteractionFailed()",
    "PostInteractionFailed()",
    "SimulationResults(bool,bytes)",
    "AccessDenied()",
    "NotEnoughBalance()",
    "TransferFromMakerToTakerFailed()",
    "TransferFromTakerToMakerFailed()",
    "OrderIsNotActive()",
    "OrderIsFilled()",
    "OrderIsCancelled()",

    // Address/AddressLib errors
    "InvalidAddress()",
    "ZeroAddress()",
    "AddressInsufficientBalance(address)",
    "AddressEmptyCode(address)",
    "FailedInnerCall()",

    // ERC20 errors
    "ERC20InsufficientBalance(address,uint256,uint256)",
    "ERC20InvalidSender(address)",
    "ERC20InvalidReceiver(address)",
    "ERC20InsufficientAllowance(address,uint256,uint256)",
    "ERC20InvalidApprover(address)",
    "ERC20InvalidSpender(address)",

    // SafeERC20 errors
    "SafeERC20FailedOperation(address)",
    "SafeERC20FailedDecreaseAllowance(address,uint256,uint256)",

    // Math errors
    "MathOverflowedMulDiv()",

    // Pausable errors
    "EnforcedPause()",
    "ExpectedPause()",

    // Ownable errors
    "OwnableUnauthorizedAccount(address)",
    "OwnableInvalidOwner(address)",

    // ECDSA errors
    "ECDSAInvalidSignature()",
    "ECDSAInvalidSignatureLength(uint256)",
    "ECDSAInvalidSignatureS(bytes32)",

    // General Solidity errors
    "Panic(uint256)",
    "Error(string)",

    // Custom potential errors
    "InvalidMakerAsset()",
    "InvalidTakerAsset()",
    "InvalidAmount()",
    "InvalidTraits()",
    "InvalidExtension()",
    "ReentrantCall()",
    "UnauthorizedCaller()",
    "ContractPaused()",
    "InvalidNonce()",
    "ExpiredOrder()",
    "FilledOrder()",
    "CancelledOrder()",
    "InsufficientMakerBalance()",
    "InsufficientTakerBalance()",
    "InvalidSignature()",
    "InvalidOrderHash()",
    "InvalidMakerTraits()",
    "InvalidTakerTraits()",
    "OrderNotFillable()",
    "ExtensionCallFailed()",
    "PredicateCallFailed()",
    "InteractionCallFailed()",
    "PostInteractionCallFailed()",
    "ArbitraryStaticCallFailed()",

    // Timelock related
    "TimelockNotReached()",
    "TimelockExpired()",
    "InvalidTimelocks()",
    "TimelockAlreadyDeployed()",

    // Escrow related
    "InvalidEscrow()",
    "EscrowNotDeployed()",
    "EscrowAlreadyExists()",
    "InvalidImmutables()",
    "InvalidSecret()",
    "SecretAlreadyRevealed()",
    "InsufficientEscrowBalance()",
    "EscrowExpired()",
    "EscrowNotExpired()",
    "InvalidWithdrawal()",
    "InvalidCancellation()",
    "NotAuthorizedForEscrow()",

    // Network/Gas related
    "OutOfGas()",
    "GasLimitTooLow()",
    "InsufficientGas()",

    // Low-level call failures
    "CallFailed()",
    "DelegatecallFailed()",
    "StaticCallFailed()",

    // Common generic errors
    "NotImplemented()",
    "NotSupported()",
    "NotAllowed()",
    "NotFound()",
    "AlreadyExists()",
    "InvalidParameter()",
    "InvalidState()",
    "InvalidOperation()",
    "OperationFailed()",
    "TransactionFailed()",

    // Additional potential errors
    "SaltAlreadyUsed()",
    "OrderHashMismatch()",
    "SignatureExpired()",
    "WrongChainId()",
    "ContractCallFailed()",
    "InvalidContractCall()",
    "UnsupportedOperation()",
    "FeatureNotEnabled()",
    "InvalidConfiguration()",
    "ConfigurationError()",
    "InitializationError()",
    "ValidationError()",
    "AuthorizationError()",
    "PermissionDenied()",
    "ResourceNotFound()",
    "ResourceUnavailable()",
    "ServiceUnavailable()",
    "NetworkError()",
    "TimeoutError()",
    "ConcurrencyError()",
    "DataError()",
    "FormatError()",
    "ParsingError()",
    "SerializationError()",
    "DeserializationError()",
    "CompressionError()",
    "DecompressionError()",
    "EncryptionError()",
    "DecryptionError()",
    "HashingError()",
    "RandomGenerationError()",
  ];

  console.log(
    `\n🔍 Checking ${errorSignatures.length} potential error signatures...\n`
  );

  let found = false;

  for (const errorSig of errorSignatures) {
    try {
      const errorHash = ethers.id(errorSig).slice(0, 10);
      if (errorHash === targetError) {
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
    console.log("\n🔍 This might be:");
    console.log("1. A custom error from a specific contract");
    console.log("2. An error with parameters that we're not matching exactly");
    console.log("3. An internal Solidity error");
    console.log("4. A low-level EVM error");

    console.log("\n💡 Manual verification approach:");
    console.log("1. Check the LOP contract source code directly");
    console.log(
      "2. Look for recent contract updates that might have new errors"
    );
    console.log("3. Test with a known working LOP transaction to compare");
    console.log(
      "4. Use a block explorer to decode the error from a failed transaction"
    );
  }

  // Let's also try some parameterized versions
  console.log("\n🔍 Checking parameterized error patterns...");

  const parameterizedErrors = [
    "InvalidOrderHash(bytes32)",
    "OrderExpired(uint256)",
    "InsufficientBalance(uint256,uint256)",
    "InvalidAmount(uint256)",
    "CustomError(uint256)",
    "ValidationFailed(bytes4)",
    "CallFailed(address,bytes)",
    "InvalidCaller(address)",
    "UnauthorizedAccess(address)",
    "InsufficientAllowance(address,uint256)",
    "TransferFailed(address,address,uint256)",
  ];

  for (const errorSig of parameterizedErrors) {
    try {
      const errorHash = ethers.id(errorSig).slice(0, 10);
      if (errorHash === targetError) {
        console.log(`✅ FOUND PARAMETERIZED MATCH: ${errorSig}`);
        console.log(`   Error Hash: ${errorHash}`);
        found = true;
        break;
      }
    } catch (e) {
      // Skip invalid signatures
    }
  }

  console.log("\n📋 Summary:");
  console.log(`Target Error: ${targetError}`);
  console.log(`Found Match: ${found ? "✅ YES" : "❌ NO"}`);

  if (!found) {
    console.log("\n🚨 Next steps:");
    console.log("1. Deploy a test transaction and get the full error details");
    console.log("2. Check if MockTRX token has proper allowances");
    console.log("3. Verify LOP contract is not paused");
    console.log("4. Test with official 1inch frontend to compare");
  }
}

main().catch(console.error);
