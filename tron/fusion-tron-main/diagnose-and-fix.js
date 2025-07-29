const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

class ComprehensiveTronFixer {
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

    // Failed transaction details
    this.failedCommitTx =
      "a9995e36375092de0091a8e2861727476b0c8a584fddc109a83a029b2efa86ab";
    this.failedRevealTx =
      "a2522d6251060ee05021b07af97ef3670b14a8eba99ed891e1321d0d9cd3c019";
  }

  async diagnoseAndFix() {
    console.log("🔧 Comprehensive Tron Swap Diagnostics & Fix");
    console.log("=============================================");
    console.log(`🔑 Escrow ID: ${this.escrowId}`);
    console.log(`🔐 Secret: ${this.secret.toString("hex")}`);
    console.log(`🎲 Nonce: ${this.nonce.toString("hex")}`);
    console.log(`📝 Secret Commit: ${this.secretCommit}`);
    console.log(`❌ Failed Commit TX: ${this.failedCommitTx}`);
    console.log(`❌ Failed Reveal TX: ${this.failedRevealTx}`);
    console.log("");

    try {
      // Step 1: Check transaction statuses
      await this.checkTransactionStatuses();

      // Step 2: Check escrow details on both chains
      await this.checkEscrowDetails();

      // Step 3: Check commit status (try multiple approaches)
      await this.checkCommitStatus();

      // Step 4: Check timing requirements
      await this.checkTimingRequirements();

      // Step 5: Try different parameter encodings
      await this.tryDifferentEncodings();

      // Step 6: Attempt the fix
      await this.attemptFinalFix();
    } catch (error) {
      console.error("❌ Diagnosis failed:", error.message);
      console.error("Stack:", error.stack);
    }
  }

  async checkTransactionStatuses() {
    console.log("1️⃣ Checking Transaction Statuses...");

    try {
      // Check Tron commit transaction
      console.log("   🔍 Checking commit transaction...");
      const commitTxInfo = await this.tronWeb.trx.getTransactionInfo(
        this.failedCommitTx
      );
      console.log(`   Commit TX Result: ${commitTxInfo.result || "UNKNOWN"}`);
      console.log(`   Commit Energy Used: ${commitTxInfo.energy_used || 0}`);

      if (commitTxInfo.result === "FAILED") {
        console.log("   ❌ Commit transaction FAILED!");
        console.log("   💡 This explains why reveal failed");
      } else {
        console.log("   ✅ Commit transaction succeeded");
      }

      // Check Tron reveal transaction
      console.log("   🔍 Checking reveal transaction...");
      const revealTxInfo = await this.tronWeb.trx.getTransactionInfo(
        this.failedRevealTx
      );
      console.log(`   Reveal TX Result: ${revealTxInfo.result || "UNKNOWN"}`);
      console.log(`   Reveal Energy Used: ${revealTxInfo.energy_used || 0}`);

      if (revealTxInfo.contractResult) {
        console.log(
          `   Reveal Contract Result: ${revealTxInfo.contractResult[0]}`
        );
      }
    } catch (error) {
      console.error("   ❌ Error checking transactions:", error.message);
    }

    console.log("");
  }

  async checkEscrowDetails() {
    console.log("2️⃣ Checking Escrow Details...");

    try {
      // Check Ethereum escrow
      const ethEscrow = await this.ethEscrowFactory.escrows(this.escrowId);
      console.log("   📋 Ethereum Escrow:");
      console.log(`     Completed: ${ethEscrow.completed}`);
      console.log(`     Cancelled: ${ethEscrow.cancelled}`);
      console.log(`     Secret Hash: ${ethEscrow.secretHash}`);

      // Check Tron escrow using direct call
      console.log("   📋 Tron Escrow:");
      const tronEscrowResult =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "getEscrow(bytes32)",
          {},
          [{ type: "bytes32", value: this.escrowId }]
        );

      if (tronEscrowResult.result && tronEscrowResult.result.result) {
        console.log("     ✅ Tron escrow exists");

        // Try to decode the result
        if (
          tronEscrowResult.constant_result &&
          tronEscrowResult.constant_result.length > 0
        ) {
          const result = tronEscrowResult.constant_result[0];
          console.log(`     Raw data: ${result.substring(0, 100)}...`);

          // Try to parse escrow data (initiator at position 0, completed at position ~160)
          if (result.length >= 320) {
            const completedHex = result.substring(288, 320);
            const completed = parseInt(completedHex, 16) !== 0;
            console.log(`     Completed: ${completed}`);
          }
        }
      } else {
        console.log("     ❌ Tron escrow not found");
      }
    } catch (error) {
      console.error("   ❌ Error checking escrow details:", error.message);
    }

    console.log("");
  }

  async checkCommitStatus() {
    console.log("3️⃣ Checking Secret Commit Status...");

    try {
      // Try to check if we can reveal (this will tell us if commit worked)
      console.log("   🔍 Testing if reveal is possible...");

      const testResult =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "revealAndWithdraw(bytes32,bytes32,bytes32)",
          {
            feeLimit: 1000000, // Small fee limit for test
          },
          [
            { type: "bytes32", value: this.escrowId },
            { type: "bytes32", value: "0x" + this.secret.toString("hex") },
            { type: "bytes32", value: "0x" + this.nonce.toString("hex") },
          ]
        );

      if (testResult.result && testResult.result.result) {
        console.log("   ✅ Reveal should work (commit is valid)");
      } else {
        console.log("   ❌ Reveal will fail");
        if (testResult.result && testResult.result.message) {
          console.log(`   Error: ${testResult.result.message}`);
        }
      }
    } catch (error) {
      console.error("   ❌ Error testing reveal:", error.message);
    }

    console.log("");
  }

  async checkTimingRequirements() {
    console.log("4️⃣ Checking Timing Requirements...");

    try {
      // Get current time and block
      const currentTime = Math.floor(Date.now() / 1000);
      console.log(
        `   Current time: ${currentTime} (${new Date().toISOString()})`
      );

      // Check REVEAL_DELAY constant
      const revealDelayResult =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "REVEAL_DELAY()",
          {}
        );

      if (
        revealDelayResult.constant_result &&
        revealDelayResult.constant_result.length > 0
      ) {
        const revealDelay = parseInt(revealDelayResult.constant_result[0], 16);
        console.log(`   Reveal delay required: ${revealDelay} seconds`);

        // Estimate when our commit was made (transaction time + delay)
        console.log(
          `   💡 Need to wait ${revealDelay} seconds after commit transaction`
        );
      }
    } catch (error) {
      console.error("   ❌ Error checking timing:", error.message);
    }

    console.log("");
  }

  async tryDifferentEncodings() {
    console.log("5️⃣ Testing Different Parameter Encodings...");

    const encodings = [
      {
        name: "Standard with 0x prefix",
        escrowId: this.escrowId,
        secret: "0x" + this.secret.toString("hex"),
        nonce: "0x" + this.nonce.toString("hex"),
      },
      {
        name: "Without 0x prefix",
        escrowId: this.escrowId.replace("0x", ""),
        secret: this.secret.toString("hex"),
        nonce: this.nonce.toString("hex"),
      },
      {
        name: "Tron hex encoding",
        escrowId: this.tronWeb.toHex(this.escrowId),
        secret: this.tronWeb.toHex("0x" + this.secret.toString("hex")),
        nonce: this.tronWeb.toHex("0x" + this.nonce.toString("hex")),
      },
    ];

    for (const encoding of encodings) {
      try {
        console.log(`   🧪 Testing ${encoding.name}...`);

        const testResult =
          await this.tronWeb.transactionBuilder.triggerSmartContract(
            this.tronContractAddress,
            "revealAndWithdraw(bytes32,bytes32,bytes32)",
            {
              feeLimit: 1000000,
            },
            [
              { type: "bytes32", value: encoding.escrowId },
              { type: "bytes32", value: encoding.secret },
              { type: "bytes32", value: encoding.nonce },
            ]
          );

        if (testResult.result && testResult.result.result) {
          console.log(`     ✅ ${encoding.name} should work!`);
          this.workingEncoding = encoding;
          break;
        } else {
          console.log(`     ❌ ${encoding.name} failed`);
        }
      } catch (error) {
        console.log(`     ❌ ${encoding.name} error: ${error.message}`);
      }
    }

    console.log("");
  }

  async attemptFinalFix() {
    console.log("6️⃣ Attempting Final Fix...");

    if (!this.workingEncoding) {
      console.log(
        "   ❌ No working encoding found. Need to recommit secret properly."
      );
      await this.recommitSecret();
      return;
    }

    try {
      console.log("   🔓 Attempting reveal with working encoding...");

      const tronTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "revealAndWithdraw(bytes32,bytes32,bytes32)",
          {
            feeLimit: 100_000_000,
          },
          [
            { type: "bytes32", value: this.workingEncoding.escrowId },
            { type: "bytes32", value: this.workingEncoding.secret },
            { type: "bytes32", value: this.workingEncoding.nonce },
          ]
        );

      if (!tronTxData.result || !tronTxData.result.result) {
        throw new Error("Failed to build Tron revealAndWithdraw transaction");
      }

      // Sign and broadcast
      const signedTronTx = await this.tronWeb.trx.sign(tronTxData.transaction);
      const tronResult = await this.tronWeb.trx.sendRawTransaction(
        signedTronTx
      );

      console.log(
        `   🔗 Tron Reveal Transaction: ${
          tronResult.txid || tronResult.transaction?.txID
        }`
      );

      // Wait and check status
      await this.sleep(5000);

      const txInfo = await this.tronWeb.trx.getTransactionInfo(
        tronResult.txid || tronResult.transaction?.txID
      );
      if (txInfo.result === "SUCCESS") {
        console.log("   ✅ TRX claim succeeded!");

        // Now try ETH
        await this.claimETH();
      } else {
        console.log("   ❌ TRX claim still failed");
        console.log(`   Result: ${txInfo.result}`);
      }
    } catch (error) {
      console.error("   ❌ Final fix failed:", error.message);
    }
  }

  async recommitSecret() {
    console.log("   🔄 Recommitting secret with proper encoding...");

    try {
      const commitTxData =
        await this.tronWeb.transactionBuilder.triggerSmartContract(
          this.tronContractAddress,
          "commitSecret(bytes32)",
          {
            feeLimit: 50_000_000,
          },
          [{ type: "bytes32", value: this.secretCommit }]
        );

      if (!commitTxData.result || !commitTxData.result.result) {
        throw new Error("Failed to build commitSecret transaction");
      }

      const signedTx = await this.tronWeb.trx.sign(commitTxData.transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      console.log(
        `   🔗 New Commit TX: ${result.txid || result.transaction?.txID}`
      );

      // Wait for commit confirmation
      await this.sleep(3000);

      const commitInfo = await this.tronWeb.trx.getTransactionInfo(
        result.txid || result.transaction?.txID
      );
      if (commitInfo.result === "SUCCESS") {
        console.log("   ✅ Secret recommitted successfully");
        console.log("   ⏰ Waiting 65 seconds for reveal delay...");
        await this.sleep(65000);

        // Now try reveal
        await this.attemptFinalFix();
      } else {
        console.log("   ❌ Recommit failed");
      }
    } catch (error) {
      console.error("   ❌ Recommit error:", error.message);
    }
  }

  async claimETH() {
    console.log("   🔓 Claiming ETH...");

    try {
      const ethRevealTx = await this.ethEscrowFactory.revealAndWithdraw(
        this.escrowId,
        this.secret,
        this.nonce
      );

      console.log(`   🔗 ETH Claim TX: ${ethRevealTx.hash}`);

      const ethReceipt = await ethRevealTx.wait();
      console.log(`   ✅ ETH claimed in block ${ethReceipt.blockNumber}`);

      console.log("\n🎉 SWAP FINALLY COMPLETED!");
      console.log("🚀 Your hackathon demo is ready!");
    } catch (error) {
      console.error("   ❌ ETH claim failed:", error.message);
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log(
    "🔍 Comprehensive diagnostics and fix for failed Tron transaction"
  );
  console.log(
    "💡 This will identify the exact cause and apply the correct fix\n"
  );

  const fixer = new ComprehensiveTronFixer();
  await fixer.diagnoseAndFix();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ComprehensiveTronFixer };
