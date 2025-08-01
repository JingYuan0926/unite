// scripts/debug/fix-tronweb-call.ts
// Fix the TronWeb contract call to use the correct function

import { ethers } from "ethers";
import { TronExtension, TronEscrowParams } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

async function fixTronWebCall() {
  console.log("🔧 FIXING TRONWEB CONTRACT CALL");
  console.log("===============================\n");

  const config = new ConfigManager();
  const logger = Logger.getInstance().scope("TronFix");
  const tronExtension = new TronExtension(config, logger);

  try {
    // Create test parameters
    const secret = ethers.randomBytes(32);
    const secretHash = ethers.keccak256(secret);

    const tronParams: TronEscrowParams = {
      secretHash: secretHash,
      srcChain: 11155111,
      dstChain: 3448148188,
      srcAsset: "0x0000000000000000000000000000000000000000",
      dstAsset: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
      srcAmount: "1000000000000000",
      dstAmount: "100000000",
      nonce: ethers.hexlify(ethers.randomBytes(16)),
      srcBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      srcCancellationBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstCancellationBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      safetyDeposit: "10000000",
      timelock: 3600,
    };

    // Create the immutables and timestamp
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

    const immutables = [
      orderHash,
      tronParams.secretHash,
      addressToUint256(tronParams.srcBeneficiary),
      addressToUint256(tronParams.dstBeneficiary),
      addressToUint256("0x0000000000000000000000000000000000000000"),
      tronParams.dstAmount,
      tronParams.safetyDeposit,
      packedTimelocks.toString(),
    ];

    const srcCancellationTimestamp =
      Math.floor(Date.now() / 1000) + tronParams.timelock;
    const totalCallValue =
      parseInt(tronParams.dstAmount) + parseInt(tronParams.safetyDeposit);

    console.log("📋 PARAMETERS:");
    console.log("==============");
    console.log(`Immutables array length: ${immutables.length}`);
    console.log(`Src cancellation timestamp: ${srcCancellationTimestamp}`);
    console.log(
      `Call value: ${totalCallValue} SUN (${totalCallValue / 1000000} TRX)`
    );

    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const factoryAddress = "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk";

    console.log("\n🧪 METHOD 1: Using TronWeb contract wrapper");
    console.log("============================================");

    try {
      const factoryContract = await tronWeb.contract().at(factoryAddress);
      console.log("✅ Contract loaded");

      // Log the available methods
      console.log(
        "Available methods:",
        Object.keys(factoryContract.methods || {})
      );
      console.log("Available properties:", Object.keys(factoryContract));

      // Try calling with explicit method reference
      const result1 = await factoryContract.methods
        .createDstEscrow(immutables, srcCancellationTimestamp)
        .send({
          feeLimit: 100000000,
          callValue: totalCallValue,
        });

      const txHash1 =
        typeof result1 === "string"
          ? result1
          : result1.txid || result1.transaction?.txID;
      console.log(`✅ Method 1 success: ${txHash1}`);

      // Check transaction status
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const tx1 = await tronWeb.trx.getTransaction(txHash1);
      console.log(`Status: ${tx1.ret[0].contractRet}`);
    } catch (error1: any) {
      console.log(`❌ Method 1 failed: ${error1.message}`);
    }

    console.log("\n🧪 METHOD 2: Using triggerSmartContract directly");
    console.log("================================================");

    try {
      // Manual encoding
      const functionSelector = "0x8c651207"; // createDstEscrow(tuple,uint256)
      const encodedParams = abiCoder.encode(
        [
          "tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)",
          "uint256",
        ],
        [immutables, srcCancellationTimestamp]
      );

      const callData = functionSelector + encodedParams.slice(2);
      console.log(`Call data length: ${callData.length} chars`);
      console.log(`Call data: ${callData.slice(0, 100)}...`);

      const result2 = await tronWeb.transactionBuilder.triggerSmartContract(
        factoryAddress,
        callData,
        {
          feeLimit: 100000000,
          callValue: totalCallValue,
        },
        [],
        tronWeb.defaultAddress.base58
      );

      if (result2.result && result2.result.result) {
        console.log("✅ Static call successful");

        // Broadcast the transaction
        const signedTx = await tronWeb.trx.sign(result2.transaction);
        const broadcastResult = await tronWeb.trx.sendRawTransaction(signedTx);

        console.log(`✅ Method 2 success: ${broadcastResult.txid}`);

        // Check transaction status
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const tx2 = await tronWeb.trx.getTransaction(broadcastResult.txid);
        console.log(`Status: ${tx2.ret[0].contractRet}`);
      } else {
        console.log("❌ Static call failed:", result2.result);
      }
    } catch (error2: any) {
      console.log(`❌ Method 2 failed: ${error2.message}`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    console.log("Full error:", error);
  }
}

fixTronWebCall().catch(console.error);
