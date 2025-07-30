const { ethers } = require("ethers");

/**
 * EthereumUser represents a user who holds ETH and wants to swap for TRX
 * Handles ETH escrow creation, LOP order creation, and TRX claiming with revealed secrets
 */
class EthereumUser {
  constructor(privateKey, rpcUrl, contractAddresses) {
    // Initialize Ethereum provider and wallet
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.role = "eth-holder"; // Has ETH, wants TRX

    // Store contract addresses
    this.contractAddresses = contractAddresses;

    // Initialize escrow factory contract
    this.escrowFactory = new ethers.Contract(
      contractAddresses.escrowFactory,
      require("../../deployments/EscrowFactory-sepolia-abi.json"),
      this.wallet
    );

    console.log(`🟢 EthereumUser initialized: ${this.wallet.address}`);
  }

  /**
   * Creates a LOP order for ETH->TRX swap
   * Integrates with existing LOP system for order management
   */
  async createLOPOrder(params) {
    console.log("📋 EthereumUser creating LOP order...");

    try {
      // Use existing LOP integration from atomic-swap.js
      // This is a placeholder for LOP order creation
      // In practice, this would integrate with your existing LOPFusionSwap class

      const orderParams = {
        ethAmount: params.ethAmount,
        trxAmount: params.trxAmount,
        secretHash: params.secretHash,
        resolver: params.resolver,
        timelock: params.timelock,
        safetyDeposit: params.safetyDeposit,
        maker: this.wallet.address,
      };

      console.log("✅ LOP order parameters prepared");
      return orderParams;
    } catch (error) {
      console.error("❌ Failed to create LOP order:", error.message);
      throw error;
    }
  }

  /**
   * Creates an escrow on Ethereum side
   * Locks ETH with hashlock/timelock protection
   */
  async createEthEscrow(params) {
    console.log("🔒 EthereumUser creating ETH escrow...");

    try {
      // Create escrow with safety deposit
      const tx = await this.escrowFactory.createEscrow(
        params.resolver, // Resolver address (usually TronUser's address)
        params.token, // Token address (ethers.ZeroAddress for ETH)
        params.amount, // Amount to swap
        params.secretHash, // Hash of the secret
        params.cancelDelay, // Timelock delay in seconds
        {
          value: params.totalValue, // Amount + safety deposit
          gasLimit: 500000, // Ensure enough gas for escrow creation
        }
      );

      console.log(`✅ ETH escrow transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ ETH escrow confirmed in block: ${receipt.blockNumber}`);

      // Extract escrow ID from contract event
      const escrowId = this.extractEscrowIdFromReceipt(receipt);

      return {
        hash: tx.hash,
        receipt: receipt,
        escrowId: escrowId,
      };
    } catch (error) {
      console.error("❌ Failed to create ETH escrow:", error.message);
      throw error;
    }
  }

  /**
   * Claims from ETH escrow using the revealed secret (ETH goes to the resolver)
   * This happens after TronUser reveals the secret on TRON side
   */
  async claimTRXWithSecret(escrowId, secret, nonce) {
    console.log(
      "🔓 EthereumUser revealing secret on ETH (sends ETH to User B)..."
    );

    try {
      // First, validate the escrow state
      console.log("🔍 Pre-flight checks before reveal...");
      const escrow = await this.escrowFactory.escrows(escrowId);
      console.log(
        `   Escrow exists: ${escrow.initiator !== ethers.ZeroAddress}`
      );
      console.log(`   Escrow completed: ${escrow.completed}`);
      console.log(`   Escrow cancelled: ${escrow.cancelled}`);

      // Check if finality is reached
      const finalityReached = await this.escrowFactory.isFinalityReached(
        escrowId
      );
      console.log(`   Finality reached: ${finalityReached}`);

      // Verify secret hash
      const calculatedSecretHash = ethers.keccak256(secret);
      console.log(
        `   Secret hash matches: ${escrow.secretHash === calculatedSecretHash}`
      );

      if (escrow.completed) {
        throw new Error("Escrow already completed");
      }

      if (escrow.cancelled) {
        throw new Error("Escrow has been cancelled");
      }

      // Use the secret revealed by TronUser to claim from Ethereum escrow
      const tx = await this.escrowFactory.revealAndWithdraw(
        escrowId,
        "0x" + secret.toString("hex"),
        "0x" + nonce.toString("hex"),
        { gasLimit: 300000 }
      );

      console.log(`✅ TRX claim transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ TRX claim confirmed in block: ${receipt.blockNumber}`);

      return {
        hash: tx.hash,
        receipt: receipt,
      };
    } catch (error) {
      console.error("❌ Failed to claim TRX with secret:", error.message);

      // Enhanced error analysis
      if (error.data) {
        try {
          // Try to decode the error using the contract interface
          const decodedError = this.escrowFactory.interface.parseError(
            error.data
          );
          console.error(`🔍 Decoded contract error: ${decodedError.name}`);

          // Provide specific guidance based on error type
          switch (decodedError.name) {
            case "RevealTooEarly":
              console.error(
                "💡 Wait longer after secret commitment before revealing"
              );
              break;
            case "SecretNotCommitted":
              console.error("💡 Ensure secret was properly committed first");
              break;
            case "InvalidSecret":
              console.error(
                "💡 Check that secret and nonce match committed values"
              );
              break;
            case "FinalityNotReached":
              console.error("💡 Wait for more block confirmations");
              break;
            case "EscrowNotFound":
              console.error("💡 Verify escrow ID is correct");
              break;
            case "EscrowAlreadyCompleted":
              console.error("💡 This escrow has already been claimed");
              break;
            case "Unauthorized":
              console.error(
                "💡 Only the escrow initiator can reveal the secret"
              );
              break;
            default:
              console.error(`💡 Unknown contract error: ${decodedError.name}`);
          }
        } catch (decodeError) {
          console.error("⚠️ Could not decode contract error details");
        }
      }

      throw error;
    }
  }

  /**
   * Extracts the escrow ID from the EscrowCreated event in the transaction receipt
   */
  extractEscrowIdFromReceipt(receipt) {
    const escrowCreatedEvent = receipt.logs.find((log) => {
      try {
        const parsed = this.escrowFactory.interface.parseLog(log);
        return parsed.name === "EscrowCreated";
      } catch {
        return false;
      }
    });

    if (!escrowCreatedEvent) {
      throw new Error(
        "ETH EscrowCreated event not found in transaction receipt"
      );
    }

    const parsedEvent =
      this.escrowFactory.interface.parseLog(escrowCreatedEvent);
    return parsedEvent.args.escrowId;
  }

  /**
   * Generates a deterministic escrow ID from transaction hash
   * Used for tracking and referencing escrows across chains
   */
  generateEscrowId(txHash) {
    return ethers.keccak256(ethers.toUtf8Bytes(txHash));
  }

  /**
   * Returns the user's Ethereum address
   */
  getAddress() {
    return this.wallet.address;
  }

  /**
   * Gets the user's ETH balance
   */
  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return balance;
    } catch (error) {
      console.error("❌ Failed to get ETH balance:", error.message);
      throw error;
    }
  }

  /**
   * Gets the user's ETH balance in human-readable format
   */
  async getFormattedBalance() {
    const balance = await this.getBalance();
    return ethers.formatEther(balance);
  }

  /**
   * Validates that the user has sufficient balance for the swap
   */
  async validateBalance(requiredAmount) {
    const balance = await this.getBalance();
    const hasEnough = balance >= requiredAmount;

    if (!hasEnough) {
      console.warn(
        `⚠️ Insufficient balance. Required: ${ethers.formatEther(
          requiredAmount
        )} ETH, Available: ${ethers.formatEther(balance)} ETH`
      );
    }

    return hasEnough;
  }

  /**
   * Gets network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: network.chainId,
        blockNumber: await this.provider.getBlockNumber(),
      };
    } catch (error) {
      console.error("❌ Failed to get network info:", error.message);
      throw error;
    }
  }
}

module.exports = { EthereumUser };
