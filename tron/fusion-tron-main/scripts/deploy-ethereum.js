const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Fusion+ EscrowFactory to Ethereum Sepolia...");

  // Get network info
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log("📋 Deployment Details:");
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(
    `Balance: ${hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    )} ETH`
  );

  // Deploy EscrowFactory
  console.log("\n📦 Deploying EscrowFactory...");
  const EscrowFactory = await hre.ethers.getContractFactory("EscrowFactory");

  const escrowFactory = await EscrowFactory.deploy();
  await escrowFactory.waitForDeployment();

  const escrowFactoryAddress = await escrowFactory.getAddress();
  console.log(`✅ EscrowFactory deployed to: ${escrowFactoryAddress}`);

  // Verify contract constants
  console.log("\n🔍 Verifying contract configuration...");
  const finalityBlocks = await escrowFactory.FINALITY_BLOCKS();
  const minCancelDelay = await escrowFactory.MIN_CANCEL_DELAY();
  const minSafetyDeposit = await escrowFactory.MIN_SAFETY_DEPOSIT();
  const revealDelay = await escrowFactory.REVEAL_DELAY();

  console.log(
    `Finality Blocks: ${finalityBlocks} (≈${finalityBlocks * 12} seconds)`
  );
  console.log(
    `Min Cancel Delay: ${minCancelDelay} seconds (${
      minCancelDelay / 60
    } minutes)`
  );
  console.log(
    `Min Safety Deposit: ${hre.ethers.formatEther(minSafetyDeposit)} ETH`
  );
  console.log(`Reveal Delay: ${revealDelay} seconds`);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      EscrowFactory: {
        address: escrowFactoryAddress,
        txHash: escrowFactory.deploymentTransaction().hash,
        blockNumber: escrowFactory.deploymentTransaction().blockNumber,
      },
    },
    configuration: {
      finalityBlocks: finalityBlocks.toString(),
      minCancelDelay: minCancelDelay.toString(),
      minSafetyDeposit: minSafetyDeposit.toString(),
      revealDelay: revealDelay.toString(),
    },
  };

  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Write deployment info to file
  const deploymentFile = path.join(deploymentsDir, `ethereum-${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Wait for a few confirmations before verification
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await escrowFactory.deploymentTransaction().wait(2);

    // Verify contract on Etherscan
    try {
      console.log("\n🔍 Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: escrowFactoryAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  // Generate ABI file for frontend integration
  const artifactsPath = path.join(
    __dirname,
    "../artifacts/ethereum/contracts/ethereum/EscrowFactory.sol"
  );
  if (fs.existsSync(artifactsPath)) {
    const artifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "EscrowFactory.json"), "utf8")
    );
    const abiFile = path.join(
      deploymentsDir,
      `EscrowFactory-${network}-abi.json`
    );
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log(`📄 ABI saved to: ${abiFile}`);
  }

  console.log("\n🎉 Ethereum deployment completed successfully!");
  console.log(`\n📋 Quick Reference:`);
  console.log(`Contract Address: ${escrowFactoryAddress}`);
  console.log(
    `Explorer: https://sepolia.etherscan.io/address/${escrowFactoryAddress}`
  );
  console.log(
    `Network: ${network} (Chain ID: ${
      (await hre.ethers.provider.getNetwork()).chainId
    })`
  );

  // Return deployment info for use in other scripts
  return deploymentInfo;
}

// Allow script to be imported or run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
