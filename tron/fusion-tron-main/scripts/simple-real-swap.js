#!/usr/bin/env node

/**
 * Simple Real Cross-Chain Swap Demo
 * A simplified version with better error handling and validation
 */

const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
const crypto = require("crypto");

// Import ABIs
const { EscrowFactoryABI, TronEscrowFactoryABI } = require("./abis");

class SimpleRealSwapDemo {
  constructor() {
    // Initialize Ethereum connection
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    this.ethWallet = new ethers.Wallet(
      process.env.RESOLVER_PRIVATE_KEY,
      this.ethProvider
    );

    // Initialize Tron connection
    const privateKey = process.env.TRON_PRIVATE_KEY; // Use TRON_PRIVATE_KEY for Tron operations
    const tronPrivateKey = privateKey.startsWith("0x")
      ? privateKey.slice(2)
      : privateKey;

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

    this.tronEscrowFactory = this.tronWeb.contract(
      TronEscrowFactoryABI,
      process.env.TRON_ESCROW_FACTORY_ADDRESS
    );

    // Demo parameters (smaller amounts for testing)
    this.ethAmount = ethers.parseEther("0.0001"); // Very small amount: 0.0001 ETH
    this.minSafetyDeposit = ethers.parseEther("0.001"); // Contract requirement: 0.001 ETH safety deposit
    this.totalValue = this.ethAmount + this.minSafetyDeposit; // Total: 0.0011 ETH

    this.tronAmount = this.tronWeb.toSun(5); // 5 TRX
    this.minTronSafetyDeposit = this.tronWeb.toSun(1); // 1 TRX safety deposit
    this.totalTronValue =
      BigInt(this.tronAmount) + BigInt(this.minTronSafetyDeposit); // Total: 6 TRX

    this.secret = crypto.randomBytes(32);
    this.secretHash = ethers.keccak256(this.secret);

    // Get addresses for both chains
    this.ethResolverAddress = this.ethWallet.address;
    this.tronResolverAddress =
      this.tronWeb.address.fromPrivateKey(tronPrivateKey);
  }

  async runSimpleSwap() {
    console.log("🚀 Simple Real Cross-Chain Swap Demo");
    console.log("====================================");
    console.log(`💰 ETH Amount: ${ethers.formatEther(this.ethAmount)} ETH`);
    console.log(
      `🔒 Safety Deposit: ${ethers.formatEther(this.minSafetyDeposit)} ETH`
    );
    console.log(`💸 Total Value: ${ethers.formatEther(this.totalValue)} ETH`);
    console.log(`💰 TRX Amount: ${this.tronWeb.fromSun(this.tronAmount)} TRX`);
    console.log(`🔐 Secret Hash: ${this.secretHash}`);
    console.log(`🤖 ETH Resolver: ${this.ethResolverAddress}`);
    console.log(`🤖 TRX Resolver: ${this.tronResolverAddress}`);
    console.log("");

    try {
      // Step 1: Check contract and balances
      await this.verifySetup();

      // Step 2: Create ETH escrow
      const ethEscrowId = await this.createEthEscrow();

      // Step 3: Create TRX escrow
      await this.createTronEscrow();

      // Step 4: Complete the swap (reveal secret and claim)
      await this.completeSwap(ethEscrowId);

      console.log("\n🎉 Simple Cross-Chain Swap completed successfully!");
      console.log("This demonstrates real cross-chain blockchain interaction.");
    } catch (error) {
      console.error("❌ Demo failed:", error.message);
      if (error.reason) console.error("Reason:", error.reason);
      if (error.code) console.error("Code:", error.code);
      process.exit(1);
    }
  }

  async verifySetup() {
    console.log("🔍 Verifying setup...");

    // Check ETH balance
    const ethBalance = await this.ethProvider.getBalance(
      this.ethWallet.address
    );
    console.log(`  ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    // Check TRX balance
    const tronBalance = await this.tronWeb.trx.getBalance(
      this.tronResolverAddress
    );
    console.log(`  TRX Balance: ${this.tronWeb.fromSun(tronBalance)} TRX`);

    // Verify contracts exist
    const ethCode = await this.ethProvider.getCode(
      process.env.ETH_ESCROW_FACTORY_ADDRESS
    );
    if (ethCode === "0x") {
      throw new Error("Ethereum EscrowFactory contract not found");
    }
    console.log("  ✅ EscrowFactory contract found");

    const network = await this.ethProvider.getNetwork();
    console.log(`  Network: ${network.name} (${network.chainId})`);

    // Check sufficient balance
    if (ethBalance < this.totalValue) {
      throw new Error(
        `Insufficient ETH balance. Need ${ethers.formatEther(
          this.totalValue
        )} ETH`
      );
    }

    if (tronBalance < this.totalTronValue) {
      throw new Error(
        `Insufficient TRX balance. Need ${this.tronWeb.fromSun(
          this.totalTronValue
        )} TRX`
      );
    }

    console.log("");
  }

  async createEthEscrow() {
    console.log("1️⃣ Creating Ethereum escrow...");

    const cancelDelay = 172800; // 48 hours in seconds

    console.log(`   Cancel Delay: ${cancelDelay} seconds (48 hours)`);
    console.log(
      `   Finality Lock: Will be calculated automatically (current block + 20)`
    );

    // Estimate gas
    try {
      const gasEstimate = await this.ethEscrowFactory.createEscrow.estimateGas(
        this.ethResolverAddress,
        "0x0000000000000000000000000000000000000000",
        this.ethAmount,
        this.secretHash,
        cancelDelay,
        { value: this.totalValue }
      );
      console.log(`   Estimated Gas: ${gasEstimate}`);
    } catch (gasError) {
      console.log(`   ⚠️  Gas estimation failed: ${gasError.message}`);
    }

    // Create escrow
    const tx = await this.ethEscrowFactory.createEscrow(
      this.ethResolverAddress,
      "0x0000000000000000000000000000000000000000", // ETH
      this.ethAmount,
      this.secretHash,
      cancelDelay,
      { value: this.totalValue }
    );

    console.log(`   🔗 Transaction Hash: ${tx.hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
    console.log(`   ⛽ Gas Used: ${receipt.gasUsed}`);

    // Extract escrow ID
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

    // Get escrow details
    const escrowDetails = await this.ethEscrowFactory.escrows(escrowId);
    console.log(`   📋 Escrow Details:`);
    console.log(`     Initiator: ${escrowDetails.initiator}`);
    console.log(`     Resolver: ${escrowDetails.resolver}`);
    console.log(`     Amount: ${ethers.formatEther(escrowDetails.amount)} ETH`);
    console.log(`     Completed: ${escrowDetails.completed}`);
    console.log(`     Cancelled: ${escrowDetails.cancelled}`);

    return escrowId;
  }

  async createTronEscrow() {
    console.log("\n2️⃣ Creating Tron escrow...");
    console.log(`   Amount: ${this.tronWeb.fromSun(this.tronAmount)} TRX`);
    console.log(
      `   Total Value: ${this.tronWeb.fromSun(this.totalTronValue)} TRX`
    );

    try {
      const cancelDelay = 172800; // Same as ETH side

      const createTronTx = await this.tronEscrowFactory
        .createEscrow(
          this.tronResolverAddress,
          "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // TRX token address
          this.tronAmount.toString(),
          this.secretHash,
          cancelDelay
        )
        .send({
          feeLimit: 100_000_000,
          callValue: this.totalTronValue.toString(),
        });

      console.log(`   🔗 Tron Transaction: ${createTronTx}`);
      console.log(`   ✅ Tron Escrow created successfully`);

      // Wait for Tron network
      await this.sleep(3000);
    } catch (error) {
      console.error(`   ❌ Tron escrow creation failed: ${error.message}`);
      throw error;
    }
  }

  async completeSwap(ethEscrowId) {
    console.log("\n3️⃣ Completing cross-chain swap...");

    // Generate nonce for reveal
    const nonce = crypto.randomBytes(32);

    console.log("   🔓 Revealing secret on Tron to claim TRX...");
    try {
      const revealTx = await this.tronEscrowFactory
        .revealAndWithdraw(ethEscrowId, this.secret, nonce)
        .send({
          feeLimit: 50_000_000,
        });

      console.log(`   🔗 TRX Claim Transaction: ${revealTx}`);
      console.log(`   ✅ TRX claimed successfully!`);

      // Wait for Tron transaction
      await this.sleep(5000);
    } catch (error) {
      console.error(`   ❌ TRX claim failed: ${error.message}`);
      throw error;
    }

    console.log("   🔓 Using revealed secret to claim ETH...");
    try {
      const claimEthTx = await this.ethEscrowFactory.revealAndWithdraw(
        ethEscrowId,
        this.secret,
        nonce
      );

      console.log(`   🔗 ETH Claim Transaction: ${claimEthTx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);

      const claimReceipt = await claimEthTx.wait();
      console.log(`   ✅ ETH claimed in block ${claimReceipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${claimReceipt.gasUsed}`);

      console.log("\n✅ Cross-chain swap completed!");
      console.log("✅ Secret coordinated between chains");
      console.log("✅ All funds transferred successfully");
    } catch (error) {
      console.error(`   ❌ ETH claim failed: ${error.message}`);
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
    "⚠️  WARNING: This performs REAL transactions on Ethereum Sepolia!"
  );
  console.log("Make sure you have sufficient testnet ETH before proceeding.\n");

  const demo = new SimpleRealSwapDemo();
  await demo.runSimpleSwap();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleRealSwapDemo };
