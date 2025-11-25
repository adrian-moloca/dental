import { Logger } from '@nestjs/common';

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts: number; // Maximum number of retry attempts
  initialDelay?: number; // Initial delay in ms (default: 100)
  maxDelay?: number; // Maximum delay in ms (default: 10000)
  factor?: number; // Exponential backoff factor (default: 2)
  retryableErrors?: Array<new (...args: any[]) => Error>; // Specific errors to retry
  onRetry?: (error: Error, attempt: number) => void; // Callback on retry
}

/**
 * Retry with Exponential Backoff
 *
 * Automatically retries failed operations with exponential backoff.
 *
 * Features:
 * - Exponential backoff with configurable factor
 * - Maximum delay cap
 * - Jitter to prevent thundering herd
 * - Retry only specific error types
 * - Callback on each retry attempt
 *
 * Usage:
 * ```typescript
 * @Retry({
 *   maxAttempts: 3,
 *   initialDelay: 100,
 *   maxDelay: 5000,
 *   factor: 2,
 * })
 * async fetchData() {
 *   return await externalApi.getData();
 * }
 * ```
 */
export function Retry(config: RetryConfig) {
  const logger = new Logger('RetryDecorator');

  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const {
        maxAttempts,
        initialDelay = 100,
        maxDelay = 10000,
        factor = 2,
        retryableErrors,
        onRetry,
      } = config;

      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;

          // Check if error is retryable
          if (retryableErrors && retryableErrors.length > 0) {
            const isRetryable = retryableErrors.some((ErrorClass) => error instanceof ErrorClass);
            if (!isRetryable) {
              throw error;
            }
          }

          // Don't retry on last attempt
          if (attempt === maxAttempts) {
            logger.error(`Method ${propertyKey} failed after ${maxAttempts} attempts`, error);
            throw error;
          }

          // Calculate delay with exponential backoff and jitter
          const baseDelay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
          const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
          const delay = baseDelay + jitter;

          logger.warn(
            `Method ${propertyKey} failed (attempt ${attempt}/${maxAttempts}). ` +
              `Retrying in ${Math.round(delay)}ms...`,
            error instanceof Error ? error.message : error,
          );

          // Call onRetry callback if provided
          if (onRetry) {
            onRetry(error as Error, attempt);
          }

          // Wait before retrying
          await sleep(delay);
        }
      }

      throw lastError!;
    };

    return descriptor;
  };
}

/**
 * Retry with Linear Backoff
 *
 * Simpler retry strategy with linear delay increase.
 */
export function RetryLinear(config: {
  maxAttempts: number;
  delay?: number;
  onRetry?: (error: Error, attempt: number) => void;
}) {
  const logger = new Logger('RetryLinearDecorator');

  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { maxAttempts, delay = 1000, onRetry } = config;
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;

          if (attempt === maxAttempts) {
            logger.error(`Method ${_propertyKey} failed after ${maxAttempts} attempts`, error);
            throw error;
          }

          const currentDelay = delay * attempt;
          logger.warn(
            `Method ${_propertyKey} failed (attempt ${attempt}/${maxAttempts}). ` +
              `Retrying in ${currentDelay}ms...`,
          );

          if (onRetry) {
            onRetry(error as Error, attempt);
          }

          await sleep(currentDelay);
        }
      }

      throw lastError!;
    };

    return descriptor;
  };
}

/**
 * Utility function to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function (non-decorator version)
 *
 * Usage:
 * ```typescript
 * const result = await retry(
 *   async () => externalApi.call(),
 *   { maxAttempts: 3, initialDelay: 100 }
 * );
 * ```
 */
export async function retry<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> {
  const logger = new Logger('RetryFunction');
  const {
    maxAttempts,
    initialDelay = 100,
    maxDelay = 10000,
    factor = 2,
    retryableErrors,
    onRetry,
  } = config;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (retryableErrors && retryableErrors.length > 0) {
        const isRetryable = retryableErrors.some((ErrorClass) => error instanceof ErrorClass);
        if (!isRetryable) {
          throw error;
        }
      }

      if (attempt === maxAttempts) {
        throw error;
      }

      const baseDelay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
      const jitter = Math.random() * 0.3 * baseDelay;
      const delay = baseDelay + jitter;

      logger.warn(
        `Retry attempt ${attempt}/${maxAttempts} failed. Retrying in ${Math.round(delay)}ms...`,
      );

      if (onRetry) {
        onRetry(error as Error, attempt);
      }

      await sleep(delay);
    }
  }

  throw lastError!;
}
