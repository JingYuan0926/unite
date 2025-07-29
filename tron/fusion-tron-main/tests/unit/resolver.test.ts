import { AdvancedCrossChainResolver } from "../../src/resolver/AdvancedResolver";
import { PerformanceMetrics } from "../../src/resolver/PerformanceMetrics";
import { ResolverConfig } from "../../src/resolver/types";

describe("AdvancedCrossChainResolver", () => {
  let mockConfig: ResolverConfig;

  beforeEach(() => {
    mockConfig = {
      ethNetwork: "sepolia",
      tronNetwork: "nile",
      ethRpcUrl: "https://rpc.sepolia.org",
      ethWsUrl: "wss://sepolia.gateway.tenderly.co",
      tronRpcUrl: "https://api.nileex.io",
      ethEscrowFactoryAddress: "0x1234567890123456789012345678901234567890",
      tronEscrowFactoryAddress: "T123456789012345678901234567890123456",
      resolverPrivateKey: "0x" + "0".repeat(64),
      maxConcurrentSwaps: 10,
      retryMaxAttempts: 3,
      metricsInterval: 30000,
    };
  });

  describe("Constructor", () => {
    it("should create resolver instance with valid config", () => {
      const resolver = new AdvancedCrossChainResolver(mockConfig);
      expect(resolver).toBeInstanceOf(AdvancedCrossChainResolver);
    });

    it("should initialize with correct configuration", () => {
      const resolver = new AdvancedCrossChainResolver(mockConfig);
      const status = resolver.getStatus();

      expect(status.config.ethNetwork).toBe("sepolia");
      expect(status.config.tronNetwork).toBe("nile");
      expect(status.isRunning).toBe(false);
    });
  });

  describe("Status and Metrics", () => {
    it("should return correct initial status", () => {
      const resolver = new AdvancedCrossChainResolver(mockConfig);
      const status = resolver.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.activeSwaps).toBe(0);
      expect(status.metrics.totalSwaps).toBe(0);
    });
  });
});

describe("PerformanceMetrics", () => {
  let metrics: PerformanceMetrics;

  beforeEach(() => {
    metrics = new PerformanceMetrics();
  });

  describe("Success Tracking", () => {
    it("should track successful swaps correctly", () => {
      metrics.recordSwapSuccess(1000);
      metrics.recordSwapSuccess(2000);

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalSwaps).toBe(2);
      expect(snapshot.successfulSwaps).toBe(2);
      expect(snapshot.failedSwaps).toBe(0);
      expect(snapshot.successRate).toBe(1);
      expect(snapshot.averageLatency).toBe(1500);
    });

    it("should track failed swaps correctly", () => {
      metrics.recordSwapSuccess(1000);
      metrics.recordSwapFailure();

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalSwaps).toBe(2);
      expect(snapshot.successfulSwaps).toBe(1);
      expect(snapshot.failedSwaps).toBe(1);
      expect(snapshot.successRate).toBe(0.5);
    });
  });

  describe("Volume Tracking", () => {
    it("should track volume correctly", () => {
      const volume1 = BigInt("1000000000000000000"); // 1 ETH
      const volume2 = BigInt("2000000000000000000"); // 2 ETH

      metrics.recordSwapSuccess(1000, volume1);
      metrics.recordSwapSuccess(2000, volume2);

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalVolume).toBe("3.000000"); // 3 ETH
    });
  });

  describe("Statistics", () => {
    it("should calculate latency statistics correctly", () => {
      const latencies = [100, 200, 300, 400, 500];
      latencies.forEach((lat) => metrics.recordSwapSuccess(lat));

      const stats = metrics.getStats();
      expect(stats.latencyStats.min).toBe(100);
      expect(stats.latencyStats.max).toBe(500);
      expect(stats.latencyStats.median).toBe(300);
    });

    it("should provide recent metrics", () => {
      // Add some old metrics
      for (let i = 0; i < 50; i++) {
        metrics.recordSwapSuccess(1000);
      }

      // Add some recent failures
      metrics.recordSwapFailure();
      metrics.recordSwapFailure();

      const recent = metrics.getRecentMetrics();
      expect(recent.totalOperations).toBeGreaterThan(0);
    });
  });

  describe("Reset", () => {
    it("should reset all metrics correctly", () => {
      metrics.recordSwapSuccess(1000);
      metrics.recordSwapFailure();

      metrics.reset();

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalSwaps).toBe(0);
      expect(snapshot.successfulSwaps).toBe(0);
      expect(snapshot.failedSwaps).toBe(0);
    });
  });

  describe("Export for Monitoring", () => {
    it("should export metrics in correct format", () => {
      metrics.recordSwapSuccess(1000);
      metrics.recordSwapFailure();

      const exported = metrics.exportForMonitoring();

      expect(exported.timestamp).toBeDefined();
      expect(exported.metrics["resolver.swaps.total"]).toBe(2);
      expect(exported.metrics["resolver.swaps.successful"]).toBe(1);
      expect(exported.metrics["resolver.swaps.failed"]).toBe(1);
      expect(exported.metrics["resolver.swaps.success_rate"]).toBe(0.5);
    });
  });
});
