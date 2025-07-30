const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying FusionExtension to Sepolia...");

  // Load existing LOP deployment
  const lopDeployment = JSON.parse(
    fs.readFileSync("./deployments/sepolia-lop-complete.json", "utf8")
  );
  console.log("📋 LOP Address:", lopDeployment.limitOrderProtocol);

  // Get existing EscrowFactory address from environment
  const escrowFactoryAddress = process.env.ETH_ESCROW_FACTORY_ADDRESS;
  if (!escrowFactoryAddress) {
    throw new Error(
      "❌ ETH_ESCROW_FACTORY_ADDRESS not found in environment variables"
    );
  }
  console.log("📋 EscrowFactory Address:", escrowFactoryAddress);

  // Deploy FusionExtension
  const FusionExtension = await ethers.getContractFactory("FusionExtension");
  console.log("⏳ Deploying FusionExtension...");

  const fusionExtension = await FusionExtension.deploy(
    lopDeployment.limitOrderProtocol,
    escrowFactoryAddress
  );
  await fusionExtension.waitForDeployment();

  const extensionAddress = await fusionExtension.getAddress();
  console.log("✅ FusionExtension deployed to:", extensionAddress);

  // Prepare deployment data
  const deployment = {
    fusionExtension: extensionAddress,
    limitOrderProtocol: lopDeployment.limitOrderProtocol,
    escrowFactory: escrowFactoryAddress,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
  };

  // Save deployment data
  fs.writeFileSync(
    "./deployments/sepolia-fusion-extension.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log(
    "📄 Deployment saved to: ./deployments/sepolia-fusion-extension.json"
  );

  console.log("\n🎯 Next Steps:");
  console.log("1. Authorize FusionExtension in EscrowFactory:");
  console.log(`   escrowFactory.authorizeExtension("${extensionAddress}")`);
  console.log("2. Test integration with LOP orders");
  console.log("3. Implement order builder and API");

  return {
    fusionExtension: extensionAddress,
    limitOrderProtocol: lopDeployment.limitOrderProtocol,
    escrowFactory: escrowFactoryAddress,
  };
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
