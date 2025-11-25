/**
 * Mock Logger
 * Logger implementation that captures log calls for testing
 *
 * @module shared-testing/mocks/logger
 */

import { LogLevel } from '@dentalos/shared-types';

/**
 * Log entry captured by mock logger
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Logger interface (simplified)
 */
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Mock logger for testing
 * Captures all log calls for inspection
 */
export class MockLogger implements Logger {
  private logs: LogEntry[] = [];

  /**
   * Log debug message
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  public error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Get all logged entries
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get debug logs
   */
  public getDebugLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.DEBUG);
  }

  /**
   * Get info logs
   */
  public getInfoLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.INFO);
  }

  /**
   * Get warning logs
   */
  public getWarnLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.WARN);
  }

  /**
   * Get error logs
   */
  public getErrorLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.ERROR);
  }

  /**
   * Get the last log entry
   */
  public getLastLog(): LogEntry | null {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
  }

  /**
   * Check if a message was logged
   */
  public hasMessage(message: string): boolean {
    return this.logs.some((log) => log.message.includes(message));
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Internal logging method
   * @private
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    this.logs.push({
      level,
      message,
      context,
      timestamp: new Date(),
    });
  }
}

/**
 * Factory function to create a mock logger
 */
export function createMockLogger(): MockLogger {
  return new MockLogger();
}
