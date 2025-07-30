const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  require("dotenv").config();

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
  const cleanKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
  const wallet = new ethers.Wallet(cleanKey, provider);

  console.log("🔗 Connected to Ethereum Sepolia");
  console.log("👤 Wallet:", wallet.address);

  // Load deployment addresses
  const fusionDeployment = JSON.parse(
    fs.readFileSync("./deployments/sepolia-fusion-extension.json", "utf8")
  );
  const escrowDeployment = JSON.parse(
    fs.readFileSync("./deployments/sepolia-escrow-factory-updated.json", "utf8")
  );

  const addresses = {
    fusionExtension: fusionDeployment.fusionExtension,
    escrowFactory: escrowDeployment.escrowFactory,
  };

  console.log("📋 Contract Addresses:");
  console.log("  FusionExtension:", addresses.fusionExtension);
  console.log("  EscrowFactory:", addresses.escrowFactory);

  // Setup EscrowFactory contract
  const escrowABI = [
    "function authorizeExtension(address extension) external",
    "function authorizedExtensions(address) external view returns (bool)",
    "function owner() external view returns (address)",
  ];

  const escrowContract = new ethers.Contract(
    addresses.escrowFactory,
    escrowABI,
    wallet
  );

  // Check current owner
  const owner = await escrowContract.owner();
  console.log("📋 EscrowFactory owner:", owner);
  console.log("📋 Our wallet:", wallet.address);

  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.log("❌ Error: Our wallet is not the owner of EscrowFactory");
    return;
  }

  // Check current authorization status
  console.log("\n🔍 Checking current authorization status...");

  const fusionAuthorized = await escrowContract.authorizedExtensions(
    addresses.fusionExtension
  );
  const walletAuthorized = await escrowContract.authorizedExtensions(
    wallet.address
  );

  console.log("  FusionExtension authorized:", fusionAuthorized);
  console.log("  Test wallet authorized:", walletAuthorized);

  // Authorize FusionExtension if not already authorized
  if (!fusionAuthorized) {
    console.log("\n🔐 Authorizing FusionExtension...");
    const tx1 = await escrowContract.authorizeExtension(
      addresses.fusionExtension
    );
    console.log("   Transaction hash:", tx1.hash);
    await tx1.wait();
    console.log("✅ FusionExtension authorized successfully");
  } else {
    console.log("✅ FusionExtension already authorized");
  }

  // Authorize test wallet for direct testing if not already authorized
  if (!walletAuthorized) {
    console.log("\n🔐 Authorizing test wallet for direct testing...");
    const tx2 = await escrowContract.authorizeExtension(wallet.address);
    console.log("   Transaction hash:", tx2.hash);
    await tx2.wait();
    console.log("✅ Test wallet authorized successfully");
  } else {
    console.log("✅ Test wallet already authorized");
  }

  // Verify final status
  console.log("\n🔍 Final authorization status:");
  const fusionAuthorizedFinal = await escrowContract.authorizedExtensions(
    addresses.fusionExtension
  );
  const walletAuthorizedFinal = await escrowContract.authorizedExtensions(
    wallet.address
  );

  console.log("  FusionExtension authorized:", fusionAuthorizedFinal);
  console.log("  Test wallet authorized:", walletAuthorizedFinal);

  console.log("\n🎉 Authorization complete!");
  console.log("✅ Ready for testing!");
}

main().catch(console.error);
