const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

class TRXRecovery {
  constructor() {
    // Initialize Tron connection
    const tronPrivateKey = process.env.TRON_PRIVATE_KEY.startsWith("0x")
      ? process.env.TRON_PRIVATE_KEY.slice(2)
      : process.env.TRON_PRIVATE_KEY;

    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_RPC_URL,
      privateKey: tronPrivateKey,
    });

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

    this.tronContractAddress = process.env.TRON_ESCROW_FACTORY_ADDRESS;
  }

  async recoverTRX() {
    console.log("💰 TRX Recovery Mode");
    console.log("====================");
    console.log("🎯 Goal: Recover locked TRX from escrow");
    console.log(`🔑 Escrow ID: ${this.escrowId}`);
    console.log(`🔐 Secret: ${this.secret.toString("hex")}`);
    console.log(`🎲 Nonce: ${this.nonce.toString("hex")}`);
    console.log("");

    try {
      // Step 1: Check if we can cancel instead of reveal
      await this.checkCancelOption();

      // Step 2: Try different recovery methods
      await this.tryRecoveryMethods();
    } catch (error) {
      console.error("❌ Recovery failed:", error.message);
      console.error("Stack:", error.stack);
    }
  }

  async checkCancelOption() {
    console.log("1️⃣ Checking if cancellation is available...");

    try {
      // Check if we can cancel the escrow to recover funds
      const canCancelResult =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "canCancel(bytes32)",
          {},
          [{ type: "bytes32", value: this.escrowId }]
        );

      if (
        canCancelResult.constant_result &&
        canCancelResult.constant_result.length > 0
      ) {
        const canCancel =
          canCancelResult.constant_result[0] !==
          "0000000000000000000000000000000000000000000000000000000000000000";
        console.log(`   Can Cancel: ${canCancel}`);

        if (canCancel) {
          console.log("   ✅ Cancellation is available!");
          console.log("   💡 This is safer than trying to reveal");
          await this.attemptCancellation();
          return true;
        } else {
          console.log("   ❌ Cancellation not yet available");
          console.log("   💡 Need to wait for cancel delay period");
        }
      }
    } catch (error) {
      console.error("   ❌ Error checking cancel option:", error.message);
    }

    console.log("");
    return false;
  }

  async attemptCancellation() {
    console.log("2️⃣ Attempting to cancel escrow and recover funds...");

    try {
      const cancelTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "cancel(bytes32)",
          {
            feeLimit: 50_000_000,
          },
          [{ type: "bytes32", value: this.escrowId }]
        );

      if (!cancelTxData.result || !cancelTxData.result.result) {
        throw new Error("Failed to build cancel transaction");
      }

      // Sign and broadcast
      const signedTx = await this.tronWeb.trx.sign(cancelTxData.transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      console.log(
        `   🔗 Cancel Transaction: ${result.txid || result.transaction?.txID}`
      );

      // Wait and check status
      await this.sleep(5000);

      const txInfo = await this.tronWeb.trx.getTransactionInfo(
        result.txid || result.transaction?.txID
      );
      if (txInfo.result === "SUCCESS") {
        console.log("   ✅ TRX recovered via cancellation!");
        console.log("   💰 Funds returned to your wallet");

        await this.checkFinalBalance();
        return true;
      } else {
        console.log("   ❌ Cancellation failed");
        console.log(`   Result: ${txInfo.result}`);
        return false;
      }
    } catch (error) {
      console.error("   ❌ Cancellation error:", error.message);
      return false;
    }
  }

  async tryRecoveryMethods() {
    console.log("3️⃣ Trying alternative recovery methods...");

    const methods = [
      {
        name: "Standard reveal (ignoring cross-chain state)",
        action: () => this.tryStandardReveal(),
      },
      {
        name: "Force reveal with different timing",
        action: () => this.tryForceReveal(),
      },
      {
        name: "Recommit and reveal",
        action: () => this.recommitAndReveal(),
      },
    ];

    for (const method of methods) {
      try {
        console.log(`   🧪 Attempting: ${method.name}...`);
        const success = await method.action();

        if (success) {
          console.log(`   ✅ ${method.name} succeeded!`);
          return true;
        } else {
          console.log(`   ❌ ${method.name} failed`);
        }
      } catch (error) {
        console.log(`   ❌ ${method.name} error: ${error.message}`);
      }

      // Small delay between attempts
      await this.sleep(2000);
    }

    console.log("   ⚠️  All recovery methods exhausted");
    console.log("   💡 Funds might need to wait for cancellation period");

    return false;
  }

  async tryStandardReveal() {
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
      return false;
    }

    const signedTx = await this.tronWeb.trx.sign(tronTxData.transaction);
    const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

    await this.sleep(3000);

    const txInfo = await this.tronWeb.trx.getTransactionInfo(
      result.txid || result.transaction?.txID
    );
    return txInfo.result === "SUCCESS";
  }

  async tryForceReveal() {
    // Try with higher gas and different timing
    await this.sleep(5000); // Wait a bit more

    const tronTxData =
      await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.tronContractAddress,
        "revealAndWithdraw(bytes32,bytes32,bytes32)",
        {
          feeLimit: 150_000_000, // Higher gas limit
        },
        [
          { type: "bytes32", value: this.escrowId },
          { type: "bytes32", value: "0x" + this.secret.toString("hex") },
          { type: "bytes32", value: "0x" + this.nonce.toString("hex") },
        ]
      );

    if (!tronTxData.result || !tronTxData.result.result) {
      return false;
    }

    const signedTx = await this.tronWeb.trx.sign(tronTxData.transaction);
    const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

    await this.sleep(5000);

    const txInfo = await this.tronWeb.trx.getTransactionInfo(
      result.txid || result.transaction?.txID
    );
    return txInfo.result === "SUCCESS";
  }

  async recommitAndReveal() {
    // Try recommitting the secret first
    const secretCommit = ethers.keccak256(
      ethers.concat([this.secret, this.nonce])
    );

    const commitTxData =
      await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.tronContractAddress,
        "commitSecret(bytes32)",
        {
          feeLimit: 50_000_000,
        },
        [{ type: "bytes32", value: secretCommit }]
      );

    if (!commitTxData.result || !commitTxData.result.result) {
      return false;
    }

    const signedCommitTx = await this.tronWeb.trx.sign(
      commitTxData.transaction
    );
    await this.tronWeb.trx.sendRawTransaction(signedCommitTx);

    // Wait for commit + reveal delay
    await this.sleep(65000);

    // Now try reveal
    return await this.tryStandardReveal();
  }

  async checkFinalBalance() {
    console.log("\n💰 Checking final TRX balance...");

    try {
      const tronAddress = this.tronWeb.defaultAddress.base58;
      const balance = await this.tronWeb.trx.getBalance(tronAddress);
      console.log(`   Final TRX Balance: ${this.tronWeb.fromSun(balance)} TRX`);
      console.log(`   Address: ${tronAddress}`);
    } catch (error) {
      console.error("   ❌ Error checking balance:", error.message);
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("🔧 TRX Recovery Tool");
  console.log(
    "💡 Attempting to recover locked TRX from failed cross-chain swap\n"
  );

  const recovery = new TRXRecovery();
  await recovery.recoverTRX();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TRXRecovery };
