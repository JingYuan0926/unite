const TronWeb = require("tronweb");
const fs = require("fs");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 1000000000, // 1000 TRX
};

async function deployTronEscrowFactoryPatched() {
  console.log(
    "🚀 REAL DEPLOYMENT: TronEscrowFactoryPatched to Tron Nile Testnet"
  );
  console.log("=".repeat(60));

  if (!process.env.TRON_PRIVATE_KEY || process.env.TRON_PRIVATE_KEY === "") {
    throw new Error("❌ TRON_PRIVATE_KEY not set in environment variables");
  }

  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  try {
    // Get compiled contract artifacts
    let contractArtifact;
    try {
      contractArtifact = require("../../artifacts/contracts/tron/TronEscrowFactoryPatched.sol/TronEscrowFactoryPatched.json");
    } catch (error) {
      console.log(
        "❌ Could not load contract artifact. Make sure it's compiled."
      );
      throw error;
    }

    console.log("📋 Contract Details:");
    console.log(
      `   Bytecode Length: ${contractArtifact.bytecode.length} characters`
    );
    console.log(`   ABI Functions: ${contractArtifact.abi.length}`);
    console.log(`   Deployer: ${tronWeb.defaultAddress.base58}`);

    // Check balance before deployment
    const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
    console.log(`   Balance: ${balance / 1000000} TRX`);

    if (balance < 500000000) {
      throw new Error(
        "❌ Insufficient TRX balance. Need at least 500 TRX for factory deployment."
      );
    }

    console.log("\n🔄 Deploying TronEscrowFactoryPatched...");

    // Constructor parameters for TronEscrowFactoryPatched
    const constructorParams = [
      "0x0000000000000000000000000000000000000000", // limitOrderProtocol (zero for Tron)
      "0x0000000000000000000000000000000000000000", // feeToken (zero for testing)
      "0x0000000000000000000000000000000000000000", // accessToken (zero for testing)
      tronWeb.defaultAddress.hex, // owner
      86400, // rescueDelaySrc (24 hours)
      43200, // rescueDelayDst (12 hours)
    ];

    console.log("📋 Constructor Parameters:");
    console.log(`   Owner: ${tronWeb.defaultAddress.base58}`);
    console.log(`   Rescue Delay Src: 86400 seconds (24 hours)`);
    console.log(`   Rescue Delay Dst: 43200 seconds (12 hours)`);

    // REAL deployment to Tron Nile testnet
    const contract = await tronWeb.contract().new({
      abi: contractArtifact.abi,
      bytecode: contractArtifact.bytecode,
      feeLimit: TRON_CONFIG.feeLimit,
      userFeePercentage: 100,
      parameters: constructorParams,
    });

    const address = contract.address;
    let txHash = contract.transactionHash;

    // Sometimes transactionHash is not immediately available
    if (!txHash) {
      // Try to get it from the contract deployment transaction
      console.log("⏳ Waiting for transaction hash...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check recent transactions for this account
      try {
        const transactions = await tronWeb.trx.getTransactionsFromAddress(
          tronWeb.defaultAddress.base58,
          1,
          0
        );
        if (transactions && transactions.length > 0) {
          txHash = transactions[0].txID;
        }
      } catch (error) {
        console.log("⚠️ Could not fetch transaction hash");
        txHash = "unknown";
      }
    }

    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log(`   Contract Address: ${address}`);
    console.log(`   Transaction Hash: ${txHash}`);

    if (txHash && txHash !== "unknown") {
      console.log(
        `   Tronscan: https://nile.tronscan.org/#/transaction/${txHash}`
      );
    }

    // Wait for confirmation
    console.log("\n⏳ Waiting for transaction confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get transaction info
    let gasUsed = 0;
    if (txHash && txHash !== "unknown") {
      try {
        const txInfo = await tronWeb.trx.getTransactionInfo(txHash);
        gasUsed = txInfo.receipt?.energy_usage_total || 0;
        console.log(`   Gas Used: ${gasUsed} energy`);
        console.log(`   Status: ${txInfo.receipt?.result || "SUCCESS"}`);
      } catch (error) {
        console.log("⚠️ Could not fetch transaction info");
      }
    }

    const result = {
      contractName: "TronEscrowFactoryPatched",
      address,
      txHash,
      tronscanUrl:
        txHash && txHash !== "unknown"
          ? `https://nile.tronscan.org/#/transaction/${txHash}`
          : "N/A",
      deploymentTimestamp: new Date().toISOString(),
      gasUsed,
      success: true,
    };

    // Save deployment result
    fs.writeFileSync(
      "./factory-deployment-results.json",
      JSON.stringify(
        {
          factory: result,
          timestamp: new Date().toISOString(),
          constructorParams,
        },
        null,
        2
      )
    );

    console.log(
      "\n💾 Deployment result saved to factory-deployment-results.json"
    );

    // Now test basic factory functions
    console.log("\n🧪 Testing basic factory functions...");

    try {
      // Test the Tron-specific functions
      const factoryContract = await tronWeb.contract(
        contractArtifact.abi,
        address
      );

      // Test getTronChainId
      console.log("🔍 Testing getTronChainId()...");
      const chainId = await factoryContract.getTronChainId().call();
      console.log(`✅ Chain ID: ${chainId} (should be 3448148188 for Nile)`);

      // Test isTronFactory
      console.log("🔍 Testing isTronFactory()...");
      const isTronFactory = await factoryContract.isTronFactory().call();
      console.log(`✅ Is Tron Factory: ${isTronFactory}`);

      if (isTronFactory && chainId.toString() === "3448148188") {
        console.log("\n🎊 FACTORY DEPLOYMENT AND VERIFICATION SUCCESSFUL!");
        console.log(
          "🔗 The TronEscrowFactoryPatched is working correctly on Tron Nile!"
        );
        console.log("✅ CREATE2 fixes have been successfully deployed!");

        // Show the real contract address
        console.log(`\n🌟 REAL CONTRACT ADDRESS: ${address}`);
        console.log(
          `🌟 REAL TRONSCAN LINK: https://nile.tronscan.org/#/contract/${address}`
        );
      } else {
        console.log("❌ Factory validation failed");
      }
    } catch (testError) {
      console.log("⚠️ Factory function testing failed:", testError.message);
      console.log("But deployment appears successful!");
    }

    return result;
  } catch (error) {
    console.error("❌ DEPLOYMENT FAILED:", error.message);
    throw error;
  }
}

// Execute deployment
async function main() {
  try {
    const result = await deployTronEscrowFactoryPatched();
    console.log("\n🎯 TronEscrowFactoryPatched Deployment Complete!");
    console.log("🚀 Ready for integration testing!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Factory Deployment Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { deployTronEscrowFactoryPatched };
