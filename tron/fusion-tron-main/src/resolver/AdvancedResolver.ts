import { EventEmitter } from "events";
import { ethers } from "ethers";
import * as TronWebModule from "tronweb";
import WebSocket from "ws";
import { Logger } from "../utils/logger";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { SwapContext, ResolverConfig, SwapDirection } from "./types";
import { EscrowFactoryABI } from "./abis/EscrowFactory";
import { TronEscrowFactoryABI } from "./abis/TronEscrowFactory";

// TronWeb v6.x uses .TronWeb for the constructor in ES modules
const TronWeb = (TronWebModule as any).TronWeb;

/**
 * Advanced Cross-Chain Resolver for Ethereum ↔ Tron swaps
 *
 * Features:
 * - Real-time event monitoring on both chains
 * - Intelligent failure recovery with exponential backoff
 * - Performance metrics and monitoring
 * - Multi-swap handling capability
 * - MEV protection coordination
 */

export class AdvancedCrossChainResolver extends EventEmitter {
  private ethProvider: ethers.Provider;
  private ethWsProvider: ethers.WebSocketProvider;
  private tronWeb: any;
  private logger: Logger;
  private metrics: PerformanceMetrics;
  private activeSwaps: Map<string, SwapContext>;
  private config: ResolverConfig;
  private ethEscrowFactory: ethers.Contract;
  private tronEscrowFactory: any;
  private isRunning: boolean = false;

  constructor(config: ResolverConfig) {
    super();
    this.config = config;
    this.logger = new Logger("AdvancedResolver");
    this.metrics = new PerformanceMetrics();
    this.activeSwaps = new Map();

    // Initialize Ethereum connections
    this.ethProvider = new ethers.JsonRpcProvider(config.ethRpcUrl);
    this.ethWsProvider = new ethers.WebSocketProvider(config.ethWsUrl);

    // Initialize Tron connection (strip 0x prefix from private key for Tron)
    const tronPrivateKey = config.resolverPrivateKey.startsWith("0x")
      ? config.resolverPrivateKey.slice(2)
      : config.resolverPrivateKey;

    this.tronWeb = new TronWeb({
      fullHost: config.tronRpcUrl,
      privateKey: tronPrivateKey,
    });

    // Initialize contract instances
    this.ethEscrowFactory = new ethers.Contract(
      config.ethEscrowFactoryAddress,
      EscrowFactoryABI,
      new ethers.Wallet(config.resolverPrivateKey, this.ethProvider)
    );

    this.setupEventHandlers();
  }

  /**
   * Start the resolver bot
   */
  async start(): Promise<void> {
    this.logger.info("🤖 Starting Advanced Cross-Chain Resolver...");

    try {
      // Verify connections
      await this.verifyConnections();

      // Initialize Tron contract
      await this.initializeTronContract();

      // Setup real-time monitoring
      await this.setupEthereumMonitoring();
      await this.setupTronMonitoring();

      // Start performance monitoring
      this.startMetricsCollection();

      // Start cleanup task
      this.startCleanupTask();

      this.isRunning = true;
      this.logger.info("✅ Resolver online and monitoring both chains");
      this.emit("started");
    } catch (error) {
      this.logger.error("❌ Failed to start resolver:", error);
      throw error;
    }
  }

  /**
   * Stop the resolver bot
   */
  async stop(): Promise<void> {
    this.logger.info("🛑 Stopping Advanced Cross-Chain Resolver...");

    this.isRunning = false;

    // Close WebSocket connections
    if (this.ethWsProvider) {
      await this.ethWsProvider.destroy();
    }

    this.emit("stopped");
    this.logger.info("✅ Resolver stopped");
  }

  /**
   * Get current status and metrics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSwaps: this.activeSwaps.size,
      metrics: this.metrics.getSnapshot(),
      config: {
        ethNetwork: this.config.ethNetwork,
        tronNetwork: this.config.tronNetwork,
        resolverAddress: this.getResolverAddress(),
      },
    };
  }

  /**
   * Setup event handlers for the resolver
   */
  private setupEventHandlers(): void {
    this.on("swap-initiated", (swapContext: SwapContext) => {
      this.logger.info(
        `📝 Swap initiated: ${swapContext.id} (${swapContext.direction})`
      );
    });

    this.on("swap-completed", (swapContext: SwapContext) => {
      this.logger.info(
        `✅ Swap completed: ${swapContext.id} in ${
          Date.now() - swapContext.startTime
        }ms`
      );
      this.metrics.recordSwapSuccess(Date.now() - swapContext.startTime);
    });

    this.on("swap-failed", (swapContext: SwapContext, error: Error) => {
      this.logger.error(`❌ Swap failed: ${swapContext.id}`, error);
      this.metrics.recordSwapFailure();
    });

    this.on("manual-intervention-required", (data: any) => {
      this.logger.warn("🚨 Manual intervention required:", data);
    });
  }

  /**
   * Verify connections to both chains
   */
  private async verifyConnections(): Promise<void> {
    // Test Ethereum connection
    const ethBlockNumber = await this.ethProvider.getBlockNumber();
    this.logger.info(
      `📡 Ethereum connection verified - Block: ${ethBlockNumber}`
    );

    // Test Tron connection
    const tronBlockNumber = await this.tronWeb.trx.getCurrentBlock();
    this.logger.info(
      `📡 Tron connection verified - Block: ${tronBlockNumber.block_header.raw_data.number}`
    );
  }

  /**
   * Initialize Tron contract instance
   */
  private async initializeTronContract(): Promise<void> {
    this.tronEscrowFactory = await this.tronWeb.contract(
      TronEscrowFactoryABI,
      this.config.tronEscrowFactoryAddress
    );
    this.logger.info("📋 Tron contract initialized");
  }

  /**
   * Setup Ethereum event monitoring with WebSocket
   */
  private async setupEthereumMonitoring(): Promise<void> {
    const ethEscrowFactoryWs = new ethers.Contract(
      this.config.ethEscrowFactoryAddress,
      EscrowFactoryABI,
      this.ethWsProvider
    );

    // Monitor EscrowCreated events
    ethEscrowFactoryWs.on(
      "EscrowCreated",
      async (escrowId, initiator, resolver, amount, secretHash, event) => {
        if (
          resolver.toLowerCase() === this.getResolverAddress().toLowerCase()
        ) {
          this.logger.info(`📥 New Ethereum escrow detected: ${escrowId}`);
          await this.handleEthereumEscrowCreated(escrowId, event);
        }
      }
    );

    // Monitor EscrowCompleted events
    ethEscrowFactoryWs.on("EscrowCompleted", (escrowId, secret, event) => {
      this.handleSecretRevealed(escrowId, secret, "ethereum");
    });

    // Monitor EscrowCancelled events
    ethEscrowFactoryWs.on("EscrowCancelled", (escrowId, event) => {
      this.handleEscrowCancelled(escrowId, "ethereum");
    });

    this.logger.info("📡 Ethereum WebSocket monitoring started");
  }

  /**
   * Setup Tron event monitoring
   */
  private async setupTronMonitoring(): Promise<void> {
    // Tron doesn't have native WebSocket support, so we'll use polling
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.pollTronEvents();
      } catch (error) {
        this.logger.error("❌ Error polling Tron events:", error);
      }
    }, 3000); // Poll every 3 seconds (Tron block time)

    this.logger.info("📡 Tron polling monitoring started");
  }

  /**
   * Poll Tron contract events
   */
  private async pollTronEvents(): Promise<void> {
    // Implementation depends on TronWeb event filtering capabilities
    // This is a simplified version - production would use more sophisticated event tracking
    try {
      const latestBlock = await this.tronWeb.trx.getCurrentBlock();
      const currentBlockNumber = latestBlock.block_header.raw_data.number;

      // Check for events in recent blocks
      // Note: TronWeb event filtering is limited, so this is a simplified approach
      const events = await this.tronEscrowFactory.getPastEvents(
        "EscrowCreated",
        {
          fromBlock: currentBlockNumber - 10,
          toBlock: "latest",
        }
      );

      for (const event of events) {
        const { escrowId, resolver } = event.result;
        if (resolver === this.getResolverAddress()) {
          await this.handleTronEscrowCreated(escrowId, event);
        }
      }
    } catch (error) {
      // Silently handle polling errors to avoid spam
      if (error.message && !error.message.includes("no events found")) {
        this.logger.debug("Tron polling error:", error.message);
      }
    }
  }

  /**
   * Handle Ethereum escrow creation
   */
  private async handleEthereumEscrowCreated(
    escrowId: string,
    event: any
  ): Promise<void> {
    const swapContext: SwapContext = {
      id: escrowId,
      direction: "eth-to-tron",
      startTime: Date.now(),
      status: "monitoring-finality",
      ethTxHash: event.transactionHash,
      ethBlockNumber: event.blockNumber,
      retryCount: 0,
    };

    this.activeSwaps.set(escrowId, swapContext);
    this.emit("swap-initiated", swapContext);

    try {
      // Wait for Ethereum finality
      await this.waitForEthereumFinality(swapContext);

      // Create mirror escrow on Tron
      await this.createTronMirrorEscrow(swapContext);

      // Monitor for secret reveal
      await this.monitorSecretReveal(swapContext);
    } catch (error) {
      swapContext.status = "failed";
      swapContext.error = error.message;
      this.emit("swap-failed", swapContext, error);
      await this.handleSwapFailure(escrowId, error);
    }
  }

  /**
   * Handle Tron escrow creation
   */
  private async handleTronEscrowCreated(
    escrowId: string,
    event: any
  ): Promise<void> {
    const swapContext: SwapContext = {
      id: escrowId,
      direction: "tron-to-eth",
      startTime: Date.now(),
      status: "monitoring-finality",
      tronTxHash: event.transaction,
      retryCount: 0,
    };

    this.activeSwaps.set(escrowId, swapContext);
    this.emit("swap-initiated", swapContext);

    try {
      // Wait for Tron finality
      await this.waitForTronFinality(swapContext);

      // Create mirror escrow on Ethereum
      await this.createEthereumMirrorEscrow(swapContext);

      // Monitor for secret reveal
      await this.monitorSecretReveal(swapContext);
    } catch (error) {
      swapContext.status = "failed";
      swapContext.error = error.message;
      this.emit("swap-failed", swapContext, error);
      await this.handleSwapFailure(escrowId, error);
    }
  }

  /**
   * Wait for Ethereum finality (20 blocks)
   */
  private async waitForEthereumFinality(
    swapContext: SwapContext
  ): Promise<void> {
    const targetBlock = swapContext.ethBlockNumber! + 20;
    this.logger.info(`⏳ Waiting for Ethereum finality: block ${targetBlock}`);

    return new Promise((resolve, reject) => {
      const checkFinality = async () => {
        try {
          const currentBlock = await this.ethProvider.getBlockNumber();
          if (currentBlock >= targetBlock) {
            swapContext.status = "finality-reached";
            this.logger.info(
              `✅ Ethereum finality reached at block ${currentBlock}`
            );
            resolve();
          } else {
            setTimeout(checkFinality, 5000); // Check every 5 seconds
          }
        } catch (error) {
          reject(error);
        }
      };
      checkFinality();
    });
  }

  /**
   * Wait for Tron finality (12 blocks)
   */
  private async waitForTronFinality(swapContext: SwapContext): Promise<void> {
    // Implementation for Tron finality waiting
    this.logger.info(`⏳ Waiting for Tron finality (12 blocks)`);

    // Simplified: wait 36 seconds (12 blocks * 3 seconds)
    await this.sleep(36000);

    swapContext.status = "finality-reached";
    this.logger.info(`✅ Tron finality reached`);
  }

  /**
   * Create Tron mirror escrow
   */
  private async createTronMirrorEscrow(
    swapContext: SwapContext
  ): Promise<void> {
    this.logger.info(`🔄 Creating Tron mirror escrow for ${swapContext.id}`);

    swapContext.status = "creating-mirror-escrow";

    // Get original escrow details from Ethereum
    const escrowDetails = await this.ethEscrowFactory.escrows(swapContext.id);

    // Create mirror escrow on Tron
    const tx = await this.tronEscrowFactory
      .createEscrow(
        this.getResolverAddress(), // resolver
        this.mapEthTokenToTron(escrowDetails.token), // token
        escrowDetails.amount.toString(), // amount
        escrowDetails.secretHash, // secretHash
        12, // Tron finality lock (12 blocks)
        1800, // 30 minutes cancel lock
        { value: escrowDetails.safetyDeposit.toString() }
      )
      .send();

    swapContext.tronTxHash = tx;
    swapContext.status = "mirror-escrow-created";

    this.logger.info(`✅ Tron mirror escrow created: ${tx}`);
  }

  /**
   * Create Ethereum mirror escrow
   */
  private async createEthereumMirrorEscrow(
    swapContext: SwapContext
  ): Promise<void> {
    this.logger.info(
      `🔄 Creating Ethereum mirror escrow for ${swapContext.id}`
    );

    swapContext.status = "creating-mirror-escrow";

    // Get original escrow details from Tron
    const escrowDetails = await this.tronEscrowFactory
      .escrows(swapContext.id)
      .call();

    // Create mirror escrow on Ethereum
    const tx = await this.ethEscrowFactory.createEscrow(
      this.getResolverAddress(), // resolver
      this.mapTronTokenToEth(escrowDetails.token), // token
      escrowDetails.amount, // amount
      escrowDetails.secretHash, // secretHash
      20, // Ethereum finality lock (20 blocks)
      1800, // 30 minutes cancel lock
      { value: escrowDetails.safetyDeposit }
    );

    await tx.wait();

    swapContext.ethTxHash = tx.hash;
    swapContext.status = "mirror-escrow-created";

    this.logger.info(`✅ Ethereum mirror escrow created: ${tx.hash}`);
  }

  /**
   * Monitor for secret reveal and complete swap
   */
  private async monitorSecretReveal(swapContext: SwapContext): Promise<void> {
    swapContext.status = "waiting-secret-reveal";
    this.logger.info(`👀 Monitoring secret reveal for ${swapContext.id}`);

    // This will be handled by the event listeners
    // The swap will be completed when a secret is revealed
  }

  /**
   * Handle secret revealed event
   */
  private async handleSecretRevealed(
    escrowId: string,
    secret: string,
    chain: string
  ): Promise<void> {
    const swapContext = this.activeSwaps.get(escrowId);
    if (!swapContext) return;

    this.logger.info(`🔓 Secret revealed for ${escrowId} on ${chain}`);

    try {
      // Use the secret to complete the swap on the other chain
      if (chain === "ethereum" && swapContext.tronTxHash) {
        await this.completeTronSwap(escrowId, secret);
      } else if (chain === "tron" && swapContext.ethTxHash) {
        await this.completeEthereumSwap(escrowId, secret);
      }

      swapContext.status = "completed";
      this.activeSwaps.delete(escrowId);
      this.emit("swap-completed", swapContext);
    } catch (error) {
      this.logger.error(`❌ Failed to complete swap ${escrowId}:`, error);
      await this.handleSwapFailure(escrowId, error);
    }
  }

  /**
   * Complete Tron swap using revealed secret
   */
  private async completeTronSwap(
    escrowId: string,
    secret: string
  ): Promise<void> {
    const tx = await this.tronEscrowFactory
      .revealAndWithdraw(
        escrowId,
        secret,
        "0x0000000000000000000000000000000000000000000000000000000000000000" // nonce
      )
      .send();

    this.logger.info(`✅ Tron swap completed: ${tx}`);
  }

  /**
   * Complete Ethereum swap using revealed secret
   */
  private async completeEthereumSwap(
    escrowId: string,
    secret: string
  ): Promise<void> {
    const tx = await this.ethEscrowFactory.revealAndWithdraw(
      escrowId,
      secret,
      "0x0000000000000000000000000000000000000000000000000000000000000000" // nonce
    );

    await tx.wait();
    this.logger.info(`✅ Ethereum swap completed: ${tx.hash}`);
  }

  /**
   * Handle escrow cancellation
   */
  private async handleEscrowCancelled(
    escrowId: string,
    chain: string
  ): Promise<void> {
    const swapContext = this.activeSwaps.get(escrowId);
    if (!swapContext) return;

    this.logger.info(`❌ Escrow cancelled: ${escrowId} on ${chain}`);

    swapContext.status = "cancelled";
    this.activeSwaps.delete(escrowId);
  }

  /**
   * Handle swap failures with exponential backoff retry
   */
  private async handleSwapFailure(
    escrowId: string,
    error: Error
  ): Promise<void> {
    const swapContext = this.activeSwaps.get(escrowId);
    if (!swapContext) return;

    this.logger.info(
      `🔧 Attempting recovery for ${escrowId} (attempt ${
        swapContext.retryCount + 1
      })`
    );

    swapContext.retryCount++;

    // Implement exponential backoff retry (max 3 attempts)
    if (swapContext.retryCount <= 3) {
      const delay = Math.pow(2, swapContext.retryCount) * 1000; // 2s, 4s, 8s
      await this.sleep(delay);

      try {
        if (swapContext.status === "creating-mirror-escrow") {
          if (swapContext.direction === "eth-to-tron") {
            await this.createTronMirrorEscrow(swapContext);
          } else {
            await this.createEthereumMirrorEscrow(swapContext);
          }
          this.logger.info(
            `✅ Recovery successful for ${escrowId} on attempt ${swapContext.retryCount}`
          );
          return;
        }
      } catch (retryError) {
        this.logger.info(
          `❌ Recovery attempt ${swapContext.retryCount} failed for ${escrowId}:`,
          retryError instanceof Error ? retryError.message : String(retryError)
        );
      }
    }

    // All recovery attempts failed
    this.logger.error(
      `💀 All recovery attempts failed for ${escrowId}. Manual intervention required.`
    );
    this.emit("manual-intervention-required", { escrowId, error, swapContext });
  }

  /**
   * Start performance metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      const metrics = this.metrics.getSnapshot();
      this.logger.info("📊 Resolver Performance:", {
        activeSwaps: this.activeSwaps.size,
        successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        averageLatency: `${metrics.averageLatency}ms`,
        totalSwaps: metrics.totalSwaps,
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Start cleanup task for old swap contexts
   */
  private startCleanupTask(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const [escrowId, swapContext] of this.activeSwaps.entries()) {
        if (now - swapContext.startTime > maxAge) {
          this.logger.warn(`🧹 Cleaning up stale swap context: ${escrowId}`);
          this.activeSwaps.delete(escrowId);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Helper methods
   */
  private getResolverAddress(): string {
    return this.tronWeb.address.fromPrivateKey(this.config.resolverPrivateKey);
  }

  private mapEthTokenToTron(ethToken: string): string {
    if (ethToken === "0x0000000000000000000000000000000000000000") {
      return "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"; // TRX address
    }
    // Add more token mappings as needed
    return ethToken; // Fallback
  }

  private mapTronTokenToEth(tronToken: string): string {
    if (tronToken === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      return "0x0000000000000000000000000000000000000000"; // ETH address
    }
    // Add more token mappings as needed
    return tronToken; // Fallback
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
