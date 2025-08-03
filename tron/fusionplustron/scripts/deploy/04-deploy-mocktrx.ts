import { ethers } from "hardhat";
import { writeFileSync, readFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying MockTRX token for LOP integration...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    "ETH"
  );

  // Deploy MockTRX
  const MockTRX = await ethers.getContractFactory("MockTRX");
  const mockTRX = await MockTRX.deploy();
  await mockTRX.waitForDeployment();

  const mockTRXAddress = await mockTRX.getAddress();
  console.log("✅ MockTRX deployed to:", mockTRXAddress);

  // Get token details
  const name = await mockTRX.name();
  const symbol = await mockTRX.symbol();
  const decimals = await mockTRX.decimals();
  const totalSupply = await mockTRX.totalSupply();

  console.log("📋 Token Details:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals);
  console.log("   Total Supply:", ethers.formatEther(totalSupply), symbol);

  // Update deployment file
  try {
    let deployment = JSON.parse(
      readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
    );

    deployment.contracts.MockTRX = mockTRXAddress;
    deployment.lastUpdated = new Date().toISOString();

    writeFileSync(
      "contracts/deployments/ethereum-sepolia.json",
      JSON.stringify(deployment, null, 2)
    );

    console.log("✅ Updated deployment file with MockTRX address");
  } catch (error) {
    console.error("❌ Failed to update deployment file:", error);
  }

  console.log("\n🎉 MockTRX deployment complete!");
  console.log(
    "🔗 Etherscan:",
    `https://sepolia.etherscan.io/address/${mockTRXAddress}`
  );
  console.log("\n📋 Next steps:");
  console.log("1. Mint MockTRX tokens to User B's address");
  console.log(
    "2. Update CrossChainOrchestrator to use this MockTRX address as takerAsset"
  );
  console.log("3. Test the complete LOP integration flow");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
