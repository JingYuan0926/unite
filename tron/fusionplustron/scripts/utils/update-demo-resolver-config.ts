import { readFileSync, writeFileSync } from "fs";

async function main() {
  console.log("🔧 Updating DEMO_RESOLVER_ADDRESS in .env configuration...");

  // Read the deployment file to get the new address
  const deployment = JSON.parse(
    readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
  );

  const newDemoResolverAddress = deployment.contracts.DemoResolver;
  console.log("📋 New DemoResolver Address:", newDemoResolverAddress);

  // Update .env.example
  try {
    let envExample = readFileSync(".env.example", "utf8");
    envExample = envExample.replace(
      /DEMO_RESOLVER_ADDRESS=0x[a-fA-F0-9]{40}/,
      `DEMO_RESOLVER_ADDRESS=${newDemoResolverAddress}`
    );
    writeFileSync(".env.example", envExample);
    console.log("✅ Updated .env.example");
  } catch (error) {
    console.log("⚠️ Could not update .env.example:", error);
  }

  // Update .env if it exists
  try {
    let env = readFileSync(".env", "utf8");
    env = env.replace(
      /DEMO_RESOLVER_ADDRESS=0x[a-fA-F0-9]{40}/,
      `DEMO_RESOLVER_ADDRESS=${newDemoResolverAddress}`
    );
    writeFileSync(".env", env);
    console.log("✅ Updated .env");
  } catch (error) {
    console.log("⚠️ .env file not found or could not be updated");
    console.log("📝 Please manually add this to your .env file:");
    console.log(`DEMO_RESOLVER_ADDRESS=${newDemoResolverAddress}`);
  }

  console.log("\n🎉 Configuration update complete!");
  console.log("📋 Summary:");
  console.log(
    `   Old DemoResolver (deprecated): 0xA7fa9C3a4BDBa7A2d29F8A2bC62Cf75c69C4bf3F`
  );
  console.log(
    `   New DemoResolver (with executeAtomicSwap): ${newDemoResolverAddress}`
  );
  console.log(
    "\n✅ Ready to test atomic swap with real escrow address extraction!"
  );
}

main().catch(console.error);
