/**
 * Simple logger utility for the 1inch Agent Kit
 */

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
  }
  
  export interface LoggerOptions {
    level?: LogLevel;
    prefix?: string;
    enableConsole?: boolean;
  }
  
  export class Logger {
    private level: LogLevel;
    private prefix: string;
    private enableConsole: boolean;
  
    constructor(options: LoggerOptions = {}) {
      this.level = options.level ?? LogLevel.INFO;
      this.prefix = options.prefix ?? '[1inch-agent-kit]';
      this.enableConsole = options.enableConsole ?? true;
    }
  
    private formatMessage(level: string, message: string): string {
      const timestamp = new Date().toISOString();
      return `${this.prefix} [${timestamp}] [${level}] ${message}`;
    }
  
    private log(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
      if (this.level >= level && this.enableConsole) {
        const formattedMessage = this.formatMessage(levelName, message);
        console.log(formattedMessage, ...args);
      }
    }
  
    error(message: string, ...args: any[]): void {
      this.log(LogLevel.ERROR, 'ERROR', message, ...args);
    }
  
    warn(message: string, ...args: any[]): void {
      this.log(LogLevel.WARN, 'WARN', message, ...args);
    }
  
    info(message: string, ...args: any[]): void {
      this.log(LogLevel.INFO, 'INFO', message, ...args);
    }
  
    debug(message: string, ...args: any[]): void {
      this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
    }
  
    setLevel(level: LogLevel): void {
      this.level = level;
    }
  
    setPrefix(prefix: string): void {
      this.prefix = prefix;
    }
  }
  
  // Default logger instance
  export const logger = new Logger(); 