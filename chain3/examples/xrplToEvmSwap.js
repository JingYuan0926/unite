const { ethers } = require("ethers");
const {
  CrossChainOrchestrator,
} = require("../orchestrator/crossChainOrchestrator.js");

/**
 * Example: XRPL to EVM Cross-Chain Swap
 *
 * This example demonstrates how to:
 * 1. Set up the cross-chain orchestrator
 * 2. Create a swap from XRPL to EVM chain
 * 3. Fund both escrows
 * 4. Execute the atomic swap (reverse direction)
 */

async function xrplToEvmSwapExample() {
  console.log("🚀 Starting XRPL -> EVM Cross-Chain Swap Example");
  console.log("=".repeat(60));

  try {
    // Configuration
    const config = {
      evm: {
        rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // Sepolia testnet
        chainId: 11155111, // Sepolia chain ID
        factoryAddress: "0x1234567890123456789012345678901234567890", // 1inch factory on Sepolia
        wallet: new ethers.Wallet(
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          new ethers.JsonRpcProvider(
            "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
          )
        ),
      },
      xrpl: {
        baseUrl: "http://localhost:3000", // XRPL escrow server
        timeout: 30000,
      },
      // Timelock configuration (in seconds)
      defaultTimeout: 3600, // 1 hour total timeout
      srcWithdrawalDelay: 300, // 5 minutes for source withdrawal
      dstWithdrawalDelay: 600, // 10 minutes for destination withdrawal
    };

    // Initialize orchestrator
    const orchestrator = new CrossChainOrchestrator(config);

    // Swap parameters (reverse direction)
    const swapParams = {
      srcChain: "xrpl", // Source: XRPL
      dstChain: "evm", // Destination: EVM chain
      maker: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH", // XRPL address
      taker: "0x742d35Cc6634C0532925a3b8D3Eb4c4C61BfC9e3", // EVM address
      srcToken: "0x0000000000000000000000000000000000000000", // XRP
      dstToken: "0x0000000000000000000000000000000000000000", // ETH
      srcAmount: "2000000", // 2 XRP (in drops)
      dstAmount: ethers.parseEther("0.001").toString(), // 0.001 ETH
      safetyDeposit: "100000", // 0.1 XRP safety deposit
    };

    console.log("📋 Swap Parameters:");
    console.log(
      `  Source: ${swapParams.srcAmount} drops XRP -> ${swapParams.dstAmount} wei ETH`
    );
    console.log(`  Maker: ${swapParams.maker} (XRPL)`);
    console.log(`  Taker: ${swapParams.taker} (EVM)`);
    console.log();

    // Step 1: Create the swap
    console.log("Step 1: Creating cross-chain swap...");
    const swapResult = await orchestrator.createSwap(swapParams);
    console.log(`✅ Swap created with ID: ${swapResult.swapId}`);
    console.log(`  XRPL Escrow: ${swapResult.srcEscrow.id}`);
    console.log(`  XRPL Wallet: ${swapResult.srcEscrow.walletAddress}`);
    console.log(`  EVM Escrow: ${swapResult.dstEscrow.address}`);
    console.log();

    // Step 2: Fund source escrow (XRPL)
    console.log("Step 2: Funding source escrow (XRPL)...");

    // For XRPL, the maker needs to send XRP to the escrow wallet
    const xrplSourceFundingTx = "EXAMPLE_XRPL_TX_HASH_FROM_MAKER_WALLET";

    const sourceFunding = await orchestrator.fundSourceEscrow(
      swapResult.swapId,
      {
        fromAddress: swapParams.maker,
        txHash: xrplSourceFundingTx,
      }
    );
    console.log(`✅ Source escrow funded: ${sourceFunding.transactionHash}`);
    console.log();

    // Step 3: Fund destination escrow (EVM)
    console.log("Step 3: Funding destination escrow (EVM)...");

    // For EVM, funding is handled automatically by the orchestrator
    const destinationFunding = await orchestrator.fundDestinationEscrow(
      swapResult.swapId,
      {} // No additional data needed for EVM
    );
    console.log(
      `✅ Destination escrow funded: ${destinationFunding.transactionHash}`
    );
    console.log();

    // Step 4: Wait for withdrawal window
    console.log("Step 4: Waiting for withdrawal window...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate waiting
    console.log("✅ Withdrawal window open");
    console.log();

    // Step 5: Taker withdraws from destination (EVM) - reveals secret
    console.log("Step 5: Taker withdrawing from destination escrow...");
    const destinationWithdrawal = await orchestrator.withdrawFromDestination(
      swapResult.swapId,
      swapParams.taker
    );
    console.log(
      `✅ Destination withdrawal successful: ${destinationWithdrawal.transactionHash}`
    );
    console.log("🔓 Secret has been revealed on-chain!");
    console.log();

    // Step 6: Maker withdraws from source (XRPL) using revealed secret
    console.log("Step 6: Maker withdrawing from source escrow...");

    // In practice, the maker would monitor the EVM transaction to extract the secret
    const swapStatus = orchestrator.getSwapStatus(swapResult.swapId);
    const revealedSecret = swapStatus.transactions.find(
      (tx) => tx.type === "destination_withdrawal"
    ).secret;

    const sourceWithdrawal = await orchestrator.withdrawFromSource(
      swapResult.swapId,
      revealedSecret,
      swapParams.maker
    );
    console.log(
      `✅ Source withdrawal successful: ${sourceWithdrawal.transactionHash}`
    );
    console.log();

    // Final status
    const finalStatus = orchestrator.getSwapStatus(swapResult.swapId);
    console.log("🎉 SWAP COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("Final Status:");
    console.log(`  Swap ID: ${finalStatus.id}`);
    console.log(`  Status: ${finalStatus.status}`);
    console.log(`  Completed At: ${new Date(finalStatus.completedAt)}`);
    console.log(`  Total Transactions: ${finalStatus.transactions.length}`);
    console.log();

    console.log("Transaction History:");
    finalStatus.transactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ${tx.type}: ${tx.hash || "N/A"}`);
    });

    return finalStatus;
  } catch (error) {
    console.error("❌ Swap failed:", error.message);
    console.error(error.stack);
    throw error;
  }
}

/**
 * Example: Monitoring for secret revelation
 * This shows how to monitor EVM transactions to extract the revealed secret
 */
async function monitorSecretRevelation(escrowAddress, provider) {
  console.log("\n👀 Example: Monitoring Secret Revelation");
  console.log("=".repeat(60));

  // Set up event filter for withdrawal events
  const escrowABI = [
    "event Withdrawn(address indexed to, bytes32 secret, uint256 amount)",
  ];

  const escrowContract = new ethers.Contract(
    escrowAddress,
    escrowABI,
    provider
  );

  // Listen for withdrawal events
  escrowContract.on("Withdrawn", (to, secret, amount, event) => {
    console.log("🔓 Secret revealed in EVM transaction!");
    console.log(`  Transaction: ${event.transactionHash}`);
    console.log(`  To: ${to}`);
    console.log(`  Secret: ${secret}`);
    console.log(`  Amount: ${amount.toString()}`);

    // Now the XRPL maker can use this secret to withdraw from their escrow
    console.log(
      "➡️  Maker can now withdraw from XRPL escrow using this secret"
    );
  });

  console.log(`📡 Listening for withdrawal events on ${escrowAddress}...`);
}

/**
 * Example: Automated swap completion
 * This shows how to automate the entire swap process
 */
async function automatedSwapExample() {
  console.log("\n🤖 Example: Automated Swap Completion");
  console.log("=".repeat(60));

  const config = {
    // Same config as above
    evm: {
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      chainId: 11155111,
      factoryAddress: "0x1234567890123456789012345678901234567890",
      wallet: new ethers.Wallet(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        new ethers.JsonRpcProvider(
          "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
        )
      ),
    },
    xrpl: {
      baseUrl: "http://localhost:3000",
      timeout: 30000,
    },
  };

  const orchestrator = new CrossChainOrchestrator(config);

  const swapParams = {
    srcChain: "xrpl",
    dstChain: "evm",
    maker: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    taker: "0x742d35Cc6634C0532925a3b8D3Eb4c4C61BfC9e3",
    srcToken: "0x0000000000000000000000000000000000000000",
    dstToken: "0x0000000000000000000000000000000000000000",
    srcAmount: "1000000", // 1 XRP
    dstAmount: ethers.parseEther("0.0005").toString(), // 0.0005 ETH
    safetyDeposit: "100000",
  };

  const fundingData = {
    source: {
      fromAddress: swapParams.maker,
      txHash: "EXAMPLE_XRPL_SOURCE_TX",
    },
    destination: {}, // EVM funding handled automatically
  };

  try {
    // Use the complete workflow method
    const result = await orchestrator.executeCompleteSwap(
      swapParams,
      fundingData
    );

    console.log("🎉 Automated swap completed!");
    console.log(`  Swap ID: ${result.id}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Total Time: ${result.completedAt - result.createdAt}ms`);

    return result;
  } catch (error) {
    console.error("❌ Automated swap failed:", error.message);
    throw error;
  }
}

/**
 * Run the example
 */
if (require.main === module) {
  xrplToEvmSwapExample()
    .then(() => {
      console.log("\n✅ Example completed successfully!");
      // You can also run the automated example
      // return automatedSwapExample();
    })
    .then(() => {
      console.log("\n✅ All examples completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Example failed:", error.message);
      process.exit(1);
    });
}

module.exports = {
  xrplToEvmSwapExample,
  monitorSecretRevelation,
  automatedSwapExample,
};
