import { ethers } from "ethers";
import dotenv from "dotenv";
import { TronExtension, TronEscrowParams } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

dotenv.config();

/**
 * Simple TRON escrow deployment test
 * This isolates the TRON deployment issue from the full atomic swap demo
 */

async function main() {
  console.log("🔍 SIMPLE TRON ESCROW DEPLOYMENT TEST");
  console.log("=====================================\n");

  try {
    // Initialize components
    const config = new ConfigManager();
    const baseLogger = Logger.getInstance();
    const logger = baseLogger.scope("TronTest");

    console.log("📋 TRON CONFIGURATION");
    console.log("=====================");
    console.log(`- TRON Network: ${config.TRON_NETWORK}`);
    console.log(`- TRON RPC URL: ${config.TRON_RPC_URL}`);
    console.log(
      `- TRON Factory Address: ${config.TRON_ESCROW_FACTORY_ADDRESS}`
    );
    console.log(
      `- TRON Src Implementation: ${config.TRON_ESCROW_SRC_IMPLEMENTATION}`
    );
    console.log(
      `- TRON Dst Implementation: ${config.TRON_ESCROW_DST_IMPLEMENTATION}`
    );

    // Initialize TRON extension
    const tronExtension = new TronExtension(config, logger);

    // Create minimal test parameters
    const secret = ethers.randomBytes(32);
    const secretHash = ethers.keccak256(secret);

    const tronParams: TronEscrowParams = {
      secretHash: secretHash,
      srcChain: 11155111, // Sepolia
      dstChain: 3448148188, // TRON Nile
      srcAsset: ethers.ZeroAddress, // ETH
      dstAsset: config.getTrxRepresentationAddress(), // TRX
      srcAmount: ethers.parseEther("0.001").toString(),
      dstAmount: (100 * 1000000).toString(), // 100 TRX
      nonce: ethers.hexlify(ethers.randomBytes(32)),
      srcBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      dstBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      srcCancellationBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstCancellationBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      timelock: 3600,
      safetyDeposit: tronExtension.toSun("10"), // 10 TRX
    };

    console.log("\n🚀 TESTING TRON ESCROW DEPLOYMENT");
    console.log("=================================");
    console.log(`- Secret Hash: ${secretHash}`);
    console.log(
      `- Safety Deposit: ${parseFloat(tronParams.safetyDeposit) / 1000000} TRX`
    );
    console.log(`- Timelock: ${tronParams.timelock} seconds`);

    // Test TRON escrow deployment
    console.log("\n📡 Deploying TRON escrow...");
    const result = await tronExtension.deployTronEscrowDst(
      tronParams,
      process.env.TRON_PRIVATE_KEY!
    );

    console.log("\n✅ DEPLOYMENT RESULT:");
    console.log("====================");
    console.log(`- Success: ${result.success}`);
    console.log(`- TX Hash: ${result.txHash}`);
    console.log(`- Contract Address: ${result.contractAddress}`);

    if (result.txHash) {
      console.log(
        `- Tronscan: https://nile.tronscan.org/#/transaction/${result.txHash}`
      );
    }

    if (result.success && result.txHash) {
      console.log("\n🎉 TRON ESCROW DEPLOYMENT SUCCESSFUL!");
      console.log("✅ Real TRON transaction submitted to Nile testnet");
      console.log("✅ Transaction is verifiable on Tronscan");
      return {
        success: true,
        txHash: result.txHash,
        contractAddress: result.contractAddress || "Contract address pending",
        secret: ethers.hexlify(secret),
        secretHash: secretHash,
      };
    } else {
      console.log("\n❌ TRON ESCROW DEPLOYMENT FAILED");
      console.log("- Check TRON private key configuration");
      console.log("- Check TRON contract addresses");
      console.log("- Check TRON RPC connectivity");
      return { success: false };
    }
  } catch (error: any) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.log("Full error:", error);
    return { success: false, error: error.message };
  }
}

// Execute test
if (require.main === module) {
  main()
    .then((result) => {
      if (result.success) {
        console.log("\n✨ Test completed successfully!");
        process.exit(0);
      } else {
        console.log("\n💥 Test failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Test error:", error);
      process.exit(1);
    });
}

export default main;
