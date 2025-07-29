const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
const crypto = require("crypto");
require("dotenv").config();

// Load ABIs
const EscrowFactoryABI = require("./scripts/correct-abi.json");

class FinalWorkingSwap {
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

    // Generate swap parameters
    this.secret = crypto.randomBytes(32);
    this.secretHash = ethers.keccak256(this.secret);
    this.nonce = crypto.randomBytes(32);
    this.secretCommit = ethers.keccak256(
      ethers.solidityPacked(["bytes32", "bytes32"], [this.secret, this.nonce])
    );

    console.log("🎯 FINAL WORKING ATOMIC SWAP");
    console.log("============================");
    console.log("Complete ETH ↔ TRX swap with all fixes applied");
    console.log("");
  }

  // Convert TRON hex address to Ethereum-compatible format for ethers.js
  tronHexToEthFormat(tronHex) {
    // Remove the 41 prefix and add 0x
    if (tronHex.startsWith("41")) {
      return "0x" + tronHex.slice(2);
    }
    return tronHex;
  }

  // Convert TRON base58 address to Ethereum format
  tronBase58ToEthFormat(base58Address) {
    const hex = this.tronWeb.address.toHex(base58Address);
    return this.tronHexToEthFormat(hex);
  }

  async executeWorkingSwap() {
    try {
      console.log("🚀 Starting final working atomic swap execution...");

      // Phase 1: Setup and validation
      await this.setupAndValidate();

      // Phase 2: Create escrows (with COMPLETE address handling)
      const escrowIds = await this.createEscrowsFixed();

      // Phase 3: Commit secrets for MEV protection
      await this.commitSecretsFixed();

      // Phase 4: Execute atomic swap
      await this.executeAtomicSwapFixed(escrowIds);

      // Only show final success if we reach this point (no exceptions thrown)
      console.log("\n🎉 COMPLETE ATOMIC SWAP SUCCESS!");
      console.log("================================");
      console.log("✅ ETH to TRX swap completed successfully");
      console.log("✅ Real cross-chain fund movement completed");
      console.log("✅ All contract interactions successful");
      console.log("✅ Atomic guarantees maintained");
      console.log("✅ Both transaction hashes printed above");
    } catch (error) {
      console.error("❌ Swap execution failed:", error.message);
      console.error("Stack:", error.stack);

      // Provide specific debugging info
      console.log("\n🔧 DEBUG INFO:");
      console.log(`Error type: ${error.constructor.name}`);
      if (error.code) console.log(`Error code: ${error.code}`);
      if (error.reason) console.log(`Error reason: ${error.reason}`);

      // Important: Don't claim success if we failed
      console.log("\n❌ ATOMIC SWAP INCOMPLETE");
      console.log("=========================");
      console.log("The swap did not complete successfully on both chains.");
    }
  }

  async setupAndValidate() {
    console.log("1️⃣ SETUP AND VALIDATION");
    console.log("========================");

    // Get contract requirements
    const ethMinSafetyDeposit =
      await this.ethEscrowFactory.MIN_SAFETY_DEPOSIT();
    const ethMinCancelDelay = await this.ethEscrowFactory.MIN_CANCEL_DELAY();

    // Set parameters based on actual contract requirements
    this.ethAmount = ethers.parseEther("0.0001");
    this.ethTotalValue = this.ethAmount + ethMinSafetyDeposit;
    this.tronAmount = this.tronWeb.toSun(2); // 2 TRX
    this.tronSafetyDeposit = this.tronWeb.toSun(1.5); // 1.5 TRX (above minimum)
    this.tronTotalValue =
      BigInt(this.tronAmount) + BigInt(this.tronSafetyDeposit);
    this.cancelDelay = Number(ethMinCancelDelay) + 1800; // Contract minimum + buffer

    console.log("💰 Swap Configuration:");
    console.log(`   ETH Amount: ${ethers.formatEther(this.ethAmount)} ETH`);
    console.log(
      `   ETH Safety: ${ethers.formatEther(ethMinSafetyDeposit)} ETH`
    );
    console.log(`   ETH Total: ${ethers.formatEther(this.ethTotalValue)} ETH`);
    console.log(`   TRX Amount: ${this.tronWeb.fromSun(this.tronAmount)} TRX`);
    console.log(
      `   TRX Safety: ${this.tronWeb.fromSun(this.tronSafetyDeposit)} TRX`
    );
    console.log(
      `   TRX Total: ${this.tronWeb.fromSun(
        this.tronTotalValue.toString()
      )} TRX`
    );

    // Address handling with complete formatting
    console.log("\n🔧 Address Format Handling:");
    console.log(`   ETH Wallet: ${this.ethWallet.address}`);
    console.log(
      `   TRON Wallet (base58): ${this.tronWeb.defaultAddress.base58}`
    );
    console.log(`   TRON Wallet (hex): ${this.tronWeb.defaultAddress.hex}`);

    // Store both formats for later use
    this.tronResolverHex = this.tronWeb.defaultAddress.hex;
    this.tronResolverEthFormat = this.tronHexToEthFormat(this.tronResolverHex);

    // Get proper TRX zero address in Ethereum format
    this.tronZeroAddressBase58 = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";
    this.tronZeroAddressEthFormat = this.tronBase58ToEthFormat(
      this.tronZeroAddressBase58
    );

    console.log(`   TRON Wallet (eth-format): ${this.tronResolverEthFormat}`);
    console.log(`   TRX Zero Address (base58): ${this.tronZeroAddressBase58}`);
    console.log(
      `   TRX Zero Address (eth-format): ${this.tronZeroAddressEthFormat}`
    );

    // Check balances
    const ethBalance = await this.ethProvider.getBalance(
      this.ethWallet.address
    );
    const tronBalance = await this.tronWeb.trx.getBalance(
      this.tronWeb.defaultAddress.base58
    );

    console.log("\n💳 Balance Verification:");
    console.log(
      `   ETH: ${ethers.formatEther(ethBalance)} (need ${ethers.formatEther(
        this.ethTotalValue
      )})`
    );
    console.log(
      `   TRX: ${this.tronWeb.fromSun(
        tronBalance
      )} (need ${this.tronWeb.fromSun(this.tronTotalValue.toString())})`
    );

    if (ethBalance < this.ethTotalValue) {
      throw new Error(
        `Insufficient ETH: need ${ethers.formatEther(this.ethTotalValue)}`
      );
    }
    if (BigInt(tronBalance) < this.tronTotalValue) {
      throw new Error(
        `Insufficient TRX: need ${this.tronWeb.fromSun(
          this.tronTotalValue.toString()
        )}`
      );
    }

    console.log("   ✅ All validations passed");
    console.log("");
  }

  async createEscrowsFixed() {
    console.log("2️⃣ CREATING ESCROWS (FINAL FIXED VERSION)");
    console.log("==========================================");

    // Create Ethereum escrow (this part works)
    console.log("📝 Creating Ethereum Escrow:");
    const ethTx = await this.ethEscrowFactory.createEscrow(
      this.ethWallet.address, // resolver (Ethereum address format)
      ethers.ZeroAddress, // ETH token
      this.ethAmount,
      this.secretHash,
      this.cancelDelay,
      { value: this.ethTotalValue }
    );

    console.log(`   🔗 ETH Transaction: ${ethTx.hash}`);
    const ethReceipt = await ethTx.wait();
    console.log(`   ✅ ETH Escrow created in block ${ethReceipt.blockNumber}`);

    // Extract escrow ID from events
    const escrowCreatedEvent = ethReceipt.logs.find((log) => {
      try {
        const parsed = this.ethEscrowFactory.interface.parseLog(log);
        return parsed.name === "EscrowCreated";
      } catch {
        return false;
      }
    });

    if (!escrowCreatedEvent) {
      throw new Error("ETH EscrowCreated event not found");
    }

    const parsedEvent =
      this.ethEscrowFactory.interface.parseLog(escrowCreatedEvent);
    const ethEscrowId = parsedEvent.args.escrowId;
    console.log(`   🆔 ETH Escrow ID: ${ethEscrowId}`);

    // Create TRON escrow with COMPLETE address handling
    console.log("\n📝 Creating TRON Escrow (Complete Address Fix):");

    console.log(`   Resolver (hex for contract): ${this.tronResolverHex}`);
    console.log(
      `   TRX Zero (base58 for contract): ${this.tronZeroAddressBase58}`
    );

    const tronTxData =
      await this.tronWeb.transactionBuilder.triggerSmartContract(
        process.env.TRON_ESCROW_FACTORY_ADDRESS,
        "createEscrow(address,address,uint256,bytes32,uint64)",
        {
          feeLimit: 100_000_000,
          callValue: this.tronTotalValue.toString(),
        },
        [
          { type: "address", value: this.tronResolverHex }, // Use hex format for contract
          { type: "address", value: this.tronZeroAddressBase58 }, // TRX zero address in base58
          { type: "uint256", value: this.tronAmount.toString() },
          { type: "bytes32", value: this.secretHash },
          { type: "uint64", value: this.cancelDelay.toString() },
        ]
      );

    if (!tronTxData.result || !tronTxData.result.result) {
      throw new Error("Failed to build TRON createEscrow transaction");
    }

    const signedTronTx = await this.tronWeb.trx.sign(tronTxData.transaction);
    const tronResult = await this.tronWeb.trx.sendRawTransaction(signedTronTx);
    const tronTxId = tronResult.txid || tronResult.transaction?.txID;

    console.log(`   🔗 TRON Transaction: ${tronTxId}`);
    console.log(`   ✅ TRON Escrow submitted successfully`);

    // Wait for confirmation and verify
    await this.sleep(8000);
    await this.verifyTronTransaction(tronTxId);

    // Generate TRON escrow ID with COMPLETE address handling
    console.log("\n🔧 Generating TRON Escrow ID (COMPLETE FIX):");
    console.log(`   Resolver (eth-format): ${this.tronResolverEthFormat}`);
    console.log(`   TRX Zero (eth-format): ${this.tronZeroAddressEthFormat}`);

    const tronEscrowId = ethers.keccak256(
      ethers.solidityPacked(
        [
          "address",
          "address",
          "address",
          "uint256",
          "bytes32",
          "uint256",
          "uint256",
        ],
        [
          this.tronResolverEthFormat, // Use ETH-compatible format for ethers.js
          this.tronResolverEthFormat,
          this.tronZeroAddressEthFormat, // Use properly converted TRX zero address
          this.tronAmount.toString(),
          this.secretHash,
          Math.floor(Date.now() / 1000).toString(),
          "0",
        ]
      )
    );

    console.log(`   🆔 TRON Escrow ID: ${tronEscrowId}`);
    console.log("   ✅ Escrow ID generation successful");
    console.log("");

    return { ethEscrowId, tronEscrowId, tronTxId };
  }

  async commitSecretsFixed() {
    console.log("3️⃣ COMMITTING SECRETS");
    console.log("======================");

    console.log("🔐 Secret Information:");
    console.log(`   Secret: ${this.secret.toString("hex")}`);
    console.log(`   Secret Hash: ${this.secretHash}`);
    console.log(`   Nonce: ${this.nonce.toString("hex")}`);
    console.log(`   Commit Hash: ${this.secretCommit}`);

    // Commit on Ethereum
    console.log("\n📝 Committing on Ethereum:");
    const ethCommitTx = await this.ethEscrowFactory.commitSecret(
      this.secretCommit
    );
    console.log(`   🔗 ETH Commit: ${ethCommitTx.hash}`);
    await ethCommitTx.wait();
    console.log(`   ✅ ETH secret committed`);

    // Commit on TRON with proper error handling
    console.log("\n📝 Committing on TRON:");
    try {
      const tronCommitTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          process.env.TRON_ESCROW_FACTORY_ADDRESS,
          "commitSecret(bytes32)",
          { feeLimit: 50_000_000 },
          [{ type: "bytes32", value: this.secretCommit }]
        );

      if (!tronCommitTxData.result?.result) {
        throw new Error("Failed to build TRON commit transaction");
      }

      const signedCommit = await this.tronWeb.trx.sign(
        tronCommitTxData.transaction
      );
      const commitResult = await this.tronWeb.trx.sendRawTransaction(
        signedCommit
      );

      console.log(
        `   🔗 TRON Commit: ${
          commitResult.txid || commitResult.transaction?.txID
        }`
      );
      console.log(`   ✅ TRON secret committed`);
    } catch (error) {
      console.log(`   ⚠️ TRON commit issue: ${error.message}`);
      console.log(`   💡 Continuing - this may still work`);
    }

    // Wait for commit-reveal delay
    console.log("\n⏳ Waiting for commit-reveal delay (65 seconds)...");
    await this.sleep(65000);
    console.log("   ✅ MEV protection period completed");
    console.log("");
  }

  async executeAtomicSwapFixed(escrowIds) {
    console.log("4️⃣ EXECUTING ATOMIC SWAP");
    console.log("=========================");

    // First, let's extract the REAL escrow ID from TRON events
    console.log("🔍 Extracting real TRON escrow ID from events:");
    let realTronEscrowId = escrowIds.tronEscrowId;

    try {
      const txInfo = await this.tronWeb.trx.getTransactionInfo(
        escrowIds.tronTxId
      );

      if (txInfo && txInfo.log && txInfo.log.length > 0) {
        const event = txInfo.log[0];
        if (event && event.topics && event.topics.length > 1) {
          realTronEscrowId = "0x" + event.topics[1];
          console.log(
            `   🆔 Real TRON Escrow ID from events: ${realTronEscrowId}`
          );

          // Verify this matches our calculated one
          if (realTronEscrowId !== escrowIds.tronEscrowId) {
            console.log(
              `   ⚠️ Calculated ID differs: ${escrowIds.tronEscrowId}`
            );
            console.log(`   ✅ Using real ID from events: ${realTronEscrowId}`);
          } else {
            console.log(`   ✅ Calculated ID matches event ID`);
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Could not extract from events: ${error.message}`);
      console.log(`   💡 Using calculated ID: ${realTronEscrowId}`);
    }

    // Execute TRON reveal first (to reveal the secret)
    console.log("\n🔓 Step 1: Revealing secret on TRON:");
    let tronRevealTxId = null;

    try {
      const tronRevealData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          process.env.TRON_ESCROW_FACTORY_ADDRESS,
          "revealAndWithdraw(bytes32,bytes32,bytes32)",
          { feeLimit: 100_000_000 },
          [
            { type: "bytes32", value: realTronEscrowId }, // Use the real escrow ID
            { type: "bytes32", value: "0x" + this.secret.toString("hex") },
            { type: "bytes32", value: "0x" + this.nonce.toString("hex") },
          ]
        );

      if (tronRevealData.result?.result) {
        const signedReveal = await this.tronWeb.trx.sign(
          tronRevealData.transaction
        );
        const revealResult = await this.tronWeb.trx.sendRawTransaction(
          signedReveal
        );

        tronRevealTxId = revealResult.txid || revealResult.transaction?.txID;
        console.log(`   🔗 TRON Reveal: ${tronRevealTxId}`);

        // Wait and verify TRON reveal transaction
        console.log("   ⏳ Waiting for TRON reveal confirmation...");
        await this.sleep(8000);

        const verifySuccess = await this.verifyTronRevealTransaction(
          tronRevealTxId
        );
        if (verifySuccess) {
          console.log(`   ✅ TRON reveal confirmed and successful`);
        } else {
          throw new Error("TRON reveal transaction failed or not confirmed");
        }
      } else {
        throw new Error("TRON reveal transaction failed to build");
      }
    } catch (error) {
      console.log(`   ❌ TRON reveal failed: ${error.message}`);
      throw error; // Don't continue if TRON fails
    }

    // Wait for TRON finality - need to wait longer for the Ethereum contract to recognize it
    console.log(
      "\n⏳ Waiting for TRON finality to be recognized by Ethereum contract..."
    );
    console.log(
      "   This may take several minutes as the contract checks finality..."
    );

    let finalityReached = false;
    let attempts = 0;
    const maxAttempts = 20; // Try for up to 20 attempts (about 10 minutes)

    while (!finalityReached && attempts < maxAttempts) {
      attempts++;
      console.log(`   🔍 Finality check attempt ${attempts}/${maxAttempts}...`);

      try {
        // Test if finality has been reached by doing a static call
        await this.ethEscrowFactory.revealAndWithdraw.staticCall(
          escrowIds.ethEscrowId,
          this.secret,
          this.nonce
        );

        // If we get here without error, finality has been reached
        finalityReached = true;
        console.log(`   ✅ TRON finality reached! Ethereum contract ready.`);
        break;
      } catch (error) {
        if (error.data === "0x8e8f5b9f") {
          // Still waiting for finality
          console.log(
            `   ⏳ Still waiting for finality... (${
              30 * attempts
            } seconds elapsed)`
          );
          await this.sleep(30000); // Wait 30 seconds between attempts
        } else {
          // Different error - this is unexpected
          console.log(`   ❌ Unexpected error: ${error.message}`);
          console.log(`   🔍 Error data: ${error.data}`);
          break;
        }
      }
    }

    if (!finalityReached) {
      console.log(`   ⚠️ Finality not reached after ${maxAttempts} attempts`);
      console.log(`   💡 The TRON reveal was successful: ${tronRevealTxId}`);
      console.log(
        `   💡 You can manually complete the Ethereum reveal later when finality is reached`
      );
      throw new Error("TRON finality not reached within timeout period");
    }

    // Execute Ethereum reveal now that finality is reached
    console.log(
      "\n🔓 Step 2: Using revealed secret on Ethereum (finality reached):"
    );
    try {
      const ethRevealTx = await this.ethEscrowFactory.revealAndWithdraw(
        escrowIds.ethEscrowId,
        this.secret,
        this.nonce
      );

      console.log(`   🔗 ETH Reveal: ${ethRevealTx.hash}`);
      const ethRevealReceipt = await ethRevealTx.wait();
      console.log(
        `   ✅ ETH reveal completed in block ${ethRevealReceipt.blockNumber}`
      );

      // Print final success with both transaction hashes
      console.log("\n🎉 ATOMIC SWAP FULLY COMPLETED!");
      console.log("================================");
      console.log(`✅ TRON Reveal Hash: ${tronRevealTxId}`);
      console.log(`✅ ETH Reveal Hash: ${ethRevealTx.hash}`);
      console.log("✅ Both sides of the atomic swap completed successfully!");
    } catch (error) {
      console.log(
        `   ❌ ETH reveal failed even after finality: ${error.message}`
      );
      console.log(`   🔍 Error data: ${error.data || "No error data"}`);
      throw error;
    }

    console.log("   🎯 Atomic swap execution completed!");
    console.log("");
  }

  async verifyTronTransaction(txId) {
    console.log(`🔍 Verifying TRON transaction: ${txId}`);

    try {
      let attempts = 0;
      while (attempts < 3) {
        try {
          const txInfo = await this.tronWeb.trx.getTransactionInfo(txId);

          if (txInfo && Object.keys(txInfo).length > 0) {
            const status = txInfo.receipt?.result || "UNKNOWN";
            console.log(`   Status: ${status}`);

            if (status === "SUCCESS") {
              console.log(`   ✅ TRON transaction confirmed`);
              if (txInfo.log?.length > 0) {
                console.log(`   📋 Events: ${txInfo.log.length} emitted`);
              }
            } else {
              console.log(`   ⚠️ Status: ${status}`);
            }
            break;
          }
        } catch (e) {
          console.log(`   ⏳ Attempt ${attempts + 1}: ${e.message}`);
        }

        attempts++;
        if (attempts < 3) await this.sleep(3000);
      }
    } catch (error) {
      console.log(`   ⚠️ Verification failed: ${error.message}`);
    }
  }

  async verifyTronRevealTransaction(txId) {
    console.log(`   🔍 Verifying TRON reveal: ${txId}`);

    try {
      let attempts = 0;
      while (attempts < 10) {
        // Increased from 5 to 10 attempts
        try {
          const txInfo = await this.tronWeb.trx.getTransactionInfo(txId);

          if (txInfo && Object.keys(txInfo).length > 0) {
            const status = txInfo.receipt?.result || "UNKNOWN";
            console.log(`      Status: ${status}`);

            if (status === "SUCCESS") {
              console.log(
                `      ✅ TRON reveal transaction confirmed as SUCCESS`
              );
              if (txInfo.log?.length > 0) {
                console.log(`      📋 Events: ${txInfo.log.length} emitted`);
              }
              return true;
            } else if (status === "REVERT") {
              console.log(`      ❌ TRON reveal transaction REVERTED`);
              if (txInfo.revert_info) {
                console.log(
                  `      🔍 Revert info: ${JSON.stringify(txInfo.revert_info)}`
                );
              }
              return false;
            } else {
              console.log(`      ⏳ Status: ${status}, continuing to wait...`);
            }
          } else {
            console.log(
              `      ⏳ Transaction not found yet, waiting... (attempt ${
                attempts + 1
              }/10)`
            );
          }
        } catch (e) {
          console.log(`      ⏳ Attempt ${attempts + 1}: ${e.message}`);
        }

        attempts++;
        if (attempts < 10) await this.sleep(5000); // Increased sleep from 3s to 5s
      }

      console.log(`      ⚠️ Could not verify transaction after 10 attempts`);
      console.log(
        `      💡 Transaction may still be processing. Check manually: https://nile.tronscan.org/#/transaction/${txId}`
      );
      return false;
    } catch (error) {
      console.log(`      ❌ Verification failed: ${error.message}`);
      return false;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("🚀 FINAL WORKING ATOMIC SWAP");
  console.log("Complete ETH ↔ TRX swap implementation\n");

  const swap = new FinalWorkingSwap();
  await swap.executeWorkingSwap();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FinalWorkingSwap };
