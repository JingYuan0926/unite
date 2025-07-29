#!/usr/bin/env node

/**
 * Working Cross-Chain Swap Script
 * Fixed version that handles private keys correctly
 */

const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
const crypto = require("crypto");
require("dotenv").config();

// Load ABIs
const EscrowFactoryABI = require("./scripts/correct-abi.json");

class WorkingSwap {
  constructor() {
    // Initialize Ethereum connection
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

    // Fix private key format
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

    // Demo parameters - very small amounts for testing
    this.ethAmount = ethers.parseEther("0.0001"); // 0.0001 ETH
    this.minSafetyDeposit = ethers.parseEther("0.001"); // 0.001 ETH safety deposit
    this.totalValue = this.ethAmount + this.minSafetyDeposit; // 0.0011 ETH total

    this.tronAmount = this.tronWeb.toSun(2); // 2 TRX

    // Generate fresh secret for this swap
    this.secret = crypto.randomBytes(32);
    this.secretHash = ethers.keccak256(this.secret);

    console.log("🔧 WORKING CROSS-CHAIN SWAP");
    console.log("============================");
    console.log(`💰 ETH Amount: ${ethers.formatEther(this.ethAmount)} ETH`);
    console.log(
      `🔒 Safety Deposit: ${ethers.formatEther(this.minSafetyDeposit)} ETH`
    );
    console.log(
      `💸 Total ETH Value: ${ethers.formatEther(this.totalValue)} ETH`
    );
    console.log(`💰 TRX Amount: ${this.tronWeb.fromSun(this.tronAmount)} TRX`);
    console.log(`🔐 Secret Hash: ${this.secretHash}`);
    console.log(`🔑 ETH Address: ${this.ethWallet.address}`);
    console.log(`🔑 TRX Address: ${this.tronWeb.defaultAddress.base58}`);
    console.log("");
  }

  async runSwap() {
    try {
      // Step 1: Check balances
      await this.checkBalances();

      // Step 2: Create ETH escrow
      const escrowId = await this.createEthEscrow();

      // Step 3: Create TRX escrow using direct calls (bypass ABI issues)
      await this.createTronEscrowDirect(escrowId);

      // Step 4: Complete the swap
      await this.completeSwap(escrowId);

      console.log("\n🎉 CROSS-CHAIN SWAP COMPLETED SUCCESSFULLY!");
      console.log("✅ Atomic swap executed across Ethereum ↔ TRON");
      console.log("✅ Real funds transferred on live testnets");
    } catch (error) {
      console.error("❌ Swap failed:", error.message);
      if (error.reason) console.error("Reason:", error.reason);
    }
  }

  async checkBalances() {
    console.log("1️⃣ Checking balances...");

    const ethBalance = await this.ethProvider.getBalance(
      this.ethWallet.address
    );
    const tronBalance = await this.tronWeb.trx.getBalance(
      this.tronWeb.defaultAddress.base58
    );

    console.log(`   ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
    console.log(`   TRX Balance: ${this.tronWeb.fromSun(tronBalance)} TRX`);

    if (ethBalance < this.totalValue) {
      throw new Error(
        `Insufficient ETH balance. Need ${ethers.formatEther(
          this.totalValue
        )} ETH`
      );
    }

    if (tronBalance < BigInt(this.tronAmount) * 2n) {
      throw new Error(
        `Insufficient TRX balance. Need ${this.tronWeb.fromSun(
          BigInt(this.tronAmount) * 2n
        )} TRX`
      );
    }

    console.log("   ✅ Sufficient balances confirmed");
    console.log("");
  }

  async createEthEscrow() {
    console.log("2️⃣ Creating Ethereum escrow...");

    const cancelDelay = 172800; // 48 hours

    try {
      const tx = await this.ethEscrowFactory.createEscrow(
        this.ethWallet.address, // resolver
        "0x0000000000000000000000000000000000000000", // ETH token (0x0 for native)
        this.ethAmount,
        this.secretHash,
        cancelDelay,
        { value: this.totalValue }
      );

      console.log(`   🔗 Transaction Hash: ${tx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);

      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);

      // Extract escrow ID from events
      const escrowCreatedEvent = receipt.logs.find((log) => {
        try {
          const parsed = this.ethEscrowFactory.interface.parseLog(log);
          return parsed.name === "EscrowCreated";
        } catch {
          return false;
        }
      });

      if (!escrowCreatedEvent) {
        throw new Error("Could not find EscrowCreated event");
      }

      const parsedEvent =
        this.ethEscrowFactory.interface.parseLog(escrowCreatedEvent);
      const escrowId = parsedEvent.args.escrowId;
      console.log(`   🆔 Escrow ID: ${escrowId}`);
      console.log("");

      return escrowId;
    } catch (error) {
      console.error(`   ❌ ETH escrow creation failed: ${error.message}`);
      throw error;
    }
  }

  async createTronEscrowDirect(escrowId) {
    console.log("3️⃣ Creating TRON escrow (direct call)...");

    try {
      // Use direct TronWeb transaction building to bypass ABI issues
      const tronTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          process.env.TRON_ESCROW_FACTORY_ADDRESS,
          "createEscrow(address,address,uint256,bytes32,uint256)",
          {
            feeLimit: 100_000_000,
            callValue: this.tronAmount.toString(),
          },
          [
            { type: "address", value: this.tronWeb.defaultAddress.hex },
            { type: "address", value: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb" }, // TRX token
            { type: "uint256", value: this.tronAmount.toString() },
            { type: "bytes32", value: this.secretHash },
            { type: "uint256", value: "172800" }, // 48 hours
          ]
        );

      if (!tronTxData.result || !tronTxData.result.result) {
        throw new Error("Failed to build TRON createEscrow transaction");
      }

      // Sign and broadcast
      const signedTx = await this.tronWeb.trx.sign(tronTxData.transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      console.log(
        `   🔗 TRON Transaction: ${result.txid || result.transaction?.txID}`
      );
      console.log(`   ✅ TRON escrow created successfully`);
      console.log("");

      // Wait for confirmation
      await this.sleep(5000);
    } catch (error) {
      console.error(`   ❌ TRON escrow creation failed: ${error.message}`);
      throw error;
    }
  }

  async completeSwap(escrowId) {
    console.log("4️⃣ Completing cross-chain swap...");

    // Generate nonce for reveal
    const nonce = crypto.randomBytes(32);

    try {
      // First, reveal and withdraw on TRON
      console.log("   🔓 Revealing secret on TRON to claim TRX...");

      const tronRevealTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          process.env.TRON_ESCROW_FACTORY_ADDRESS,
          "revealAndWithdraw(bytes32,bytes32,bytes32)",
          {
            feeLimit: 50_000_000,
          },
          [
            { type: "bytes32", value: escrowId },
            { type: "bytes32", value: "0x" + this.secret.toString("hex") },
            { type: "bytes32", value: "0x" + nonce.toString("hex") },
          ]
        );

      if (!tronRevealTxData.result || !tronRevealTxData.result.result) {
        throw new Error("Failed to build TRON revealAndWithdraw transaction");
      }

      const signedTronReveal = await this.tronWeb.trx.sign(
        tronRevealTxData.transaction
      );
      const tronRevealResult = await this.tronWeb.trx.sendRawTransaction(
        signedTronReveal
      );

      console.log(
        `   🔗 TRX Claim Transaction: ${
          tronRevealResult.txid || tronRevealResult.transaction?.txID
        }`
      );
      console.log(`   ✅ TRX claimed successfully!`);

      // Wait for TRON confirmation
      await this.sleep(5000);

      // Then, reveal and withdraw on Ethereum
      console.log("   🔓 Using revealed secret to claim ETH...");

      const ethRevealTx = await this.ethEscrowFactory.revealAndWithdraw(
        escrowId,
        this.secret,
        nonce
      );

      console.log(`   🔗 ETH Claim Transaction: ${ethRevealTx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);

      const ethRevealReceipt = await ethRevealTx.wait();
      console.log(`   ✅ ETH claimed in block ${ethRevealReceipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${ethRevealReceipt.gasUsed}`);
    } catch (error) {
      console.error(`   ❌ Swap completion failed: ${error.message}`);
      throw error;
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("🚀 EXECUTING REAL CROSS-CHAIN ATOMIC SWAP");
  console.log("This performs actual transactions on live testnets!\n");

  const swap = new WorkingSwap();
  await swap.runSwap();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WorkingSwap };
