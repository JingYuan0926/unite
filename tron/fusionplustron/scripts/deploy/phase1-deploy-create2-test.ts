import { ethers } from "hardhat";
import { TronWeb } from "tronweb";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 1000000000, // 1000 TRX
};

interface RealDeploymentResult {
  contractName: string;
  address: string;
  txHash: string;
  tronscanUrl: string;
  deploymentTimestamp: string;
  gasUsed: number;
  success: boolean;
}

async function deployTronCreate2Test(): Promise<RealDeploymentResult> {
  console.log("🚀 REAL DEPLOYMENT: TronCreate2Test to Tron Nile Testnet");
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
    // Get compiled contract
    const TronCreate2Test = await ethers.getContractFactory("TronCreate2Test");
    const bytecode = TronCreate2Test.bytecode;
    const abi = JSON.parse(
      TronCreate2Test.interface.format(ethers.utils.FormatTypes.json) as string
    );

    console.log("📋 Contract Details:");
    console.log(`   Bytecode Length: ${bytecode.length} characters`);
    console.log(`   ABI Functions: ${abi.length}`);
    console.log(`   Deployer: ${tronWeb.defaultAddress.base58}`);

    // Check balance before deployment
    const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
    console.log(`   Balance: ${balance / 1000000} TRX`);

    if (balance < 100000000) {
      // Less than 100 TRX
      throw new Error(
        "❌ Insufficient TRX balance. Need at least 100 TRX for deployment."
      );
    }

    console.log("\n🔄 Deploying contract...");

    // REAL deployment to Tron Nile testnet
    const contract = await tronWeb.contract().new({
      abi,
      bytecode,
      feeLimit: TRON_CONFIG.feeLimit,
      userFeePercentage: 100,
      originEnergyLimit: 10000000,
      parameters: [], // No constructor parameters
    });

    const address = contract.address;
    const txHash = contract.transactionHash;

    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log(`   Contract Address: ${address}`);
    console.log(`   Transaction Hash: ${txHash}`);

    // Wait for transaction confirmation
    console.log("\n⏳ Waiting for transaction confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get transaction info for gas usage
    let gasUsed = 0;
    try {
      const txInfo = await tronWeb.trx.getTransactionInfo(txHash);
      gasUsed = txInfo.receipt?.energy_usage_total || 0;
      console.log(`   Gas Used: ${gasUsed} energy`);
    } catch (error) {
      console.log("⚠️ Could not fetch gas usage info");
    }

    const result: RealDeploymentResult = {
      contractName: "TronCreate2Test",
      address,
      txHash,
      tronscanUrl: `https://nile.tronscan.org/#/transaction/${txHash}`,
      deploymentTimestamp: new Date().toISOString(),
      gasUsed,
      success: true,
    };

    console.log("\n🔗 Verification:");
    console.log(`   Tronscan: ${result.tronscanUrl}`);
    console.log(
      `   Contract Explorer: https://nile.tronscan.org/#/contract/${address}`
    );

    // Save deployment result
    const deploymentData = {
      phase1: result,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      "./real-deployment-results.json",
      JSON.stringify(deploymentData, null, 2)
    );

    console.log("\n💾 Deployment result saved to real-deployment-results.json");

    return result;
  } catch (error: any) {
    console.error("❌ DEPLOYMENT FAILED:", error.message);

    const failedResult: RealDeploymentResult = {
      contractName: "TronCreate2Test",
      address: "",
      txHash: "",
      tronscanUrl: "",
      deploymentTimestamp: new Date().toISOString(),
      gasUsed: 0,
      success: false,
    };

    throw error;
  }
}

// Execute deployment
async function main() {
  try {
    const result = await deployTronCreate2Test();
    console.log("\n🎯 Phase 1 Deployment Complete!");
    console.log("📋 Next Step: Run test-create2-functionality.ts");
    process.exit(0);
  } catch (error) {
    console.error("💥 Phase 1 Deployment Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { deployTronCreate2Test };
