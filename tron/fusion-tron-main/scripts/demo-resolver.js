#!/usr/bin/env node

/**
 * Demo script for testing the Advanced Cross-Chain Resolver
 * This script simulates cross-chain swaps and demonstrates resolver functionality
 */

const { ethers } = require("ethers");
const TronWeb = require("tronweb");
require("dotenv").config();

// Demo configuration
const DEMO_CONFIG = {
  ethAmount: "0.01", // 0.01 ETH
  tronAmount: "100", // 100 TRX
  secretHash: "0x" + "1".repeat(64), // Demo secret hash
  demoSecrets: [
    "0x" + "a".repeat(64),
    "0x" + "b".repeat(64),
    "0x" + "c".repeat(64),
  ],
};

class ResolverDemo {
  constructor() {
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    this.tronWeb = new TronWeb({
      fullHost: process.env.TRON_RPC_URL,
      privateKey:
        process.env.DEMO_PRIVATE_KEY || process.env.RESOLVER_PRIVATE_KEY,
    });
  }

  async runDemo() {
    console.log("🎬 Starting Fusion+ Resolver Demo");
    console.log("=====================================");

    try {
      // 1. Check resolver status
      await this.checkResolverStatus();

      // 2. Demo ETH → TRX swap
      console.log("\n📝 Demo 1: ETH → TRX Swap");
      await this.demoEthToTronSwap();

      // 3. Demo TRX → ETH swap
      console.log("\n📝 Demo 2: TRX → ETH Swap");
      await this.demoTronToEthSwap();

      // 4. Show performance metrics
      await this.showPerformanceMetrics();

      console.log("\n✅ Demo completed successfully!");
    } catch (error) {
      console.error("❌ Demo failed:", error.message);
      process.exit(1);
    }
  }

  async checkResolverStatus() {
    console.log("📊 Checking resolver status...");

    try {
      const response = await fetch(
        `http://localhost:${process.env.HEALTH_PORT || 3001}/status`
      );
      const status = await response.json();

      console.log("✅ Resolver Status:", {
        running: status.isRunning ? "🟢" : "🔴",
        activeSwaps: status.activeSwaps,
        successRate: `${(status.metrics.successRate * 100).toFixed(1)}%`,
        totalSwaps: status.metrics.totalSwaps,
      });
    } catch (error) {
      console.warn(
        "⚠️  Could not connect to resolver status endpoint. Make sure resolver is running."
      );
    }
  }

  async demoEthToTronSwap() {
    console.log("🔄 Simulating ETH → TRX swap...");

    // In a real scenario, this would:
    // 1. Create escrow on Ethereum
    // 2. Resolver detects the event
    // 3. Resolver creates mirror escrow on Tron
    // 4. User reveals secret to claim TRX
    // 5. Resolver uses secret to claim ETH

    const steps = [
      "📝 Creating Ethereum escrow with 0.01 ETH...",
      "⏳ Waiting for Ethereum finality (20 blocks)...",
      "🔄 Resolver creating Tron mirror escrow...",
      "🔓 User revealing secret to claim TRX...",
      "✅ Resolver claiming ETH with revealed secret...",
      "🎉 Swap completed successfully!",
    ];

    for (let i = 0; i < steps.length; i++) {
      console.log(`  ${i + 1}. ${steps[i]}`);
      await this.sleep(1000 + Math.random() * 2000); // Random delay 1-3s
    }

    console.log("📊 Swap Metrics:");
    console.log("  • Duration: ~90 seconds");
    console.log("  • Gas Used: ~120,000");
    console.log("  • Success: ✅");
  }

  async demoTronToEthSwap() {
    console.log("🔄 Simulating TRX → ETH swap...");

    const steps = [
      "📝 Creating Tron escrow with 100 TRX...",
      "⏳ Waiting for Tron finality (12 blocks)...",
      "🔄 Resolver creating Ethereum mirror escrow...",
      "🔓 User revealing secret to claim ETH...",
      "✅ Resolver claiming TRX with revealed secret...",
      "🎉 Reverse swap completed successfully!",
    ];

    for (let i = 0; i < steps.length; i++) {
      console.log(`  ${i + 1}. ${steps[i]}`);
      await this.sleep(800 + Math.random() * 1500); // Random delay 0.8-2.3s
    }

    console.log("📊 Swap Metrics:");
    console.log("  • Duration: ~75 seconds");
    console.log("  • Energy Used: ~85,000");
    console.log("  • Success: ✅");
  }

  async showPerformanceMetrics() {
    console.log("\n📈 Overall Performance Metrics");
    console.log("================================");

    // Simulated metrics for demo
    const metrics = {
      totalSwaps: 47,
      successRate: 100,
      averageLatency: 87.3,
      totalVolume: "12.4 ETH",
      uptime: "4h 23m",
      activeSwaps: 0,
    };

    console.log(`📊 Total Swaps: ${metrics.totalSwaps}`);
    console.log(`✅ Success Rate: ${metrics.successRate}%`);
    console.log(`⚡ Avg Latency: ${metrics.averageLatency}s`);
    console.log(`💰 Total Volume: ${metrics.totalVolume}`);
    console.log(`⏱️  Uptime: ${metrics.uptime}`);
    console.log(`🔄 Active Swaps: ${metrics.activeSwaps}`);
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const demo = new ResolverDemo();
  await demo.runDemo();
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ResolverDemo };
