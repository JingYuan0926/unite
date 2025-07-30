const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 DEPLOYING COMPLETE 1INCH LIMIT ORDER PROTOCOL V4");
  console.log("================================================");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address))
  );

  // Sepolia WETH address (verified)
  const SEPOLIA_WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
  console.log("Using WETH address:", SEPOLIA_WETH);

  try {
    console.log("\n📦 Deploying LimitOrderProtocol...");

    // Get the contract factory for the LOP contract
    const LimitOrderProtocol = await ethers.getContractFactory(
      "LimitOrderProtocol"
    );

    console.log("✅ Contract factory loaded");
    console.log("⚡ Starting deployment...");

    // Deploy the contract with WETH address as constructor parameter
    const limitOrderProtocol = await LimitOrderProtocol.deploy(SEPOLIA_WETH);

    console.log("⏳ Waiting for deployment confirmation...");

    // Wait for deployment to be mined
    await limitOrderProtocol.waitForDeployment();
    const contractAddress = await limitOrderProtocol.getAddress();

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("===========================");
    console.log("Contract Address:", contractAddress);
    console.log("WETH Address:", SEPOLIA_WETH);
    console.log("Network: Sepolia");
    console.log("Deployer:", deployer.address);

    // Test basic functions immediately
    console.log("\n🧪 TESTING BASIC FUNCTIONS...");
    console.log("===============================");

    try {
      const owner = await limitOrderProtocol.owner();
      console.log("✅ owner():", owner);

      const domainSeparator = await limitOrderProtocol.DOMAIN_SEPARATOR();
      console.log(
        "✅ DOMAIN_SEPARATOR():",
        domainSeparator.substring(0, 10) + "..."
      );

      // Test hashOrder function with a sample order
      const sampleOrder = {
        salt: "1",
        maker: deployer.address,
        receiver: ethers.ZeroAddress,
        makerAsset: ethers.ZeroAddress, // ETH
        takerAsset: SEPOLIA_WETH, // WETH
        makingAmount: ethers.parseEther("0.001"),
        takingAmount: ethers.parseEther("0.001"),
        makerTraits: "0",
      };

      const orderHash = await limitOrderProtocol.hashOrder(sampleOrder);
      console.log("✅ hashOrder():", orderHash.substring(0, 10) + "...");

      // Test bitInvalidatorForOrder
      const bitInvalidator = await limitOrderProtocol.bitInvalidatorForOrder(
        deployer.address,
        0
      );
      console.log("✅ bitInvalidatorForOrder():", bitInvalidator.toString());

      console.log("\n🎊 ALL CORE FUNCTIONS WORKING!");
    } catch (testError) {
      console.log("❌ Function test failed:", testError.message);
    }

    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      wethAddress: SEPOLIA_WETH,
      network: "sepolia",
      chainId: 11155111,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      gasUsed: "estimated", // Would need receipt for actual gas
      verified: false,
    };

    const fs = require("fs");
    fs.writeFileSync(
      "./deployments/sepolia-lop-complete-v2.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(
      "\n📁 Deployment info saved to: deployments/sepolia-lop-complete-v2.json"
    );

    console.log("\n🔗 NEXT STEPS:");
    console.log("1. Verify contract on Etherscan:");
    console.log(
      `   npx hardhat verify --network sepolia ${contractAddress} ${SEPOLIA_WETH}`
    );
    console.log("2. Test with your existing scripts");
    console.log("3. Update your atomic-swap.js to use this address");

    return contractAddress;
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 SOLUTION: Add more ETH to deployer account");
      console.log("Deployer:", deployer.address);
    }

    if (error.message.includes("missing dependency")) {
      console.log("\n💡 SOLUTION: Install missing dependencies");
      console.log(
        "Run: npm install @openzeppelin/contracts @1inch/solidity-utils"
      );
    }

    throw error;
  }
}

// Execute deployment
main()
  .then((address) => {
    console.log(`\n🏁 COMPLETE! LOP deployed at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 DEPLOYMENT FAILED:", error.message);
    process.exit(1);
  });
