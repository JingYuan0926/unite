const { XRPLEscrowClient, XRPLEscrowUtils } = require("../client/client.js");
const {
  EVMEscrowClient,
  EVMEscrowUtils,
} = require("../client/evmEscrowClient.js");
const crypto = require("crypto");

/**
 * Cross-Chain HTLC Orchestrator
 * Manages atomic swaps between EVM and XRPL chains
 */
class CrossChainOrchestrator {
  constructor(config = {}) {
    // EVM configuration
    this.evmClient = new EVMEscrowClient(config.evm);

    // XRPL configuration
    this.xrplClient = new XRPLEscrowClient(config.xrpl);

    // Swap tracking
    this.activeSwaps = new Map();
    this.swapHistory = new Map();

    // Configuration
    this.config = {
      defaultTimeout: config.defaultTimeout || 3600, // 1 hour
      srcWithdrawalDelay: config.srcWithdrawalDelay || 300, // 5 minutes
      dstWithdrawalDelay: config.dstWithdrawalDelay || 600, // 10 minutes
      cancellationGracePeriod: config.cancellationGracePeriod || 900, // 15 minutes
      ...config,
    };
  }

  /**
   * Generate a unique order hash for the swap
   * @param {Object} swapParams - Swap parameters
   * @returns {string} Order hash
   */
  generateOrderHash(swapParams) {
    const data = JSON.stringify({
      srcChain: swapParams.srcChain,
      dstChain: swapParams.dstChain,
      maker: swapParams.maker,
      taker: swapParams.taker,
      srcToken: swapParams.srcToken,
      dstToken: swapParams.dstToken,
      srcAmount: swapParams.srcAmount,
      dstAmount: swapParams.dstAmount,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString("hex"),
    });

    return "0x" + crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Create a new cross-chain swap
   * @param {Object} swapParams - Swap parameters
   * @returns {Promise<Object>} Swap creation result
   */
  async createSwap(swapParams) {
    const {
      srcChain,
      dstChain,
      maker,
      taker,
      srcToken,
      dstToken,
      srcAmount,
      dstAmount,
      safetyDeposit = "0",
    } = swapParams;

    // Generate swap identifiers
    const orderHash = this.generateOrderHash(swapParams);
    const secret = EVMEscrowClient.generateSecret();
    const hashlock = EVMEscrowClient.hashSecret(secret);
    const swapId = crypto.randomUUID();

    console.log(`🔄 Creating cross-chain swap ${swapId}`);
    console.log(`📋 Order Hash: ${orderHash}`);
    console.log(`🔐 Hashlock: ${hashlock}`);

    // Calculate timelocks based on swap direction
    const now = Math.floor(Date.now() / 1000);
    const timelocks = this.calculateTimelocks(now, srcChain);

    try {
      const swap = {
        id: swapId,
        orderHash,
        secret,
        hashlock,
        status: "created",
        srcChain,
        dstChain,
        maker,
        taker,
        srcToken,
        dstToken,
        srcAmount,
        dstAmount,
        safetyDeposit,
        timelocks,
        createdAt: now,
        srcEscrow: null,
        dstEscrow: null,
        transactions: [],
      };

      // Create escrows on both chains
      if (srcChain === "evm") {
        // EVM -> XRPL swap
        swap.srcEscrow = await this.createEVMEscrow(swap, "src");
        swap.dstEscrow = await this.createXRPLEscrow(swap, "dst");
      } else if (srcChain === "xrpl") {
        // XRPL -> EVM swap
        swap.srcEscrow = await this.createXRPLEscrow(swap, "src");
        swap.dstEscrow = await this.createEVMEscrow(swap, "dst");
      } else {
        throw new Error(`Unsupported source chain: ${srcChain}`);
      }

      swap.status = "escrows_created";
      this.activeSwaps.set(swapId, swap);

      console.log(`✅ Swap ${swapId} created successfully`);
      return {
        swapId,
        orderHash,
        hashlock,
        srcEscrow: swap.srcEscrow,
        dstEscrow: swap.dstEscrow,
        timelocks,
      };
    } catch (error) {
      console.error(`❌ Failed to create swap ${swapId}:`, error.message);
      throw error;
    }
  }

  /**
   * Calculate timelocks for the swap
   * @param {number} deployedAt - Deployment timestamp
   * @param {string} srcChain - Source chain
   * @returns {Object} Timelocks configuration
   */
  calculateTimelocks(deployedAt, srcChain) {
    const config = this.config;

    if (srcChain === "evm") {
      // EVM -> XRPL: EVM is source, XRPL is destination
      return {
        0: deployedAt + config.srcWithdrawalDelay, // SrcWithdrawal
        1: deployedAt + config.srcWithdrawalDelay + 300, // SrcPublicWithdrawal
        2: deployedAt + config.defaultTimeout - config.cancellationGracePeriod, // SrcCancellation
        3: deployedAt + config.defaultTimeout, // SrcPublicCancellation
        4: deployedAt + config.dstWithdrawalDelay, // DstWithdrawal
        5: deployedAt + config.dstWithdrawalDelay + 300, // DstPublicWithdrawal
        6: deployedAt + config.defaultTimeout - config.cancellationGracePeriod, // DstCancellation
      };
    } else {
      // XRPL -> EVM: XRPL is source, EVM is destination
      return {
        0: deployedAt + config.srcWithdrawalDelay, // SrcWithdrawal
        1: deployedAt + config.srcWithdrawalDelay + 300, // SrcPublicWithdrawal
        2: deployedAt + config.defaultTimeout - config.cancellationGracePeriod, // SrcCancellation
        3: deployedAt + config.defaultTimeout, // SrcPublicCancellation
        4: deployedAt + config.dstWithdrawalDelay, // DstWithdrawal
        5: deployedAt + config.dstWithdrawalDelay + 300, // DstPublicWithdrawal
        6: deployedAt + config.defaultTimeout - config.cancellationGracePeriod, // DstCancellation
      };
    }
  }

  /**
   * Create EVM escrow
   * @param {Object} swap - Swap object
   * @param {string} type - "src" or "dst"
   * @returns {Promise<Object>} EVM escrow details
   */
  async createEVMEscrow(swap, type) {
    const isSource = type === "src";
    const amount = isSource ? swap.srcAmount : swap.dstAmount;
    const token = isSource ? swap.srcToken : swap.dstToken;
    const timelock = isSource ? swap.timelocks[2] : swap.timelocks[6]; // Cancellation timelock

    // Use appropriate EVM addresses
    const maker = swap.evmMaker || swap.maker;
    const taker = swap.evmTaker || swap.taker;

    const escrowParams = {
      hashlock: swap.hashlock,
      timelock,
      maker: maker,
      taker: taker,
      token,
      amount,
      safetyDeposit: swap.safetyDeposit,
    };

    console.log(`🔧 Creating EVM ${type} escrow...`);
    const deployment = await this.evmClient.deployEscrow(
      escrowParams,
      swap.orderHash
    );

    return {
      type: "evm",
      address: deployment.escrowAddress,
      transactionHash: deployment.transactionHash,
      requiredAmount: amount,
      token,
      timelock,
    };
  }

  /**
   * Create XRPL escrow
   * @param {Object} swap - Swap object
   * @param {string} type - "src" or "dst"
   * @returns {Promise<Object>} XRPL escrow details
   */
  async createXRPLEscrow(swap, type) {
    const isSource = type === "src";
    const amount = isSource ? swap.srcAmount : swap.dstAmount;
    const token = isSource ? swap.srcToken : swap.dstToken;

    // Use appropriate XRPL addresses
    const maker = swap.xrplMaker || swap.maker;
    const taker = swap.xrplTaker || swap.taker;

    // Pack timelocks for XRPL
    const packedTimelocks = XRPLEscrowUtils.packTimelocks(
      swap.timelocks,
      swap.createdAt
    );

    const escrowData = {
      orderHash: swap.orderHash,
      hashlock: swap.hashlock,
      maker: maker,
      taker: taker,
      token,
      amount,
      safetyDeposit: swap.safetyDeposit,
      timelocks: packedTimelocks,
      type: type,
    };

    console.log(`🔧 Creating XRPL ${type} escrow...`);
    const result = await this.xrplClient.createDestinationEscrow(escrowData);

    return {
      type: "xrpl",
      id: result.escrowId,
      walletAddress: result.walletAddress,
      requiredDeposit: result.requiredDeposit,
      timelocks: result.timelocks,
    };
  }

  /**
   * Fund source escrow (initiates the swap)
   * @param {string} swapId - Swap ID
   * @param {Object} fundingData - Funding transaction details
   * @returns {Promise<Object>} Funding result
   */
  async fundSourceEscrow(swapId, fundingData) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    if (swap.status !== "escrows_created") {
      throw new Error(`Invalid swap status: ${swap.status}`);
    }

    console.log(`💰 Funding source escrow for swap ${swapId}`);

    try {
      let result;

      if (swap.srcEscrow.type === "evm") {
        // Fund EVM escrow
        if (swap.srcToken !== "0x0000000000000000000000000000000000000000") {
          // ERC20 - approve first
          await this.evmClient.approveToken(
            swap.srcToken,
            swap.srcEscrow.address,
            swap.srcAmount
          );
        }

        result = await this.evmClient.fundEscrow(
          swap.srcEscrow.address,
          swap.srcToken,
          swap.srcAmount
        );
      } else {
        // Fund XRPL escrow
        result = await this.xrplClient.fundEscrow(
          swap.srcEscrow.id,
          fundingData
        );
      }

      swap.status = "source_funded";
      swap.transactions.push({
        type: "source_funding",
        hash: result.transactionHash,
        timestamp: Date.now(),
      });

      console.log(`✅ Source escrow funded for swap ${swapId}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to fund source escrow for swap ${swapId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Fund destination escrow
   * @param {string} swapId - Swap ID
   * @param {Object} fundingData - Funding transaction details
   * @returns {Promise<Object>} Funding result
   */
  async fundDestinationEscrow(swapId, fundingData) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    if (swap.status !== "source_funded") {
      throw new Error(`Invalid swap status: ${swap.status}`);
    }

    console.log(`💰 Funding destination escrow for swap ${swapId}`);

    try {
      let result;

      if (swap.dstEscrow.type === "evm") {
        // Fund EVM escrow
        if (swap.dstToken !== "0x0000000000000000000000000000000000000000") {
          // ERC20 - approve first
          await this.evmClient.approveToken(
            swap.dstToken,
            swap.dstEscrow.address,
            swap.dstAmount
          );
        }

        result = await this.evmClient.fundEscrow(
          swap.dstEscrow.address,
          swap.dstToken,
          swap.dstAmount
        );
      } else {
        // Fund XRPL escrow
        result = await this.xrplClient.fundEscrow(
          swap.dstEscrow.id,
          fundingData
        );
      }

      swap.status = "both_funded";
      swap.transactions.push({
        type: "destination_funding",
        hash: result.transactionHash,
        timestamp: Date.now(),
      });

      console.log(`✅ Destination escrow funded for swap ${swapId}`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to fund destination escrow for swap ${swapId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Execute withdrawal from destination escrow (reveals secret)
   * @param {string} swapId - Swap ID
   * @param {string} callerAddress - Address of the caller
   * @returns {Promise<Object>} Withdrawal result
   */
  async withdrawFromDestination(swapId, callerAddress) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    if (swap.status !== "both_funded") {
      throw new Error(`Invalid swap status: ${swap.status}`);
    }

    console.log(`🏦 Withdrawing from destination escrow for swap ${swapId}`);

    try {
      let result;

      if (swap.dstEscrow.type === "evm") {
        // Withdraw from EVM escrow
        result = await this.evmClient.withdrawFromEscrow(
          swap.dstEscrow.address,
          swap.secret,
          callerAddress
        );
      } else {
        // Withdraw from XRPL escrow
        result = await this.xrplClient.withdraw(
          swap.dstEscrow.id,
          swap.secret,
          callerAddress
        );
      }

      swap.status = "destination_withdrawn";
      swap.revealedSecret = swap.secret;
      swap.transactions.push({
        type: "destination_withdrawal",
        hash: result.transactionHash,
        timestamp: Date.now(),
        secret: swap.secret,
      });

      console.log(`✅ Destination escrow withdrawn for swap ${swapId}`);
      console.log(`🔓 Secret revealed: ${swap.secret}`);

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to withdraw from destination escrow for swap ${swapId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Execute withdrawal from source escrow (completes the swap)
   * @param {string} swapId - Swap ID
   * @param {string} secret - The revealed secret
   * @param {string} callerAddress - Address of the caller
   * @returns {Promise<Object>} Withdrawal result
   */
  async withdrawFromSource(swapId, secret, callerAddress) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    // Verify secret
    const expectedHashlock = EVMEscrowClient.hashSecret(secret);
    if (expectedHashlock.toLowerCase() !== swap.hashlock.toLowerCase()) {
      throw new Error("Invalid secret provided");
    }

    console.log(`🏦 Withdrawing from source escrow for swap ${swapId}`);

    try {
      let result;

      if (swap.srcEscrow.type === "evm") {
        // Withdraw from EVM escrow
        result = await this.evmClient.withdrawFromEscrow(
          swap.srcEscrow.address,
          secret,
          callerAddress
        );
      } else {
        // Withdraw from XRPL escrow
        result = await this.xrplClient.withdraw(
          swap.srcEscrow.id,
          secret,
          callerAddress
        );
      }

      swap.status = "completed";
      swap.completedAt = Date.now();
      swap.transactions.push({
        type: "source_withdrawal",
        hash: result.transactionHash,
        timestamp: Date.now(),
        secret,
      });

      // Move to history
      this.swapHistory.set(swapId, swap);
      this.activeSwaps.delete(swapId);

      console.log(`🎉 Swap ${swapId} completed successfully!`);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to withdraw from source escrow for swap ${swapId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Cancel a swap and return funds
   * @param {string} swapId - Swap ID
   * @param {string} callerAddress - Address of the caller
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSwap(swapId, callerAddress) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    console.log(`🚫 Cancelling swap ${swapId}`);

    try {
      const results = {};

      // Cancel source escrow if funded
      if (swap.status === "source_funded" || swap.status === "both_funded") {
        if (swap.srcEscrow.type === "evm") {
          results.srcCancel = await this.evmClient.cancelEscrow(
            swap.srcEscrow.address
          );
        } else {
          results.srcCancel = await this.xrplClient.cancel(
            swap.srcEscrow.id,
            callerAddress
          );
        }
      }

      // Cancel destination escrow if funded
      if (swap.status === "both_funded") {
        if (swap.dstEscrow.type === "evm") {
          results.dstCancel = await this.evmClient.cancelEscrow(
            swap.dstEscrow.address
          );
        } else {
          results.dstCancel = await this.xrplClient.cancel(
            swap.dstEscrow.id,
            callerAddress
          );
        }
      }

      swap.status = "cancelled";
      swap.cancelledAt = Date.now();
      swap.transactions.push({
        type: "cancellation",
        timestamp: Date.now(),
        results,
      });

      // Move to history
      this.swapHistory.set(swapId, swap);
      this.activeSwaps.delete(swapId);

      console.log(`✅ Swap ${swapId} cancelled successfully`);
      return results;
    } catch (error) {
      console.error(`❌ Failed to cancel swap ${swapId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get swap status and details
   * @param {string} swapId - Swap ID
   * @returns {Object} Swap details
   */
  getSwapStatus(swapId) {
    const swap = this.activeSwaps.get(swapId) || this.swapHistory.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    return {
      id: swap.id,
      orderHash: swap.orderHash,
      hashlock: swap.hashlock,
      status: swap.status,
      srcChain: swap.srcChain,
      dstChain: swap.dstChain,
      maker: swap.maker,
      taker: swap.taker,
      srcAmount: swap.srcAmount,
      dstAmount: swap.dstAmount,
      createdAt: swap.createdAt,
      completedAt: swap.completedAt,
      cancelledAt: swap.cancelledAt,
      srcEscrow: swap.srcEscrow,
      dstEscrow: swap.dstEscrow,
      transactions: swap.transactions,
      timelocks: swap.timelocks,
      revealedSecret: swap.revealedSecret ? "***REVEALED***" : undefined,
    };
  }

  /**
   * List all active swaps
   * @returns {Array} Active swaps
   */
  getActiveSwaps() {
    return Array.from(this.activeSwaps.keys()).map((swapId) =>
      this.getSwapStatus(swapId)
    );
  }

  /**
   * Execute complete swap workflow (for testing/demo)
   * @param {Object} swapParams - Swap parameters
   * @param {Object} fundingData - Funding transaction details
   * @returns {Promise<Object>} Complete swap result
   */
  async executeCompleteSwap(swapParams, fundingData) {
    console.log("🚀 Starting complete swap workflow...");

    try {
      // Step 1: Create swap
      const swapResult = await this.createSwap(swapParams);
      const { swapId } = swapResult;

      // Step 2: Fund source escrow
      await this.fundSourceEscrow(swapId, fundingData.source);

      // Step 3: Fund destination escrow
      await this.fundDestinationEscrow(swapId, fundingData.destination);

      // Step 4: Wait for withdrawal window
      console.log("⏳ Waiting for withdrawal window...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Step 5: Withdraw from destination (reveals secret)
      const dstCallerAddress =
        swapParams.xrplTaker || swapParams.taker || swapParams.evmTaker;
      await this.withdrawFromDestination(swapId, dstCallerAddress);

      // Step 6: Withdraw from source (completes swap)
      const swap = this.swapHistory.get(swapId) || this.activeSwaps.get(swapId);
      const srcCallerAddress =
        swapParams.evmMaker || swapParams.maker || swapParams.xrplMaker;
      await this.withdrawFromSource(swapId, swap.secret, srcCallerAddress);

      console.log("🎉 Complete swap workflow finished successfully!");
      return this.getSwapStatus(swapId);
    } catch (error) {
      console.error("❌ Complete swap workflow failed:", error.message);
      throw error;
    }
  }
}

module.exports = {
  CrossChainOrchestrator,
};
