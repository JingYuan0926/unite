const { ErrorDecoder } = require("ethers-decode-error");
const { ethers } = require("ethers");

// Error data from the failed transaction
const errorData = "0xf4840e96";

// Contract ABIs that might contain the error
const demoResolverABI =
  require("../../artifacts/contracts/ethereum/DemoResolver.sol/DemoResolver.json").abi;
const escrowFactoryABI =
  require("../../artifacts/contracts/ethereum/official-escrow/BaseEscrowFactory.sol/BaseEscrowFactory.json").abi;

async function decodeError() {
  console.log("🔍 Attempting to decode error:", errorData);

  try {
    // Create error decoder with both ABIs
    const errorDecoder = ErrorDecoder.create([
      demoResolverABI,
      escrowFactoryABI,
    ]);

    // Try to decode the error
    const decoded = await errorDecoder.decode({ data: errorData });

    console.log("✅ Successfully decoded error:");
    console.log("Error name:", decoded.name);
    console.log("Error signature:", decoded.signature);
    console.log("Error args:", decoded.args);
  } catch (decodeError) {
    console.log("❌ Could not decode with provided ABIs:", decodeError.message);

    // Try manual selector calculation for common errors
    console.log("\n🔍 Trying manual selector calculation...");

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
    ];

    const targetSelector = errorData.slice(0, 10); // First 4 bytes (8 hex chars + 0x)
    console.log("Target selector:", targetSelector);

    for (const errorSig of commonErrors) {
      const hash = ethers.keccak256(ethers.toUtf8Bytes(errorSig));
      const selector = hash.slice(0, 10);

      if (selector === targetSelector) {
        console.log(`✅ MATCH FOUND: ${errorSig}`);
        console.log(`Selector: ${selector}`);
        console.log(`Full hash: ${hash}`);
        return;
      }
    }

    console.log("❌ No matches found in common error list");
    console.log(
      "The error might be from a different contract or a custom error not in our list"
    );
  }
}

decodeError().catch(console.error);
