/**
 * Core Config - Logger Service
 * Structured logging service with levels and production disable
 */

import { sanitizeForLog, sanitizeError } from '../utils/sanitization';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Minimum log level to output
   * Logs below this level will be ignored
   */
  minLevel: LogLevel;

  /**
   * Enable logging in production (default: false)
   */
  enableInProduction: boolean;

  /**
   * Enable console output (default: true in dev, false in production)
   */
  enableConsole: boolean;

  /**
   * Enable file logging (for future implementation)
   */
  enableFileLogging: boolean;

  /**
   * Sanitize sensitive data before logging (default: true)
   */
  sanitizeData: boolean;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  enableInProduction: false,
  enableConsole: __DEV__,
  enableFileLogging: false,
  sanitizeData: true,
};

/**
 * Logger class
 */
class Logger {
  private config: LoggerConfig;
  private context?: string;

  constructor(config?: Partial<LoggerConfig>, context?: string) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.context = context;
  }

  /**
   * Check if logging is enabled for the given level
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableInProduction && !__DEV__) {
      return false;
    }

    if (!this.config.enableConsole) {
      return false;
    }

    return level >= this.config.minLevel;
  }

  /**
   * Format log message with context
   */
  private formatMessage(level: string, message: string): string {
    const context = this.context ? `[${this.context}]` : '';
    const timestamp = new Date().toISOString();
    return `${timestamp} ${context} [${level}] ${message}`;
  }

  /**
   * Sanitize data if enabled
   */
  private prepareData(data: unknown): unknown {
    if (this.config.sanitizeData) {
      return sanitizeForLog(data);
    }
    return data;
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.DEBUG)) {
      return;
    }

    const formattedMessage = this.formatMessage('DEBUG', message);
    const sanitizedArgs = args.map(arg => this.prepareData(arg));

    if (__DEV__) {
      console.log(formattedMessage, ...sanitizedArgs);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.INFO)) {
      return;
    }

    const formattedMessage = this.formatMessage('INFO', message);
    const sanitizedArgs = args.map(arg => this.prepareData(arg));

    if (__DEV__) {
      console.info(formattedMessage, ...sanitizedArgs);
    } else if (this.config.enableInProduction) {
      console.info(formattedMessage, ...sanitizedArgs);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.WARN)) {
      return;
    }

    const formattedMessage = this.formatMessage('WARN', message);
    const sanitizedArgs = args.map(arg => this.prepareData(arg));

    console.warn(formattedMessage, ...sanitizedArgs);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return;
    }

    const formattedMessage = this.formatMessage('ERROR', message);
    const sanitizedArgs = args.map(arg => this.prepareData(arg));

    if (error) {
      const sanitizedError = this.config.sanitizeData ? sanitizeError(error) : error;
      console.error(formattedMessage, sanitizedError, ...sanitizedArgs);
    } else {
      console.error(formattedMessage, ...sanitizedArgs);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(this.config, childContext);
  }

  /**
   * Update logger configuration
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with specific context
 * @param context - Context name for the logger
 * @returns Logger instance
 */
export function createLogger(context: string): Logger {
  return new Logger(undefined, context);
}

/**
 * Set global logger configuration
 * @param config - Logger configuration
 */
export function setLoggerConfig(config: Partial<LoggerConfig>): void {
  logger.setConfig(config);
}

/**
 * Get global logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return logger.getConfig();
}

