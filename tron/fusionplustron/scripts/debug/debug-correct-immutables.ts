// scripts/debug/debug-correct-immutables.ts
// Debug script that creates proper IBaseEscrow.Immutables for TRON contract

import { ethers } from "ethers";
import { TronExtension } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

async function debugCorrectImmutables() {
  console.log("🔍 DEBUGGING WITH CORRECT IMMUTABLES STRUCTURE");
  console.log("===============================================\n");

  // Initialize services
  const config = new ConfigManager();
  const logger = Logger.getInstance().scope("TronDebug");
  const tronExtension = new TronExtension(config, logger);

  // Generate test parameters
  const secret = ethers.randomBytes(32);
  const secretHash = ethers.keccak256(secret);
  const orderHash = ethers.keccak256(ethers.toUtf8Bytes("test-order-12345"));

  console.log("📋 CORE PARAMETERS");
  console.log("==================");
  console.log(`Secret: ${ethers.hexlify(secret)}`);
  console.log(`Secret Hash: ${secretHash}`);
  console.log(`Order Hash: ${orderHash}\n`);

  try {
    console.log("🧪 CREATING CORRECT IMMUTABLES STRUCTURE");
    console.log("=========================================");

    // Helper function to convert address to uint256 (Address type)
    function addressToUint256(address: string): string {
      if (address.startsWith("0x")) {
        // Ethereum address - convert to uint256
        return BigInt(address).toString();
      } else {
        // TRON address - for demo, we'll use a placeholder
        // In reality, you'd need to convert TRON base58 to uint256
        return BigInt(
          "0x" + ethers.keccak256(ethers.toUtf8Bytes(address)).slice(2, 42)
        ).toString();
      }
    }

    // Create packed timelocks using TronExtension method
    const packedTimelocks = tronExtension.createPackedTimelocks(3600);
    console.log(`Packed Timelocks: ${packedTimelocks.toString()}`);
    console.log(`Packed Timelocks Hex: 0x${packedTimelocks.toString(16)}\n`);

    // Create the CORRECT Immutables structure matching IBaseEscrow.Immutables
    const correctImmutables = {
      orderHash: orderHash, // bytes32
      hashlock: secretHash, // bytes32 (our secretHash)
      maker: addressToUint256("0x32F91E4E2c60A9C16cAE736D3b42152B331c147F"), // Address as uint256
      taker: addressToUint256("TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk"), // Address as uint256
      token: addressToUint256("0x0000000000000000000000000000000000000000"), // Address as uint256 (0x0 for native)
      amount: "100000000", // uint256 (100 TRX in SUN)
      safetyDeposit: "10000000", // uint256 (10 TRX in SUN)
      timelocks: packedTimelocks.toString(), // Timelocks as uint256 string
    };

    console.log("🔍 CORRECT IMMUTABLES OBJECT:");
    console.log("==============================");
    Object.entries(correctImmutables).forEach(([key, value]) => {
      console.log(`${key}: ${value} (${typeof value})`);
    });

    // Calculate source cancellation timestamp
    const srcCancellationTimestamp = Math.floor(Date.now() / 1000) + 3600;
    console.log(`\n📅 SRC CANCELLATION TIMESTAMP: ${srcCancellationTimestamp}`);

    console.log("\n🧪 ATTEMPTING STATIC CALL WITH CORRECT STRUCTURE...");

    // Get TronWeb instance
    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const factoryAddress = "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk";

    // Try static call with triggerConstantContract
    try {
      const staticResult =
        await tronWeb.transactionBuilder.triggerConstantContract(
          factoryAddress,
          "createDstEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256),uint256)",
          {},
          [
            [
              correctImmutables.orderHash,
              correctImmutables.hashlock,
              correctImmutables.maker,
              correctImmutables.taker,
              correctImmutables.token,
              correctImmutables.amount,
              correctImmutables.safetyDeposit,
              correctImmutables.timelocks,
            ],
            srcCancellationTimestamp,
          ],
          tronWeb.defaultAddress.base58
        );

      console.log("📋 Static Call Result:");
      console.log(JSON.stringify(staticResult, null, 2));

      if (staticResult.result && staticResult.result.result) {
        console.log("✅ Static call SUCCEEDED!");
        console.log("🎯 The parameter structure is now correct!");
      } else {
        console.log("❌ Static call failed");
        if (staticResult.result && staticResult.result.message) {
          console.log(`Revert reason: ${staticResult.result.message}`);
        }
      }
    } catch (staticError: any) {
      console.log("❌ Static call error:", staticError.message);
    }

    console.log("\n🧪 ATTEMPTING REAL TRANSACTION WITH CORRECT STRUCTURE...");

    // Try with the factory contract
    const factoryContract = await tronWeb.contract().at(factoryAddress);

    // Create immutables array for contract call
    const immutablesArray = [
      correctImmutables.orderHash,
      correctImmutables.hashlock,
      correctImmutables.maker,
      correctImmutables.taker,
      correctImmutables.token,
      correctImmutables.amount,
      correctImmutables.safetyDeposit,
      correctImmutables.timelocks,
    ];

    const result = await factoryContract
      .createDstEscrow(immutablesArray, srcCancellationTimestamp)
      .send({
        feeLimit: 100000000, // 100 TRX fee limit
        callValue: 10000000, // 10 TRX safety deposit
      });

    const txHash =
      typeof result === "string"
        ? result
        : result.txid || result.transaction?.txID;
    console.log(`✅ Transaction Hash: ${txHash}`);
    console.log(
      `🔗 Tronscan: https://nile.tronscan.org/#/transaction/${txHash}`
    );

    // Wait and check status
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const tx = await tronWeb.trx.getTransaction(txHash);
      console.log(`\n📋 Transaction Status: ${tx.ret[0].contractRet}`);

      if (tx.ret[0].contractRet === "SUCCESS") {
        console.log("🎉 TRANSACTION SUCCEEDED!");
        console.log("✅ TRON escrow creation is now working!");
      } else {
        console.log("❌ Transaction still reverting");
        console.log("Need to investigate contract logic further");
      }
    } catch (statusError: any) {
      console.log(
        `⚠️ Could not get transaction status: ${statusError.message}`
      );
    }
  } catch (error: any) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.log("Full error:", error);
  }
}

// Run the debug test
debugCorrectImmutables().catch(console.error);
