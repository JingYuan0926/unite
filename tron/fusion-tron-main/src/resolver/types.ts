export interface ResolverConfig {
  // Network configuration
  ethNetwork: string;
  tronNetwork: string;

  // RPC endpoints
  ethRpcUrl: string;
  ethWsUrl: string;
  tronRpcUrl: string;

  // Contract addresses
  ethEscrowFactoryAddress: string;
  tronEscrowFactoryAddress: string;

  // Resolver credentials
  resolverPrivateKey: string;

  // Optional performance settings
  maxConcurrentSwaps?: number;
  retryMaxAttempts?: number;
  metricsInterval?: number;
}

export type SwapDirection = "eth-to-tron" | "tron-to-eth";

export type SwapStatus =
  | "monitoring-finality"
  | "finality-reached"
  | "creating-mirror-escrow"
  | "mirror-escrow-created"
  | "waiting-secret-reveal"
  | "secret-revealed"
  | "completing-swap"
  | "completed"
  | "failed"
  | "cancelled";

export interface SwapContext {
  id: string;
  direction: SwapDirection;
  startTime: number;
  status: SwapStatus;

  // Transaction hashes
  ethTxHash?: string;
  tronTxHash?: string;

  // Block information
  ethBlockNumber?: number;
  tronBlockNumber?: number;

  // Error handling
  error?: string;
  retryCount: number;

  // Timing information
  finalityReachedAt?: number;
  mirrorEscrowCreatedAt?: number;
  secretRevealedAt?: number;
  completedAt?: number;
}

export interface TokenMapping {
  ethereum: string;
  tron: string;
  symbol: string;
  decimals: number;
}

export interface EscrowDetails {
  initiator: string;
  resolver: string;
  token: string;
  amount: string;
  safetyDeposit: string;
  secretHash: string;
  finalityLock: number;
  cancelLock: number;
  createdAt: number;
  completed: boolean;
  cancelled: boolean;
}

export interface MetricsSnapshot {
  totalSwaps: number;
  successfulSwaps: number;
  failedSwaps: number;
  successRate: number;
  averageLatency: number;
  totalVolume: string;
  activeSwaps: number;
  uptime: number;
}

export interface ResolverEvent {
  type:
    | "escrow-created"
    | "escrow-completed"
    | "escrow-cancelled"
    | "secret-revealed";
  chain: "ethereum" | "tron";
  escrowId: string;
  txHash: string;
  blockNumber?: number;
  data?: any;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface PerformanceConfig {
  metricsCollectionInterval: number;
  cleanupInterval: number;
  maxSwapContextAge: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

// Event payload types
export interface EscrowCreatedEvent {
  escrowId: string;
  initiator: string;
  resolver: string;
  amount: string;
  secretHash: string;
  token: string;
  finalityLock: number;
  cancelLock: number;
}

export interface EscrowCompletedEvent {
  escrowId: string;
  secret: string;
  resolver: string;
}

export interface EscrowCancelledEvent {
  escrowId: string;
  initiator: string;
  resolver: string;
}

// Resolver status types
export interface ResolverStatus {
  isRunning: boolean;
  activeSwaps: number;
  metrics: MetricsSnapshot;
  config: {
    ethNetwork: string;
    tronNetwork: string;
    resolverAddress: string;
  };
  health: {
    ethConnection: boolean;
    tronConnection: boolean;
    lastEthBlock: number;
    lastTronBlock: number;
  };
}

// Error types
export class ResolverError extends Error {
  constructor(
    message: string,
    public code: string,
    public swapId?: string,
    public chain?: string
  ) {
    super(message);
    this.name = "ResolverError";
  }
}

export class NetworkError extends ResolverError {
  constructor(message: string, chain: string, swapId?: string) {
    super(message, "NETWORK_ERROR", swapId, chain);
    this.name = "NetworkError";
  }
}

export class ContractError extends ResolverError {
  constructor(message: string, chain: string, swapId?: string) {
    super(message, "CONTRACT_ERROR", swapId, chain);
    this.name = "ContractError";
  }
}

export class TimeoutError extends ResolverError {
  constructor(message: string, swapId?: string) {
    super(message, "TIMEOUT_ERROR", swapId);
    this.name = "TimeoutError";
  }
}
