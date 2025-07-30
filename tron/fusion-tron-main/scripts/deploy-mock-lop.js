const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Mock Limit Order Protocol to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy MockLimitOrderProtocol
  console.log("\n📦 Deploying MockLimitOrderProtocol...");
  const MockLOP = await ethers.getContractFactory("MockLimitOrderProtocol");
  const mockLOP = await MockLOP.deploy();
  await mockLOP.waitForDeployment();

  const lopAddress = await mockLOP.getAddress();
  console.log("✅ MockLimitOrderProtocol deployed to:", lopAddress);

  // Update the deployment file
  const deploymentPath = path.join(
    __dirname,
    "../deployments/sepolia-lop-complete.json"
  );
  const deploymentData = {
    limitOrderProtocol: lopAddress,
    weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Sepolia WETH
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    txHash: mockLOP.deploymentTransaction().hash,
    blockNumber: await deployer.provider.getBlockNumber(),
    gasUsed: "estimated",
    contracts: {
      mockLimitOrderProtocol: {
        address: lopAddress,
        deploymentTx: mockLOP.deploymentTransaction().hash,
      },
    },
  };

  // Write deployment data
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log("✅ Deployment info saved to:", deploymentPath);

  // Fund the contract with some ETH for testing
  console.log("\n💰 Funding contract with test ETH...");
  const fundTx = await deployer.sendTransaction({
    to: lopAddress,
    value: ethers.parseEther("0.1"), // 0.1 ETH for testing
  });
  await fundTx.wait();
  console.log("✅ Contract funded with 0.1 ETH");

  console.log("\n🎉 Deployment complete!");
  console.log("📋 Contract Address:", lopAddress);
  console.log("🔗 Network: Sepolia Testnet");
  console.log("⛽ Transaction:", mockLOP.deploymentTransaction().hash);

  // Verify on Etherscan if API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Waiting for blocks before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      await hre.run("verify:verify", {
        address: lopAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
