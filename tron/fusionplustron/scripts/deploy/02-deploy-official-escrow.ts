import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying Official Escrow System");

  // Read LOP deployment
  const deployment = JSON.parse(
    readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
  );
  const lopAddress = deployment.contracts.LimitOrderProtocol;
  const wethAddress = deployment.contracts.WETH;

  console.log("📍 Using LOP at:", lopAddress);
  console.log("📍 Using WETH at:", wethAddress);

  // Deploy EscrowFactory with official parameters
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
  const escrowFactory = await EscrowFactory.deploy(
    lopAddress, // limitOrderProtocol
    ethers.ZeroAddress, // feeToken (zero for testnet)
    ethers.ZeroAddress, // accessToken (zero for testnet)
    (await ethers.getSigners())[0].address, // owner
    86400, // rescueDelaySrc (24 hours)
    86400 // rescueDelayDst (24 hours)
  );
  await escrowFactory.waitForDeployment();
  console.log(
    "✅ EscrowFactory deployed to:",
    await escrowFactory.getAddress()
  );

  // Verify implementations
  const srcImpl = await escrowFactory.ESCROW_SRC_IMPLEMENTATION();
  const dstImpl = await escrowFactory.ESCROW_DST_IMPLEMENTATION();
  console.log("✅ Src Implementation:", srcImpl);
  console.log("✅ Dst Implementation:", dstImpl);

  // Update deployment file
  deployment.contracts.EscrowFactory = await escrowFactory.getAddress();
  deployment.contracts.EscrowSrcImplementation = srcImpl;
  deployment.contracts.EscrowDstImplementation = dstImpl;

  writeFileSync(
    "contracts/deployments/ethereum-sepolia.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("🎉 Official Escrow System deployment complete!");
  console.log(
    "📝 Deployment updated in contracts/deployments/ethereum-sepolia.json"
  );
}

main().catch(console.error);
