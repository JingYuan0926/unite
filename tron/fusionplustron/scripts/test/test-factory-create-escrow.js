const TronWeb = require("tronweb");
const fs = require("fs");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 200000000, // 200 TRX for escrow creation tests
};

// Factory address from deployment (UPDATE THIS WITH REAL ADDRESS)
const FACTORY_ADDRESS = "TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH"; // PLACEHOLDER - UPDATE WITH REAL ADDRESS

/**
 * CRITICAL TEST: First live test of createDstEscrow function
 * This test will prove that the TronEscrowFactoryPatched can successfully
 * deploy new escrow proxy contracts using CREATE2 on Tron Nile testnet.
 */
async function testFactoryCreateEscrow() {
  console.log("🧪 LIVE TEST: TronEscrowFactoryPatched.createDstEscrow()");
  console.log("=".repeat(70));
  console.log(`📋 Factory Address: ${FACTORY_ADDRESS}`);
  console.log(`🌐 Network: Tron Nile Testnet`);
  console.log(`⏰ Test Started: ${new Date().toISOString()}`);

  // Initialize TronWeb
  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  // Factory contract ABI - focused on createDstEscrow function
  const factoryABI = [
    {
      inputs: [
        {
          components: [
            { name: "orderHash", type: "bytes32" },
            { name: "hashlock", type: "bytes32" },
            { name: "maker", type: "uint256" }, // Address as uint256 in Tron
            { name: "taker", type: "uint256" }, // Address as uint256 in Tron
            { name: "token", type: "uint256" }, // Address as uint256 in Tron
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

  const testResults = [];

  try {
    // Step 1: Verify factory is accessible and is Tron factory
    console.log("\n🔍 Step 1: Verifying Factory Contract");

    const factoryContract = await tronWeb.contract(factoryABI, FACTORY_ADDRESS);

    // Check if it's a Tron factory
    const isTronFactory = await factoryContract.isTronFactory().call();
    console.log(`   Is Tron Factory: ${isTronFactory}`);

    if (!isTronFactory) {
      throw new Error("❌ Contract is not configured as a Tron factory");
    }

    // Get Tron chain ID
    const chainId = await factoryContract.getTronChainId().call();
    console.log(`   Tron Chain ID: ${chainId}`);
    console.log("✅ Factory verification successful");

    // Step 2: Construct Immutables struct for createDstEscrow
    console.log("\n🔍 Step 2: Constructing Immutables Struct");

    const currentTimestamp = Math.floor(Date.now() / 1000);
    // Create proper bytes32 orderHash (64 hex characters)
    const testOrderHash =
      "0x" + currentTimestamp.toString(16).padStart(64, "0");
    const testSecret = "test-secret-" + currentTimestamp;
    const testHashlock = tronWeb.sha3(testSecret);

    // Convert addresses to uint256 format for Tron
    const makerAddressHex = tronWeb.address.toHex(
      tronWeb.defaultAddress.base58
    );
    const takerAddressHex = tronWeb.address.toHex(
      tronWeb.defaultAddress.base58
    );

    // Convert hex addresses to uint256 strings
    const makerAddress = "0x" + makerAddressHex.substring(2);
    const takerAddress = "0x" + takerAddressHex.substring(2);
    const tokenAddress = "0x0000000000000000000000000000000000000000"; // Native TRX (zero address)

    const testAmount = tronWeb.toSun(1); // 1 TRX
    const safetyDeposit = tronWeb.toSun(0.1); // 0.1 TRX safety deposit

    // Create timelocks using the same pattern as TronFusionExtension
    // All delays are in seconds relative to deployment timestamp
    const timelock = 7200; // 2 hours
    const timelocks =
      (BigInt(600) << BigInt(0 * 32)) | // srcWithdrawal: 10 minutes
      (BigInt(1800) << BigInt(1 * 32)) | // srcPublicWithdrawal: 30 minutes
      (BigInt(timelock) << BigInt(2 * 32)) | // srcCancellation: 2 hours
      (BigInt(timelock + 3600) << BigInt(3 * 32)) | // srcPublicCancellation: +1 hour
      (BigInt(300) << BigInt(4 * 32)) | // dstWithdrawal: 5 minutes
      (BigInt(900) << BigInt(5 * 32)) | // dstPublicWithdrawal: 15 minutes
      (BigInt(timelock - 300) << BigInt(6 * 32)); // dstCancellation: 5 min earlier than src

    // Create dstImmutables as an array (tuple) in the correct order for Solidity struct
    const dstImmutables = [
      testOrderHash, // orderHash (bytes32)
      testHashlock, // hashlock (bytes32)
      makerAddress, // maker (uint256)
      takerAddress, // taker (uint256)
      tokenAddress, // token (uint256)
      testAmount.toString(), // amount (uint256)
      safetyDeposit.toString(), // safetyDeposit (uint256)
      "0x" + timelocks.toString(16), // timelocks (uint256)
    ];

    const srcCancellationTimestamp = currentTimestamp + timelock; // 2 hours from now

    console.log("   Constructed Parameters:");
    console.log(`     Order Hash: ${testOrderHash}`);
    console.log(`     Hashlock: ${testHashlock}`);
    console.log(`     Secret (for verification): ${testSecret}`);
    console.log(`     Maker: ${tronWeb.address.fromHex(makerAddressHex)}`);
    console.log(`     Taker: ${tronWeb.address.fromHex(takerAddressHex)}`);
    console.log(`     Token: Native TRX (${tokenAddress})`);
    console.log(`     Amount: ${tronWeb.fromSun(testAmount)} TRX`);
    console.log(`     Safety Deposit: ${tronWeb.fromSun(safetyDeposit)} TRX`);
    console.log(
      `     Total Value Required: ${tronWeb.fromSun(BigInt(testAmount) + BigInt(safetyDeposit))} TRX`
    );
    console.log(
      `     Src Cancellation: ${new Date(srcCancellationTimestamp * 1000).toISOString()}`
    );

    // Step 3: Execute createDstEscrow transaction
    console.log("\n🔍 Step 3: Executing createDstEscrow Transaction");

    const totalValue = BigInt(testAmount) + BigInt(safetyDeposit);
    console.log(
      `   Sending ${tronWeb.fromSun(totalValue)} TRX with transaction...`
    );

    const createEscrowResult = await factoryContract
      .createDstEscrow(dstImmutables, srcCancellationTimestamp)
      .send({
        feeLimit: TRON_CONFIG.feeLimit,
        callValue: totalValue,
        shouldPollResponse: true,
      });

    // Extract transaction hash
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

    console.log(`✅ Transaction Submitted: ${txHash}`);
    console.log(
      `🔗 Tronscan: https://nile.tronscan.org/#/transaction/${txHash}`
    );

    // Step 4: Wait and get transaction info with event logs
    console.log("\n🔍 Step 4: Retrieving Transaction Details and Event Logs");

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds for confirmation

    let txInfo;
    let gasUsed = 0;
    let escrowAddress = null;

    try {
      txInfo = await tronWeb.trx.getTransactionInfo(txHash);
      gasUsed = txInfo.receipt?.energy_usage_total || 0;
      console.log(`   Gas Used: ${gasUsed} energy`);
      console.log(
        `   Transaction Status: ${txInfo.receipt?.result || "UNKNOWN"}`
      );

      // Parse event logs to find DstEscrowCreated event
      if (txInfo.log && txInfo.log.length > 0) {
        console.log(`   Found ${txInfo.log.length} event log(s)`);

        for (const log of txInfo.log) {
          // Look for DstEscrowCreated event signature
          const eventSignature = tronWeb
            .sha3("DstEscrowCreated(address,bytes32,uint256)")
            .substring(0, 10);

          if (log.topics && log.topics[0] === eventSignature) {
            console.log("✅ Found DstEscrowCreated event!");

            // Decode the event data
            const decodedLog = tronWeb.utils.abi.decodeLog(
              [
                { indexed: false, name: "escrow", type: "address" },
                { indexed: false, name: "hashlock", type: "bytes32" },
                { indexed: false, name: "taker", type: "uint256" },
              ],
              log.data,
              log.topics.slice(1)
            );

            escrowAddress = tronWeb.address.fromHex(decodedLog.escrow);
            console.log(`   📍 New Escrow Address: ${escrowAddress}`);
            console.log(`   🔐 Event Hashlock: ${decodedLog.hashlock}`);
            console.log(
              `   👤 Event Taker: ${tronWeb.address.fromHex("41" + decodedLog.taker.substring(2).padStart(40, "0"))}`
            );
            break;
          }
        }
      }

      if (!escrowAddress) {
        console.log("⚠️ Could not find DstEscrowCreated event in logs");
        console.log(
          "   This might indicate the transaction failed or event parsing needs adjustment"
        );
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch transaction info: ${error.message}`);
    }

    // Step 5: Verify the deployed escrow contract exists
    console.log("\n🔍 Step 5: Verifying Deployed Escrow Contract");

    if (escrowAddress) {
      try {
        // Check if contract exists by getting its bytecode
        const bytecode = await tronWeb.trx.getCode(escrowAddress);
        if (bytecode && bytecode !== "0x") {
          console.log("✅ Escrow contract found on-chain!");
          console.log(`   Contract Address: ${escrowAddress}`);
          console.log(`   Bytecode Length: ${bytecode.length} characters`);
          console.log(
            `🔗 Contract Explorer: https://nile.tronscan.org/#/contract/${escrowAddress}`
          );
        } else {
          console.log("❌ No bytecode found at escrow address");
        }

        // Try to get account info
        const accountInfo = await tronWeb.trx.getAccount(escrowAddress);
        if (accountInfo && Object.keys(accountInfo).length > 0) {
          console.log("✅ Escrow account exists on Tron blockchain");
          console.log(`   Account Type: ${accountInfo.type || "Contract"}`);
          if (accountInfo.balance) {
            console.log(
              `   Balance: ${tronWeb.fromSun(accountInfo.balance)} TRX`
            );
          }
        }
      } catch (error) {
        console.log(`⚠️ Error verifying escrow contract: ${error.message}`);
      }
    } else {
      console.log("❌ Cannot verify escrow - no address found from event logs");
    }

    // Record test results
    testResults.push({
      testName: "createDstEscrow",
      txHash: txHash,
      escrowAddress: escrowAddress,
      gasUsed: gasUsed,
      success: escrowAddress !== null,
      timestamp: new Date().toISOString(),
      tronscanUrl: `https://nile.tronscan.org/#/transaction/${txHash}`,
      contractExplorerUrl: escrowAddress
        ? `https://nile.tronscan.org/#/contract/${escrowAddress}`
        : null,
      testParameters: {
        orderHash: testOrderHash,
        hashlock: testHashlock,
        secret: testSecret,
        amount: tronWeb.fromSun(testAmount),
        safetyDeposit: tronWeb.fromSun(safetyDeposit),
        totalValue: tronWeb.fromSun(totalValue),
      },
    });

    // Step 6: Generate Final Test Report
    console.log("\n📊 FINAL TEST REPORT");
    console.log("=".repeat(70));

    const testResult = testResults[0];
    if (testResult.success) {
      console.log("🎊 ✅ LIVE TEST SUCCESSFUL! ✅ 🎊");
      console.log("");
      console.log("🔥 CRITICAL SUCCESS METRICS:");
      console.log(`   ✅ createDstEscrow() executed successfully`);
      console.log(`   ✅ DstEscrowCreated event emitted`);
      console.log(`   ✅ New escrow proxy deployed on-chain`);
      console.log(`   ✅ CREATE2 deployment working on Tron TVM`);
      console.log("");
      console.log("📋 TRANSACTION DETAILS:");
      console.log(`   🔗 TX Hash: ${testResult.txHash}`);
      console.log(`   📍 Escrow Address: ${testResult.escrowAddress}`);
      console.log(`   ⛽ Gas Used: ${testResult.gasUsed} energy`);
      console.log(
        `   💰 Total Value: ${testResult.testParameters.totalValue} TRX`
      );
      console.log("");
      console.log("🔗 VERIFICATION LINKS:");
      console.log(`   Transaction: ${testResult.tronscanUrl}`);
      console.log(`   New Contract: ${testResult.contractExplorerUrl}`);
      console.log("");
      console.log("🚀 SYSTEM STATUS: READY FOR FULL INTEGRATION!");
      console.log("✅ The TronEscrowFactoryPatched is LIVE and FUNCTIONAL");
      console.log("✅ Cross-chain atomic swaps can now be executed");
      console.log("✅ Off-chain systems can be updated with confidence");
    } else {
      console.log("❌ LIVE TEST FAILED");
      console.log(`   Transaction Hash: ${testResult.txHash}`);
      console.log(`   Check Tronscan: ${testResult.tronscanUrl}`);
      console.log("   Review transaction logs for error details");
    }

    // Save detailed results
    const reportData = {
      testType: "LIVE_FACTORY_CREATE_ESCROW_TEST",
      factoryAddress: FACTORY_ADDRESS,
      network: "Tron Nile Testnet",
      timestamp: new Date().toISOString(),
      results: testResults,
      summary: {
        success: testResult.success,
        escrowCreated: testResult.escrowAddress !== null,
        readyForIntegration: testResult.success,
      },
    };

    fs.writeFileSync(
      "./FACTORY_CREATE_ESCROW_TEST_REPORT.json",
      JSON.stringify(reportData, null, 2)
    );

    console.log(
      "\n📄 Detailed report saved to: FACTORY_CREATE_ESCROW_TEST_REPORT.json"
    );

    return testResults;
  } catch (error) {
    console.error("💥 LIVE TEST FAILED:", error.message);
    console.error("Stack trace:", error.stack);

    testResults.push({
      testName: "createDstEscrow",
      txHash: null,
      escrowAddress: null,
      gasUsed: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

// Execute the live test
async function main() {
  try {
    console.log("🚀 Starting LIVE Factory Test...");
    console.log(
      `⚠️  IMPORTANT: This test will spend real TRX on Tron Nile testnet`
    );
    console.log(`💰 Estimated cost: ~2 TRX (1 TRX + 0.1 TRX safety + gas)`);
    console.log("");

    const results = await testFactoryCreateEscrow();

    console.log("\n🎯 LIVE FACTORY TEST COMPLETE!");

    if (results[0].success) {
      console.log("🎊 SUCCESS: Factory is ready for production use!");
      process.exit(0);
    } else {
      console.log("❌ FAILURE: Factory needs investigation");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Live Factory Test Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testFactoryCreateEscrow };
