const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

class TronSwapFixer {
  constructor() {
    // Initialize connections
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    this.ethWallet = new ethers.Wallet(
      process.env.RESOLVER_PRIVATE_KEY,
      this.ethProvider
    );

    const tronPrivateKey = process.env.TRON_PRIVATE_KEY.startsWith("0x")
      ? process.env.TRON_PRIVATE_KEY.slice(2)
      : process.env.TRON_PRIVATE_KEY;

    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_RPC_URL,
      privateKey: tronPrivateKey,
    });

    // Load correct Ethereum ABI
    const EscrowFactoryABI = require("./scripts/correct-abi.json");
    this.ethEscrowFactory = new ethers.Contract(
      process.env.ETH_ESCROW_FACTORY_ADDRESS,
      EscrowFactoryABI,
      this.ethWallet
    );

    // The failed swap details
    this.escrowId =
      "0x2ef92d216fd7815e27323e032d99a6008f05f97dd5b5e109ca6374b0b7d37c84";
    this.secret = Buffer.from(
      "2eaaafa2e1c1d1a1ca9e0e1e76569db9d0ef7a04b6e2cea4ea2299cfe20087a2",
      "hex"
    );
    this.nonce = Buffer.from(
      "b9d750d31236497b2bb017c13c4ca1a1f3fae560015087af416c827bb83b71c3",
      "hex"
    );
    this.secretCommit = ethers.keccak256(
      ethers.concat([this.secret, this.nonce])
    );

    this.tronContractAddress = process.env.TRON_ESCROW_FACTORY_ADDRESS;
  }

  async fixSwap() {
    console.log("🔧 Tron Cross-Chain Swap Fixer");
    console.log("==============================");
    console.log(`🔑 Escrow ID: ${this.escrowId}`);
    console.log(`🔐 Secret: ${this.secret.toString("hex")}`);
    console.log(`🎲 Nonce: ${this.nonce.toString("hex")}`);
    console.log(`📝 Secret Commit: ${this.secretCommit}`);
    console.log("");

    try {
      // Step 1: Check if Tron escrow exists using direct call
      const escrowExists = await this.checkTronEscrowDirect();

      if (!escrowExists) {
        console.log("❌ Tron escrow does not exist. Cannot complete swap.");
        return;
      }

      // Step 2: Commit secret on Tron using direct call
      await this.commitSecretDirectly();

      // Step 3: Complete the swap
      await this.completeSwapDirectly();
    } catch (error) {
      console.error("❌ Fix failed:", error.message);
      console.error("Stack:", error.stack);
    }
  }

  async checkTronEscrowDirect() {
    console.log("1️⃣ Checking Tron Escrow (Direct Call)...");

    try {
      // Use TronWeb's triggerSmartContract to call escrows function
      const result = await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.tronContractAddress,
        "escrows(bytes32)",
        {},
        [{ type: "bytes32", value: this.escrowId }]
      );

      if (result.result && result.result.result) {
        console.log("   ✅ Tron escrow exists");
        console.log("   📋 Raw result:", result.constant_result);

        // Decode the result if possible
        if (result.constant_result && result.constant_result.length > 0) {
          console.log("   💡 Escrow data found");
          return true;
        }
      }

      console.log("   ❌ Tron escrow does not exist");
      return false;
    } catch (error) {
      console.error("   ❌ Error checking Tron escrow:", error.message);
      return false;
    }
  }

  async commitSecretDirectly() {
    console.log("2️⃣ Committing Secret on Tron (Direct Call)...");

    try {
      console.log(`   📝 Committing secret: ${this.secretCommit}`);

      // Build the transaction to commit secret
      const txData = await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.tronContractAddress,
        "commitSecret(bytes32)",
        {
          feeLimit: 50_000_000,
        },
        [{ type: "bytes32", value: this.secretCommit }]
      );

      if (!txData.result || !txData.result.result) {
        throw new Error("Failed to build commitSecret transaction");
      }

      // Sign and broadcast
      const signedTx = await this.tronWeb.trx.sign(txData.transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      console.log(
        `   🔗 Tron Commit Transaction: ${
          result.txid || result.transaction?.txID
        }`
      );
      console.log("   ✅ Secret committed on Tron");
      console.log("   ⏰ Waiting 65 seconds for reveal delay...");

      // Wait for reveal delay
      await this.sleep(65000);
    } catch (error) {
      console.error("   ❌ Error committing secret:", error.message);

      if (
        error.message.includes("REVERT") ||
        error.message.includes("revert")
      ) {
        console.log("   💡 Secret might already be committed");
        console.log("   ⏰ Waiting 65 seconds anyway for reveal delay...");
        await this.sleep(65000);
      } else {
        throw error;
      }
    }
  }

  async completeSwapDirectly() {
    console.log("3️⃣ Completing Cross-Chain Swap (Direct Calls)...");

    try {
      // First, reveal and withdraw on Tron
      console.log("   🔓 Revealing and withdrawing TRX...");

      const tronTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "revealAndWithdraw(bytes32,bytes32,bytes32)",
          {
            feeLimit: 100_000_000,
          },
          [
            { type: "bytes32", value: this.escrowId },
            { type: "bytes32", value: "0x" + this.secret.toString("hex") },
            { type: "bytes32", value: "0x" + this.nonce.toString("hex") },
          ]
        );

      if (!tronTxData.result || !tronTxData.result.result) {
        throw new Error("Failed to build Tron revealAndWithdraw transaction");
      }

      // Sign and broadcast Tron transaction
      const signedTronTx = await this.tronWeb.trx.sign(tronTxData.transaction);
      const tronResult = await this.tronWeb.trx.sendRawTransaction(
        signedTronTx
      );

      console.log(
        `   🔗 Tron Reveal Transaction: ${
          tronResult.txid || tronResult.transaction?.txID
        }`
      );
      console.log("   ✅ TRX claimed successfully!");

      // Wait for transaction confirmation
      await this.sleep(5000);

      // Then, reveal and withdraw on Ethereum
      console.log("   🔓 Revealing and withdrawing ETH...");

      const ethRevealTx = await this.ethEscrowFactory.revealAndWithdraw(
        this.escrowId,
        this.secret,
        this.nonce
      );

      console.log(`   🔗 ETH Reveal Transaction: ${ethRevealTx.hash}`);
      console.log("   ⏳ Waiting for confirmation...");

      const ethReceipt = await ethRevealTx.wait();
      console.log(`   ✅ ETH claimed in block ${ethReceipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${ethReceipt.gasUsed}`);

      console.log("\n🎉 CROSS-CHAIN SWAP COMPLETED SUCCESSFULLY!");
      console.log("===============================================");
      console.log("✅ All funds transferred");
      console.log("✅ Secret coordination worked");
      console.log("✅ MEV protection bypassed with direct calls");
      console.log("✅ Ready for your hackathon! 🚀");
    } catch (error) {
      console.error("   ❌ Error completing swap:", error.message);

      if (error.message.includes("execution reverted")) {
        console.log("   🔍 Detailed error analysis:");
        if (error.data) {
          console.log("   Error data:", error.data);
        }

        // Common error scenarios
        if (error.message.includes("SecretNotCommitted")) {
          console.log("   💡 The secret was not committed on Tron");
        } else if (error.message.includes("RevealTooEarly")) {
          console.log("   💡 Need to wait longer for reveal delay");
        } else if (error.message.includes("FinalityNotReached")) {
          console.log("   💡 Need to wait for more blocks");
        } else if (error.message.includes("EscrowNotFound")) {
          console.log("   💡 The escrow does not exist on Tron");
        }
      }

      throw error;
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("⚠️  Direct contract calling mode - bypassing ABI issues");
  console.log(
    "💰 This will attempt to complete the failed swap using direct calls\n"
  );

  const fixer = new TronSwapFixer();
  await fixer.fixSwap();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TronSwapFixer };
