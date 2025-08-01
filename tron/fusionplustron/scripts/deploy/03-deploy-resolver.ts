import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying Official Resolver");

  // Read previous deployments
  const deployment = JSON.parse(
    readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
  );

  const lopAddress = deployment.contracts.LimitOrderProtocol;
  const escrowFactoryAddress = deployment.contracts.EscrowFactory;
  const ownerAddress = (await ethers.getSigners())[0].address;

  console.log("📍 Using LOP at:", lopAddress);
  console.log("📍 Using EscrowFactory at:", escrowFactoryAddress);
  console.log("📍 Using Owner at:", ownerAddress);

  // Deploy Official Resolver
  const Resolver = await ethers.getContractFactory("Resolver");
  const resolver = await Resolver.deploy(
    escrowFactoryAddress, // factory
    lopAddress, // lop
    ownerAddress // initialOwner
  );
  await resolver.waitForDeployment();
  console.log("✅ Official Resolver deployed to:", await resolver.getAddress());

  // Verify resolver initialization (owner is public in Ownable)
  const resolverOwner = await resolver.owner();
  console.log("✅ Resolver Owner:", resolverOwner);

  // Update deployment
  deployment.contracts.Resolver = await resolver.getAddress();
  writeFileSync(
    "contracts/deployments/ethereum-sepolia.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("🎉 Official Resolver deployment complete!");
  console.log(
    "📝 Deployment updated in contracts/deployments/ethereum-sepolia.json"
  );
}

main().catch(console.error);
