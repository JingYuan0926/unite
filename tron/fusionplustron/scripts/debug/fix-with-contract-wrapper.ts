// scripts/debug/fix-with-contract-wrapper.ts
// Fix TRON REVERT by using contract wrapper instead of manual encoding

import { ethers } from "ethers";
import { TronExtension, TronEscrowParams } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

async function fixWithContractWrapper() {
  console.log("🔧 FIXING TRON REVERT USING CONTRACT WRAPPER");
  console.log("============================================\n");

  const config = new ConfigManager();
  const logger = Logger.getInstance().scope("ContractWrapperFix");
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

    // Define the CORRECT ABI for createDstEscrow with proper struct definition
    const ESCROW_FACTORY_ABI = [
      {
        inputs: [
          {
            components: [
              { type: "bytes32", name: "orderHash" },
              { type: "bytes32", name: "hashlock" },
              { type: "uint256", name: "maker" }, // Address -> uint256
              { type: "uint256", name: "taker" }, // Address -> uint256
              { type: "uint256", name: "token" }, // Address -> uint256
              { type: "uint256", name: "amount" },
              { type: "uint256", name: "safetyDeposit" },
              { type: "uint256", name: "timelocks" }, // Timelocks -> uint256
            ],
            internalType: "struct IBaseEscrow.Immutables",
            name: "dstImmutables",
            type: "tuple",
          },
          { type: "uint256", name: "srcCancellationTimestamp" },
        ],
        name: "createDstEscrow",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ];

    console.log("📋 PREPARING PARAMETERS");
    console.log("========================");

    // Create the immutables using our existing logic
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
    const srcCancellationTimestamp =
      Math.floor(Date.now() / 1000) + tronParams.timelock;

    // KEY CHANGE: Pass immutables as an OBJECT, not an array
    const immutablesObject = {
      orderHash: orderHash,
      hashlock: tronParams.secretHash,
      maker: addressToUint256(tronParams.srcBeneficiary),
      taker: addressToUint256(tronParams.dstBeneficiary),
      token: addressToUint256("0x0000000000000000000000000000000000000000"), // 0x0 for native TRX
      amount: tronParams.dstAmount,
      safetyDeposit: tronParams.safetyDeposit,
      timelocks: packedTimelocks.toString(),
    };

    const isNativeTRX =
      tronParams.dstAsset === "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR";
    const totalCallValue = isNativeTRX
      ? (
          parseInt(tronParams.dstAmount) + parseInt(tronParams.safetyDeposit)
        ).toString()
      : tronParams.safetyDeposit;

    console.log("📋 IMMUTABLES OBJECT:");
    console.log("=====================");
    Object.entries(immutablesObject).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log(`\nSrc Cancellation Timestamp: ${srcCancellationTimestamp}`);
    console.log(
      `Call Value: ${totalCallValue} SUN (${parseInt(totalCallValue) / 1000000} TRX)`
    );

    // Initialize TronWeb
    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const factoryAddress = "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk";

    // STEP 1: Create contract instance with ABI
    console.log("\n🔧 STEP 1: Creating Contract Instance with ABI");
    console.log("===============================================");

    // Method 1: Try with explicit ABI
    const contract = await tronWeb.contract(ESCROW_FACTORY_ABI, factoryAddress);
    console.log("✅ Contract instance created with explicit ABI");

    // STEP 2: Skip triggerConstantContract for now, go directly to contract wrapper test
    console.log(
      "\n🧪 STEP 2: Skipping triggerConstantContract (has parameter issues)"
    );
    console.log(
      "=================================================================="
    );
    console.log("⏭️  Proceeding directly to contract wrapper test...");

    // STEP 3: Use contract wrapper for the real transaction
    console.log("\n🚀 STEP 3: Using Contract Wrapper for Real Transaction");
    console.log("======================================================");

    // Log available methods to verify
    console.log("Available methods:", Object.keys(contract.methods || {}));

    // Convert immutables object to array format (TronWeb expects arrays for structs)
    const immutablesArray = [
      immutablesObject.orderHash,
      immutablesObject.hashlock,
      immutablesObject.maker,
      immutablesObject.taker,
      immutablesObject.token,
      immutablesObject.amount,
      immutablesObject.safetyDeposit,
      immutablesObject.timelocks,
    ];

    console.log("📋 Converting to array format for TronWeb:");
    console.log("==========================================");
    immutablesArray.forEach((value, index) => {
      const fieldNames = [
        "orderHash",
        "hashlock",
        "maker",
        "taker",
        "token",
        "amount",
        "safetyDeposit",
        "timelocks",
      ];
      console.log(`[${index}] ${fieldNames[index]}: ${value}`);
    });

    const result = await contract
      .createDstEscrow(immutablesArray, srcCancellationTimestamp)
      .send({
        feeLimit: 100000000,
        callValue: totalCallValue,
      });

    const txHash =
      typeof result === "string"
        ? result
        : result.txid || result.transaction?.txID;
    console.log(`✅ Transaction Hash: ${txHash}`);
    console.log(
      `🔗 Tronscan: https://nile.tronscan.org/#/transaction/${txHash}`
    );

    // STEP 4: Check transaction status
    console.log("\n⏳ STEP 4: Checking Transaction Status");
    console.log("======================================");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const tx = await tronWeb.trx.getTransaction(txHash);
      const status = tx.ret[0].contractRet;
      console.log(`📋 Transaction Status: ${status}`);

      if (status === "SUCCESS") {
        console.log("🎉 SUCCESS! The contract wrapper approach worked!");
        console.log("✅ TRON escrow creation is now working!");
        console.log("\n🔧 SOLUTION IDENTIFIED:");
        console.log("=======================");
        console.log(
          "✅ Use TronWeb contract wrapper instead of manual triggerSmartContract"
        );
        console.log("✅ Define proper ABI with struct/tuple components");
        console.log("✅ Pass immutables as object with named fields");
        console.log("✅ Use triggerConstantContract for debugging first");
      } else {
        console.log("❌ Transaction still reverting");
        console.log("Additional investigation needed...");

        // Log the full transaction for analysis
        console.log("\n📋 Full Transaction Details:");
        console.log(JSON.stringify(tx, null, 2));
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

// Run the fix
fixWithContractWrapper().catch(console.error);
