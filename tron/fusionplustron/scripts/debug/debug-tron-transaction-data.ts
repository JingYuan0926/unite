// scripts/debug/debug-tron-transaction-data.ts
// Debug the actual TRON transaction data being sent

import { ethers } from "ethers";
import { TronExtension, TronEscrowParams } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

async function debugTronTransactionData() {
  console.log("🔍 DEBUGGING TRON TRANSACTION DATA");
  console.log("==================================\n");

  const config = new ConfigManager();
  const logger = Logger.getInstance().scope("TronTxDebug");
  const tronExtension = new TronExtension(config, logger);

  try {
    // Create the exact same parameters we're using
    const secret = ethers.randomBytes(32);
    const secretHash = ethers.keccak256(secret);

    const tronParams: TronEscrowParams = {
      secretHash: secretHash,
      srcChain: 11155111,
      dstChain: 3448148188,
      srcAsset: "0x0000000000000000000000000000000000000000",
      dstAsset: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR", // Native TRX
      srcAmount: "1000000000000000",
      dstAmount: "100000000", // 100 TRX
      nonce: ethers.hexlify(ethers.randomBytes(16)),
      srcBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      srcCancellationBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstCancellationBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      safetyDeposit: "10000000", // 10 TRX
      timelock: 3600,
    };

    // Manually create the same immutables that TronExtension would create
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const orderHash = ethers.keccak256(
      abiCoder.encode(
        [
          "bytes32",
          "uint256",
          "uint256",
          "string",
          "string",
          "string",
          "string",
        ],
        [
          tronParams.secretHash,
          tronParams.srcChain,
          tronParams.dstChain,
          tronParams.srcAsset,
          tronParams.dstAsset,
          tronParams.srcAmount,
          tronParams.dstAmount,
        ]
      )
    );

    const addressToUint256 = (address: string): string => {
      if (address.startsWith("0x")) {
        return BigInt(address).toString();
      } else {
        return BigInt(
          "0x" + ethers.keccak256(ethers.toUtf8Bytes(address)).slice(2, 42)
        ).toString();
      }
    };

    const packedTimelocks = tronExtension.createPackedTimelocks(
      tronParams.timelock
    );

    const immutables = {
      orderHash: orderHash,
      hashlock: tronParams.secretHash,
      maker: addressToUint256(tronParams.srcBeneficiary),
      taker: addressToUint256(tronParams.dstBeneficiary),
      token: addressToUint256("0x0000000000000000000000000000000000000000"), // 0x0 for native TRX
      amount: tronParams.dstAmount,
      safetyDeposit: tronParams.safetyDeposit,
      timelocks: packedTimelocks.toString(),
    };

    const srcCancellationTimestamp =
      Math.floor(Date.now() / 1000) + tronParams.timelock;

    // Calculate call value
    const isNativeTRX =
      tronParams.dstAsset === "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR";
    const totalCallValue = isNativeTRX
      ? (
          parseInt(tronParams.dstAmount) + parseInt(tronParams.safetyDeposit)
        ).toString()
      : tronParams.safetyDeposit;

    console.log("📋 TRANSACTION PARAMETERS:");
    console.log("==========================");
    console.log(`Order Hash: ${orderHash}`);
    console.log(`Secret Hash: ${tronParams.secretHash}`);
    console.log(`Maker: ${immutables.maker}`);
    console.log(`Taker: ${immutables.taker}`);
    console.log(`Token: ${immutables.token} (should be 0 for native TRX)`);
    console.log(
      `Amount: ${immutables.amount} SUN (${parseInt(immutables.amount) / 1000000} TRX)`
    );
    console.log(
      `Safety Deposit: ${immutables.safetyDeposit} SUN (${parseInt(immutables.safetyDeposit) / 1000000} TRX)`
    );
    console.log(`Timelocks: ${immutables.timelocks}`);
    console.log(`Src Cancellation Timestamp: ${srcCancellationTimestamp}`);
    console.log(`Is Native TRX: ${isNativeTRX}`);
    console.log(
      `Call Value: ${totalCallValue} SUN (${parseInt(totalCallValue) / 1000000} TRX)`
    );

    console.log("\n🔍 POTENTIAL ISSUES TO CHECK:");
    console.log("=============================");

    // Issue 1: Token address conversion
    if (immutables.token !== "0") {
      console.log(
        "❌ Issue 1: Token should be 0 for native TRX, but it's:",
        immutables.token
      );
    } else {
      console.log("✅ Issue 1: Token is correctly 0 for native TRX");
    }

    // Issue 2: Address conversions
    console.log(`🔍 Issue 2: Address conversions`);
    console.log(
      `   - Maker (srcBeneficiary): ${tronParams.srcBeneficiary} → ${immutables.maker}`
    );
    console.log(
      `   - Taker (dstBeneficiary): ${tronParams.dstBeneficiary} → ${immutables.taker}`
    );

    // Issue 3: Timelocks validation
    const currentTime = Math.floor(Date.now() / 1000);
    const dstCancellation = currentTime + tronParams.timelock - 300; // From createPackedTimelocks
    console.log(
      `✅ Issue 3: Timing validation - dstCancellation (${dstCancellation}) <= srcCancellation (${srcCancellationTimestamp}) = ${dstCancellation <= srcCancellationTimestamp}`
    );

    // Issue 4: Amount validations
    console.log(`✅ Issue 4: Amount > 0: ${parseInt(immutables.amount) > 0}`);
    console.log(
      `✅ Issue 5: Hashlock != 0: ${immutables.hashlock !== "0x0000000000000000000000000000000000000000000000000000000000000000"}`
    );
    console.log(
      `✅ Issue 6: Call value >= required: ${parseInt(totalCallValue)} >= ${parseInt(immutables.amount) + parseInt(immutables.safetyDeposit)} = ${parseInt(totalCallValue) >= parseInt(immutables.amount) + parseInt(immutables.safetyDeposit)}`
    );

    console.log("\n🧪 EXECUTING TEST TRANSACTION:");
    console.log("==============================");

    // Try the actual deployment
    const result = await tronExtension.deployTronEscrowDst(
      tronParams,
      process.env.TRON_PRIVATE_KEY!
    );

    console.log(`Transaction Hash: ${result.txHash}`);
    console.log(
      `Tronscan: https://nile.tronscan.org/#/transaction/${result.txHash}`
    );

    // Wait and check status
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const tx = await tronWeb.trx.getTransaction(result.txHash);
    console.log(`\nTransaction Status: ${tx.ret[0].contractRet}`);

    if (tx.ret[0].contractRet === "SUCCESS") {
      console.log("🎉 SUCCESS! The fix worked!");
    } else {
      console.log("❌ Still reverting. Need to investigate further...");

      // Let's try to decode the transaction input data
      console.log("\n🔍 RAW TRANSACTION DATA:");
      console.log("========================");
      console.log(JSON.stringify(tx, null, 2));
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    console.log("Full error:", error);
  }
}

debugTronTransactionData().catch(console.error);
