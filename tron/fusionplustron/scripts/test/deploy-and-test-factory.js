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

async function deployAndTestFactory() {
  console.log("🚀 COMPLETE DEPLOY AND TEST SEQUENCE");
  console.log("=".repeat(60));

  const tronWeb = new TronWeb({
    fullHost: TRON_CONFIG.fullHost,
    headers: TRON_CONFIG.headers,
    privateKey: TRON_CONFIG.privateKey,
  });

  let factoryAddress = null;

  try {
    // Step 1: Deploy the factory
    console.log("🔍 Step 1: Deploying TronEscrowFactoryPatched");

    // Load contract artifact
    const contractArtifact = require("../../artifacts/contracts/tron/TronEscrowFactoryPatched.sol/TronEscrowFactoryPatched.json");

    console.log(`   Bytecode Length: ${contractArtifact.bytecode.length}`);
    console.log(`   Deployer: ${tronWeb.defaultAddress.base58}`);

    // Constructor parameters
    const limitOrderProtocol = "0x0000000000000000000000000000000000000000"; // Zero address for Tron
    const feeToken = "0x0000000000000000000000000000000000000000"; // Zero address
    const accessToken = "0x0000000000000000000000000000000000000000"; // Zero address
    const owner = tronWeb.defaultAddress.base58;
    const rescueDelaySrc = 86400; // 24 hours
    const rescueDelayDst = 43200; // 12 hours

    console.log("   Constructor Parameters:");
    console.log(`     Owner: ${owner}`);
    console.log(`     Rescue Delay Src: ${rescueDelaySrc} seconds`);
    console.log(`     Rescue Delay Dst: ${rescueDelayDst} seconds`);

    // Deploy using TronWeb's contract deployment
    const options = {
      abi: contractArtifact.abi,
      bytecode: contractArtifact.bytecode,
      parameters: [
        limitOrderProtocol,
        feeToken,
        accessToken,
        owner,
        rescueDelaySrc,
        rescueDelayDst,
      ],
      feeLimit: TRON_CONFIG.feeLimit,
      callValue: 0,
      userFeePercentage: 100,
      originEnergyLimit: 10000000,
    };

    console.log("   Submitting deployment transaction...");

    const deployedContract = await tronWeb.contract().new(options);

    if (deployedContract && deployedContract.address) {
      factoryAddress = deployedContract.address;
      console.log(`✅ Factory deployed successfully!`);
      console.log(`   Factory Address: ${factoryAddress}`);
      console.log(
        `🔗 Contract Explorer: https://nile.tronscan.org/#/contract/${factoryAddress}`
      );
    } else {
      throw new Error("Deployment returned no address");
    }

    // Wait for deployment to be confirmed
    console.log("   Waiting for deployment confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 2: Verify deployment
    console.log("\n🔍 Step 2: Verifying Factory Deployment");

    const factoryABI = [
      {
        inputs: [],
        name: "isTronFactory",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTronChainId",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    const factoryContract = await tronWeb.contract(factoryABI, factoryAddress);

    const isTronFactory = await factoryContract.isTronFactory().call();
    const chainId = await factoryContract.getTronChainId().call();

    console.log(`   Is Tron Factory: ${isTronFactory}`);
    console.log(`   Chain ID: ${chainId}`);

    if (!isTronFactory) {
      throw new Error("Factory verification failed - not a Tron factory");
    }

    console.log("✅ Factory verification successful!");

    // Step 3: Test createDstEscrow function
    console.log("\n🔍 Step 3: Testing createDstEscrow Function");

    const fullFactoryABI = [
      {
        inputs: [
          {
            components: [
              { name: "orderHash", type: "bytes32" },
              { name: "hashlock", type: "bytes32" },
              { name: "maker", type: "uint256" },
              { name: "taker", type: "uint256" },
              { name: "token", type: "uint256" },
              { name: "amount", type: "uint256" },
              { name: "safetyDeposit", type: "uint256" },
              { name: "timelocks", type: "uint256" },
            ],
            name: "dstImmutables",
            type: "tuple",
          },
          { name: "srcCancellationTimestamp", type: "uint256" },
        ],
        name: "createDstEscrow",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, name: "escrow", type: "address" },
          { indexed: false, name: "hashlock", type: "bytes32" },
          { indexed: false, name: "taker", type: "uint256" },
        ],
        name: "DstEscrowCreated",
        type: "event",
      },
    ];

    const fullFactoryContract = await tronWeb.contract(
      fullFactoryABI,
      factoryAddress
    );

    // Construct test parameters
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const testOrderHash =
      "0x" + currentTimestamp.toString(16).padStart(64, "0");
    const testSecret = "test-secret-" + currentTimestamp;
    const testHashlock = tronWeb.sha3(testSecret);

    const makerAddressHex = tronWeb.address.toHex(
      tronWeb.defaultAddress.base58
    );
    const takerAddressHex = tronWeb.address.toHex(
      tronWeb.defaultAddress.base58
    );

    const makerAddress = "0x" + makerAddressHex.substring(2);
    const takerAddress = "0x" + takerAddressHex.substring(2);
    const tokenAddress = "0x0000000000000000000000000000000000000000";

    const testAmount = tronWeb.toSun(1); // 1 TRX
    const safetyDeposit = tronWeb.toSun(0.1); // 0.1 TRX safety deposit

    const timelock = 7200; // 2 hours
    const timelocks =
      (BigInt(600) << BigInt(0 * 32)) |
      (BigInt(1800) << BigInt(1 * 32)) |
      (BigInt(timelock) << BigInt(2 * 32)) |
      (BigInt(timelock + 3600) << BigInt(3 * 32)) |
      (BigInt(300) << BigInt(4 * 32)) |
      (BigInt(900) << BigInt(5 * 32)) |
      (BigInt(timelock - 300) << BigInt(6 * 32));

    const dstImmutables = [
      testOrderHash,
      testHashlock,
      makerAddress,
      takerAddress,
      tokenAddress,
      testAmount.toString(),
      safetyDeposit.toString(),
      "0x" + timelocks.toString(16),
    ];

    const srcCancellationTimestamp = currentTimestamp + timelock;
    const totalValue = BigInt(testAmount) + BigInt(safetyDeposit);

    console.log("   Test Parameters:");
    console.log(`     Order Hash: ${testOrderHash}`);
    console.log(`     Hashlock: ${testHashlock}`);
    console.log(`     Secret: ${testSecret}`);
    console.log(`     Amount: ${tronWeb.fromSun(testAmount)} TRX`);
    console.log(`     Safety Deposit: ${tronWeb.fromSun(safetyDeposit)} TRX`);
    console.log(`     Total Value: ${tronWeb.fromSun(totalValue)} TRX`);

    console.log("   Executing createDstEscrow...");

    const createEscrowResult = await fullFactoryContract
      .createDstEscrow(dstImmutables, srcCancellationTimestamp)
      .send({
        feeLimit: TRON_CONFIG.feeLimit,
        callValue: totalValue.toString(),
        shouldPollResponse: true,
      });

    let txHash = "unknown";
    if (createEscrowResult.transactionHash) {
      txHash = createEscrowResult.transactionHash;
    } else if (createEscrowResult.txid) {
      txHash = createEscrowResult.txid;
    } else if (
      createEscrowResult.transaction &&
      createEscrowResult.transaction.txID
    ) {
      txHash = createEscrowResult.transaction.txID;
    }

    console.log(`✅ Transaction submitted: ${txHash}`);
    console.log(
      `🔗 Tronscan: https://nile.tronscan.org/#/transaction/${txHash}`
    );

    // Wait for confirmation and get transaction info
    console.log("   Waiting for transaction confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    if (txHash !== "unknown") {
      try {
        const txInfo = await tronWeb.trx.getTransactionInfo(txHash);
        const gasUsed = txInfo.receipt?.energy_usage_total || 0;
        const status = txInfo.receipt?.result || "UNKNOWN";

        console.log(`   Gas Used: ${gasUsed} energy`);
        console.log(`   Status: ${status}`);

        if (status === "SUCCESS" && txInfo.log && txInfo.log.length > 0) {
          console.log(`   Found ${txInfo.log.length} event log(s)`);

          // Look for DstEscrowCreated event
          for (const log of txInfo.log) {
            const eventSignature = tronWeb
              .sha3("DstEscrowCreated(address,bytes32,uint256)")
              .substring(0, 10);

            if (log.topics && log.topics[0] === eventSignature) {
              console.log("✅ Found DstEscrowCreated event!");

              const decodedLog = tronWeb.utils.abi.decodeLog(
                [
                  { indexed: false, name: "escrow", type: "address" },
                  { indexed: false, name: "hashlock", type: "bytes32" },
                  { indexed: false, name: "taker", type: "uint256" },
                ],
                log.data,
                log.topics.slice(1)
              );

              const escrowAddress = tronWeb.address.fromHex(decodedLog.escrow);
              console.log(`   📍 New Escrow Address: ${escrowAddress}`);
              console.log(
                `🔗 Escrow Explorer: https://nile.tronscan.org/#/contract/${escrowAddress}`
              );

              // Verify escrow contract exists
              const escrowAccount = await tronWeb.trx.getAccount(escrowAddress);
              if (escrowAccount && Object.keys(escrowAccount).length > 0) {
                console.log("✅ Escrow contract verified on-chain!");
                console.log(
                  `   Balance: ${tronWeb.fromSun(escrowAccount.balance || 0)} TRX`
                );
              }

              // Save results
              const results = {
                deploymentSuccess: true,
                factoryAddress: factoryAddress,
                factoryTxHash: "deployment-tx", // Would need to capture from deployment
                escrowCreationSuccess: true,
                escrowTxHash: txHash,
                escrowAddress: escrowAddress,
                testParameters: {
                  orderHash: testOrderHash,
                  hashlock: testHashlock,
                  secret: testSecret,
                  amount: tronWeb.fromSun(testAmount),
                  safetyDeposit: tronWeb.fromSun(safetyDeposit),
                  totalValue: tronWeb.fromSun(totalValue),
                },
              };

              fs.writeFileSync(
                "./COMPLETE_SUCCESS_REPORT.json",
                JSON.stringify(results, null, 2)
              );

              console.log("\n🎊 ✅ COMPLETE SUCCESS! ✅ 🎊");
              console.log("🔥 CRITICAL SUCCESS METRICS:");
              console.log(`   ✅ Factory deployed: ${factoryAddress}`);
              console.log(`   ✅ createDstEscrow executed successfully`);
              console.log(`   ✅ DstEscrowCreated event emitted`);
              console.log(`   ✅ New escrow proxy deployed: ${escrowAddress}`);
              console.log(`   ✅ CREATE2 deployment working on Tron TVM`);
              console.log("\n🚀 SYSTEM STATUS: READY FOR FULL INTEGRATION!");

              return {
                success: true,
                factoryAddress: factoryAddress,
                escrowAddress: escrowAddress,
                txHash: txHash,
              };
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not fetch transaction info: ${error.message}`);
      }
    }

    throw new Error(
      "Could not find DstEscrowCreated event or transaction failed"
    );
  } catch (error) {
    console.error("💥 DEPLOYMENT AND TEST FAILED:", error.message);
    console.error("Stack trace:", error.stack);

    return {
      success: false,
      error: error.message,
      factoryAddress: factoryAddress,
    };
  }
}

// Execute the complete sequence
async function main() {
  try {
    const result = await deployAndTestFactory();

    if (result.success) {
      console.log("\n🎯 MISSION ACCOMPLISHED!");
      console.log("✅ Factory deployed and tested successfully");
      process.exit(0);
    } else {
      console.log("\n❌ MISSION FAILED");
      console.log("Need to investigate and fix issues");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Complete sequence failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { deployAndTestFactory };
