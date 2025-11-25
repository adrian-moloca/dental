import { BaseError } from '../base/base-error';
import { InfrastructureError } from '../infra/infrastructure-error';
import { RateLimitError } from '../infra/rate-limit-error';

/**
 * Determines if an error represents a retryable operation
 *
 * Edge cases handled:
 * - BaseError instances use their isRetryable() method
 * - Network errors are retryable
 * - Timeout errors are retryable
 * - Database connection errors are retryable
 * - Unknown errors are not retryable (safe default)
 *
 * @param error - Error to check
 * @returns true if operation can be retried
 */
export function isRetryableError(error: Error): boolean {
  // BaseError instances have explicit retry logic
  if (error instanceof BaseError) {
    return error.isRetryable();
  }

  // Check error code for known retryable patterns
  if ('code' in error && typeof error.code === 'string') {
    const retryableCodes = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EHOSTUNREACH',
    ];
    return retryableCodes.includes(error.code);
  }

  // Default: not retryable (safe choice)
  return false;
}

/**
 * Determines if an error is a user-facing error
 *
 * Edge cases handled:
 * - BaseError instances use their isUserError() method
 * - Validation errors are user errors
 * - Internal server errors are not user errors
 * - Unknown errors are not user errors (security)
 *
 * @param error - Error to check
 * @returns true if error should be shown to users
 */
export function isUserError(error: Error): boolean {
  // BaseError instances have explicit user error logic
  if (error instanceof BaseError) {
    return error.isUserError();
  }

  // Check status code for client errors (4xx)
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode >= 400 && error.statusCode < 500;
  }

  // Default: not a user error (security)
  return false;
}

/**
 * Determines if an error is critical and requires immediate attention
 *
 * Edge cases handled:
 * - BaseError instances use their isCritical() method
 * - Programmer errors (non-operational) are critical
 * - Infrastructure failures are critical
 * - User errors are typically not critical
 * - Unknown errors are critical (safe default)
 *
 * @param error - Error to check
 * @returns true if error is critical
 */
export function isCriticalError(error: Error): boolean {
  // BaseError instances have explicit critical logic
  if (error instanceof BaseError) {
    return error.isCritical();
  }

  // Default: critical (safe choice for unknown errors)
  // Better to alert on non-critical than miss critical errors
  return true;
}

/**
 * Extracts error code from various error formats
 *
 * Edge cases handled:
 * - BaseError instances have code property
 * - Standard Error doesn't have code
 * - Some libraries use code property
 * - Returns 'UNKNOWN_ERROR' for errors without code
 *
 * @param error - Error to extract code from
 * @returns Error code or 'UNKNOWN_ERROR'
 */
export function extractErrorCode(error: Error): string {
  if (error instanceof BaseError) {
    return error.code;
  }

  if ('code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Extracts correlation ID from error for distributed tracing
 *
 * Edge cases handled:
 * - BaseError instances have correlationId property
 * - Some errors don't have correlation IDs
 * - Returns undefined if no correlation ID found
 *
 * @param error - Error to extract correlation ID from
 * @returns Correlation ID or undefined
 */
export function extractCorrelationId(error: Error): string | undefined {
  if (error instanceof BaseError) {
    return error.correlationId;
  }

  if ('correlationId' in error && typeof error.correlationId === 'string') {
    return error.correlationId;
  }

  return undefined;
}

/**
 * Determines if an error is operational (expected) vs programmer error (bug)
 *
 * Edge cases handled:
 * - BaseError instances have isOperational property
 * - Unknown errors are assumed to be programmer errors (critical)
 *
 * @param error - Error to check
 * @returns true if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof BaseError) {
    return error.isOperational;
  }

  // Default: not operational (programmer error)
  return false;
}

/**
 * Determines if an error is transient (temporary failure)
 *
 * Edge cases handled:
 * - Infrastructure errors may be transient
 * - Network errors are typically transient
 * - Validation errors are not transient
 *
 * @param error - Error to check
 * @returns true if error is transient
 */
export function isTransientError(error: Error): boolean {
  // Infrastructure errors can be transient
  if (error instanceof InfrastructureError) {
    return error.metadata.isTransient === true;
  }

  // Network errors are typically transient
  if ('code' in error && typeof error.code === 'string') {
    const transientCodes = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EHOSTUNREACH',
    ];
    return transientCodes.includes(error.code);
  }

  return false;
}

/**
 * Calculates retry delay for retryable errors with exponential backoff
 *
 * @param attemptNumber - Current retry attempt (1-indexed)
 * @param baseDelayMs - Base delay in milliseconds (default: 1000)
 * @param maxDelayMs - Maximum delay in milliseconds (default: 30000)
 * @returns Delay in milliseconds before next retry
 */
export function calculateRetryDelay(
  attemptNumber: number,
  baseDelayMs = 1000,
  maxDelayMs = 30000
): number {
  // Exponential backoff: baseDelay * 2^(attempt-1)
  const delay = baseDelayMs * Math.pow(2, attemptNumber - 1);

  // Add jitter (±25%) to prevent thundering herd
  const jitter = delay * (0.75 + Math.random() * 0.5);

  // Cap at maximum delay
  return Math.min(jitter, maxDelayMs);
}

/**
 * Determines if an error should be logged
 *
 * @param error - Error to check
 * @returns true if error should be logged
 */
export function shouldLogError(error: Error): boolean {
  // Always log critical errors
  if (isCriticalError(error)) {
    return true;
  }

  // Always log non-operational errors (programmer errors)
  if (!isOperationalError(error)) {
    return true;
  }

  // Rate limit errors don't need logging (expected in high load)
  if (error instanceof RateLimitError) {
    return false;
  }

  // Log all other errors
  return true;
}
