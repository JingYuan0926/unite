const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔑 Authorizing FusionExtension in EscrowFactory...");

  // Load deployment data
  const fusionDeployment = JSON.parse(
    fs.readFileSync("./deployments/sepolia-fusion-extension.json", "utf8")
  );
  console.log("📋 FusionExtension Address:", fusionDeployment.fusionExtension);
  console.log("📋 EscrowFactory Address:", fusionDeployment.escrowFactory);

  // Get EscrowFactory contract
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
  const escrowFactory = EscrowFactory.attach(fusionDeployment.escrowFactory);

  // Check if already authorized
  const isAuthorized = await escrowFactory.authorizedExtensions(
    fusionDeployment.fusionExtension
  );

  if (isAuthorized) {
    console.log("✅ FusionExtension is already authorized!");
    return;
  }

  console.log("⏳ Authorizing FusionExtension...");

  // Authorize the extension
  const tx = await escrowFactory.authorizeExtension(
    fusionDeployment.fusionExtension
  );
  console.log("📄 Transaction hash:", tx.hash);

  // Wait for confirmation
  await tx.wait();
  console.log("✅ FusionExtension authorized successfully!");

  // Verify authorization
  const isNowAuthorized = await escrowFactory.authorizedExtensions(
    fusionDeployment.fusionExtension
  );
  console.log("🔍 Verification - Authorized:", isNowAuthorized);

  console.log("\n🎯 Phase 2 Complete!");
  console.log("✅ FusionExtension deployed and authorized");
  console.log("✅ EscrowFactory integration ready");
  console.log("📋 Next: Implement order builder and API (Phase 3)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Authorization failed:", error);
    process.exit(1);
  });
