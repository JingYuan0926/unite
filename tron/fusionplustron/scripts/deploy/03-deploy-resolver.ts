import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying DemoResolver with LOP + EscrowFactory Integration");

  // Use hardcoded addresses for now (user will deploy their own LOP for hackathon)
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0"; // Current LOP on Sepolia
  const escrowFactoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA"; // EscrowFactory on Sepolia

  console.log("📍 Using LOP at:", lopAddress);
  console.log("📍 Using EscrowFactory at:", escrowFactoryAddress);

  // Deploy DemoResolver
  const DemoResolver = await ethers.getContractFactory("DemoResolver");
  const demoResolver = await DemoResolver.deploy(
    lopAddress, // LOP address (payable)
    escrowFactoryAddress // EscrowFactory address
  );
  await demoResolver.waitForDeployment();

  const deployedAddress = await demoResolver.getAddress();
  console.log("✅ DemoResolver deployed to:", deployedAddress);

  // Verify deployment by checking the immutable addresses
  const lopCheck = await demoResolver.LOP();
  const factoryCheck = await demoResolver.ESCROW_FACTORY();
  console.log("✅ LOP address verified:", lopCheck);
  console.log("✅ EscrowFactory address verified:", factoryCheck);

  // Update deployment (create if doesn't exist)
  let deployment;
  try {
    deployment = JSON.parse(
      readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
    );
  } catch (e) {
    deployment = { contracts: {} };
  }

  deployment.contracts.DemoResolver = deployedAddress;
  writeFileSync(
    "contracts/deployments/ethereum-sepolia.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("🎉 DemoResolver deployment complete!");
  console.log("📋 Contract addresses:");
  console.log("   DemoResolver:", deployedAddress);
  console.log("   LOP:", lopAddress);
  console.log("   EscrowFactory:", escrowFactoryAddress);
  console.log(
    "📝 Deployment updated in contracts/deployments/ethereum-sepolia.json"
  );
}

main().catch(console.error);
