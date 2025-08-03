/**
 * Simple logger utility for Fusion+ Tron Extension
 * Provides structured logging with different levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  /**
   * Get singleton logger instance
   */
  public static getInstance(logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    return Logger.instance;
  }

  /**
   * Set log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.log("DEBUG", message, data);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.log("INFO", message, data);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      this.log("WARN", message, data);
    }
  }

  /**
   * Log error message
   */
  public error(message: string, error?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.log("ERROR", message, error);
    }
  }

  /**
   * Log transaction hash with explorer link
   */
  public logTransaction(
    network: "ethereum" | "tron",
    txHash: string,
    description?: string
  ): void {
    const explorerUrl =
      network === "ethereum"
        ? `https://sepolia.etherscan.io/tx/${txHash}`
        : `https://nile.tronscan.org/#/transaction/${txHash}`;

    this.info(`${description || "Transaction"} on ${network}`, {
      hash: txHash,
      explorer: explorerUrl,
    });
  }

  /**
   * Log order information
   */
  public logOrder(orderHash: string, status: string, data?: any): void {
    this.info(`Order ${status}`, {
      orderHash,
      ...data,
    });
  }

  /**
   * Log escrow information
   */
  public logEscrow(escrowAddress: string, action: string, data?: any): void {
    this.info(`Escrow ${action}`, {
      escrowAddress,
      ...data,
    });
  }

  /**
   * Log cross-chain swap progress
   */
  public logSwapProgress(step: string, data?: any): void {
    this.info(`🔄 Swap Progress: ${step}`, data);
  }

  /**
   * Log success with emoji
   */
  public success(message: string, data?: any): void {
    this.info(`✅ ${message}`, data);
  }

  /**
   * Log failure with emoji
   */
  public failure(message: string, error?: any): void {
    this.error(`❌ ${message}`, error);
  }

  /**
   * Create a scoped logger for a specific component
   */
  public scope(component: string): ScopedLogger {
    return new ScopedLogger(this, component);
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
}

/**
 * Scoped logger that prefixes all messages with component name
 */
export class ScopedLogger {
  constructor(
    private logger: Logger,
    private component: string
  ) {}

  debug(message: string, data?: any): void {
    this.logger.debug(`[${this.component}] ${message}`, data);
  }

  info(message: string, data?: any): void {
    this.logger.info(`[${this.component}] ${message}`, data);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(`[${this.component}] ${message}`, data);
  }

  error(message: string, error?: any): void {
    this.logger.error(`[${this.component}] ${message}`, error);
  }

  success(message: string, data?: any): void {
    this.logger.success(`[${this.component}] ${message}`, data);
  }

  failure(message: string, error?: any): void {
    this.logger.failure(`[${this.component}] ${message}`, error);
  }

  logTransaction(
    network: "ethereum" | "tron",
    txHash: string,
    description?: string
  ): void {
    this.logger.logTransaction(
      network,
      txHash,
      `[${this.component}] ${description}`
    );
  }

  logOrder(orderHash: string, status: string, data?: any): void {
    this.logger.logOrder(orderHash, `${status} (${this.component})`, data);
  }

  logEscrow(escrowAddress: string, action: string, data?: any): void {
    this.logger.logEscrow(escrowAddress, `${action} (${this.component})`, data);
  }

  logSwapProgress(step: string, data?: any): void {
    this.logger.logSwapProgress(`[${this.component}] ${step}`, data);
  }
}

// Export default logger instance
export const logger = Logger.getInstance();
