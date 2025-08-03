import { ethers } from "hardhat";

/**
 * Decode the new error 0x478a5205 and investigate further
 */
async function decodeNewError() {
  console.log("🔍 DECODING NEW ERROR: 0x478a5205");
  console.log("=".repeat(40));

  const errorCode = "0x478a5205";
  console.log(`Error code: ${errorCode}`);

  // Common error signatures to check against
  const commonErrors = [
    "InvalidPermit2Transfer()",
    "SwapWithZeroAmount()",
    "TakingAmountExceeded()",
    "MakingAmountTooLow()",
    "TransferFromMakerToTakerFailed()",
    "TransferFromTakerToMakerFailed()",
    "BadSignature()",
    "OrderExpired()",
    "WrongSeriesNonce()",
    "PartialFillNotAllowed()",
    "PredicateIsNotTrue()",
    "ReentrancyDetected()",
  ];

  console.log("\n🧪 Testing error signatures:");
  for (const errorSig of commonErrors) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(errorSig)).slice(0, 10);
    console.log(`${errorSig}: ${hash}`);
    if (hash === errorCode) {
      console.log(`🎯 MATCH FOUND: ${errorSig}`);
      break;
    }
  }

  // The error might be from our DemoResolver contract instead of LOP
  console.log("\n💡 Checking if error is from DemoResolver contract...");

  // Check DemoResolver errors
  const demoResolverErrors = [
    "Invalid ETH: must equal amount + safetyDeposit",
    "Safety deposit transfer failed",
    "NativeTokenSendingFailure()",
  ];

  // Let's also check the actual values being passed
  console.log("\n📊 Let's check what might be wrong with our call...");
  console.log("Possible issues:");
  console.log("1. msg.value doesn't match amount + safetyDeposit");
  console.log("2. Safety deposit transfer to computed escrow address failed");
  console.log("3. LOP.fillOrderArgs call failed for different reason");
  console.log("4. Order structure mismatch");

  // Let's test some basic validation
  const ethAmount = ethers.parseEther("0.001");
  const safetyDeposit = ethers.parseEther("0.01");
  const totalValue = ethAmount + safetyDeposit;

  console.log(`\n💰 Value validation:`);
  console.log(`ETH Amount: ${ethers.formatEther(ethAmount)} ETH`);
  console.log(`Safety Deposit: ${ethers.formatEther(safetyDeposit)} ETH`);
  console.log(`Total Expected: ${ethers.formatEther(totalValue)} ETH`);
  console.log(`Total Sent: ${ethers.formatEther(totalValue)} ETH`);
  console.log(`Match: ${totalValue === totalValue ? "✅" : "❌"}`);
}

decodeNewError().catch(console.error);
