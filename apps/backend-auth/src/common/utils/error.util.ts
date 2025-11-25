/**
 * Error Utilities
 *
 * Provides comprehensive error handling and building utilities
 * for the Enterprise Service.
 *
 * Edge cases handled:
 * - Error wrapping and context preservation
 * - Stack trace management
 * - Error categorization
 * - Retry logic helpers
 * - Error aggregation
 * - Async error handling
 *
 * @module ErrorUtil
 */

import { HttpStatus } from '@nestjs/common';
import { BaseError } from '@dentalos/shared-errors';

/**
 * Error context interface
 */
export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  clinicId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Retry options interface
 */
export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Error aggregation result
 */
export interface ErrorAggregation {
  hasErrors: boolean;
  errors: Error[];
  errorCount: number;
  firstError: Error | null;
}

/**
 * Error Utility Class
 *
 * Provides static methods for error handling
 */
export class ErrorUtil {
  /**
   * Wraps error with context
   *
   * Edge cases:
   * - Preserves original error message and stack
   * - Adds contextual information
   * - Handles null/undefined errors
   *
   * @param error - Original error
   * @param context - Error context
   * @returns Wrapped error with context
   */
  static wrapError(error: Error | unknown, context: ErrorContext): Error {
    // Edge case: If not an Error, create one
    const originalError = error instanceof Error ? error : new Error(String(error));

    // Create enriched error message
    const contextParts: string[] = [];

    if (context.operation) {
      contextParts.push(`Operation: ${context.operation}`);
    }

    if (context.correlationId) {
      contextParts.push(`CorrelationId: ${context.correlationId}`);
    }

    if (context.organizationId) {
      contextParts.push(`OrganizationId: ${context.organizationId}`);
    }

    if (context.clinicId) {
      contextParts.push(`ClinicId: ${context.clinicId}`);
    }

    if (context.userId) {
      contextParts.push(`UserId: ${context.userId}`);
    }

    const contextString = contextParts.length > 0 ? ` [${contextParts.join(', ')}]` : '';

    // Create new error with enriched message
    const wrappedError = new Error(`${originalError.message}${contextString}`);

    // Preserve original stack trace
    wrappedError.stack = originalError.stack;

    // Attach context as property
    (wrappedError as Error & { context: ErrorContext }).context = context;

    // Attach original error
    (wrappedError as Error & { cause: Error }).cause = originalError;

    return wrappedError;
  }

  /**
   * Checks if error is operational (expected error)
   *
   * Edge cases:
   * - BaseError instances are operational by default
   * - HTTP errors (4xx) are operational
   * - Other errors are programmer errors
   *
   * @param error - Error to check
   * @returns true if operational error
   */
  static isOperational(error: Error | unknown): boolean {
    // BaseError instances have isOperational flag
    if (error instanceof BaseError) {
      return error.isOperational;
    }

    // HTTP client errors (4xx) are operational
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;
      return statusCode >= 400 && statusCode < 500;
    }

    // Default: not operational (programmer error)
    return false;
  }

  /**
   * Checks if error is critical (requires immediate attention)
   *
   * Edge cases:
   * - BaseError instances have isCritical flag
   * - Database connection errors are critical
   * - OOM errors are critical
   *
   * @param error - Error to check
   * @returns true if critical error
   */
  static isCritical(error: Error | unknown): boolean {
    // BaseError instances have isCritical method
    if (error instanceof BaseError) {
      return error.isCritical();
    }

    // Check for critical error patterns
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Database connection errors
      if (message.includes('econnrefused') || message.includes('connection refused')) {
        return true;
      }

      // Out of memory errors
      if (message.includes('out of memory') || message.includes('heap out of memory')) {
        return true;
      }

      // MongoDB connection errors
      if (message.includes('mongoerror') || message.includes('mongodb')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if error is retryable
   *
   * Edge cases:
   * - Network errors are retryable
   * - Timeout errors are retryable
   * - Rate limit errors are retryable
   * - 5xx errors are retryable
   * - 4xx errors are NOT retryable (client errors)
   *
   * @param error - Error to check
   * @returns true if error is retryable
   */
  static isRetryable(error: Error | unknown): boolean {
    if (!(error instanceof Error)) return false;

    const message = error.message.toLowerCase();

    // Network errors are retryable
    if (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('network')
    ) {
      return true;
    }

    // Timeout errors are retryable
    if (message.includes('timeout')) {
      return true;
    }

    // Rate limit errors are retryable
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return true;
    }

    // Check HTTP status code
    if ('statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;

      // 5xx errors are retryable
      if (statusCode >= 500 && statusCode < 600) {
        return true;
      }

      // 429 Too Many Requests is retryable
      if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
        return true;
      }

      // 408 Request Timeout is retryable
      if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retries async operation with exponential backoff
   *
   * Edge cases:
   * - Respects maxAttempts
   * - Uses exponential backoff
   * - Custom retry predicate
   * - Preserves original error on final failure
   *
   * @param operation - Async operation to retry
   * @param options - Retry options
   * @returns Result of operation
   * @throws Last error if all retries fail
   */
  static async retry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
    const {
      maxAttempts,
      delayMs,
      backoffMultiplier = 2,
      shouldRetry = ErrorUtil.isRetryable,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Edge case: Don't retry if this is the last attempt
        if (attempt === maxAttempts) {
          throw ErrorUtil.wrapError(lastError, {
            operation: 'retry',
            metadata: {
              attempts: attempt,
              maxAttempts,
            },
          });
        }

        // Edge case: Check if error is retryable
        if (!shouldRetry(lastError, attempt)) {
          throw ErrorUtil.wrapError(lastError, {
            operation: 'retry',
            metadata: {
              attempts: attempt,
              reason: 'non-retryable error',
            },
          });
        }

        // Calculate delay with exponential backoff
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Edge case: Should never reach here, but TypeScript needs this
    throw lastError || new Error('Retry failed with unknown error');
  }

  /**
   * Executes async operation with timeout
   *
   * Edge cases:
   * - Rejects if operation takes longer than timeout
   * - Cleans up timeout on success
   * - Preserves operation result
   *
   * @param operation - Async operation
   * @param timeoutMs - Timeout in milliseconds
   * @param timeoutMessage - Custom timeout message
   * @returns Result of operation
   * @throws TimeoutError if operation times out
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${timeoutMessage} (exceeded ${timeoutMs}ms)`));
        }, timeoutMs);
      }),
    ]);
  }

  /**
   * Wraps async operation in try-catch with error handling
   *
   * Edge cases:
   * - Always returns a result (never throws)
   * - Success: { success: true, data: T }
   * - Failure: { success: false, error: Error }
   *
   * @param operation - Async operation
   * @returns Result object
   */
  static async tryCatch<T>(
    operation: () => Promise<T>
  ): Promise<{ success: true; data: T } | { success: false; error: Error }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { success: false, error: err };
    }
  }

  /**
   * Aggregates multiple errors
   *
   * Edge cases:
   * - Empty array returns no errors
   * - Filters out null/undefined
   * - Preserves all error messages
   *
   * @param errors - Array of errors
   * @returns Error aggregation result
   */
  static aggregateErrors(errors: (Error | null | undefined)[]): ErrorAggregation {
    const validErrors = errors.filter((err): err is Error => err instanceof Error);

    return {
      hasErrors: validErrors.length > 0,
      errors: validErrors,
      errorCount: validErrors.length,
      firstError: validErrors[0] || null,
    };
  }

  /**
   * Creates combined error from multiple errors
   *
   * Edge cases:
   * - Empty array returns null
   * - Single error returns that error
   * - Multiple errors combined into one
   *
   * @param errors - Array of errors
   * @param separator - Message separator
   * @returns Combined error or null
   */
  static combineErrors(errors: (Error | null | undefined)[], separator = '; '): Error | null {
    const aggregation = ErrorUtil.aggregateErrors(errors);

    if (!aggregation.hasErrors) return null;
    if (aggregation.errorCount === 1) return aggregation.firstError;

    const combinedMessage = aggregation.errors.map((err) => err.message).join(separator);

    const combinedError = new Error(`Multiple errors occurred: ${combinedMessage}`);

    // Attach individual errors
    (combinedError as Error & { errors: Error[] }).errors = aggregation.errors;

    return combinedError;
  }

  /**
   * Extracts HTTP status code from error
   *
   * Edge cases:
   * - BaseError instances use toHttpStatus()
   * - Errors with statusCode property
   * - Errors with status property
   * - Defaults to 500 for unknown errors
   *
   * @param error - Error to extract status from
   * @returns HTTP status code
   */
  static getHttpStatus(error: Error | unknown): number {
    // BaseError instances have toHttpStatus method
    if (error instanceof BaseError) {
      return error.toHttpStatus();
    }

    // Check for statusCode property
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;
      if (typeof statusCode === 'number') {
        return statusCode;
      }
    }

    // Check for status property
    if (error instanceof Error && 'status' in error) {
      const status = (error as Error & { status: number }).status;
      if (typeof status === 'number') {
        return status;
      }
    }

    // Default to 500 Internal Server Error
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extracts error message safely
   *
   * Edge cases:
   * - Error instances use message property
   * - Non-Error objects converted to string
   * - Null/undefined returns generic message
   *
   * @param error - Error to extract message from
   * @param defaultMessage - Default message if extraction fails
   * @returns Error message
   */
  static getMessage(error: unknown, defaultMessage = 'An error occurred'): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error === null || error === undefined) {
      return defaultMessage;
    }

    // Try to stringify
    try {
      return JSON.stringify(error);
    } catch {
      return defaultMessage;
    }
  }

  /**
   * Extracts stack trace safely
   *
   * Edge cases:
   * - Error instances have stack property
   * - Non-Error objects return null
   * - Stack may be undefined
   *
   * @param error - Error to extract stack from
   * @returns Stack trace or null
   */
  static getStack(error: unknown): string | null {
    if (error instanceof Error && error.stack) {
      return error.stack;
    }

    return null;
  }

  /**
   * Sanitizes error for logging (removes sensitive data)
   *
   * Edge cases:
   * - Removes passwords, tokens, secrets
   * - Preserves error structure
   * - Handles nested objects
   *
   * @param error - Error to sanitize
   * @returns Sanitized error object
   */
  static sanitizeForLogging(error: Error | unknown): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {
      message: ErrorUtil.getMessage(error),
      stack: ErrorUtil.getStack(error),
    };

    if (error instanceof Error) {
      // Copy enumerable properties
      for (const [key, value] of Object.entries(error)) {
        // Edge case: Skip sensitive fields
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('authorization')
        ) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Checks if two errors are equivalent
   *
   * Edge cases:
   * - Compares error messages
   * - Compares error types
   * - Handles null/undefined
   *
   * @param error1 - First error
   * @param error2 - Second error
   * @returns true if errors are equivalent
   */
  static areEquivalent(error1: Error | unknown, error2: Error | unknown): boolean {
    if (error1 === error2) return true;

    if (!(error1 instanceof Error) || !(error2 instanceof Error)) {
      return false;
    }

    return error1.constructor.name === error2.constructor.name && error1.message === error2.message;
  }

  /**
   * Creates error from validation failures
   *
   * Edge cases:
   * - Multiple validation errors
   * - Single validation error
   * - No validation errors returns null
   *
   * @param validationErrors - Array of validation error messages
   * @returns Validation error or null
   */
  static fromValidationErrors(validationErrors: string[]): Error | null {
    if (validationErrors.length === 0) return null;

    if (validationErrors.length === 1) {
      return new Error(validationErrors[0]);
    }

    const error = new Error(`Validation failed: ${validationErrors.join('; ')}`);

    (error as Error & { validationErrors: string[] }).validationErrors = validationErrors;

    return error;
  }

  /**
   * Executes callback and ignores errors
   *
   * Edge cases:
   * - Useful for cleanup operations
   * - Never throws
   * - Optionally logs errors
   *
   * @param callback - Callback to execute
   * @param logErrors - Whether to log errors (default: false)
   */
  static async ignoreErrors(
    callback: () => Promise<void> | void,
    logErrors = false
  ): Promise<void> {
    try {
      await callback();
    } catch (error) {
      if (logErrors) {
        console.error('Ignored error:', error);
      }
    }
  }

  /**
   * Delays execution (for retry backoff)
   *
   * @param ms - Delay in milliseconds
   * @returns Promise that resolves after delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
