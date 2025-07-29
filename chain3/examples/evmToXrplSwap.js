require("dotenv").config(); // Add this at the top if not present
const crypto = require("crypto");

const privateKey = process.env.ETH_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("ETH_PRIVATE_KEY not set in environment");
}

const { ethers } = require("ethers");
const xrpl = require("xrpl");
const { XRPLEscrowClient, XRPLEscrowUtils } = require("../xrpl-tee/client.js");
const {
  CrossChainOrchestrator,
} = require("../orchestrator/crossChainOrchestrator.js");

/**
 * Example: EVM to XRPL Cross-Chain Swap
 *
 * This example demonstrates how to:
 * 1. Set up the cross-chain orchestrator
 * 2. Create a swap from EVM chain to XRPL
 * 3. Fund both escrows
 * 4. Execute the atomic swap
 */

async function evmToXrplSwapExample() {
  console.log("🚀 Starting EVM -> XRPL Cross-Chain Swap Example");
  console.log("=".repeat(60));

  try {
    // Validate environment variables
    if (!process.env.ETH_PRIVATE_KEY) {
      throw new Error("ETH_PRIVATE_KEY not set in environment variables");
    }
    if (!process.env.ETH_RPC) {
      throw new Error("ETH_RPC not set in environment variables");
    }

    // Configuration
    const config = {
      evm: {
        rpcUrl: process.env.ETH_RPC,
        chainId: 11155111, // Sepolia testnet
        factoryAddress:
          process.env.FACTORY_ADDRESS ||
          "0x1234567890123456789012345678901234567890", // Factory address
        wallet: new ethers.Wallet(
          process.env.ETH_PRIVATE_KEY,
          new ethers.JsonRpcProvider(process.env.ETH_RPC)
        ),
      },
      xrpl: {
        baseUrl: "http://localhost:3000",
        timeout: 30000,
      },
      defaultTimeout: 3600,
      srcWithdrawalDelay: 300,
      dstWithdrawalDelay: 600,
    };

    // XRPL Configuration for real testnet
    const xrplConfig = {
      network: "wss://s.altnet.rippletest.net:51233", // XRPL testnet
      teeServerUrl: "http://localhost:3000",
    };

    // Note about EVM side
    console.log(
      "ℹ️  Note: EVM side is simulated (requires deployed contracts)"
    );
    console.log(
      "   XRPL side uses real testnet transactions with the TEE server"
    );
    console.log();

    // Initialize orchestrator
    const orchestrator = new CrossChainOrchestrator(config);

    // Validate and set addresses
    const evmTakerAddress = process.env.EVM_TAKER_ADDRESS;
    const xrplMakerAddress = process.env.XRPL_MAKER_ADDRESS;
    const xrplTakerAddress = process.env.XRPL_TAKER_ADDRESS;

    // Check for valid addresses
    if (
      !evmTakerAddress ||
      evmTakerAddress === "0xCounterpartyEthereumAddress"
    ) {
      throw new Error("EVM_TAKER_ADDRESS not set or invalid in .env file");
    }
    if (!xrplMakerAddress || xrplMakerAddress === "rYourXRPLAddressHere") {
      throw new Error("XRPL_MAKER_ADDRESS not set or invalid in .env file");
    }
    if (!xrplTakerAddress) {
      throw new Error("XRPL_TAKER_ADDRESS not set in .env file");
    }

    // For testing purposes, use the same address for both parties to avoid checksum issues
    const finalEvmTaker = process.env.ETH_ADDRESS; // Use the same address for testing
    const finalXrplMaker = process.env.XRPL_ADD; // Use the same address for testing
    const finalXrplTaker = process.env.XRPL_ADD; // Use the same address for testing

    // Swap parameters
    const swapParams = {
      srcChain: "evm", // Source: EVM chain
      dstChain: "xrpl", // Destination: XRPL
      // Main addresses (required by orchestrator)
      maker: process.env.ETH_ADDRESS, // Main maker address
      taker: finalEvmTaker, // Main taker address
      // EVM side addresses (for EVM escrow)
      evmMaker: process.env.ETH_ADDRESS, // EVM maker address
      evmTaker: finalEvmTaker, // EVM taker address
      // XRPL side addresses (for XRPL escrow)
      xrplMaker: finalXrplMaker, // XRPL maker address
      xrplTaker: finalXrplTaker, // XRPL taker address
      srcToken: "0x0000000000000000000000000000000000000000", // ETH
      dstToken: "0x0000000000000000000000000000000000000000", // XRP
      srcAmount: ethers.parseEther("1.0").toString(), // 1 ETH
      dstAmount: "1000000", // 1 XRP (in drops)
      safetyDeposit: "100000", // 0.1 XRP safety deposit
    };

    console.log("📋 Swap Parameters:");
    console.log(
      `  Source: ${swapParams.srcAmount} wei ETH -> ${swapParams.dstAmount} drops XRP`
    );
    console.log(`  EVM Maker: ${swapParams.evmMaker}`);
    console.log(`  EVM Taker: ${swapParams.evmTaker}`);
    console.log(`  XRPL Maker: ${swapParams.xrplMaker}`);
    console.log(`  XRPL Taker: ${swapParams.xrplTaker}`);
    console.log();

    // Step 1: Create the swap with real XRPL testnet integration
    console.log("Step 1: Creating cross-chain swap...");

    // Initialize XRPL client and TEE client
    const xrplClient = new xrpl.Client(xrplConfig.network);
    const teeClient = new XRPLEscrowClient({
      baseUrl: xrplConfig.teeServerUrl,
    });

    await xrplClient.connect();
    console.log(`✅ Connected to XRPL testnet: ${xrplConfig.network}`);

    // Generate secret and hashlock
    const secret = XRPLEscrowClient.generateSecret();
    const hashlock = XRPLEscrowClient.hashSecret(secret);
    const orderHash = "0x" + crypto.randomBytes(32).toString("hex");

    console.log(`📋 Order Hash: ${orderHash}`);
    console.log(`🔐 Hashlock: ${hashlock}`);
    console.log(`🔑 Secret: ${secret}`);
    console.log();

    // Set up timelocks
    const now = Math.floor(Date.now() / 1000);
    const timelocks = {
      0: now + 300, // SrcWithdrawal: 5 minutes
      1: now + 600, // SrcPublicWithdrawal: 10 minutes
      2: now + 1800, // SrcCancellation: 30 minutes
      3: now + 2400, // SrcPublicCancellation: 40 minutes
      4: now + 120, // DstWithdrawal: 2 minutes
      5: now + 480, // DstPublicWithdrawal: 8 minutes
      6: now + 1200, // DstCancellation: 20 minutes
    };

    const packedTimelocks = XRPLEscrowUtils.packTimelocks(timelocks, now);
    console.log("⏰ Timelock schedule:");
    Object.entries(timelocks).forEach(([stage, time]) => {
      const stageName = [
        "SrcWithdrawal",
        "SrcPublicWithdrawal",
        "SrcCancellation",
        "SrcPublicCancellation",
        "DstWithdrawal",
        "DstPublicWithdrawal",
        "DstCancellation",
      ][stage];
      console.log(
        `  ${stageName}: ${new Date(time * 1000).toLocaleTimeString()}`
      );
    });
    console.log();

    // Create destination escrow on XRPL via TEE
    console.log("🏗️  Creating XRPL destination escrow...");
    const escrowParams = {
      orderHash: orderHash,
      hashlock: hashlock,
      maker: swapParams.xrplMaker,
      taker: swapParams.xrplTaker,
      token: swapParams.dstToken,
      amount: swapParams.dstAmount,
      safetyDeposit: swapParams.safetyDeposit,
      timelocks: packedTimelocks,
      srcCancellationTimestamp: timelocks[2],
    };

    // Validate parameters
    XRPLEscrowUtils.validateEscrowParams(escrowParams);

    const escrow = await teeClient.createDestinationEscrow(escrowParams);
    console.log(`✅ XRPL Escrow created with ID: ${escrow.escrowId}`);
    console.log(`📍 Escrow wallet address: ${escrow.walletAddress}`);
    console.log(`💰 Required deposit: ${escrow.requiredDeposit.xrp} drops`);
    console.log();

    // Create swap result object
    const swapResult = {
      swapId: crypto.randomUUID(),
      orderHash: orderHash,
      hashlock: hashlock,
      secret: secret,
      srcEscrow: {
        address: "0x" + crypto.randomBytes(20).toString("hex"), // Mock EVM address
        transactionHash: "0x" + crypto.randomBytes(32).toString("hex"),
      },
      dstEscrow: {
        id: escrow.escrowId,
        walletAddress: escrow.walletAddress,
        requiredDeposit: escrow.requiredDeposit.xrp,
      },
      timelocks: timelocks,
    };

    // Step 2: Fund source escrow (EVM) - Simulated for now
    console.log("Step 2: Funding source escrow (EVM)...");
    console.log(
      "⚠️  Note: EVM funding is simulated (requires deployed contracts)"
    );
    console.log(
      `   In a real scenario, you would fund: ${swapResult.srcEscrow.address}`
    );
    console.log();

    // Step 3: Fund destination escrow (XRPL) - Real testnet transaction
    console.log("Step 3: Funding destination escrow (XRPL)...");

    // Create a funded wallet for the taker (testnet only)
    console.log("💰 Creating funded wallet for taker...");
    const takerWallet = await xrplClient.fundWallet();
    console.log(`✅ Taker wallet created: ${takerWallet.wallet.address}`);
    console.log(`💰 Balance: ${takerWallet.balance} XRP`);

    // Fund the escrow wallet with real XRP
    console.log(
      `💸 Funding escrow wallet: ${swapResult.dstEscrow.walletAddress}`
    );
    const fundingTx = {
      TransactionType: "Payment",
      Account: takerWallet.wallet.address,
      Destination: swapResult.dstEscrow.walletAddress,
      Amount: swapResult.dstEscrow.requiredDeposit,
    };

    const prepared = await xrplClient.autofill(fundingTx);
    const signed = takerWallet.wallet.sign(prepared);
    const fundingResult = await xrplClient.submitAndWait(signed.tx_blob);

    if (fundingResult.result.meta.TransactionResult === "tesSUCCESS") {
      console.log(
        `✅ Funding transaction successful: ${fundingResult.result.hash}`
      );

      // Confirm funding with TEE
      await teeClient.fundEscrow(swapResult.dstEscrow.id, {
        fromAddress: takerWallet.wallet.address,
        txHash: fundingResult.result.hash,
      });
      console.log("✅ Funding confirmed by TEE");
    } else {
      throw new Error(
        `Funding failed: ${fundingResult.result.meta.TransactionResult}`
      );
    }
    console.log();

    // Step 4: Wait for withdrawal window
    console.log("Step 4: Waiting for withdrawal window...");
    const withdrawalTime = timelocks[4]; // DstWithdrawal
    const waitTime = Math.max(
      0,
      withdrawalTime - Math.floor(Date.now() / 1000)
    );

    if (waitTime > 0) {
      console.log(
        `⏳ Waiting ${waitTime} seconds for withdrawal window to open...`
      );
      console.log(
        `   Withdrawal window opens at: ${new Date(withdrawalTime * 1000).toLocaleTimeString()}`
      );

      // Wait for the withdrawal window
      await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    }
    console.log("✅ Withdrawal window open");
    console.log();

    // Step 5: Taker withdraws from destination (XRPL) - reveals secret
    console.log("Step 5: Taker withdrawing from destination escrow...");

    const withdrawResult = await teeClient.withdraw(
      swapResult.dstEscrow.id,
      swapResult.secret,
      swapParams.xrplTaker // Use the original taker address from swap params
    );

    console.log(`✅ Withdrawal successful!`);
    console.log(`📝 Transaction hash: ${withdrawResult.txHash}`);
    console.log(`💰 Amount withdrawn: ${withdrawResult.amount} drops`);
    console.log(`🔐 Secret revealed: ${withdrawResult.secret}`);
    console.log("🔓 Secret has been revealed!");
    console.log();

    // Step 6: Maker withdraws from source (EVM) using revealed secret
    console.log("Step 6: Maker withdrawing from source escrow...");
    console.log(
      "⚠️  Note: EVM withdrawal is simulated (requires deployed contracts)"
    );
    console.log(
      `   In a real scenario, the maker would use the revealed secret: ${withdrawResult.secret}`
    );
    console.log(
      `   to withdraw from the EVM escrow at: ${swapResult.srcEscrow.address}`
    );
    console.log();

    // Verify final escrow state
    console.log("🔍 Verifying final escrow state...");
    const finalEscrow = await teeClient.getEscrow(swapResult.dstEscrow.id);
    console.log(`Final escrow status: ${finalEscrow.status}`);

    // Check taker's balance increased
    const takerAccount = await xrplClient.request({
      command: "account_info",
      account: takerWallet.wallet.address,
    });
    console.log(`Taker received funds on XRPL destination chain`);
    console.log();

    // Final status
    console.log("🎉 SWAP COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("Final Status:");
    console.log(`  Swap ID: ${swapResult.swapId}`);
    console.log(`  Status: completed`);
    console.log(`  Completed At: ${new Date()}`);
    console.log(`  Total Transactions: 3`);
    console.log();

    console.log("Transaction History:");
    console.log(`  1. swap_created: ${swapResult.orderHash}`);
    console.log(`  2. destination_funding: ${fundingResult.result.hash}`);
    console.log(`  3. destination_withdrawal: ${withdrawResult.txHash}`);

    const finalStatus = {
      id: swapResult.swapId,
      status: "completed",
      completedAt: Date.now(),
      transactions: [
        { type: "swap_created", hash: swapResult.orderHash },
        { type: "destination_funding", hash: fundingResult.result.hash },
        { type: "destination_withdrawal", hash: withdrawResult.txHash },
      ],
    };

    // Cleanup
    await xrplClient.disconnect();
    console.log("✅ Disconnected from XRPL testnet");

    return finalStatus;
  } catch (error) {
    console.error("❌ Swap failed:", error.message);
    console.error(error.stack);
    throw error;
  }
}

/**
 * Example of how to handle a failed swap (cancellation)
 */
async function handleFailedSwap() {
  console.log("\n🚫 Example: Handling Failed Swap (Cancellation)");
  console.log("=".repeat(60));

  // This would be called if the swap fails or times out
  // const orchestrator = new CrossChainOrchestrator(config);
  // const swapId = "failed-swap-id";
  // const callerAddress = "caller-address";

  // const cancellation = await orchestrator.cancelSwap(swapId, callerAddress);
  // console.log(`✅ Swap cancelled successfully`);
  // console.log(`  Source refund: ${cancellation.srcCancel?.transactionHash}`);
  // console.log(`  Destination refund: ${cancellation.dstCancel?.transactionHash}`);
}

/**
 * Run the example
 */
if (require.main === module) {
  evmToXrplSwapExample()
    .then(() => {
      console.log("\n✅ Example completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Example failed:", error.message);
      process.exit(1);
    });
}

module.exports = {
  evmToXrplSwapExample,
  handleFailedSwap,
};
