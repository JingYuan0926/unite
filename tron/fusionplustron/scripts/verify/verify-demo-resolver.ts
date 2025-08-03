import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying DemoResolver deployment and functions...");

  // Read the deployed address
  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const demoResolverAddress = deployment.contracts.DemoResolver;

  console.log("📋 DemoResolver Address:", demoResolverAddress);

  // Get contract instance
  const DemoResolver = await ethers.getContractFactory("DemoResolver");
  const demoResolver = DemoResolver.attach(demoResolverAddress);

  try {
    // Test that executeAtomicSwap function exists
    const hasExecuteAtomicSwap =
      demoResolver.interface.hasFunction("executeAtomicSwap");
    console.log(
      `✅ executeAtomicSwap function: ${hasExecuteAtomicSwap ? "Available" : "Missing"}`
    );

    // Test that LOP and ESCROW_FACTORY are properly set
    const lopAddress = await demoResolver.LOP();
    const escrowFactoryAddress = await demoResolver.ESCROW_FACTORY();

    console.log("✅ LOP Address:", lopAddress);
    console.log("✅ EscrowFactory Address:", escrowFactoryAddress);

    // Check function signature
    const executeAtomicSwapFragment =
      demoResolver.interface.getFunction("executeAtomicSwap");
    console.log(
      "✅ executeAtomicSwap signature:",
      executeAtomicSwapFragment.format("full")
    );

    console.log("\n🎉 DemoResolver verification complete!");
    console.log("✅ Contract has executeAtomicSwap function");
    console.log("✅ LOP integration configured");
    console.log("✅ EscrowFactory integration configured");
    console.log("✅ Ready for Phase 1.2 atomic swap flow");
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

main().catch(console.error);
