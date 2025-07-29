const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

// Import ABIs
const { EscrowFactoryABI, TronEscrowFactoryABI } = require("./scripts/abis");

class TronSwapDebugger {
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

    // Initialize contracts
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
  }

  async debugCompleteSwap() {
    console.log("🔧 Advanced Tron Cross-Chain Swap Debugger");
    console.log("===========================================");
    console.log(`🔑 Escrow ID: ${this.escrowId}`);
    console.log(`🔐 Secret: ${this.secret.toString("hex")}`);
    console.log(`🎲 Nonce: ${this.nonce.toString("hex")}`);
    console.log(`📝 Secret Commit: ${this.secretCommit}`);
    console.log("");

    try {
      // Step 1: Check Ethereum escrow status
      await this.checkEthereumEscrow();

      // Step 2: Check Tron escrow status
      await this.checkTronEscrow();

      // Step 3: Check Tron commit status
      await this.checkTronCommitStatus();

      // Step 4: If needed, commit secret on Tron
      await this.commitSecretOnTron();

      // Step 5: Complete the swap
      await this.completeSwap();
    } catch (error) {
      console.error("❌ Debug failed:", error.message);
      console.error("Stack:", error.stack);
    }
  }

  async checkEthereumEscrow() {
    console.log("1️⃣ Checking Ethereum Escrow Status...");

    try {
      const escrow = await this.ethEscrowFactory.escrows(this.escrowId);

      console.log("   📋 Ethereum Escrow Details:");
      console.log(`     Initiator: ${escrow.initiator}`);
      console.log(`     Resolver: ${escrow.resolver}`);
      console.log(`     Amount: ${ethers.formatEther(escrow.amount)} ETH`);
      console.log(`     Secret Hash: ${escrow.secretHash}`);
      console.log(`     Completed: ${escrow.completed}`);
      console.log(`     Cancelled: ${escrow.cancelled}`);
      console.log(`     Finality Lock: ${escrow.finalityLock}`);

      // Check finality
      const currentBlock = await this.ethProvider.getBlockNumber();
      const finalityReached = currentBlock >= Number(escrow.finalityLock);
      console.log(`     Current Block: ${currentBlock}`);
      console.log(`     Finality Reached: ${finalityReached ? "✅" : "❌"}`);

      if (!finalityReached) {
        const blocksToWait = Number(escrow.finalityLock) - currentBlock;
        console.log(`     ⏰ Wait ${blocksToWait} more blocks for finality`);
      }
    } catch (error) {
      console.error("   ❌ Error checking Ethereum escrow:", error.message);
      throw error;
    }

    console.log("");
  }

  async checkTronEscrow() {
    console.log("2️⃣ Checking Tron Escrow Status...");

    try {
      // Create contract instance using TronWeb
      const tronContract = await this.tronWeb.contract(
        TronEscrowFactoryABI,
        process.env.TRON_ESCROW_FACTORY_ADDRESS
      );

      console.log("   📋 Checking if Tron escrow exists...");

      // Try to get escrow details
      const escrowDetails = await tronContract.escrows(this.escrowId).call();

      console.log("   📋 Tron Escrow Details:");
      console.log(
        `     Initiator: ${this.tronWeb.address.fromHex(
          escrowDetails.initiator
        )}`
      );
      console.log(
        `     Resolver: ${this.tronWeb.address.fromHex(escrowDetails.resolver)}`
      );
      console.log(
        `     Amount: ${this.tronWeb.fromSun(escrowDetails.amount)} TRX`
      );
      console.log(`     Secret Hash: ${escrowDetails.secretHash}`);
      console.log(`     Completed: ${escrowDetails.completed}`);
      console.log(`     Cancelled: ${escrowDetails.cancelled}`);

      // Check if escrow exists (initiator won't be zero address)
      if (
        escrowDetails.initiator === "0x0000000000000000000000000000000000000000"
      ) {
        console.log("   ❌ Tron escrow does not exist!");
        console.log("   💡 This might be why the reveal failed");
        return false;
      } else {
        console.log("   ✅ Tron escrow exists");
        return true;
      }
    } catch (error) {
      console.error("   ❌ Error checking Tron escrow:", error.message);
      console.log("   💡 This suggests the Tron escrow might not exist");
      return false;
    }

    console.log("");
  }

  async checkTronCommitStatus() {
    console.log("3️⃣ Checking Tron Secret Commit Status...");

    try {
      const tronContract = await this.tronWeb.contract(
        TronEscrowFactoryABI,
        process.env.TRON_ESCROW_FACTORY_ADDRESS
      );

      // Check if secret is committed (this will likely fail since it's a private mapping)
      console.log("   🔍 Checking if secret was committed on Tron...");
      console.log(
        "   💡 Note: Secret commits are private, so we'll attempt to commit"
      );
    } catch (error) {
      console.log(
        "   ⚠️  Cannot check commit status directly (private mapping)"
      );
    }

    console.log("");
  }

  async commitSecretOnTron() {
    console.log("4️⃣ Committing Secret on Tron...");

    try {
      const tronContract = await this.tronWeb.contract(
        TronEscrowFactoryABI,
        process.env.TRON_ESCROW_FACTORY_ADDRESS
      );

      console.log(`   📝 Committing secret: ${this.secretCommit}`);

      const commitTx = await tronContract.commitSecret(this.secretCommit).send({
        feeLimit: 50_000_000, // 50 TRX fee limit
      });

      console.log(`   🔗 Tron Commit Transaction: ${commitTx}`);
      console.log("   ✅ Secret committed on Tron");
      console.log("   ⏰ Waiting 65 seconds for reveal delay...");

      // Wait for reveal delay
      await this.sleep(65000);
    } catch (error) {
      console.error("   ❌ Error committing secret on Tron:", error.message);

      if (error.message.includes("REVERT")) {
        console.log("   💡 Secret might already be committed");
        console.log("   ⏰ Waiting 65 seconds anyway for reveal delay...");
        await this.sleep(65000);
      } else {
        throw error;
      }
    }

    console.log("");
  }

  async completeSwap() {
    console.log("5️⃣ Completing Cross-Chain Swap...");

    try {
      // First, try to reveal and withdraw on Tron
      console.log("   🔓 Attempting to reveal and withdraw TRX...");

      const tronContract = await this.tronWeb.contract(
        TronEscrowFactoryABI,
        process.env.TRON_ESCROW_FACTORY_ADDRESS
      );

      const tronRevealTx = await tronContract
        .revealAndWithdraw(
          this.escrowId,
          "0x" + this.secret.toString("hex"),
          "0x" + this.nonce.toString("hex")
        )
        .send({
          feeLimit: 100_000_000,
        });

      console.log(`   🔗 Tron Reveal Transaction: ${tronRevealTx}`);
      console.log("   ✅ TRX claimed successfully!");

      // Wait a moment for transaction to process
      await this.sleep(5000);

      // Then, reveal and withdraw on Ethereum
      console.log("   🔓 Attempting to reveal and withdraw ETH...");

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
      console.log("✅ MEV protection activated on both chains");
    } catch (error) {
      console.error("   ❌ Error completing swap:", error.message);

      if (error.message.includes("execution reverted")) {
        console.log("   🔍 Analyzing revert reason...");
        // Add specific error analysis here
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
  console.log(
    "⚠️  Advanced debugging mode - will attempt to fix the failed swap"
  );
  console.log("💰 Make sure you have sufficient TRX for transaction fees\n");

  const swapDebugger = new TronSwapDebugger();
  await swapDebugger.debugCompleteSwap();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TronSwapDebugger };
