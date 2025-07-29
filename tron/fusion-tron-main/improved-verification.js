const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

// Load ABIs
const EscrowFactoryABI = require("./scripts/correct-abi.json");

class ImprovedVerification {
  constructor() {
    // Initialize Ethereum connection
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

    let ethPrivateKey = process.env.RESOLVER_PRIVATE_KEY;
    if (!ethPrivateKey.startsWith("0x")) {
      ethPrivateKey = "0x" + ethPrivateKey;
    }
    this.ethWallet = new ethers.Wallet(ethPrivateKey, this.ethProvider);

    // Initialize Tron connection
    let tronPrivateKey = process.env.TRON_PRIVATE_KEY;
    if (tronPrivateKey.startsWith("0x")) {
      tronPrivateKey = tronPrivateKey.slice(2);
    }
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_RPC_URL,
      privateKey: tronPrivateKey,
    });

    // Initialize contracts
    this.ethEscrowFactory = new ethers.Contract(
      process.env.ETH_ESCROW_FACTORY_ADDRESS,
      EscrowFactoryABI,
      this.ethWallet
    );
  }

  async verifyTransactions() {
    console.log("🔍 IMPROVED TRANSACTION VERIFICATION");
    console.log("====================================");
    console.log("Properly verifying ETH and TRON transactions...");
    console.log("");

    // Example transaction hashes from your recent run
    const ethTxHash =
      "0x14ea3d1f77e0ec54999ddaed0391d1c9dde8537834c4f21c79bc9722f0171576";
    const tronTxHash =
      "659336994ec3aedf446db29fc9253c083b46451811128e862d8a515ef92f7f63";
    const ethEscrowId =
      "0x28ec628cdf523ec87a7d761146e6cd4ee885e041636fed88dfe50c250e998ed8";

    await this.verifyEthereumTransaction(ethTxHash, ethEscrowId);
    await this.verifyTronTransaction(tronTxHash);
    await this.provideExplorerGuidance(ethTxHash, tronTxHash, ethEscrowId);
  }

  async verifyEthereumTransaction(txHash, escrowId) {
    console.log("1️⃣ ETHEREUM TRANSACTION VERIFICATION");
    console.log("====================================");

    try {
      console.log(`🔍 Checking ETH Transaction: ${txHash}`);

      // Get transaction receipt
      const receipt = await this.ethProvider.getTransactionReceipt(txHash);

      if (!receipt) {
        console.log("   ❌ Transaction not found");
        return;
      }

      console.log(
        `   ✅ Transaction Status: ${
          receipt.status === 1 ? "SUCCESS" : "FAILED"
        }`
      );
      console.log(`   📦 Block Number: ${receipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(
        `   💰 ETH Used: ${ethers.formatEther(
          receipt.gasUsed * receipt.gasPrice || 0n
        )} ETH`
      );

      // Parse events to find EscrowCreated
      console.log("\n   📋 Transaction Events:");
      let escrowCreatedFound = false;
      let actualEscrowId = null;

      for (const log of receipt.logs) {
        try {
          const parsed = this.ethEscrowFactory.interface.parseLog(log);
          if (parsed.name === "EscrowCreated") {
            escrowCreatedFound = true;
            actualEscrowId = parsed.args.escrowId;
            console.log(`   ✅ EscrowCreated Event Found:`);
            console.log(`      Escrow ID: ${actualEscrowId}`);
            console.log(`      Initiator: ${parsed.args.initiator}`);
            console.log(`      Resolver: ${parsed.args.resolver}`);
            console.log(
              `      Amount: ${ethers.formatEther(parsed.args.amount)} ETH`
            );
            console.log(`      Token: ${parsed.args.token}`);
            break;
          }
        } catch (e) {
          // Not our contract's log
        }
      }

      if (!escrowCreatedFound) {
        console.log(
          "   ❌ No EscrowCreated event found - escrow creation failed"
        );
        return;
      }

      // Verify the escrow exists in contract state
      console.log("\n   🔍 Verifying Escrow in Contract State:");
      try {
        const escrowExists = await this.ethEscrowFactory.escrowExists(
          actualEscrowId
        );
        console.log(`   Escrow Exists: ${escrowExists ? "✅" : "❌"}`);

        if (escrowExists) {
          const escrowData = await this.ethEscrowFactory.getEscrow(
            actualEscrowId
          );
          console.log(`   Initiator: ${escrowData.initiator}`);
          console.log(`   Resolver: ${escrowData.resolver}`);
          console.log(
            `   Amount: ${ethers.formatEther(escrowData.amount)} ETH`
          );
          console.log(
            `   Safety Deposit: ${ethers.formatEther(
              escrowData.safetyDeposit
            )} ETH`
          );
          console.log(`   Completed: ${escrowData.completed ? "✅" : "❌"}`);
          console.log(`   Cancelled: ${escrowData.cancelled ? "✅" : "❌"}`);
        }
      } catch (error) {
        console.log(`   ❌ Error reading escrow: ${error.message}`);
      }
    } catch (error) {
      console.error(`   ❌ ETH verification failed: ${error.message}`);
    }

    console.log("");
  }

  async verifyTronTransaction(txHash) {
    console.log("2️⃣ TRON TRANSACTION VERIFICATION");
    console.log("=================================");

    try {
      console.log(`🔍 Checking TRON Transaction: ${txHash}`);

      // Try multiple times with delays (TRON can be slow)
      let tronTxInfo = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts && !tronTxInfo) {
        try {
          console.log(
            `   ⏳ Attempt ${
              attempts + 1
            }/${maxAttempts} - Checking transaction...`
          );

          tronTxInfo = await this.tronWeb.trx.getTransactionInfo(txHash);

          if (tronTxInfo && Object.keys(tronTxInfo).length > 0) {
            break;
          }

          // Also try getTransaction
          const txData = await this.tronWeb.trx.getTransaction(txHash);
          if (txData && txData.txID) {
            console.log(`   📦 Transaction found in mempool/blockchain`);
            console.log(`   🔗 Transaction ID: ${txData.txID}`);
          }
        } catch (error) {
          console.log(`   ⚠️ Attempt ${attempts + 1} failed: ${error.message}`);
        }

        attempts++;
        if (attempts < maxAttempts) {
          console.log(`   ⏳ Waiting 3 seconds before retry...`);
          await this.sleep(3000);
        }
      }

      if (!tronTxInfo || Object.keys(tronTxInfo).length === 0) {
        console.log("   ❌ Transaction not found or still processing");
        console.log("   💡 This could mean:");
        console.log(
          "      • Transaction is still being processed (TRON can be slow)"
        );
        console.log(
          "      • Transaction failed and wasn't included in a block"
        );
        console.log("      • Network/RPC issues");
        return;
      }

      // Check various status fields
      console.log("\n   📊 Transaction Status Details:");
      console.log(`   Block Number: ${tronTxInfo.blockNumber || "N/A"}`);
      console.log(`   Block Timestamp: ${tronTxInfo.blockTimeStamp || "N/A"}`);

      // Check receipt result
      if (tronTxInfo.receipt) {
        console.log(`   Receipt Result: ${tronTxInfo.receipt.result || "N/A"}`);
        console.log(`   Energy Used: ${tronTxInfo.receipt.energy_usage || 0}`);
        console.log(`   Energy Fee: ${tronTxInfo.receipt.energy_fee || 0}`);
        console.log(`   Net Usage: ${tronTxInfo.receipt.net_usage || 0}`);
      }

      // Check contract result
      if (tronTxInfo.contractResult && tronTxInfo.contractResult.length > 0) {
        console.log(`   Contract Result: ${tronTxInfo.contractResult[0]}`);
      }

      // Overall status determination
      let status = "UNKNOWN";
      if (tronTxInfo.receipt) {
        if (tronTxInfo.receipt.result === "SUCCESS") {
          status = "SUCCESS";
        } else if (tronTxInfo.receipt.result === "REVERT") {
          status = "FAILED";
        }
      }

      console.log(`   🎯 Overall Status: ${status}`);

      // Check for events/logs
      if (tronTxInfo.log && tronTxInfo.log.length > 0) {
        console.log(`   📋 Events Emitted: ${tronTxInfo.log.length}`);
        for (let i = 0; i < tronTxInfo.log.length; i++) {
          console.log(
            `      Event ${i + 1}: ${JSON.stringify(tronTxInfo.log[i])}`
          );
        }
      } else {
        console.log(
          `   📋 No events emitted (this might indicate the contract call failed)`
        );
      }
    } catch (error) {
      console.error(`   ❌ TRON verification failed: ${error.message}`);
    }

    console.log("");
  }

  async provideExplorerGuidance(ethTxHash, tronTxHash, escrowId) {
    console.log("3️⃣ BLOCK EXPLORER GUIDANCE");
    console.log("===========================");

    console.log("🌐 How to Verify in Block Explorers:");
    console.log("");

    console.log("📋 ETHEREUM SEPOLIA:");
    console.log(
      `   🔗 Transaction: https://sepolia.etherscan.io/tx/${ethTxHash}`
    );
    console.log(`   📦 Search for: ${ethTxHash} (transaction hash)`);
    console.log(`   ❌ DO NOT search for: ${escrowId} (escrow ID)`);
    console.log("");
    console.log("   💡 What to look for:");
    console.log("      • Transaction status should be 'Success'");
    console.log("      • Look in 'Logs' tab for 'EscrowCreated' event");
    console.log("      • The escrow ID will be in the event data");
    console.log("");

    console.log("📋 TRON NILE:");
    console.log(
      `   🔗 Transaction: https://nile.tronscan.org/#/transaction/${tronTxHash}`
    );
    console.log(`   📦 Search for: ${tronTxHash} (transaction hash)`);
    console.log("");
    console.log("   💡 What to look for:");
    console.log("      • Transaction status should be 'Success'");
    console.log("      • Check 'Events' tab for contract events");
    console.log("      • Energy consumption should be reasonable");
    console.log("");

    console.log("🔧 TROUBLESHOOTING:");
    console.log(
      "   • If ETH transaction shows 'Success' but no EscrowCreated event:"
    );
    console.log("     → The contract call failed (check revert reason)");
    console.log("   • If TRON transaction shows 'Success' but no events:");
    console.log("     → The contract call failed (check contract result)");
    console.log("   • If transactions aren't found:");
    console.log("     → They might still be processing or failed");
    console.log("");

    console.log("📝 KEY INSIGHT:");
    console.log("   Escrow IDs are NOT transaction hashes!");
    console.log(
      "   • Transaction hash = identifier for the transaction itself"
    );
    console.log(
      "   • Escrow ID = internal identifier generated by the smart contract"
    );
    console.log("   • Always search for transaction hashes in explorers");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("🚀 IMPROVED TRANSACTION VERIFICATION");
  console.log("Properly checking ETH and TRON transactions...\n");

  const verifier = new ImprovedVerification();
  await verifier.verifyTransactions();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImprovedVerification };
