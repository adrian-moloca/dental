import { BaseError } from '../base/base-error';

/**
 * Maps errors to HTTP status codes
 *
 * Edge cases handled:
 * - BaseError subclasses use their toHttpStatus() method
 * - Unknown errors default to 500 Internal Server Error
 * - Respects statusCode property if present
 * - Provides consistent mapping across all error types
 *
 * @param error - Error to map to HTTP status code
 * @returns HTTP status code (400-599)
 */
export function mapErrorToHttpStatus(error: BaseError | Error): number {
  // If it's a BaseError, use its toHttpStatus() method
  if (error instanceof BaseError) {
    return error.toHttpStatus();
  }

  // Check for statusCode property (some libraries use this)
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode;
  }

  // Check for status property (alternative convention)
  if ('status' in error && typeof error.status === 'number') {
    return error.status as number;
  }

  // Default to 500 for unknown errors
  // This is safe - programmer errors should be 500
  return 500;
}

/**
 * Maps error codes to HTTP status codes
 *
 * Useful for cases where you have error codes but not error instances
 *
 * Edge cases handled:
 * - Unknown codes default to 500
 * - Case-insensitive matching
 * - Consistent with error class mappings
 *
 * @param code - Error code to map
 * @returns HTTP status code (400-599)
 */
export function mapErrorCodeToHttpStatus(code: string): number {
  const normalizedCode = code.toUpperCase();

  const codeToStatusMap: Record<string, number> = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    DOMAIN_ERROR: 422,
    AUTHENTICATION_ERROR: 401,
    AUTHORIZATION_ERROR: 403,
    INFRASTRUCTURE_ERROR: 500,
    RATE_LIMIT_EXCEEDED: 429,
    TENANT_ISOLATION_ERROR: 403,
  };

  return codeToStatusMap[normalizedCode] ?? 500;
}

/**
 * Determines if an HTTP status code represents a client error
 *
 * @param statusCode - HTTP status code
 * @returns true if status is 4xx (client error)
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Determines if an HTTP status code represents a server error
 *
 * @param statusCode - HTTP status code
 * @returns true if status is 5xx (server error)
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Gets a human-readable description for an HTTP status code
 *
 * @param statusCode - HTTP status code
 * @returns Status description
 */
export function getStatusDescription(statusCode: number): string {
  const statusDescriptions: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };

  return statusDescriptions[statusCode] ?? 'Unknown';
}
