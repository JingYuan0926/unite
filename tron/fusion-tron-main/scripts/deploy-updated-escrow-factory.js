const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log(
    "🚀 Deploying Updated EscrowFactory with Authorization to Sepolia..."
  );

  // Deploy the updated EscrowFactory
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
  console.log("⏳ Deploying EscrowFactory...");

  const escrowFactory = await EscrowFactory.deploy();
  await escrowFactory.waitForDeployment();

  const factoryAddress = await escrowFactory.getAddress();
  console.log("✅ EscrowFactory deployed to:", factoryAddress);

  // Prepare deployment data
  const deployment = {
    escrowFactory: factoryAddress,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    features: [
      "Authorization system for extensions",
      "LOP integration ready",
      "Hashlock/Timelock atomic swaps",
    ],
  };

  // Save deployment data
  fs.writeFileSync(
    "./deployments/sepolia-escrow-factory-updated.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log(
    "📄 Deployment saved to: ./deployments/sepolia-escrow-factory-updated.json"
  );

  // Update .env file (backup first)
  const envPath = "./.env";
  if (fs.existsSync(envPath)) {
    const envBackup = fs.readFileSync(envPath, "utf8");
    fs.writeFileSync("./.env.backup", envBackup);
    console.log("💾 Backed up .env to .env.backup");

    // Update ETH_ESCROW_FACTORY_ADDRESS
    const updatedEnv = envBackup.replace(
      /ETH_ESCROW_FACTORY_ADDRESS=.*/,
      `ETH_ESCROW_FACTORY_ADDRESS=${factoryAddress}`
    );
    fs.writeFileSync(envPath, updatedEnv);
    console.log("📝 Updated ETH_ESCROW_FACTORY_ADDRESS in .env");
  }

  console.log("\n🎯 Next Steps:");
  console.log("1. Redeploy FusionExtension with new factory address:");
  console.log(
    "   npx hardhat run scripts/deploy-fusion-extension.js --network sepolia"
  );
  console.log("2. Authorize FusionExtension:");
  console.log(
    "   npx hardhat run scripts/authorize-fusion-extension.js --network sepolia"
  );
  console.log("3. Test integration");

  return factoryAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
