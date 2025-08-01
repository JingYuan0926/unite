// scripts/debug/debug-tron-revert.ts
// Minimal test to debug the reverted TRON transaction

import { ethers } from "ethers";
import { TronExtension, TronEscrowParams } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

async function debugTronRevert() {
  console.log("🔍 DEBUGGING REVERTED TRON TRANSACTION");
  console.log("=====================================\n");

  // Initialize services
  const config = new ConfigManager();
  const logger = Logger.getInstance().scope("TronDebug");
  const tronExtension = new TronExtension(config, logger);

  // Generate test parameters
  const secret = ethers.randomBytes(32);
  const secretHash = ethers.keccak256(secret);

  console.log("📋 PARAMETER ANALYSIS");
  console.log("=====================");
  console.log(`Secret: ${ethers.hexlify(secret)}`);
  console.log(`Secret Hash: ${secretHash}`);
  console.log(`Secret Length: ${secret.length} bytes`);
  console.log(`Secret Hash Length: ${secretHash.length} characters\n`);

  // Create TronEscrowParams - let's analyze each field carefully
  const tronParams: TronEscrowParams = {
    secretHash: secretHash,
    srcChain: 11155111, // Sepolia chainId
    dstChain: 3448148188, // TRON Nile chainId
    srcAsset: "0x0000000000000000000000000000000000000000", // ETH address (0x format)
    dstAsset: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR", // TRX address (TRON format)
    srcAmount: "1000000000000000", // 0.001 ETH in wei (string)
    dstAmount: "100000000", // 100 TRX in SUN (string)
    nonce: ethers.hexlify(ethers.randomBytes(16)), // Random nonce
    srcBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F", // ETH address (0x format)
    dstBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk", // TRON address (TRON format)
    srcCancellationBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F", // ETH address (0x format)
    dstCancellationBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk", // TRON address (TRON format)
    safetyDeposit: "10000000", // 10 TRX in SUN (string)
    timelock: 3600,
  };

  console.log("🔍 PARAMETER BREAKDOWN");
  console.log("======================");
  console.log(`Secret Hash: ${tronParams.secretHash}`);
  console.log(`Src Chain: ${tronParams.srcChain} (Sepolia)`);
  console.log(`Dst Chain: ${tronParams.dstChain} (TRON Nile)`);
  console.log(`Src Asset: ${tronParams.srcAsset} (ETH - 0x format)`);
  console.log(`Dst Asset: ${tronParams.dstAsset} (TRX - TRON format)`);
  console.log(
    `Src Amount: ${tronParams.srcAmount} (${ethers.formatEther(tronParams.srcAmount)} ETH)`
  );
  console.log(
    `Dst Amount: ${tronParams.dstAmount} (${parseInt(tronParams.dstAmount) / 1000000} TRX)`
  );
  console.log(`Nonce: ${tronParams.nonce}`);
  console.log(
    `Src Beneficiary: ${tronParams.srcBeneficiary} (ETH wallet - 0x format)`
  );
  console.log(
    `Dst Beneficiary: ${tronParams.dstBeneficiary} (TRON wallet - TRON format)`
  );
  console.log(
    `Src Cancellation Beneficiary: ${tronParams.srcCancellationBeneficiary}`
  );
  console.log(
    `Dst Cancellation Beneficiary: ${tronParams.dstCancellationBeneficiary}`
  );
  console.log(
    `Safety Deposit: ${tronParams.safetyDeposit} (${parseInt(tronParams.safetyDeposit) / 1000000} TRX)`
  );
  console.log(`Timelock: ${tronParams.timelock} seconds\n`);

  try {
    console.log("🧪 STEP 1: STATIC CALL TEST");
    console.log("============================");

    // First, let's try to get the deployed factory contract and inspect it
    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const factoryAddress = "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk";
    console.log(`Factory Address: ${factoryAddress}`);

    // Get contract info
    const contractInfo = await tronWeb.trx.getContract(factoryAddress);
    console.log("📋 Contract Info:");
    console.log(`- Type: ${contractInfo.contract_type}`);
    console.log(`- Owner: ${contractInfo.owner_address}`);
    console.log(`- Contract State: ${contractInfo.contract_state}\n`);

    // Try to get the contract instance
    const factoryContract = await tronWeb.contract().at(factoryAddress);
    console.log("✅ Factory contract loaded successfully");

    // Create a mock TronExtension to get the createTimelocks method
    const timelocks = tronExtension.createTimelocks(tronParams.timelock);
    console.log(`\n🔍 TIMELOCKS ANALYSIS:`);
    console.log(`======================`);
    console.log(`Packed: ${timelocks.packed.toString()}`);
    console.log(`Packed Hex: 0x${timelocks.packed.toString(16)}`);
    console.log(`Src Withdrawal: ${timelocks.srcWithdrawal}`);
    console.log(`Src Cancellation: ${timelocks.srcCancellation}`);
    console.log(`Dst Withdrawal: ${timelocks.dstWithdrawal}`);
    console.log(`Dst Cancellation: ${timelocks.dstCancellation}`);

    // Create the immutables object that will be passed to the contract (matching TronExtension.ts)
    const immutables = {
      secretHash: tronParams.secretHash,
      srcChain: tronParams.srcChain,
      dstChain: tronParams.dstChain,
      srcAsset: tronParams.srcAsset,
      dstAsset: tronParams.dstAsset,
      srcAmount: tronParams.srcAmount,
      dstAmount: tronParams.dstAmount,
      nonce: tronParams.nonce,
      srcBeneficiary: tronParams.srcBeneficiary,
      dstBeneficiary: tronParams.dstBeneficiary,
      srcCancellationBeneficiary: tronParams.srcCancellationBeneficiary,
      dstCancellationBeneficiary: tronParams.dstCancellationBeneficiary,
      timelocks: timelocks,
      safetyDeposit: tronParams.safetyDeposit,
    };

    console.log("\n🔍 IMMUTABLES OBJECT:");
    console.log("=====================");
    Object.entries(immutables).forEach(([key, value]) => {
      if (typeof value === "bigint") {
        console.log(`${key}: ${value.toString()} (bigint)`);
      } else if (typeof value === "object" && value !== null) {
        console.log(
          `${key}: ${JSON.stringify(value, (k, v) => (typeof v === "bigint" ? v.toString() : v), 2)} (object)`
        );
      } else {
        console.log(`${key}: ${value} (${typeof value})`);
      }
    });

    // Calculate source cancellation timestamp (matching TronExtension.ts)
    const srcCancellationTimestamp =
      Math.floor(Date.now() / 1000) + tronParams.timelock;
    console.log(`\n📅 SRC CANCELLATION TIMESTAMP: ${srcCancellationTimestamp}`);

    console.log("\n🧪 ATTEMPTING STATIC CALL...");

    // Try static call first to get better error information
    try {
      const staticResult =
        await tronWeb.transactionBuilder.triggerConstantContract(
          factoryAddress,
          "createDstEscrow(tuple,uint256)", // The method signature with both parameters
          {},
          [immutables, srcCancellationTimestamp],
          tronWeb.defaultAddress.base58
        );

      console.log("📋 Static Call Result:");
      console.log(JSON.stringify(staticResult, null, 2));

      if (staticResult.result && staticResult.result.result) {
        console.log("✅ Static call succeeded!");
      } else {
        console.log("❌ Static call failed");
        if (staticResult.result && staticResult.result.message) {
          console.log(`Revert reason: ${staticResult.result.message}`);
        }
      }
    } catch (staticError: any) {
      console.log("❌ Static call error:", staticError.message);
    }

    console.log("\n🧪 STEP 2: REAL TRANSACTION TEST");
    console.log("=================================");

    // Now try the real transaction
    const result = await tronExtension.deployTronEscrowDst(
      tronParams,
      process.env.TRON_PRIVATE_KEY!
    );

    console.log("\n📋 TRANSACTION RESULT:");
    console.log("======================");
    console.log(`Success: ${result.success}`);
    console.log(`TX Hash: ${result.txHash}`);
    console.log(`Contract Address: ${result.contractAddress}`);

    if (result.txHash) {
      console.log(
        `\n🔗 Tronscan: https://nile.tronscan.org/#/transaction/${result.txHash}`
      );

      // Wait and check transaction status
      console.log("\n⏳ Waiting 5 seconds for transaction confirmation...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        const txInfo = await tronWeb.trx.getTransactionInfo(result.txHash);
        console.log("\n📋 Transaction Info:");
        console.log(JSON.stringify(txInfo, null, 2));

        const tx = await tronWeb.trx.getTransaction(result.txHash);
        console.log("\n📋 Transaction Details:");
        console.log(JSON.stringify(tx, null, 2));
      } catch (infoError: any) {
        console.log(`⚠️ Could not get transaction info: ${infoError.message}`);
      }
    }
  } catch (error: any) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.log("Full error:", error);
  }
}

// Run the debug test
debugTronRevert().catch(console.error);
