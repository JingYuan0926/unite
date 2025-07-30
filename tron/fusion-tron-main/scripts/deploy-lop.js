const { ethers } = require("hardhat");

async function main() {
  // Sepolia WETH address
  const SEPOLIA_WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

  console.log("Deploying LimitOrderProtocol to Sepolia...");

  const LimitOrderProtocol = await ethers.getContractFactory(
    "LimitOrderProtocol"
  );
  const limitOrderProtocol = await LimitOrderProtocol.deploy(SEPOLIA_WETH);

  await limitOrderProtocol.waitForDeployment();

  console.log(
    "LimitOrderProtocol deployed to:",
    await limitOrderProtocol.getAddress()
  );

  // Save deployment address
  const fs = require("fs");
  const contractAddress = await limitOrderProtocol.getAddress();
  const deployment = {
    limitOrderProtocol: contractAddress,
    weth: SEPOLIA_WETH,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments/sepolia-lop.json",
    JSON.stringify(deployment, null, 2)
  );

  return contractAddress;
}

main().catch(console.error);
