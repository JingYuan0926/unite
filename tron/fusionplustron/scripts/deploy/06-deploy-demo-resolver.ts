import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Deploy DemoResolver.sol - Our permissionless solver contract
 * This allows us to demonstrate the complete atomic swap flow
 */

async function main() {
  console.log("🚀 DEPLOYING DEMORESOLVER CONTRACT");
  console.log("==================================\n");

  // Load existing deployment addresses
  const deploymentPath = path.join(
    __dirname,
    "../../contracts/deployments/ethereum-sepolia.json"
  );

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      "ethereum-sepolia.json not found. Please deploy LOP and EscrowFactory first."
    );
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const lopAddress = deployments.contracts?.LimitOrderProtocol;
  const escrowFactoryAddress = deployments.contracts?.EscrowFactory;

  if (!lopAddress || !escrowFactoryAddress) {
    throw new Error("LOP or EscrowFactory address not found in deployments");
  }

  console.log("📋 DEPLOYMENT CONFIGURATION");
  console.log("===========================");
  console.log(`- Network: Sepolia Testnet`);
  console.log(`- LimitOrderProtocol: ${lopAddress}`);
  console.log(`- EscrowFactory: ${escrowFactoryAddress}`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`- Deployer: ${deployer.address}`);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`- Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient ETH balance for deployment");
  }

  console.log("\n🔨 DEPLOYING DEMORESOLVER");
  console.log("=========================");

  // Deploy DemoResolver contract
  const DemoResolver = await ethers.getContractFactory("DemoResolver");

  console.log("Deploying DemoResolver with constructor parameters:");
  console.log(`- LOP Address: ${lopAddress}`);
  console.log(`- EscrowFactory Address: ${escrowFactoryAddress}`);

  const demoResolver = await DemoResolver.deploy(
    lopAddress,
    escrowFactoryAddress
  );

  console.log(
    `⏳ Deployment transaction: ${demoResolver.deploymentTransaction()?.hash}`
  );

  // Wait for deployment confirmation
  await demoResolver.waitForDeployment();
  const demoResolverAddress = await demoResolver.getAddress();

  console.log(`✅ DemoResolver deployed to: ${demoResolverAddress}`);

  // Verify deployment by calling view functions
  console.log("\n🔍 VERIFYING DEPLOYMENT");
  console.log("======================");

  try {
    const deployedLOP = await demoResolver.LOP();
    const deployedEscrowFactory = await demoResolver.ESCROW_FACTORY();

    console.log(
      `✅ LOP Address: ${deployedLOP} (${deployedLOP === lopAddress ? "CORRECT" : "MISMATCH"})`
    );
    console.log(
      `✅ EscrowFactory Address: ${deployedEscrowFactory} (${deployedEscrowFactory === escrowFactoryAddress ? "CORRECT" : "MISMATCH"})`
    );

    // Test getEscrowAddress function with dummy data
    const dummyImmutables = {
      orderHash: ethers.ZeroHash,
      hashlock: ethers.ZeroHash,
      maker: { get: () => deployer.address },
      taker: { get: () => deployer.address },
      token: { get: () => ethers.ZeroAddress },
      amount: ethers.parseEther("0.001"),
      safetyDeposit: ethers.parseEther("0.0001"),
      timelocks: { get: () => Math.floor(Date.now() / 1000) },
    };

    // Note: We can't test getEscrowAddress easily due to complex struct format
    console.log(`✅ Contract functions accessible`);
  } catch (error) {
    console.log(`⚠️  Verification warning: ${error.message}`);
  }

  // Update deployments file
  console.log("\n💾 UPDATING DEPLOYMENTS FILE");
  console.log("============================");

  deployments.DemoResolver = {
    address: demoResolverAddress,
    constructorArgs: [lopAddress, escrowFactoryAddress],
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    network: "sepolia",
    purpose: "Permissionless solver for atomic swap demonstration",
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  console.log(`✅ Updated: ${deploymentPath}`);

  console.log("\n🎉 DEPLOYMENT COMPLETE");
  console.log("======================");
  console.log(`✅ DemoResolver: ${demoResolverAddress}`);
  console.log(
    `✅ Etherscan: https://sepolia.etherscan.io/address/${demoResolverAddress}`
  );
  console.log(`✅ Ready for atomic swap demonstration!`);

  console.log("\n📋 NEXT STEPS");
  console.log("=============");
  console.log("1. Run the final atomic swap demo script");
  console.log("2. Execute complete ETH ↔ TRX atomic swap");
  console.log("3. Verify all four transaction stages");
  console.log("4. Celebrate successful implementation! 🎊");

  return {
    demoResolver: demoResolverAddress,
    lop: lopAddress,
    escrowFactory: escrowFactoryAddress,
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export default main;
