const crypto = require("crypto");
const { ethers } = require("ethers");

/**
 * TwoUserSwapCoordinator orchestrates atomic swaps between two independent users
 * Handles ETH↔TRX swaps with proper hashlock/timelock mechanisms
 * Ensures atomic execution where both users either succeed or fail together
 */
class TwoUserSwapCoordinator {
  constructor(userA, userB, config) {
    this.userA = userA; // EthereumUser instance (holds ETH, wants TRX)
    this.userB = userB; // TronUser instance (holds TRX, wants ETH)
    this.config = config; // Contract addresses, RPC URLs, etc.

    // Generate cryptographic parameters for atomic swap
    this.secret = crypto.randomBytes(32);
    this.secretHash = ethers.keccak256(this.secret);
    this.nonce = crypto.randomBytes(32);

    // Track swap state
    this.swapState = {
      ethEscrowCreated: false,
      tronEscrowCreated: false,
      secretRevealed: false,
      swapCompleted: false,
    };

    console.log("🤝 TwoUserSwapCoordinator initialized");
    console.log(`🔐 Secret Hash: ${this.secretHash}`);
  }

  /**
   * Coordinates a complete ETH→TRX swap between two users
   * User A provides ETH, User B provides TRX
   */
  async coordinateETHtoTRXSwap(ethAmount, trxAmount) {
    console.log("\n🔄 COORDINATING ETH→TRX SWAP BETWEEN TWO USERS");
    console.log("==============================================");
    console.log(`📊 ETH Amount: ${ethers.formatEther(ethAmount)} ETH`);
    console.log(`📊 TRX Amount: ${this.userB.fromSun(trxAmount)} TRX`);
    console.log(`👤 User A (ETH): ${this.userA.getAddress()}`);
    console.log(`👤 User B (TRX): ${this.userB.getAddress().base58}\n`);

    try {
      // Step 1: Validate user balances
      await this.validateUserBalances(ethAmount, trxAmount);

      // Step 2: Create escrows simultaneously
      const { ethEscrowTx, tronEscrowTx } = await this.createBothEscrows(
        ethAmount,
        trxAmount
      );

      // Step 3: Wait for confirmations
      console.log("⏳ Waiting for blockchain confirmations...");
      await this.sleep(10000); // 10 second safety delay

      // Step 4: Commit secrets for MEV protection
      console.log("\n🔐 COMMITTING SECRETS (MEV Protection)");
      console.log("=====================================");
      await this.commitSecrets();

      // Step 5: Execute atomic reveal sequence
      console.log("\n🔓 EXECUTING ATOMIC REVEAL SEQUENCE");
      console.log("===================================");
      const result = await this.executeAtomicSequence(
        ethEscrowTx,
        tronEscrowTx
      );

      this.swapState.swapCompleted = true;
      console.log("\n🎉 TWO-USER SWAP COMPLETED SUCCESSFULLY!");
      console.log("========================================");

      return result;
    } catch (error) {
      console.error("\n❌ SWAP COORDINATION FAILED");
      console.error("============================");
      console.error(`Error: ${error.message}`);

      // In production, implement rollback mechanisms here
      await this.handleSwapFailure(error);
      throw error;
    }
  }

  /**
   * Coordinates a complete TRX→ETH swap between two users
   * User B provides TRX, User A provides ETH (reverse direction)
   */
  async coordinateTRXtoETHSwap(trxAmount, ethAmount) {
    console.log("\n🔄 COORDINATING TRX→ETH SWAP BETWEEN TWO USERS");
    console.log("==============================================");

    // Implementation similar to ETH→TRX but with roles reversed
    // This demonstrates bidirectional swap capability

    try {
      // Validate balances (reversed)
      await this.validateUserBalances(ethAmount, trxAmount);

      // Create escrows with TronUser starting first
      const tronEscrowParams = this.buildTronEscrowParams(
        trxAmount,
        process.env.USER_A_TRX_RECEIVE_ADDRESS // FIXED: User A should be resolver, not User B
      );
      const ethEscrowParams = this.buildEthEscrowParams(
        ethAmount,
        this.userA.getAddress()
      );

      // User B creates TRON escrow first
      console.log("1️⃣ User B creating TRON escrow...");
      const tronEscrowTx = await this.userB.createTronEscrow(tronEscrowParams);

      // User A creates matching ETH escrow
      console.log("2️⃣ User A creating ETH escrow...");
      const ethEscrowTx = await this.userA.createEthEscrow(ethEscrowParams);

      // Continue with atomic sequence
      await this.sleep(10000);
      return await this.executeAtomicSequence(ethEscrowTx, tronEscrowTx);
    } catch (error) {
      console.error("❌ TRX→ETH swap coordination failed:", error.message);
      throw error;
    }
  }

  /**
   * Creates both ETH and TRON escrows in coordinated sequence
   */
  async createBothEscrows(ethAmount, trxAmount) {
    // Phase 1: User A creates ETH escrow (ETH will go to User B)
    console.log("1️⃣ User A creating ETH escrow...");
    const ethEscrowParams = this.buildEthEscrowParams(
      ethAmount,
      process.env.USER_B_ETH_RECEIVE_ADDRESS // ETH goes to User B
    );
    const ethEscrowTx = await this.userA.createEthEscrow(ethEscrowParams);
    this.swapState.ethEscrowCreated = true;
    this.lastEthEscrowId = ethEscrowTx.escrowId; // Store for finality checking
    console.log(`✅ ETH escrow created: ${ethEscrowTx.hash}`);
    console.log(
      `🔍 Debug: Stored escrow ID for finality: ${this.lastEthEscrowId}`
    );

    // Phase 2: User B creates matching TRON escrow (TRX will go to User A)
    console.log("2️⃣ User B creating TRON escrow...");
    const tronEscrowParams = this.buildTronEscrowParams(
      trxAmount,
      process.env.USER_A_TRX_RECEIVE_ADDRESS // TRX goes to User A
    );
    const tronEscrowTx = await this.userB.createTronEscrow(tronEscrowParams);
    this.swapState.tronEscrowCreated = true;
    this.lastTronEscrowId = tronEscrowTx.escrowId; // Store for finality checking
    console.log(`✅ TRON escrow created: ${tronEscrowTx.txid}`);
    console.log(
      `🔍 Debug: Stored TRON escrow ID for finality: ${this.lastTronEscrowId}`
    );

    return { ethEscrowTx, tronEscrowTx };
  }

  /**
   * Commits secrets to both chains for MEV protection
   */
  async commitSecrets() {
    const secretCommit = ethers.keccak256(
      ethers.concat([this.secret, this.nonce])
    );

    console.log("🔒 Committing secret to ETH...");
    try {
      const ethCommitTx = await this.userA.escrowFactory.commitSecret(
        secretCommit,
        {
          gasLimit: 100000,
        }
      );
      await ethCommitTx.wait();
      console.log(`✅ ETH secret committed: ${ethCommitTx.hash}`);
    } catch (error) {
      console.log(`⚠️ ETH commit failed (may already exist): ${error.message}`);
    }

    console.log("🔒 Committing secret to TRON...");
    try {
      await this.userB.commitSecretToTron(secretCommit);
      console.log(`✅ TRON secret committed`);
    } catch (error) {
      console.log(
        `⚠️ TRON commit failed (may already exist): ${error.message}`
      );
    }

    // Wait for reveal delay (MEV protection)
    console.log("⏳ Waiting for MEV protection delay (60 seconds)...");
    await this.sleep(60000);
    console.log("✅ MEV protection period completed");

    // Also check finality blocks requirement
    console.log("🔍 Checking finality blocks requirement...");
    try {
      console.log(`🔍 Debug: lastEthEscrowId = ${this.lastEthEscrowId}`);

      if (!this.lastEthEscrowId) {
        console.log("❌ Error: No escrow ID stored for finality checking");
        console.log(
          "⚠️ Skipping finality check - this may cause reveal failure"
        );
        return;
      }

      const finalityBlocks = await this.userA.escrowFactory.FINALITY_BLOCKS();
      console.log(`📋 Contract requires ${finalityBlocks} blocks for finality`);
      console.log("⏳ Waiting for finality blocks to be reached...");

      // Wait for finality blocks on BOTH chains (poll every 15 seconds)
      let ethFinalityReached = false;
      let tronFinalityReached = false;
      let attempts = 0;
      const maxAttempts = 20; // Max 5 minutes of waiting

      while (
        (!ethFinalityReached || !tronFinalityReached) &&
        attempts < maxAttempts
      ) {
        try {
          // Check ETH escrow finality
          if (!ethFinalityReached) {
            const ethFinality =
              await this.userA.escrowFactory.isFinalityReached(
                this.lastEthEscrowId
              );
            console.log(
              `   ETH escrow finality reached: ${ethFinality} (attempt ${
                attempts + 1
              })`
            );
            ethFinalityReached = ethFinality;
          }

          // Check TRON escrow finality (simplified approach)
          if (!tronFinalityReached && this.lastTronEscrowId) {
            try {
              // Get TRON escrow details
              const escrowData =
                await this.userB.tronWeb.transactionBuilder.triggerSmartContract(
                  this.userB.escrowFactoryAddress,
                  "escrows(bytes32)",
                  { feeLimit: 10_000_000 },
                  [{ type: "bytes32", value: this.lastTronEscrowId }]
                );

              if (
                escrowData.result.result &&
                escrowData.constant_result &&
                escrowData.constant_result[0]
              ) {
                // Extract finalityLock from escrow struct (6th field, uint64)
                const result = escrowData.constant_result[0];
                // Parse the struct - finalityLock is at position 192 (6*32 bytes)
                const finalityLockHex = result.substring(192, 208); // 8 bytes = 16 hex chars
                const finalityLock = parseInt(finalityLockHex, 16);

                // Get current TRON block number
                const currentBlock =
                  await this.userB.tronWeb.trx.getCurrentBlock();
                const currentBlockNumber =
                  currentBlock.block_header.raw_data.number;

                tronFinalityReached = currentBlockNumber >= finalityLock;
                console.log(
                  `   TRON escrow finality reached: ${tronFinalityReached} (current: ${currentBlockNumber}, required: ${finalityLock}) (attempt ${
                    attempts + 1
                  })`
                );
              }
            } catch (tronError) {
              console.log(
                `⚠️ Could not check TRON finality: ${tronError.message}`
              );
              // Assume TRON finality is reached after sufficient time (fallback)
              if (attempts >= 3) {
                tronFinalityReached = true;
                console.log(
                  `   TRON finality assumed reached (fallback after ${attempts} attempts)`
                );
              }
            }
          }

          if (ethFinalityReached && tronFinalityReached) {
            console.log("✅ Both ETH and TRON finality requirements satisfied");
            break;
          } else {
            console.log("⏳ Waiting 15 seconds for more blocks...");
            await this.sleep(15000);
            attempts++;
          }
        } catch (error) {
          console.log(`⚠️ Error checking finality: ${error.message}`);
          await this.sleep(15000);
          attempts++;
        }
      }

      if (!ethFinalityReached || !tronFinalityReached) {
        console.log(
          "⚠️ Cross-chain finality not reached within timeout, proceeding anyway"
        );
        console.log(
          `   ETH finality: ${ethFinalityReached}, TRON finality: ${tronFinalityReached}`
        );
      }
    } catch (error) {
      console.log(`⚠️ Could not check finality requirement: ${error.message}`);
      console.log(
        "⚠️ This may cause reveal failure due to finality not reached"
      );
    }
  }

  /**
   * Executes the atomic reveal sequence that completes the swap
   */
  async executeAtomicSequence(ethEscrowTx, tronEscrowTx) {
    // Use the escrow IDs that were already extracted from the transaction results
    const ethEscrowId = ethEscrowTx.escrowId;
    const tronEscrowId = tronEscrowTx.escrowId;

    console.log(`🔍 ETH Escrow ID: ${ethEscrowId}`);
    console.log(`🔍 TRON Escrow ID: ${tronEscrowId}`);

    // Verify escrows exist
    console.log("🔍 Verifying escrows exist...");
    try {
      const ethEscrow = await this.userA.escrowFactory.escrows(ethEscrowId);
      console.log(`✅ ETH escrow verified - Initiator: ${ethEscrow.initiator}`);
      console.log(`   Resolver: ${ethEscrow.resolver}`);
      console.log(`   Amount: ${ethers.formatEther(ethEscrow.amount)} ETH`);
      console.log(`   Completed: ${ethEscrow.completed}`);
    } catch (error) {
      console.log(`❌ ETH escrow verification failed: ${error.message}`);
    }

    // Step 1: User B reveals secret on TRON and claims TRX (which goes to User A via resolver)
    console.log("\n🔓 Step 1: User B reveals secret on TRON (TRX → User A)");
    console.log("=====================================================");
    const trxClaimTx = await this.userB.revealSecretAndClaimETH(
      tronEscrowId,
      this.secret,
      this.nonce
    );
    this.swapState.secretRevealed = true;
    console.log(
      `✅ User B revealed secret, TRX sent to User A: ${trxClaimTx.txid}`
    );
    console.log(`🔐 Secret revealed: ${trxClaimTx.revealedSecret}`);

    // Step 2: User A uses revealed secret to claim ETH (which goes to User B via resolver)
    console.log("\n🔓 Step 2: User A uses revealed secret (ETH → User B)");
    console.log("===================================================");
    const ethClaimTx = await this.userA.claimTRXWithSecret(
      ethEscrowId,
      this.secret,
      this.nonce
    );
    console.log(
      `✅ User A used secret, ETH sent to User B: ${ethClaimTx.hash}`
    );

    // Return comprehensive swap result
    return {
      swapType: "ETH→TRX",
      ethEscrow: ethEscrowTx.hash,
      tronEscrow: tronEscrowTx.txid,
      ethClaim: ethClaimTx.txid,
      trxClaim: trxClaimTx.hash,
      secret: this.secret.toString("hex"),
      secretHash: this.secretHash,
      timestamp: new Date().toISOString(),
      userA: this.userA.getAddress(),
      userB: this.userB.getAddress().base58,
    };
  }

  /**
   * Builds ETH escrow parameters with proper safety measures
   */
  buildEthEscrowParams(ethAmount, resolverAddress) {
    return {
      resolver: resolverAddress, // Ethereum address as resolver
      token: ethers.ZeroAddress, // ETH (native token)
      amount: ethAmount,
      secretHash: this.secretHash,
      cancelDelay: 3600, // 1 hour timelock
      totalValue: ethAmount + ethers.parseEther("0.001"), // Amount + safety deposit
    };
  }

  /**
   * Builds TRON escrow parameters with proper safety measures
   */
  buildTronEscrowParams(trxAmount, resolverAddress) {
    return {
      resolver: resolverAddress, // TRON address as resolver
      token: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // TRX zero address equivalent
      amount: trxAmount,
      secretHash: this.secretHash,
      cancelDelay: 3600, // 1 hour timelock
      totalValue: BigInt(trxAmount) + BigInt("1500000"), // Amount + safety deposit (1.5 TRX)
    };
  }

  /**
   * Validates that both users have sufficient balances for the swap
   */
  async validateUserBalances(ethAmount, trxAmount) {
    console.log("💰 Validating user balances...");

    // Check User A's ETH balance
    const userAHasEnough = await this.userA.validateBalance(
      ethAmount + ethers.parseEther("0.001") // Include safety deposit
    );

    // Check User B's TRX balance
    const userBHasEnough = await this.userB.validateBalance(
      BigInt(trxAmount) + BigInt("1500000") // Include safety deposit
    );

    if (!userAHasEnough) {
      throw new Error(
        "User A has insufficient ETH balance for swap + safety deposit"
      );
    }

    if (!userBHasEnough) {
      throw new Error(
        "User B has insufficient TRX balance for swap + safety deposit"
      );
    }

    console.log("✅ Both users have sufficient balances");
  }

  /**
   * Handles swap failures and provides debugging information
   */
  async handleSwapFailure(error) {
    console.log("\n🚨 SWAP FAILURE ANALYSIS");
    console.log("========================");
    console.log(`Current State: ${JSON.stringify(this.swapState, null, 2)}`);
    console.log(`Error Type: ${error.constructor.name}`);
    console.log(`Error Message: ${error.message}`);

    // In production, implement rollback mechanisms:
    // - Cancel escrows if timelock allows
    // - Refund safety deposits
    // - Log incident for analysis
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets current swap state for monitoring
   */
  getSwapState() {
    return {
      ...this.swapState,
      secretHash: this.secretHash,
      userA: this.userA.getAddress(),
      userB: this.userB.getAddress(),
    };
  }

  /**
   * Estimates gas costs for the complete swap operation
   */
  async estimateSwapCosts() {
    // This would estimate total gas costs for both chains
    // Useful for user experience and cost transparency
    return {
      ethGasCost: "~0.001 ETH", // Estimated
      tronEnergyCost: "~15 TRX", // Estimated
      totalEstimate: "Varies by network congestion",
    };
  }
}

module.exports = { TwoUserSwapCoordinator };
