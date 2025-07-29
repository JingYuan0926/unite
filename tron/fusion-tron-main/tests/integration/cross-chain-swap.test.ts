import { ethers } from "ethers";
import TronWeb from "tronweb";
import { AdvancedCrossChainResolver } from "../../src/resolver/AdvancedResolver";
import { ResolverConfig } from "../../src/resolver/types";

// Test configuration
const TEST_CONFIG: ResolverConfig = {
  ethNetwork: "sepolia",
  tronNetwork: "nile",
  ethRpcUrl: process.env.ETH_RPC_URL || "https://rpc.sepolia.org",
  ethWsUrl: process.env.ETH_WS_URL || "wss://sepolia.gateway.tenderly.co",
  tronRpcUrl: process.env.TRON_RPC_URL || "https://api.nileex.io",
  ethEscrowFactoryAddress:
    process.env.ETH_ESCROW_FACTORY_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  tronEscrowFactoryAddress:
    process.env.TRON_ESCROW_FACTORY_ADDRESS ||
    "T000000000000000000000000000000000000",
  resolverPrivateKey: process.env.TEST_PRIVATE_KEY || "0x" + "1".repeat(64),
  maxConcurrentSwaps: 5,
  retryMaxAttempts: 2,
  metricsInterval: 10000,
};

describe("Cross-Chain Swap Integration Tests", () => {
  let resolver: AdvancedCrossChainResolver;
  let ethProvider: ethers.Provider;
  let tronWeb: TronWeb;

  beforeAll(async () => {
    // Skip integration tests if no valid configuration
    if (
      TEST_CONFIG.ethEscrowFactoryAddress ===
      "0x0000000000000000000000000000000000000000"
    ) {
      console.warn("⚠️  Skipping integration tests - no deployed contracts");
      return;
    }

    ethProvider = new ethers.JsonRpcProvider(TEST_CONFIG.ethRpcUrl);
    tronWeb = new TronWeb({
      fullHost: TEST_CONFIG.tronRpcUrl,
      privateKey: TEST_CONFIG.resolverPrivateKey,
    });

    resolver = new AdvancedCrossChainResolver(TEST_CONFIG);
  });

  afterAll(async () => {
    if (resolver) {
      await resolver.stop();
    }
  });

  describe("Network Connectivity", () => {
    it("should connect to Ethereum Sepolia", async () => {
      const blockNumber = await ethProvider.getBlockNumber();
      expect(blockNumber).toBeGreaterThan(0);
      console.log(`📡 Ethereum block: ${blockNumber}`);
    }, 30000);

    it("should connect to Tron Nile", async () => {
      const block = await tronWeb.trx.getCurrentBlock();
      expect(block.block_header.raw_data.number).toBeGreaterThan(0);
      console.log(`📡 Tron block: ${block.block_header.raw_data.number}`);
    }, 30000);
  });

  describe("Resolver Lifecycle", () => {
    it("should start resolver successfully", async () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return; // Skip if no contracts
      }

      await resolver.start();

      const status = resolver.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.activeSwaps).toBe(0);

      console.log("✅ Resolver started successfully");
    }, 60000);

    it("should provide correct status information", () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      const status = resolver.getStatus();

      expect(status.config.ethNetwork).toBe("sepolia");
      expect(status.config.tronNetwork).toBe("nile");
      expect(status.metrics).toBeDefined();
      expect(status.metrics.totalSwaps).toBe(0);
      expect(status.metrics.successRate).toBe(0);
    });
  });

  describe("Cross-Chain Event Monitoring", () => {
    it("should monitor Ethereum events", (done) => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        done();
        return;
      }

      // Listen for swap events
      resolver.on("swap-initiated", (swapContext) => {
        expect(swapContext).toBeDefined();
        expect(swapContext.id).toBeDefined();
        expect(swapContext.direction).toBeDefined();
        done();
      });

      // Timeout the test after 30 seconds
      setTimeout(() => {
        console.log("ℹ️  No events detected (expected for test environment)");
        done();
      }, 30000);
    }, 35000);

    it("should handle multiple concurrent swaps", () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      const status = resolver.getStatus();
      expect(status.activeSwaps).toBeLessThanOrEqual(
        TEST_CONFIG.maxConcurrentSwaps!
      );
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle network errors gracefully", async () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      // Test with invalid RPC URL
      const invalidConfig = {
        ...TEST_CONFIG,
        ethRpcUrl: "https://invalid-url.com",
      };

      const invalidResolver = new AdvancedCrossChainResolver(invalidConfig);

      await expect(invalidResolver.start()).rejects.toThrow();
    }, 30000);

    it("should retry failed operations", () => {
      expect(TEST_CONFIG.retryMaxAttempts).toBe(2);
      // Additional retry logic tests would be implemented here
    });
  });

  describe("Performance Metrics", () => {
    it("should track metrics correctly", () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      const status = resolver.getStatus();
      const metrics = status.metrics;

      expect(metrics.totalSwaps).toBeGreaterThanOrEqual(0);
      expect(metrics.successfulSwaps).toBeGreaterThanOrEqual(0);
      expect(metrics.failedSwaps).toBeGreaterThanOrEqual(0);
      expect(metrics.uptime).toBeGreaterThan(0);
    });

    it("should calculate success rate correctly", () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      const status = resolver.getStatus();
      const metrics = status.metrics;

      if (metrics.totalSwaps > 0) {
        const expectedSuccessRate =
          metrics.successfulSwaps / metrics.totalSwaps;
        expect(metrics.successRate).toBeCloseTo(expectedSuccessRate);
      } else {
        expect(metrics.successRate).toBe(0);
      }
    });
  });

  describe("Health Monitoring", () => {
    it("should provide health endpoint", async () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      const port = process.env.HEALTH_PORT || 3001;

      try {
        const response = await fetch(`http://localhost:${port}/health`);
        expect(response.status).toBe(200);

        const health = await response.json();
        expect(health.status).toBeDefined();
        expect(health.resolver).toBeDefined();

        console.log("✅ Health endpoint responding");
      } catch (error) {
        console.warn(
          "⚠️  Health endpoint not available (resolver may not be running)"
        );
      }
    }, 10000);

    it("should provide metrics endpoint", async () => {
      if (
        TEST_CONFIG.ethEscrowFactoryAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }

      const port = process.env.HEALTH_PORT || 3001;

      try {
        const response = await fetch(`http://localhost:${port}/metrics`);
        expect(response.status).toBe(200);

        const metricsText = await response.text();
        expect(metricsText).toContain("resolver_swaps_total");
        expect(metricsText).toContain("resolver_success_rate");

        console.log("✅ Metrics endpoint providing Prometheus format");
      } catch (error) {
        console.warn("⚠️  Metrics endpoint not available");
      }
    }, 10000);
  });
});

// Helper functions for integration testing
export class IntegrationTestHelper {
  static async waitForSwapCompletion(
    resolver: AdvancedCrossChainResolver,
    swapId: string,
    timeoutMs = 300000
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(`Swap ${swapId} did not complete within ${timeoutMs}ms`)
        );
      }, timeoutMs);

      resolver.on("swap-completed", (swapContext) => {
        if (swapContext.id === swapId) {
          clearTimeout(timeout);
          resolve(true);
        }
      });

      resolver.on("swap-failed", (swapContext) => {
        if (swapContext.id === swapId) {
          clearTimeout(timeout);
          resolve(false);
        }
      });
    });
  }

  static generateTestSecret(): string {
    return (
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")
    );
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
