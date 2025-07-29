import { MetricsSnapshot } from "./types";

/**
 * Performance metrics collector for the resolver
 * Tracks swap success rates, latency, volume, and other KPIs
 */
export class PerformanceMetrics {
  private startTime: number;
  private totalSwaps: number = 0;
  private successfulSwaps: number = 0;
  private failedSwaps: number = 0;
  private latencies: number[] = [];
  private volumes: bigint[] = [];

  // Recent metrics for rolling averages
  private recentLatencies: number[] = [];
  private recentSuccesses: number = 0;
  private recentFailures: number = 0;
  private maxRecentEntries: number = 100;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Record a successful swap
   */
  recordSwapSuccess(latencyMs: number, volumeWei?: bigint): void {
    this.totalSwaps++;
    this.successfulSwaps++;
    this.latencies.push(latencyMs);
    this.recentLatencies.push(latencyMs);
    this.recentSuccesses++;

    if (volumeWei) {
      this.volumes.push(volumeWei);
    }

    this.trimRecentMetrics();
  }

  /**
   * Record a failed swap
   */
  recordSwapFailure(): void {
    this.totalSwaps++;
    this.failedSwaps++;
    this.recentFailures++;

    this.trimRecentMetrics();
  }

  /**
   * Get current metrics snapshot
   */
  getSnapshot(): MetricsSnapshot {
    const uptime = Date.now() - this.startTime;
    const averageLatency = this.calculateAverageLatency();
    const successRate = this.calculateSuccessRate();
    const totalVolume = this.calculateTotalVolume();

    return {
      totalSwaps: this.totalSwaps,
      successfulSwaps: this.successfulSwaps,
      failedSwaps: this.failedSwaps,
      successRate,
      averageLatency,
      totalVolume,
      activeSwaps: 0, // Will be set by the resolver
      uptime,
    };
  }

  /**
   * Get recent performance metrics (last 100 operations)
   */
  getRecentMetrics() {
    const recentTotal = this.recentSuccesses + this.recentFailures;
    const recentSuccessRate =
      recentTotal > 0 ? this.recentSuccesses / recentTotal : 0;
    const recentAverageLatency =
      this.recentLatencies.length > 0
        ? this.recentLatencies.reduce((sum, lat) => sum + lat, 0) /
          this.recentLatencies.length
        : 0;

    return {
      successRate: recentSuccessRate,
      averageLatency: recentAverageLatency,
      totalOperations: recentTotal,
      samplesCount: this.recentLatencies.length,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.startTime = Date.now();
    this.totalSwaps = 0;
    this.successfulSwaps = 0;
    this.failedSwaps = 0;
    this.latencies = [];
    this.volumes = [];
    this.recentLatencies = [];
    this.recentSuccesses = 0;
    this.recentFailures = 0;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const snapshot = this.getSnapshot();
    const recent = this.getRecentMetrics();

    return {
      overall: snapshot,
      recent,
      latencyStats: this.getLatencyStats(),
      volumeStats: this.getVolumeStats(),
    };
  }

  /**
   * Get detailed latency statistics
   */
  private getLatencyStats() {
    if (this.latencies.length === 0) {
      return {
        min: 0,
        max: 0,
        median: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sorted = [...this.latencies].sort((a, b) => a - b);
    const length = sorted.length;

    return {
      min: sorted[0],
      max: sorted[length - 1],
      median: this.getPercentile(sorted, 0.5),
      p95: this.getPercentile(sorted, 0.95),
      p99: this.getPercentile(sorted, 0.99),
    };
  }

  /**
   * Get volume statistics
   */
  private getVolumeStats() {
    if (this.volumes.length === 0) {
      return {
        totalVolumeWei: "0",
        averageVolumeWei: "0",
        swapsWithVolume: 0,
      };
    }

    const totalVolume = this.volumes.reduce((sum, vol) => sum + vol, 0n);
    const averageVolume = totalVolume / BigInt(this.volumes.length);

    return {
      totalVolumeWei: totalVolume.toString(),
      averageVolumeWei: averageVolume.toString(),
      swapsWithVolume: this.volumes.length,
    };
  }

  /**
   * Calculate overall success rate
   */
  private calculateSuccessRate(): number {
    if (this.totalSwaps === 0) return 0;
    return this.successfulSwaps / this.totalSwaps;
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    return (
      this.latencies.reduce((sum, lat) => sum + lat, 0) / this.latencies.length
    );
  }

  /**
   * Calculate total volume in ETH equivalent
   */
  private calculateTotalVolume(): string {
    const totalVolumeWei = this.volumes.reduce((sum, vol) => sum + vol, 0n);
    // Convert to ETH (divide by 10^18)
    const totalVolumeEth = Number(totalVolumeWei) / 1e18;
    return totalVolumeEth.toFixed(6);
  }

  /**
   * Trim recent metrics arrays to prevent memory leaks
   */
  private trimRecentMetrics(): void {
    if (this.recentLatencies.length > this.maxRecentEntries) {
      this.recentLatencies = this.recentLatencies.slice(-this.maxRecentEntries);
    }

    const recentTotal = this.recentSuccesses + this.recentFailures;
    if (recentTotal > this.maxRecentEntries) {
      // Proportionally reduce recent successes and failures
      const ratio = this.maxRecentEntries / recentTotal;
      this.recentSuccesses = Math.floor(this.recentSuccesses * ratio);
      this.recentFailures = Math.floor(this.recentFailures * ratio);
    }
  }

  /**
   * Calculate percentile from sorted array
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Export metrics for monitoring systems
   */
  exportForMonitoring() {
    const stats = this.getStats();
    const timestamp = new Date().toISOString();

    return {
      timestamp,
      metrics: {
        "resolver.swaps.total": stats.overall.totalSwaps,
        "resolver.swaps.successful": stats.overall.successfulSwaps,
        "resolver.swaps.failed": stats.overall.failedSwaps,
        "resolver.swaps.success_rate": stats.overall.successRate,
        "resolver.latency.average": stats.overall.averageLatency,
        "resolver.latency.p95": stats.latencyStats.p95,
        "resolver.latency.p99": stats.latencyStats.p99,
        "resolver.volume.total": stats.overall.totalVolume,
        "resolver.uptime": stats.overall.uptime,
        "resolver.recent.success_rate": stats.recent.successRate,
        "resolver.recent.latency": stats.recent.averageLatency,
      },
    };
  }
}
