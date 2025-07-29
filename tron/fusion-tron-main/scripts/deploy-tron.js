const fs = require("fs");
const path = require("path");
const TronWeb = require("tronweb");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

async function main() {
  console.log("🚀 Deploying Fusion+ TronEscrowFactory to Tron Nile...");

  // Verify environment variables
  if (!process.env.TRON_PRIVATE_KEY) {
    throw new Error("❌ TRON_PRIVATE_KEY not found in environment variables");
  }

  // Initialize TronWeb for network interaction
  const tronWeb = new TronWeb({
    fullHost: "https://api.nileex.io",
    privateKey: process.env.TRON_PRIVATE_KEY,
  });

  // Get deployer address
  const deployerAddress = tronWeb.address.fromPrivateKey(
    process.env.TRON_PRIVATE_KEY
  );
  console.log("📋 Deployment Details:");
  console.log(`Network: Tron Nile`);
  console.log(`Deployer: ${deployerAddress}`);

  // Check balance
  try {
    const balance = await tronWeb.trx.getBalance(deployerAddress);
    const balanceTrx = tronWeb.fromSun(balance);
    console.log(`Balance: ${balanceTrx} TRX`);

    if (balanceTrx < 100) {
      console.log(
        "⚠️  Low balance detected. You may need more TRX for deployment."
      );
      console.log("💡 Get free TRX from: https://nileex.io/join/getJoinPage");
    }
  } catch (error) {
    console.log("⚠️ Could not fetch balance:", error.message);
  }

  console.log("\n📦 Deploying with TronBox...");

  try {
    // Use TronBox to deploy the contract
    const { stdout, stderr } = await execAsync(
      "npx tronbox migrate --network nile --reset",
      {
        cwd: path.join(__dirname, ".."),
        env: { ...process.env },
      }
    );

    if (stderr && !stderr.includes("Warning")) {
      console.error("❌ Deployment error:", stderr);
      throw new Error(stderr);
    }

    console.log("✅ TronBox deployment output:");
    console.log(stdout);

    // Parse deployment output to extract contract address
    const addressMatch = stdout.match(
      /TronEscrowFactory: ([T][A-Za-z0-9]{33})/
    );
    const txHashMatch = stdout.match(/txHash: (0x[a-fA-F0-9]{64})/);

    if (!addressMatch) {
      throw new Error(
        "❌ Could not parse contract address from deployment output"
      );
    }

    const contractAddress = addressMatch[1];
    const txHash = txHashMatch ? txHashMatch[1] : null;

    console.log(`\n✅ TronEscrowFactory deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    if (txHash) {
      console.log(`🔗 Transaction Hash: ${txHash}`);
      console.log(
        `🌐 View on TronScan: https://nile.tronscan.org/#/transaction/${txHash}`
      );
    }

    // Verify contract constants
    console.log("\n🔍 Verifying contract configuration...");
    try {
      const contract = await tronWeb.contract().at(contractAddress);

      const finalityBlocks = await contract.FINALITY_BLOCKS().call();
      const minCancelDelay = await contract.MIN_CANCEL_DELAY().call();
      const minSafetyDeposit = await contract.MIN_SAFETY_DEPOSIT().call();
      const revealDelay = await contract.REVEAL_DELAY().call();

      console.log(
        `✅ Finality Blocks: ${finalityBlocks} (≈${finalityBlocks * 3} seconds)`
      );
      console.log(
        `✅ Min Cancel Delay: ${minCancelDelay} seconds (${
          minCancelDelay / 60
        } minutes)`
      );
      console.log(
        `✅ Min Safety Deposit: ${tronWeb.fromSun(minSafetyDeposit)} TRX`
      );
      console.log(`✅ Reveal Delay: ${revealDelay} seconds`);
    } catch (verifyError) {
      console.log(
        "⚠️ Could not verify contract constants:",
        verifyError.message
      );
    }

    // Save deployment info
    const deploymentInfo = {
      network: "nile",
      chainId: "3",
      deployedAt: new Date().toISOString(),
      deployer: deployerAddress,
      contracts: {
        TronEscrowFactory: {
          address: contractAddress,
          txHash: txHash,
          deploymentBlock: null, // Tron doesn't use block numbers the same way
        },
      },
      configuration: {
        finalityBlocks: "12",
        minCancelDelay: "1800",
        minSafetyDeposit: "1000000", // 1 TRX in sun
        revealDelay: "60",
      },
    };

    // Ensure deployments directory exists
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to JSON file
    const deploymentPath = path.join(deploymentsDir, "tron-nile.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);

    // Update .env file with new contract address
    const envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      envContent = envContent.replace(
        /TRON_ESCROW_FACTORY_ADDRESS=.*/,
        `TRON_ESCROW_FACTORY_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log(`🔄 Updated .env with new contract address`);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log(`📋 Next steps:`);
    console.log(`   1. Verify the contract on TronScan`);
    console.log(`   2. Test the contract functions`);
    console.log(`   3. Update your frontend/resolver with the new address`);
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);

    // Provide helpful debugging information
    console.log("\n🔧 Troubleshooting tips:");
    console.log(
      "   1. Ensure you have enough TRX balance (minimum 100 TRX recommended)"
    );
    console.log("   2. Check your TRON_PRIVATE_KEY is valid");
    console.log("   3. Verify network connectivity to Tron Nile");
    console.log("   4. Try running 'npx tronbox compile' first");

    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
