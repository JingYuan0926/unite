export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Simple logger utility for the resolver system
 * Provides structured logging with timestamps and log levels
 */
export class Logger {
  private context: string;
  private logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = "info") {
    this.context = context;
    this.logLevel = logLevel;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog("debug")) {
      this.log("DEBUG", message, data);
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (this.shouldLog("info")) {
      this.log("INFO", message, data);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog("warn")) {
      this.log("WARN", message, data);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    if (this.shouldLog("error")) {
      this.log("ERROR", message, error);
    }
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Check if should log at given level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;

    if (data !== undefined) {
      if (data instanceof Error) {
        console.log(`${prefix} ${message}`, {
          error: data.message,
          stack: data.stack,
        });
      } else {
        console.log(`${prefix} ${message}`, data);
      }
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}
