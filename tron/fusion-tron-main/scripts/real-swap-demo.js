#!/usr/bin/env node

/**
 * Real Cross-Chain Swap Demo
 * This script performs ACTUAL transactions on Ethereum Sepolia and Tron Nile testnets
 */

const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
const crypto = require("crypto");
require("dotenv").config();

// Import ABIs
const { EscrowFactoryABI, TronEscrowFactoryABI } = require("./abis");

class RealSwapDemo {
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

    // Demo parameters (fixed amounts for testing)
    this.ethAmount = ethers.parseEther("0.0001"); // 0.0001 ETH
    this.minSafetyDeposit = ethers.parseEther("0.001"); // Contract requirement: 0.001 ETH safety deposit
    this.totalEthValue = this.ethAmount + this.minSafetyDeposit; // Total: 0.0011 ETH

    this.tronAmount = this.tronWeb.toSun(10); // 10 TRX
    this.minTronSafetyDeposit = this.tronWeb.toSun(1); // 1 TRX safety deposit
    this.totalTronValue =
      BigInt(this.tronAmount) + BigInt(this.minTronSafetyDeposit); // Total: 11 TRX

    this.secret = crypto.randomBytes(32);
    this.secretHash = ethers.keccak256(this.secret);

    // Timing parameters (using durations, not timestamps)
    this.cancelDelay = 48 * 60 * 60; // 48 hours in seconds

    // Get addresses for both chains from the same private key
    this.ethResolverAddress = this.ethWallet.address; // Ethereum address
    this.tronResolverAddress =
      this.tronWeb.address.fromPrivateKey(tronPrivateKey); // Tron address
  }

  async runRealSwap() {
    console.log("🚀 Starting REAL Cross-Chain Swap Demo");
    console.log("=====================================");
    console.log(`💰 ETH Amount: ${ethers.formatEther(this.ethAmount)} ETH`);
    console.log(
      `🔒 ETH Safety Deposit: ${ethers.formatEther(this.minSafetyDeposit)} ETH`
    );
    console.log(
      `💸 Total ETH Value: ${ethers.formatEther(this.totalEthValue)} ETH`
    );
    console.log(`💰 TRX Amount: ${this.tronWeb.fromSun(this.tronAmount)} TRX`);
    console.log(
      `🔒 TRX Safety Deposit: ${this.tronWeb.fromSun(
        this.minTronSafetyDeposit
      )} TRX`
    );
    console.log(
      `💸 Total TRX Value: ${this.tronWeb.fromSun(this.totalTronValue)} TRX`
    );
    console.log(`🔐 Secret Hash: ${this.secretHash}`);
    console.log(`🤖 ETH Resolver: ${this.ethResolverAddress}`);
    console.log(`🤖 TRX Resolver: ${this.tronResolverAddress}`);
    console.log(`⏰ Cancel Delay: ${this.cancelDelay / 3600} hours`);
    console.log("");

    try {
      // Check balances first
      await this.checkBalances();

      // Verify contract setup
      await this.verifyContracts();

      // Perform ETH → TRX swap
      await this.performEthToTronSwap();
    } catch (error) {
      console.error("❌ Swap failed:", error.message);
      if (error.reason) console.error("Reason:", error.reason);
      if (error.code) console.error("Code:", error.code);
      process.exit(1);
    }
  }

  async checkBalances() {
    console.log("💰 Checking current balances...");

    // ETH balance
    const ethBalance = await this.ethProvider.getBalance(
      this.ethWallet.address
    );
    console.log(`  ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    // TRX balance
    const tronBalance = await this.tronWeb.trx.getBalance(
      this.tronResolverAddress
    );
    console.log(`  TRX Balance: ${this.tronWeb.fromSun(tronBalance)} TRX`);
    console.log("");

    // Check if we have enough balance
    if (ethBalance < this.totalEthValue) {
      throw new Error(
        `Insufficient ETH balance. Need ${ethers.formatEther(
          this.totalEthValue
        )} ETH, have ${ethers.formatEther(ethBalance)} ETH`
      );
    }

    if (tronBalance < this.totalTronValue) {
      throw new Error(
        `Insufficient TRX balance. Need ${this.tronWeb.fromSun(
          this.totalTronValue
        )} TRX, have ${this.tronWeb.fromSun(tronBalance)} TRX`
      );
    }
  }

  async verifyContracts() {
    console.log("🔍 Verifying contract setup...");

    // Verify Ethereum contract
    try {
      const ethNetwork = await this.ethProvider.getNetwork();
      console.log(
        `  ✅ ETH Network: ${ethNetwork.name} (${ethNetwork.chainId})`
      );

      const ethCode = await this.ethProvider.getCode(
        process.env.ETH_ESCROW_FACTORY_ADDRESS
      );
      if (ethCode === "0x") {
        throw new Error("Ethereum EscrowFactory contract not found");
      }
      console.log("  ✅ Ethereum EscrowFactory contract verified");
    } catch (error) {
      throw new Error(
        `Ethereum contract verification failed: ${error.message}`
      );
    }

    // Verify Tron contract
    try {
      const tronAccount = await this.tronWeb.trx.getAccount(
        process.env.TRON_ESCROW_FACTORY_ADDRESS
      );
      if (!tronAccount || !tronAccount.address) {
        throw new Error("Tron EscrowFactory contract not found");
      }
      console.log("  ✅ Tron EscrowFactory contract verified");
    } catch (error) {
      throw new Error(`Tron contract verification failed: ${error.message}`);
    }

    console.log("");
  }

  async performEthToTronSwap() {
    console.log("🔄 Performing ETH → TRX Cross-Chain Swap");
    console.log("==========================================");

    // Step 1: Create ETH escrow (user locks ETH)
    console.log("1️⃣ Creating Ethereum escrow...");
    console.log(
      `   Cancel Delay: ${this.cancelDelay} seconds (${
        this.cancelDelay / 3600
      } hours)`
    );
    console.log(`   Amount: ${ethers.formatEther(this.ethAmount)} ETH`);
    console.log(
      `   Safety Deposit: ${ethers.formatEther(this.minSafetyDeposit)} ETH`
    );
    console.log(
      `   Total Value: ${ethers.formatEther(this.totalEthValue)} ETH`
    );

    // Estimate gas first
    try {
      const gasEstimate = await this.ethEscrowFactory.createEscrow.estimateGas(
        this.ethResolverAddress, // resolver
        "0x0000000000000000000000000000000000000000", // ETH token address (0x0 for native ETH)
        this.ethAmount,
        this.secretHash,
        this.cancelDelay, // Using duration, not timestamp
        { value: this.totalEthValue }
      );
      console.log(`   Estimated Gas: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.log(`   ⚠️  Gas estimation failed: ${gasError.message}`);
    }

    const createEthTx = await this.ethEscrowFactory.createEscrow(
      this.ethResolverAddress, // resolver
      "0x0000000000000000000000000000000000000000", // ETH token address (0x0 for native ETH)
      this.ethAmount,
      this.secretHash,
      this.cancelDelay, // Using duration, not timestamp
      { value: this.totalEthValue } // Total includes safety deposit
    );

    console.log(`   🔗 Transaction Hash: ${createEthTx.hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);
    const ethReceipt = await createEthTx.wait();
    console.log(`   ✅ Confirmed in block ${ethReceipt.blockNumber}`);
    console.log(`   ⛽ Gas Used: ${ethReceipt.gasUsed}`);

    // Extract escrow ID from event
    const escrowCreatedEvent = ethReceipt.logs.find((log) => {
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
    const ethEscrowId = parsedEvent.args.escrowId;
    console.log(`   🆔 Escrow ID: ${ethEscrowId}`);

    // Get escrow details to verify
    console.log("   📋 Escrow Details:");
    const escrowDetails = await this.ethEscrowFactory.escrows(ethEscrowId);
    console.log(`     Initiator: ${escrowDetails.initiator}`);
    console.log(`     Resolver: ${escrowDetails.resolver}`);
    console.log(`     Amount: ${ethers.formatEther(escrowDetails.amount)} ETH`);
    console.log(`     Completed: ${escrowDetails.completed}`);
    console.log(`     Cancelled: ${escrowDetails.cancelled}`);

    // Step 2: Create Tron mirror escrow (resolver provides TRX)
    console.log("\n2️⃣ Creating Tron mirror escrow...");
    console.log(`   Amount: ${this.tronWeb.fromSun(this.tronAmount)} TRX`);
    console.log(
      `   Safety Deposit: ${this.tronWeb.fromSun(
        this.minTronSafetyDeposit
      )} TRX`
    );
    console.log(
      `   Total Value: ${this.tronWeb.fromSun(this.totalTronValue)} TRX`
    );

    try {
      const createTronTx = await this.tronEscrowFactory
        .createEscrow(
          this.tronResolverAddress, // resolver (Tron address)
          "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // TRX token address (native TRX)
          this.tronAmount.toString(),
          this.secretHash,
          this.cancelDelay // Using same duration as ETH side
        )
        .send({
          feeLimit: 100_000_000, // 100 TRX fee limit
          callValue: this.totalTronValue.toString(), // Send TRX with the transaction (includes safety deposit)
        });

      console.log(`   🔗 Tron Transaction: ${createTronTx}`);
      console.log(`   ✅ Tron Escrow created successfully`);

      // Wait a bit for Tron network to process
      await this.sleep(3000);
    } catch (tronError) {
      console.error(`   ❌ Tron escrow creation failed: ${tronError.message}`);
      throw tronError;
    }

    // Step 3: Commit secret for MEV protection on Ethereum
    console.log("\n3️⃣ Committing secret for MEV protection...");

    // Generate a random nonce for the reveal
    const nonce = crypto.randomBytes(32);
    console.log(`   Secret: ${this.secret.toString("hex")}`);
    console.log(`   Nonce: ${nonce.toString("hex")}`);

    // Create secret commit
    const secretCommit = ethers.keccak256(ethers.concat([this.secret, nonce]));
    console.log(`   Secret Commit: ${secretCommit}`);

    try {
      const commitTx = await this.ethEscrowFactory.commitSecret(secretCommit);
      console.log(`   🔗 Commit Transaction: ${commitTx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);
      const commitReceipt = await commitTx.wait();
      console.log(
        `   ✅ Secret committed in block ${commitReceipt.blockNumber}`
      );
      console.log(`   ⏰ Waiting 60 seconds for reveal delay...`);

      // Wait for the required reveal delay (60 seconds)
      await this.sleep(65000); // 65 seconds to be safe

      // Step 4: Reveal secret to claim TRX (simulate user action)
      console.log("\n4️⃣ Revealing secret to claim TRX...");

      const revealTx = await this.tronEscrowFactory
        .revealAndWithdraw(
          ethEscrowId, // Using same escrow ID cross-chain
          this.secret,
          nonce
        )
        .send({
          feeLimit: 50_000_000,
        });

      console.log(`   🔗 TRX Claim Transaction: ${revealTx}`);
      console.log(`   ✅ TRX claimed successfully!`);

      // Wait for transaction to be processed
      await this.sleep(5000);

      // Step 5: Wait for Ethereum finality
      console.log("\n5️⃣ Waiting for Ethereum finality...");

      // Get escrow details to check finality lock
      const escrowDetails = await this.ethEscrowFactory.escrows(ethEscrowId);
      const finalityLock = Number(escrowDetails.finalityLock);
      const currentBlock = await this.ethProvider.getBlockNumber();

      console.log(`   Current block: ${currentBlock}`);
      console.log(`   Finality required at block: ${finalityLock}`);

      if (currentBlock < finalityLock) {
        const blocksToWait = finalityLock - currentBlock;
        console.log(
          `   ⏰ Waiting for ${blocksToWait} more blocks (≈${
            blocksToWait * 12
          } seconds)...`
        );

        // Wait for blocks (approximately 12 seconds per block on Sepolia)
        await this.sleep(blocksToWait * 12 * 1000 + 10000); // Add 10 seconds buffer

        const newBlock = await this.ethProvider.getBlockNumber();
        console.log(`   ✅ Current block: ${newBlock} (finality reached)`);
      } else {
        console.log(`   ✅ Finality already reached`);
      }

      // Step 6: Use revealed secret to claim ETH (resolver claims ETH)
      console.log("\n6️⃣ Using revealed secret to claim ETH...");

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

      console.log("\n🎉 REAL Cross-Chain Swap Completed Successfully!");
      console.log("===============================================");
      console.log("✅ ETH escrow created and claimed");
      console.log("✅ TRX escrow created and claimed");
      console.log("✅ Secret committed and revealed with MEV protection");
      console.log("✅ All funds transferred successfully");

      // Show final balances
      console.log("\n💰 Final balances:");
      await this.checkBalances();
    } catch (revealError) {
      console.error(`   ❌ Secret reveal/claim failed: ${revealError.message}`);
      throw revealError;
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("⚠️  WARNING: This performs REAL transactions on testnets!");
  console.log("Make sure you have testnet ETH and TRX before proceeding.\n");

  const demo = new RealSwapDemo();
  await demo.runRealSwap();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealSwapDemo };
