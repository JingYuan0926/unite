import { ethers } from "hardhat";

async function main() {
  console.log("🔍 DECODING DEMORESOLVER ERROR: 0x478a5205");
  console.log("New error with fresh User A account - progress!\n");

  const targetError = "0x478a5205";
  console.log("Target Error:", targetError);

  // DemoResolver and related contract errors
  const demoResolverErrors = [
    // Common validation errors
    "InvalidAmount()",
    "InvalidDeposit()",
    "InvalidValue()",
    "InvalidETH()",
    "InvalidSafetyDeposit()",
    "InsufficientValue()",
    "ExcessiveValue()",

    // Order-related errors
    "InvalidOrder()",
    "OrderExpired()",
    "OrderFailed()",
    "InvalidOrderHash()",
    "BadOrder()",

    // Escrow-related errors
    "EscrowCreationFailed()",
    "EscrowDeploymentFailed()",
    "InvalidEscrowAddress()",
    "EscrowTransferFailed()",
    "SafetyDepositFailed()",

    // LOP integration errors
    "LOPCallFailed()",
    "FillOrderFailed()",
    "PostInteractionFailed()",
    "InvalidLOPCall()",

    // Value validation errors (likely candidates)
    "ValueMismatch()",
    "InvalidMsgValue()",
    "AmountSafetyDepositMismatch()",
    "TotalValueIncorrect()",

    // EscrowFactory errors
    "FactoryCallFailed()",
    "CreateEscrowFailed()",
    "AddressComputationFailed()",

    // Timelock errors
    "InvalidTimelocks()",
    "TimelockDeploymentFailed()",
    "BadTimelockEncoding()",

    // Generic contract errors
    "CallFailed()",
    "ExecutionFailed()",
    "ValidationFailed()",
    "ReentrancyDetected()",
    "Unauthorized()",
    "Forbidden()",
  ];

  console.log(
    `🔍 Checking ${demoResolverErrors.length} DemoResolver error signatures...\n`
  );

  let found = false;

  for (const errorSig of demoResolverErrors) {
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
    console.log("❌ Error signature not found in DemoResolver list");

    console.log("\n🔍 Manual Analysis:");
    console.log("Error bytes: 0x478a5205");
    console.log("As uint32:", parseInt(targetError.slice(2), 16));

    // Since this is a new error with the fresh account, it's likely:
    // 1. A validation error in DemoResolver contract
    // 2. An issue with the immutables format
    // 3. A problem with the escrow address calculation
    // 4. A timelock encoding issue

    console.log("\n💡 Most Likely Causes:");
    console.log("1. DemoResolver value validation (amount + safetyDeposit)");
    console.log("2. Immutables format issue (BigInt encoding)");
    console.log("3. EscrowFactory address calculation problem");
    console.log("4. Timelock encoding validation");
    console.log("5. Custom validation in DemoResolver contract");
  }

  // Let's also check the DemoResolver contract for clues
  console.log("\n🔍 Checking DemoResolver Contract Requirements:");

  try {
    const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
    const demoResolverAddress = deployment.contracts.DemoResolver;
    const DemoResolver = await ethers.getContractAt(
      "DemoResolver",
      demoResolverAddress
    );

    console.log(`DemoResolver Address: ${demoResolverAddress}`);

    // Test basic contract interaction
    const provider = ethers.provider;
    const code = await provider.getCode(demoResolverAddress);
    console.log(`Contract exists: ${code !== "0x" ? "✅ YES" : "❌ NO"}`);
    console.log(`Code length: ${code.length} bytes`);
  } catch (error: any) {
    console.log("❌ Contract check failed:", error.message);
  }

  console.log("\n📋 ANALYSIS SUMMARY:");
  console.log("🎯 PROGRESS: Fresh User A account bypassed invalidation!");
  console.log("🎯 NEW CHALLENGE: DemoResolver validation error");
  console.log("🎯 LIKELY CAUSE: Value calculation or immutables format");
  console.log("🎯 NEXT STEP: Debug DemoResolver parameter validation");

  console.log("\n💡 DEBUGGING STRATEGY:");
  console.log("1. Check DemoResolver.sol line 67-68 (value validation)");
  console.log("2. Verify immutables format (BigInt vs Number)");
  console.log("3. Test with simplified immutables");
  console.log("4. Validate escrow address calculation");
}

main().catch(console.error);
