const { ethers } = require("ethers");
const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
require("dotenv").config();

class TronErrorDecoder {
  constructor() {
    const tronPrivateKey = process.env.TRON_PRIVATE_KEY.startsWith("0x")
      ? process.env.TRON_PRIVATE_KEY.slice(2)
      : process.env.TRON_PRIVATE_KEY;

    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_RPC_URL,
      privateKey: tronPrivateKey,
    });

    // Common Tron/Solidity error selectors
    this.errorSelectors = {
      // Standard reverts
      "0x08c379a0": "Error(string)", // Standard revert with message
      "0x4e487b71": "Panic(uint256)", // Panic codes

      // Custom error selectors (calculated from error signatures)
      "0x1425ea42": "EscrowNotFound()",
      "0x3204506f": "EscrowAlreadyCompleted()",
      "0x62d38987": "EscrowAlreadyCancelled()",
      "0x4c1dd169": "InvalidSecret()",
      "0x9dbead8a": "FinalityNotReached()",
      "0x21097b42": "SecretNotCommitted()",
      "0x1b34b439": "RevealTooEarly()",
      "0xf1d80ab1": "UnknownError - needs analysis",

      // Common TRC-20 errors
      "0xa9059cbb": "transfer(address,uint256)",
      "0x23b872dd": "transferFrom(address,address,uint256)",

      // ERC-20 standard errors
      "0x96c6fd1e": "InsufficientBalance()",
      "0x13be252b": "InsufficientAllowance()",

      // Access control
      "0x82b42900": "Unauthorized()",
      "0x5fc483c5": "OnlyOwner()",

      // Reentrancy
      "0xab143c06": "ReentrancyGuardReentrantCall()",
    };

    // Panic codes for 0x4e487b71
    this.panicCodes = {
      0x00: "Generic compiler inserted panic",
      0x01: "Assertion failed",
      0x11: "Arithmetic overflow/underflow",
      0x12: "Division by zero",
      0x21: "Invalid enum value",
      0x22: "Invalid storage byte array access",
      0x31: "Pop on empty array",
      0x32: "Array index out of bounds",
      0x41: "Out of memory",
      0x51: "Invalid function selector",
    };
  }

  // Calculate error selector from signature
  calculateErrorSelector(signature) {
    return ethers.id(signature).substring(0, 10);
  }

  // Decode error data
  decodeError(errorData) {
    if (!errorData || errorData.length < 10) {
      return { type: "unknown", message: "No error data" };
    }

    const selector = errorData.substring(0, 10);
    const data = errorData.substring(10);

    console.log(`🔍 Error selector: ${selector}`);
    console.log(`📊 Error data: ${data}`);

    if (this.errorSelectors[selector]) {
      const errorType = this.errorSelectors[selector];
      console.log(`✅ Known error: ${errorType}`);

      // Special handling for specific error types
      if (selector === "0x08c379a0" && data.length >= 64) {
        // Standard revert with message
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["string"],
            "0x" + data
          );
          return { type: "revert", message: decoded[0] };
        } catch (e) {
          return { type: "revert", message: "Failed to decode string" };
        }
      } else if (selector === "0x4e487b71" && data.length >= 64) {
        // Panic error
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256"],
            "0x" + data
          );
          const panicCode = parseInt(decoded[0].toString());
          const panicMessage =
            this.panicCodes[panicCode] || `Unknown panic code: ${panicCode}`;
          return { type: "panic", code: panicCode, message: panicMessage };
        } catch (e) {
          return { type: "panic", message: "Failed to decode panic code" };
        }
      } else {
        return { type: "custom", message: errorType };
      }
    } else {
      console.log(`❌ Unknown error selector: ${selector}`);
      return { type: "unknown", selector, message: "Unknown error type" };
    }
  }

  // Analyze a specific transaction
  async analyzeTransaction(txId) {
    console.log(`🔍 Analyzing transaction: ${txId}`);
    console.log("=" + "=".repeat(50));

    try {
      const txInfo = await this.tronWeb.trx.getTransactionInfo(txId);

      console.log(`📊 Result: ${txInfo.result || "UNKNOWN"}`);
      console.log(`⚡ Energy used: ${txInfo.energy_used || 0}`);
      console.log(`💰 Fee: ${txInfo.fee || 0} SUN`);

      if (txInfo.contractResult && txInfo.contractResult.length > 0) {
        console.log("\n🚨 CONTRACT EXECUTION FAILED");
        console.log("-".repeat(30));

        for (let i = 0; i < txInfo.contractResult.length; i++) {
          const result = txInfo.contractResult[i];
          console.log(`\n📋 Contract result ${i + 1}: ${result}`);

          if (result && result.length > 0) {
            const decoded = this.decodeError("0x" + result);
            console.log(`🔓 Decoded: ${JSON.stringify(decoded, null, 2)}`);
          }
        }
      } else if (txInfo.result === "SUCCESS") {
        console.log("✅ Transaction executed successfully");
      } else {
        console.log("❌ Transaction failed without contract result");
      }

      // Check for internal transactions
      if (
        txInfo.internal_transactions &&
        txInfo.internal_transactions.length > 0
      ) {
        console.log(
          `\n🔄 Internal transactions: ${txInfo.internal_transactions.length}`
        );
      }

      return txInfo;
    } catch (error) {
      console.error(`❌ Failed to analyze transaction: ${error.message}`);
      return null;
    }
  }

  // Analyze the specific failed transactions from the swap
  async analyzeFailedSwap() {
    console.log("🔧 ANALYZING FAILED TRON SWAP");
    console.log("==============================");

    const failedTxs = [
      {
        id: "a9995e36375092de0091a8e2861727476b0c8a584fddc109a83a029b2efa86ab",
        type: "commitSecret",
      },
      {
        id: "a2522d6251060ee05021b07af97ef3670b14a8eba99ed891e1321d0d9cd3c019",
        type: "revealAndWithdraw",
      },
    ];

    for (const tx of failedTxs) {
      console.log(`\n📋 Analyzing ${tx.type} transaction...`);
      await this.analyzeTransaction(tx.id);
      console.log("\n" + "=".repeat(60));
    }
  }

  // Test error selector calculations
  testErrorSelectors() {
    console.log("🧪 TESTING ERROR SELECTOR CALCULATIONS");
    console.log("=======================================");

    const errorSignatures = [
      "EscrowNotFound()",
      "EscrowAlreadyCompleted()",
      "EscrowAlreadyCancelled()",
      "InvalidSecret()",
      "FinalityNotReached()",
      "SecretNotCommitted()",
      "RevealTooEarly()",
      "Error(string)",
      "Panic(uint256)",
    ];

    for (const sig of errorSignatures) {
      const selector = this.calculateErrorSelector(sig);
      console.log(`${sig} -> ${selector}`);
    }
  }

  // Simulate the 0xf1d80ab1 error
  async investigateUnknownError() {
    console.log("\n🔬 INVESTIGATING UNKNOWN ERROR 0xf1d80ab1");
    console.log("==========================================");

    // This error code doesn't match standard patterns
    // Let's check if it might be a truncated or modified selector
    const unknownError = "0xf1d80ab1";

    console.log(`🎯 Target error: ${unknownError}`);
    console.log("🔍 Possible explanations:");
    console.log("1. Custom error with non-standard encoding");
    console.log("2. ABI encoding issue in TronWeb");
    console.log("3. Contract-specific error code");
    console.log("4. Memory corruption or invalid selector");

    // Test if this could be a known error with different encoding
    const testBytes = unknownError.substring(2);
    console.log(`\n🧪 Testing byte patterns for: ${testBytes}`);

    // Try interpreting as different data types
    try {
      const asUint = parseInt(testBytes, 16);
      console.log(`   As uint: ${asUint}`);

      const asAddress = "0x" + testBytes.padStart(40, "0");
      console.log(`   As address: ${asAddress}`);
    } catch (e) {
      console.log("   ❌ Failed to interpret as standard types");
    }
  }
}

// Main execution
async function main() {
  const decoder = new TronErrorDecoder();

  console.log("🔍 TRON ERROR ANALYSIS TOOLKIT");
  console.log("===============================\n");

  // Test error selector calculations
  decoder.testErrorSelectors();

  // Investigate the unknown error
  await decoder.investigateUnknownError();

  // Analyze the failed swap transactions
  await decoder.analyzeFailedSwap();

  console.log("\n💡 RECOMMENDATIONS:");
  console.log("==================");
  console.log("1. Run ultimate-tron-fix.js for comprehensive resolution");
  console.log("2. Check contract bytecode for actual error definitions");
  console.log("3. Verify ABI compatibility between TronWeb and contract");
  console.log(
    "4. Consider deploying updated contract with better error handling"
  );
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TronErrorDecoder };
