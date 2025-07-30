const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;

/**
 * TronUser represents a user who holds TRX and wants to swap for ETH
 * Handles TRON escrow creation, secret revealing, and ETH claiming
 */
class TronUser {
  constructor(privateKey, rpcUrl, contractAddresses) {
    // Format private key for TronWeb (remove 0x prefix if present)
    if (privateKey.startsWith("0x")) {
      privateKey = privateKey.slice(2);
    }

    // Initialize TronWeb instance
    this.tronWeb = new TronWeb({
      fullHost: rpcUrl,
      privateKey: privateKey,
    });

    this.role = "trx-holder"; // Has TRX, wants ETH
    this.contractAddresses = contractAddresses;
    this.escrowFactoryAddress = contractAddresses.tronEscrowFactory;

    console.log(`🟠 TronUser initialized: ${this.getAddress().base58}`);
  }

  /**
   * Creates an escrow on TRON side
   * Locks TRX with hashlock/timelock protection
   */
  async createTronEscrow(params) {
    console.log("🔒 TronUser creating TRON escrow...");

    try {
      console.log("🔧 TRON Escrow Creation Parameters:");
      console.log(`   Contract: ${this.escrowFactoryAddress}`);
      console.log(`   Resolver (input): ${params.resolver}`);
      console.log(
        `   Resolver (hex): ${this.tronWeb.address.toHex(params.resolver)}`
      );
      console.log(`   Token: ${params.token}`);
      console.log(`   Amount: ${params.amount}`);
      console.log(`   Total Value: ${params.totalValue}`);
      console.log(`   Secret Hash: ${params.secretHash}`);
      console.log(`   Cancel Delay: ${params.cancelDelay}`);

      // Build the smart contract transaction
      const txData = await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.escrowFactoryAddress,
        "createEscrow(address,address,uint256,bytes32,uint64)",
        {
          feeLimit: 100_000_000, // 100 TRX fee limit
          callValue: params.totalValue.toString(), // TRX amount + safety deposit
        },
        [
          {
            type: "address",
            value: this.tronWeb.address.toHex(params.resolver),
          }, // Convert to hex like atomic-swap.js
          { type: "address", value: params.token }, // Keep token in base58 format like atomic-swap.js
          { type: "uint256", value: params.amount.toString() },
          { type: "bytes32", value: params.secretHash },
          { type: "uint64", value: params.cancelDelay.toString() },
        ]
      );

      console.log(
        "🔍 Contract call result:",
        JSON.stringify(txData.result, null, 2)
      );

      if (!txData.result.result) {
        console.log("❌ Contract call failed!");
        console.log("   Result:", txData.result);
        throw new Error(`Contract call failed: ${txData.result.message}`);
      }

      console.log("✅ Contract call built successfully");

      // Sign the transaction
      const signedTx = await this.tronWeb.trx.sign(txData.transaction);

      // Broadcast the transaction
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      if (!result.result) {
        throw new Error(
          `Transaction failed: ${result.message || "Unknown error"}`
        );
      }

      console.log(`✅ TRON escrow transaction sent: ${result.txid}`);

      // Wait for confirmation (simplified - in production, you'd want to poll for confirmation)
      await this.sleep(5000);

      // Extract escrow ID from transaction events with proper fallback parameters
      const escrowParams = {
        initiatorEthFormat: this.convertToEthFormat(
          this.tronWeb.defaultAddress.base58
        ), // User B is initiator
        resolverEthFormat: this.convertToEthFormat(params.resolver), // User A is resolver
        tokenEthFormat: this.convertToEthFormat(params.token),
        amount: params.amount,
        secretHash: params.secretHash,
        cancelDelay: params.cancelDelay,
      };

      const escrowId = await this.extractEscrowIdFromTransactionWithParams(
        result.txid,
        escrowParams
      );

      return {
        txid: result.txid,
        escrowId: escrowId,
      };
    } catch (error) {
      console.error("❌ Failed to create TRON escrow:", error.message);
      throw error;
    }
  }

  /**
   * Reveals the secret and claims ETH from Ethereum escrow
   * This is the critical step that enables the atomic swap
   */
  async revealSecretAndClaimETH(escrowId, secret, nonce) {
    console.log("🔓 TronUser revealing secret and claiming ETH...");

    try {
      // Build the reveal and withdraw transaction
      const txData = await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.escrowFactoryAddress,
        "revealAndWithdraw(bytes32,bytes32,bytes32)",
        { feeLimit: 100_000_000 },
        [
          { type: "bytes32", value: escrowId },
          { type: "bytes32", value: "0x" + secret.toString("hex") },
          { type: "bytes32", value: "0x" + nonce.toString("hex") },
        ]
      );

      if (!txData.result.result) {
        throw new Error(`Contract call failed: ${txData.result.message}`);
      }

      // Sign the transaction
      const signedTx = await this.tronWeb.trx.sign(txData.transaction);

      // Broadcast the transaction
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      if (!result.result) {
        throw new Error(
          `Transaction failed: ${result.message || "Unknown error"}`
        );
      }

      console.log(`✅ Secret revealed and ETH claimed: ${result.txid}`);

      return {
        txid: result.txid,
        revealedSecret: secret.toString("hex"),
      };
    } catch (error) {
      console.error("❌ Failed to reveal secret and claim ETH:", error.message);
      throw error;
    }
  }

  /**
   * Commits a secret to TRON for MEV protection
   */
  async commitSecretToTron(secretCommit) {
    console.log("🔒 TronUser committing secret...");
    try {
      const txData = await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.escrowFactoryAddress,
        "commitSecret(bytes32)",
        { feeLimit: 50_000_000 },
        [{ type: "bytes32", value: secretCommit }]
      );

      if (!txData.result.result) {
        throw new Error(`Contract call failed: ${txData.result.message}`);
      }

      const signedTx = await this.tronWeb.trx.sign(txData.transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

      if (!result.result) {
        throw new Error(
          `Transaction failed: ${result.message || "Unknown error"}`
        );
      }

      console.log(`✅ TRON secret committed: ${result.txid}`);
      return result.txid;
    } catch (error) {
      console.error("❌ Failed to commit secret to TRON:", error.message);
      throw error;
    }
  }

  /**
   * Extracts the escrow ID from TRON transaction events (with proven fallback logic)
   */
  async extractEscrowIdFromTransaction(txid) {
    return this.extractEscrowIdFromTransactionWithParams(txid, null);
  }

  /**
   * Extracts escrow ID with proper fallback parameters
   */
  async extractEscrowIdFromTransactionWithParams(txid, escrowParams) {
    console.log(`🔍 Extracting escrow ID from TRON transaction: ${txid}`);

    // Wait for TRON indexing with multiple retry attempts
    let txInfo = null;
    let attempts = 0;
    const maxAttempts = 8;

    while (attempts < maxAttempts && !txInfo) {
      attempts++;
      console.log(
        `🔍 Attempt ${attempts}/${maxAttempts}: Checking TRON transaction indexing...`
      );
      await this.sleep(8000); // Wait 8 seconds between attempts

      try {
        const info = await this.tronWeb.trx.getTransactionInfo(txid);
        if (info && Object.keys(info).length > 0) {
          txInfo = info;
          console.log(`✅ Got transaction info on attempt ${attempts}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ Attempt ${attempts}: ${error.message}`);
      }
    }

    if (!txInfo) {
      console.log(
        `❌ Failed to get transaction info after ${maxAttempts} attempts`
      );
      throw new Error(
        `TRON transaction not indexed after ${maxAttempts * 8} seconds: ${txid}`
      );
    }

    console.log(`🔍 TRON transaction info:`, JSON.stringify(txInfo, null, 2));

    // Check if transaction succeeded
    if (txInfo.receipt && txInfo.receipt.result === "SUCCESS") {
      console.log("✅ TRON escrow creation transaction succeeded");

      // Extract real escrow ID from events
      if (txInfo.log && txInfo.log.length > 0) {
        const event = txInfo.log[0];
        if (event && event.topics && event.topics.length > 1) {
          const realEscrowId = "0x" + event.topics[1];
          console.log(`🆔 Real TRON Escrow ID from events: ${realEscrowId}`);

          // Compare with calculated ID for debugging
          const calculatedId = this.generateEscrowId(txid, escrowParams);
          console.log(`🔍 Calculated ID: ${calculatedId}`);
          console.log(`🔍 Real ID:       ${realEscrowId}`);
          console.log(`✅ Using REAL escrow ID from contract events`);

          return realEscrowId;
        }
      }
    } else {
      console.log(`❌ TRON escrow creation failed`);
      console.log(`   Receipt result: ${txInfo?.receipt?.result || "UNKNOWN"}`);
      throw new Error(
        `TRON escrow creation failed: ${txInfo?.receipt?.result || "UNKNOWN"}`
      );
    }

    // If we reach here, transaction succeeded but no events found
    console.log(`❌ Transaction succeeded but no escrow creation events found`);
    throw new Error(`No escrow creation events in TRON transaction: ${txid}`);
  }

  /**
   * Convert TRON address to Ethereum format for hashing consistency
   */
  convertToEthFormat(tronAddress) {
    try {
      // Check if it's already in hex format
      if (tronAddress.startsWith("0x")) {
        return tronAddress;
      }

      // Check if it's in TRON hex format (starts with '41')
      if (tronAddress.startsWith("41")) {
        return "0x" + tronAddress.slice(2);
      }

      // Convert from base58 to hex, then to eth format
      const hex = this.tronWeb.address.toHex(tronAddress);
      return "0x" + hex.slice(2); // Remove '41' prefix and add '0x'
    } catch (error) {
      console.log(`⚠️ Address conversion failed: ${error.message}`);
      return tronAddress; // Return as-is if conversion fails
    }
  }

  /**
   * Generates a deterministic escrow ID using contract parameters (proven working method)
   * This matches the actual contract's escrow ID generation logic
   */
  generateEscrowId(txid, escrowParams = null) {
    if (!escrowParams) {
      // Fallback to simple hash if no parameters available
      console.log(`🔄 Using simple hash fallback for escrow ID`);
      return this.tronWeb.sha3(txid);
    }

    // Use ethers.js for consistent keccak256 hashing (same as Ethereum)
    const { ethers } = require("ethers");

    console.log(
      `🔧 Generating TRON Escrow ID using EXACT atomic-swap.js logic:`
    );
    console.log(`   Initiator: ${escrowParams.initiatorEthFormat}`);
    console.log(`   Resolver: ${escrowParams.resolverEthFormat}`);
    console.log(`   Token: ${escrowParams.tokenEthFormat}`);
    console.log(`   Amount: ${escrowParams.amount}`);
    console.log(`   Secret Hash: ${escrowParams.secretHash}`);

    // Generate escrow ID using EXACT same logic as atomic-swap.js
    const escrowId = ethers.keccak256(
      ethers.solidityPacked(
        [
          "address", // initiator
          "address", // resolver
          "address", // token
          "uint256", // amount
          "bytes32", // secretHash
          "uint256", // timestamp (approximate)
          "uint256", // cancelDelay
        ],
        [
          escrowParams.initiatorEthFormat, // FIXED: User B is initiator (who creates escrow)
          escrowParams.resolverEthFormat, // User A is resolver (who gets TRX)
          escrowParams.tokenEthFormat, // token (TRX zero address)
          escrowParams.amount.toString(),
          escrowParams.secretHash,
          Math.floor(Date.now() / 1000).toString(), // Current timestamp approximation
          "0", // FIXED: Use "0" like atomic-swap.js, not actual cancelDelay
        ]
      )
    );

    console.log(`🆔 Generated TRON Escrow ID: ${escrowId}`);
    return escrowId;
  }

  /**
   * Returns the user's TRON addresses in both formats
   */
  getAddress() {
    return {
      base58: this.tronWeb.defaultAddress.base58,
      hex: this.tronWeb.defaultAddress.hex,
    };
  }

  /**
   * Gets the user's TRX balance
   */
  async getBalance() {
    try {
      const balance = await this.tronWeb.trx.getBalance(
        this.tronWeb.defaultAddress.base58
      );
      return balance;
    } catch (error) {
      console.error("❌ Failed to get TRX balance:", error.message);
      throw error;
    }
  }

  /**
   * Gets the user's TRX balance in human-readable format
   */
  async getFormattedBalance() {
    const balance = await this.getBalance();
    return this.tronWeb.fromSun(balance);
  }

  /**
   * Validates that the user has sufficient balance for the swap
   */
  async validateBalance(requiredAmount) {
    const balance = await this.getBalance();
    const hasEnough = BigInt(balance) >= BigInt(requiredAmount);

    if (!hasEnough) {
      console.warn(
        `⚠️ Insufficient balance. Required: ${this.tronWeb.fromSun(
          requiredAmount
        )} TRX, Available: ${this.tronWeb.fromSun(balance)} TRX`
      );
    }

    return hasEnough;
  }

  /**
   * Gets current block information from TRON network
   */
  async getNetworkInfo() {
    try {
      const block = await this.tronWeb.trx.getCurrentBlock();
      return {
        blockNumber: block.block_header.raw_data.number,
        timestamp: block.block_header.raw_data.timestamp,
        blockHash: block.blockID,
      };
    } catch (error) {
      console.error("❌ Failed to get network info:", error.message);
      throw error;
    }
  }

  /**
   * Utility function for delays (used for waiting for confirmations)
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Converts TRX amount to Sun (smallest TRON unit)
   */
  toSun(trxAmount) {
    return this.tronWeb.toSun(trxAmount);
  }

  /**
   * Converts Sun to TRX amount
   */
  fromSun(sunAmount) {
    return this.tronWeb.fromSun(sunAmount);
  }

  /**
   * Validates TRON address format
   */
  isValidAddress(address) {
    return this.tronWeb.isAddress(address);
  }

  /**
   * Converts address between hex and base58 formats
   */
  convertAddress(address) {
    if (address.startsWith("T")) {
      // base58 to hex
      return this.tronWeb.address.toHex(address);
    } else {
      // hex to base58
      return this.tronWeb.address.fromHex(address);
    }
  }
}

module.exports = { TronUser };
