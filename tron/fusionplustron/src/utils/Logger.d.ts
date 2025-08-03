/**
 * Simple logger utility for Fusion+ Tron Extension
 * Provides structured logging with different levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger {
    private static instance;
    private logLevel;
    private constructor();
    /**
     * Get singleton logger instance
     */
    static getInstance(logLevel?: LogLevel): Logger;
    /**
     * Set log level
     */
    setLogLevel(level: LogLevel): void;
    /**
     * Log debug message
     */
    debug(message: string, data?: any): void;
    /**
     * Log info message
     */
    info(message: string, data?: any): void;
    /**
     * Log warning message
     */
    warn(message: string, data?: any): void;
    /**
     * Log error message
     */
    error(message: string, error?: any): void;
    /**
     * Log transaction hash with explorer link
     */
    logTransaction(network: "ethereum" | "tron", txHash: string, description?: string): void;
    /**
     * Log order information
     */
    logOrder(orderHash: string, status: string, data?: any): void;
    /**
     * Log escrow information
     */
    logEscrow(escrowAddress: string, action: string, data?: any): void;
    /**
     * Log cross-chain swap progress
     */
    logSwapProgress(step: string, data?: any): void;
    /**
     * Log success with emoji
     */
    success(message: string, data?: any): void;
    /**
     * Log failure with emoji
     */
    failure(message: string, error?: any): void;
    /**
     * Create a scoped logger for a specific component
     */
    scope(component: string): ScopedLogger;
    /**
     * Internal log method
     */
    private log;
}
/**
 * Scoped logger that prefixes all messages with component name
 */
export declare class ScopedLogger {
    private logger;
    private component;
    constructor(logger: Logger, component: string);
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    success(message: string, data?: any): void;
    failure(message: string, error?: any): void;
    logTransaction(network: "ethereum" | "tron", txHash: string, description?: string): void;
    logOrder(orderHash: string, status: string, data?: any): void;
    logEscrow(escrowAddress: string, action: string, data?: any): void;
    logSwapProgress(step: string, data?: any): void;
}
export declare const logger: Logger;
//# sourceMappingURL=Logger.d.ts.map