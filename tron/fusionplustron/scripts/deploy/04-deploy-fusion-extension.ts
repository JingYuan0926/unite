import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying TronFusionExtension to Ethereum Sepolia");
  console.log("================================================");

  // Read existing deployment data
  const deploymentPath = "contracts/deployments/ethereum-sepolia.json";
  let deployment: any;

  try {
    deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
  } catch (error) {
    console.error("❌ Failed to read deployment file:", error);
    process.exit(1);
  }

  // Verify required contracts are deployed
  const requiredContracts = ["LimitOrderProtocol", "EscrowFactory"];
  for (const contract of requiredContracts) {
    if (!deployment.contracts[contract]) {
      console.error(`❌ Required contract ${contract} not found in deployment`);
      process.exit(1);
    }
  }

  console.log("✅ Using deployed contracts:");
  console.log(
    `   - LimitOrderProtocol: ${deployment.contracts.LimitOrderProtocol}`
  );
  console.log(`   - EscrowFactory: ${deployment.contracts.EscrowFactory}`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`\n📋 Deploying with account: ${deployer.address}`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  Low balance warning: Less than 0.01 ETH");
  }

  // Deploy TronFusionExtension
  console.log("\n🔧 Deploying TronFusionExtension...");

  const TronFusionExtension = await ethers.getContractFactory(
    "TronFusionExtension"
  );

  // Estimate gas
  const deploymentData = TronFusionExtension.interface.encodeDeploy([
    deployment.contracts.LimitOrderProtocol,
    deployment.contracts.EscrowFactory,
  ]);

  const gasEstimate = await ethers.provider.estimateGas({
    data: deploymentData,
  });

  console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

  // Deploy with proper gas limit
  const fusionExtension = await TronFusionExtension.deploy(
    deployment.contracts.LimitOrderProtocol,
    deployment.contracts.EscrowFactory,
    {
      gasLimit: 2000000, // 2M gas limit for complex contract
    }
  );

  console.log("⏳ Deployment transaction sent, waiting for confirmation...");
  await fusionExtension.waitForDeployment();

  const extensionAddress = await fusionExtension.getAddress();
  console.log(`✅ TronFusionExtension deployed to: ${extensionAddress}`);

  // Verify deployment by calling view functions
  console.log("\n🔍 Verifying deployment...");

  try {
    const lopAddress = await fusionExtension.LIMIT_ORDER_PROTOCOL();
    const factoryAddress = await fusionExtension.ESCROW_FACTORY();
    const owner = await fusionExtension.owner();
    const trxRepresentation = await fusionExtension.TRX_REPRESENTATION();

    console.log("✅ Contract verification successful:");
    console.log(`   - LOP Address: ${lopAddress}`);
    console.log(`   - Factory Address: ${factoryAddress}`);
    console.log(`   - Owner: ${owner}`);
    console.log(`   - TRX Representation: ${trxRepresentation}`);

    // Verify addresses match deployment
    if (lopAddress !== deployment.contracts.LimitOrderProtocol) {
      throw new Error("LOP address mismatch");
    }
    if (factoryAddress !== deployment.contracts.EscrowFactory) {
      throw new Error("Factory address mismatch");
    }
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    process.exit(1);
  }

  // Update deployment file
  deployment.contracts.TronFusionExtension = extensionAddress;
  deployment.phase4 = {
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    gasUsed: gasEstimate.toString(),
    deployer: deployer.address,
  };

  writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  // Update .env file
  const envPath = ".env";
  let envContent = readFileSync(envPath, "utf8");

  // Update or add FUSION_EXTENSION_ADDRESS
  if (envContent.includes("FUSION_EXTENSION_ADDRESS=")) {
    envContent = envContent.replace(
      /FUSION_EXTENSION_ADDRESS=.*/,
      `FUSION_EXTENSION_ADDRESS=${extensionAddress}`
    );
  } else {
    envContent += `\nFUSION_EXTENSION_ADDRESS=${extensionAddress}\n`;
  }

  writeFileSync(envPath, envContent);

  console.log(`\n📄 Updated deployment file: ${deploymentPath}`);
  console.log(`📄 Updated environment file: ${envPath}`);

  // Display integration instructions
  console.log("\n🔗 INTEGRATION INSTRUCTIONS:");
  console.log("=============================");
  console.log("1. The TronFusionExtension is now deployed and ready to use");
  console.log(
    "2. It implements IPostInteraction for integration with LimitOrderProtocol"
  );
  console.log(
    "3. Orders should set their postInteraction to this contract address"
  );
  console.log("4. extraData should contain encoded TronSwapData structure");
  console.log(
    "5. The contract will emit events for off-chain Tron escrow creation"
  );

  console.log(
    "\n🎉 Phase 4 - TronFusionExtension deployment completed successfully!"
  );
  console.log(`📍 Contract Address: ${extensionAddress}`);
  console.log(
    `🔍 Verify on Etherscan: https://sepolia.etherscan.io/address/${extensionAddress}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
