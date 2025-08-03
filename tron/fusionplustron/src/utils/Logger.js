"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.ScopedLogger = exports.Logger = exports.LogLevel = void 0;
/**
 * Simple logger utility for Fusion+ Tron Extension
 * Provides structured logging with different levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(logLevel = LogLevel.INFO) {
        this.logLevel = logLevel;
    }
    /**
     * Get singleton logger instance
     */
    static getInstance(logLevel) {
        if (!Logger.instance) {
            Logger.instance = new Logger(logLevel);
        }
        return Logger.instance;
    }
    /**
     * Set log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Log debug message
     */
    debug(message, data) {
        if (this.logLevel <= LogLevel.DEBUG) {
            this.log("DEBUG", message, data);
        }
    }
    /**
     * Log info message
     */
    info(message, data) {
        if (this.logLevel <= LogLevel.INFO) {
            this.log("INFO", message, data);
        }
    }
    /**
     * Log warning message
     */
    warn(message, data) {
        if (this.logLevel <= LogLevel.WARN) {
            this.log("WARN", message, data);
        }
    }
    /**
     * Log error message
     */
    error(message, error) {
        if (this.logLevel <= LogLevel.ERROR) {
            this.log("ERROR", message, error);
        }
    }
    /**
     * Log transaction hash with explorer link
     */
    logTransaction(network, txHash, description) {
        const explorerUrl = network === "ethereum"
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
    logOrder(orderHash, status, data) {
        this.info(`Order ${status}`, {
            orderHash,
            ...data,
        });
    }
    /**
     * Log escrow information
     */
    logEscrow(escrowAddress, action, data) {
        this.info(`Escrow ${action}`, {
            escrowAddress,
            ...data,
        });
    }
    /**
     * Log cross-chain swap progress
     */
    logSwapProgress(step, data) {
        this.info(`🔄 Swap Progress: ${step}`, data);
    }
    /**
     * Log success with emoji
     */
    success(message, data) {
        this.info(`✅ ${message}`, data);
    }
    /**
     * Log failure with emoji
     */
    failure(message, error) {
        this.error(`❌ ${message}`, error);
    }
    /**
     * Create a scoped logger for a specific component
     */
    scope(component) {
        return new ScopedLogger(this, component);
    }
    /**
     * Internal log method
     */
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        if (data) {
            console.log(logMessage, data);
        }
        else {
            console.log(logMessage);
        }
    }
}
exports.Logger = Logger;
/**
 * Scoped logger that prefixes all messages with component name
 */
class ScopedLogger {
    constructor(logger, component) {
        this.logger = logger;
        this.component = component;
    }
    debug(message, data) {
        this.logger.debug(`[${this.component}] ${message}`, data);
    }
    info(message, data) {
        this.logger.info(`[${this.component}] ${message}`, data);
    }
    warn(message, data) {
        this.logger.warn(`[${this.component}] ${message}`, data);
    }
    error(message, error) {
        this.logger.error(`[${this.component}] ${message}`, error);
    }
    success(message, data) {
        this.logger.success(`[${this.component}] ${message}`, data);
    }
    failure(message, error) {
        this.logger.failure(`[${this.component}] ${message}`, error);
    }
    logTransaction(network, txHash, description) {
        this.logger.logTransaction(network, txHash, `[${this.component}] ${description}`);
    }
    logOrder(orderHash, status, data) {
        this.logger.logOrder(orderHash, `${status} (${this.component})`, data);
    }
    logEscrow(escrowAddress, action, data) {
        this.logger.logEscrow(escrowAddress, `${action} (${this.component})`, data);
    }
    logSwapProgress(step, data) {
        this.logger.logSwapProgress(`[${this.component}] ${step}`, data);
    }
}
exports.ScopedLogger = ScopedLogger;
// Export default logger instance
exports.logger = Logger.getInstance();
//# sourceMappingURL=Logger.js.map