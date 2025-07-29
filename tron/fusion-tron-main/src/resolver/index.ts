#!/usr/bin/env node

import * as dotenv from "dotenv";
import { AdvancedCrossChainResolver } from "./AdvancedResolver";
import { ResolverConfig } from "./types";
import { Logger } from "../utils/logger";

// Load environment variables
dotenv.config();

const logger = new Logger("ResolverMain");

/**
 * Main resolver application entry point
 */
async function main() {
  logger.info("🚀 Starting Fusion+ Cross-Chain Resolver...");

  // Validate environment
  const config = validateAndLoadConfig();

  // Create resolver instance
  const resolver = new AdvancedCrossChainResolver(config);

  // Setup graceful shutdown
  setupGracefulShutdown(resolver);

  // Setup health monitoring
  setupHealthMonitoring(resolver);

  try {
    // Start the resolver
    await resolver.start();

    logger.info("✅ Resolver successfully started and monitoring both chains");
    logger.info(
      `📊 Status endpoint available at: http://localhost:${
        process.env.HEALTH_PORT || 3001
      }/status`
    );
  } catch (error) {
    logger.error("❌ Failed to start resolver:", error);
    process.exit(1);
  }
}

/**
 * Validate environment variables and create config
 */
function validateAndLoadConfig(): ResolverConfig {
  const requiredEnvVars = [
    "ETH_RPC_URL",
    "ETH_WS_URL",
    "TRON_RPC_URL",
    "ETH_ESCROW_FACTORY_ADDRESS",
    "TRON_ESCROW_FACTORY_ADDRESS",
    "RESOLVER_PRIVATE_KEY",
  ];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    ethNetwork: process.env.ETH_NETWORK || "sepolia",
    tronNetwork: process.env.TRON_NETWORK || "nile",
    ethRpcUrl: process.env.ETH_RPC_URL!,
    ethWsUrl: process.env.ETH_WS_URL!,
    tronRpcUrl: process.env.TRON_RPC_URL!,
    ethEscrowFactoryAddress: process.env.ETH_ESCROW_FACTORY_ADDRESS!,
    tronEscrowFactoryAddress: process.env.TRON_ESCROW_FACTORY_ADDRESS!,
    resolverPrivateKey: process.env.RESOLVER_PRIVATE_KEY!,
    maxConcurrentSwaps: parseInt(process.env.MAX_CONCURRENT_SWAPS || "10"),
    retryMaxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || "3"),
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || "30000"),
  };
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(resolver: AdvancedCrossChainResolver) {
  const shutdown = async (signal: string) => {
    logger.info(`📨 Received ${signal}. Gracefully shutting down...`);

    try {
      await resolver.stop();
      logger.info("✅ Resolver stopped successfully");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGUSR2", () => shutdown("SIGUSR2")); // nodemon restart
}

/**
 * Setup health monitoring HTTP server
 */
function setupHealthMonitoring(resolver: AdvancedCrossChainResolver) {
  const express = require("express");
  const app = express();
  const port = process.env.HEALTH_PORT || 3001;

  app.use(express.json());

  // Health check endpoint
  app.get("/health", (req: any, res: any) => {
    const status = resolver.getStatus();
    const statusCode = status.isRunning ? 200 : 503;

    res.status(statusCode).json({
      status: status.isRunning ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      resolver: status,
    });
  });

  // Detailed status endpoint
  app.get("/status", (req: any, res: any) => {
    const status = resolver.getStatus();
    res.json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      ...status,
    });
  });

  // Metrics endpoint (Prometheus format)
  app.get("/metrics", (req: any, res: any) => {
    const status = resolver.getStatus();
    const metrics = status.metrics;

    const prometheusMetrics = `
# HELP resolver_swaps_total Total number of swaps processed
# TYPE resolver_swaps_total counter
resolver_swaps_total ${metrics.totalSwaps}

# HELP resolver_swaps_successful_total Total number of successful swaps
# TYPE resolver_swaps_successful_total counter
resolver_swaps_successful_total ${metrics.successfulSwaps}

# HELP resolver_swaps_failed_total Total number of failed swaps
# TYPE resolver_swaps_failed_total counter
resolver_swaps_failed_total ${metrics.failedSwaps}

# HELP resolver_success_rate Current success rate
# TYPE resolver_success_rate gauge
resolver_success_rate ${metrics.successRate}

# HELP resolver_average_latency_ms Average swap latency in milliseconds
# TYPE resolver_average_latency_ms gauge
resolver_average_latency_ms ${metrics.averageLatency}

# HELP resolver_active_swaps Current number of active swaps
# TYPE resolver_active_swaps gauge
resolver_active_swaps ${metrics.activeSwaps}

# HELP resolver_uptime_seconds Resolver uptime in seconds
# TYPE resolver_uptime_seconds counter
resolver_uptime_seconds ${metrics.uptime / 1000}
    `.trim();

    res.set("Content-Type", "text/plain");
    res.send(prometheusMetrics);
  });

  // Force stop endpoint (for debugging)
  app.post("/admin/stop", async (req: any, res: any) => {
    logger.warn("🛑 Force stop requested via API");
    res.json({ message: "Stopping resolver..." });

    setTimeout(async () => {
      await resolver.stop();
      process.exit(0);
    }, 1000);
  });

  // Start health monitoring server
  app.listen(port, () => {
    logger.info(`📈 Health monitoring server started on port ${port}`);
  });
}

/**
 * Handle uncaught exceptions and rejections
 */
process.on("uncaughtException", (error) => {
  logger.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
if (require.main === module) {
  main().catch((error) => {
    logger.error("💥 Failed to start resolver:", error);
    process.exit(1);
  });
}

export { AdvancedCrossChainResolver };
export * from "./types";
