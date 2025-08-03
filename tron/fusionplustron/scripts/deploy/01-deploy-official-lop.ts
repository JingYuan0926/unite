import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying Official 1inch Limit Order Protocol v4");

  // Ensure deployments directory exists
  mkdirSync("contracts/deployments", { recursive: true });

  // Deploy WrappedTokenMock as WETH (required dependency for testnet)
  const WrappedTokenMock = await ethers.getContractFactory("WrappedTokenMock");
  const weth = await WrappedTokenMock.deploy("Wrapped Ether", "WETH");
  await weth.waitForDeployment();
  console.log(
    "✅ WETH (WrappedTokenMock) deployed to:",
    await weth.getAddress()
  );

  // Deploy Official LimitOrderProtocol
  const LimitOrderProtocol =
    await ethers.getContractFactory("LimitOrderProtocol");
  const lop = await LimitOrderProtocol.deploy(await weth.getAddress());
  await lop.waitForDeployment();
  console.log("✅ Official LOP deployed to:", await lop.getAddress());

  // Verify domain separator
  const domainSeparator = await lop.DOMAIN_SEPARATOR();
  console.log("✅ Domain Separator:", domainSeparator);

  // Save deployment info
  const deployment = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    contracts: {
      WETH: await weth.getAddress(),
      LimitOrderProtocol: await lop.getAddress(),
      domainSeparator: domainSeparator,
    },
  };

  writeFileSync(
    "contracts/deployments/ethereum-sepolia.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("🎉 Official LOP deployment complete!");
  console.log(
    "📝 Deployment saved to contracts/deployments/ethereum-sepolia.json"
  );
}

main().catch(console.error);
