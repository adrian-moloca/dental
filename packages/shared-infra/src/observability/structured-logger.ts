import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface LogContext {
  correlationId?: string;
  tenantId?: string;
  organizationId?: string;
  clinicId?: string;
  userId?: string;
  deviceId?: string;
  requestId?: string;
  [key: string]: any;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Structured logger with automatic context propagation and correlation IDs.
 * Provides consistent log formatting across all DentalOS services with
 * automatic tenant/organization/clinic tagging for observability.
 *
 * @example
 * const logger = new StructuredLogger('PatientService');
 * logger.setContext({ tenantId: 'tenant-123', correlationId: req.id });
 * logger.info('Patient created', { patientId: '456' });
 * // Output: {"level":"info","service":"PatientService","tenantId":"tenant-123","correlationId":"...","message":"Patient created","patientId":"456","timestamp":"2025-01-21T..."}
 */
@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger implements LoggerService {
  private context: LogContext = {};
  private readonly serviceName: string;

  constructor(serviceName: string = 'DentalOS') {
    this.serviceName = serviceName;
  }

  /**
   * Sets the context for all subsequent log calls in this logger instance.
   * Context is automatically included in every log entry.
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Adds a correlation ID to the context if not already present.
   */
  ensureCorrelationId(): string {
    if (!this.context.correlationId) {
      this.context.correlationId = uuidv4();
    }
    return this.context.correlationId || '';
  }

  /**
   * Logs an info message with structured data.
   */
  log(message: string, data?: Record<string, any>): void {
    this.write(LogLevel.INFO, message, data);
  }

  /**
   * Logs an error with optional error object and additional data.
   */
  error(message: string, error?: Error, data?: Record<string, any>): void {
    const errorData = error
      ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          ...data,
        }
      : data;
    this.write(LogLevel.ERROR, message, errorData);
  }

  /**
   * Logs a warning message.
   */
  warn(message: string, data?: Record<string, any>): void {
    this.write(LogLevel.WARN, message, data);
  }

  /**
   * Logs a debug message (only in development).
   */
  debug(message: string, data?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      this.write(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Logs a verbose message (alias for debug).
   */
  verbose(message: string, data?: Record<string, any>): void {
    this.debug(message, data);
  }

  /**
   * Creates a child logger with additional context.
   * Useful for scoping logs to specific operations.
   */
  child(additionalContext: Partial<LogContext>): StructuredLogger {
    const childLogger = new StructuredLogger(this.serviceName);
    childLogger.setContext({ ...this.context, ...additionalContext });
    return childLogger;
  }

  /**
   * Writes a structured log entry to stdout.
   */
  private write(level: LogLevel, message: string, data?: Record<string, any>): void {
    const logEntry = {
      level,
      service: this.serviceName,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    };

    // Filter out sensitive fields before logging
    this.sanitizeLogEntry(logEntry);

    const output = JSON.stringify(logEntry);

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * Removes sensitive fields from log entry to prevent leaking secrets.
   */
  private sanitizeLogEntry(entry: any): void {
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'authorization',
      'cookie',
      'encryptionKey',
    ];

    for (const field of sensitiveFields) {
      if (entry[field]) {
        entry[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in entry) {
      if (typeof entry[key] === 'object' && entry[key] !== null && !Array.isArray(entry[key])) {
        this.sanitizeLogEntry(entry[key]);
      }
    }
  }

  /**
   * Logs an audit event for compliance tracking.
   * Audit logs are always written regardless of log level.
   */
  audit(action: string, resource: string, data?: Record<string, any>): void {
    const auditEntry = {
      level: 'audit',
      service: this.serviceName,
      action,
      resource,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    };

    this.sanitizeLogEntry(auditEntry);
    console.log(JSON.stringify(auditEntry));
  }

  /**
   * Measures and logs execution time of an async function.
   */
  async measureTime<T>(
    operation: string,
    fn: () => Promise<T>,
    data?: Record<string, any>,
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.log(`${operation} completed`, { ...data, durationMs: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`${operation} failed`, error as Error, { ...data, durationMs: duration });
      throw error;
    }
  }
}

/**
 * Factory for creating structured loggers with service context.
 */
export class LoggerFactory {
  static create(serviceName: string, initialContext?: Partial<LogContext>): StructuredLogger {
    const logger = new StructuredLogger(serviceName);
    if (initialContext) {
      logger.setContext(initialContext);
    }
    return logger;
  }
}
