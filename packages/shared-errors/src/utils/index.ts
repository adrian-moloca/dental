/**
 * Error classification and utility functions
 * @module utils
 */

export {
  isRetryableError,
  isUserError,
  isCriticalError,
  extractErrorCode,
  extractCorrelationId,
  isOperationalError,
  isTransientError,
  calculateRetryDelay,
  shouldLogError,
} from './error-classification';
