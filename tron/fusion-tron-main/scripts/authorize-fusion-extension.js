const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔐 Authorizing FusionExtension in EscrowFactory...");

  // Load FusionExtension deployment
  const fusionDeployment = JSON.parse(
    fs.readFileSync("./deployments/sepolia-fusion-extension.json", "utf8")
  );
  console.log("📋 FusionExtension Address:", fusionDeployment.fusionExtension);
  console.log("📋 EscrowFactory Address:", fusionDeployment.escrowFactory);

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployer address:", deployer.address);

  // Connect to EscrowFactory
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
  const escrowFactory = EscrowFactory.attach(fusionDeployment.escrowFactory);

  console.log("⏳ Authorizing FusionExtension...");

  // Authorize the FusionExtension
  const tx = await escrowFactory.authorizeExtension(
    fusionDeployment.fusionExtension
  );
  console.log("📄 Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ FusionExtension authorized successfully!");

  // Verify authorization
  const isAuthorized = await escrowFactory.authorizedExtensions(
    fusionDeployment.fusionExtension
  );
  console.log("🔍 Authorization verified:", isAuthorized);

  return {
    fusionExtension: fusionDeployment.fusionExtension,
    escrowFactory: fusionDeployment.escrowFactory,
    authorized: isAuthorized,
  };
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Authorization failed:", error);
      process.exit(1);
    });
}

module.exports = main;
