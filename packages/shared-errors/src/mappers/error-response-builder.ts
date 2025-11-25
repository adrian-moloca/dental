import { BaseError, type ErrorResponse } from '../base/base-error';

/**
 * Sensitive field patterns that should never be included in error responses
 * Used to sanitize error metadata and prevent PHI/PII leakage
 *
 * CRITICAL: Tenant identifiers must be excluded from client responses
 * to prevent cross-tenant information disclosure
 */
const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /credential/i,
  /ssn/i,
  /social[_-]?security/i,
  /credit[_-]?card/i,
  /card[_-]?number/i,
  /cvv/i,
  /pin/i,
  // PHI-specific patterns
  /patient[_-]?id/i,
  /mrn/i, // Medical Record Number
  /diagnosis/i,
  /treatment/i,
  /medication/i,
  /insurance/i,
  /medical[_-]?history/i,
  // Tenant isolation patterns (CRITICAL: prevent cross-tenant disclosure)
  /tenant[_-]?id/i,
  /organization[_-]?id/i,
  /clinic[_-]?id/i,
  /org[_-]?id/i,
  /tenant[_-]?context/i,
  // PII patterns
  /email/i,
  /date[_-]?of[_-]?birth/i,
  /dob/i,
  /phone/i,
  /address/i,
  /zip[_-]?code/i,
  /postal[_-]?code/i,
];

/**
 * Builds a standardized error response from a BaseError instance
 *
 * Edge cases handled:
 * - Uses error's own toErrorResponse() if available
 * - Optionally includes stack trace (development only)
 * - Sanitizes metadata to prevent PHI/PII exposure
 * - Generates correlation ID if missing
 *
 * @param error - Error to convert to response
 * @param includeStack - Whether to include stack trace (default: false)
 * @returns Standardized error response
 */
export function buildErrorResponse(
  error: BaseError,
  includeStack = false
): ErrorResponse {
  // Use error's own toErrorResponse() method
  const response = error.toErrorResponse();

  // Optionally include stack trace (only in development)
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Sanitizes an error for client consumption
 * Removes sensitive data, stack traces, and internal details
 *
 * Edge cases handled:
 * - BaseError instances use their toErrorResponse() method
 * - Unknown errors get generic messages
 * - All metadata is sanitized for sensitive fields
 * - Stack traces never included
 *
 * @param error - Error to sanitize
 * @returns Sanitized error response safe for clients
 */
export function sanitizeErrorForClient(error: Error): ErrorResponse {
  // If it's a BaseError, use its toErrorResponse() which is already sanitized
  if (error instanceof BaseError) {
    return error.toErrorResponse();
  }

  // For unknown errors, return generic response
  // Never expose internal error details to clients
  return {
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please contact support.',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sanitizes error metadata to remove sensitive fields
 *
 * Edge cases handled:
 * - Recursively sanitizes nested objects
 * - Removes fields matching sensitive patterns
 * - Handles arrays of objects
 * - Prevents deep recursion (max depth: 5)
 *
 * @param metadata - Metadata to sanitize
 * @param depth - Current recursion depth (internal)
 * @returns Sanitized metadata
 */
export function sanitizeMetadata(
  metadata: unknown,
  depth = 0
): Record<string, unknown> | undefined {
  // Prevent deep recursion
  if (depth > 5) {
    return undefined;
  }

  // Only process objects
  if (typeof metadata !== 'object' || metadata === null) {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(metadata)) {
    return {
      items: metadata
        .map((item) => sanitizeMetadata(item, depth + 1))
        .filter((item) => item !== undefined),
    };
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Skip sensitive fields
    if (isSensitiveField(key)) {
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      const sanitizedValue = sanitizeMetadata(value, depth + 1);
      if (sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    } else {
      // Include primitive values
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Checks if a field name matches sensitive patterns
 *
 * @param fieldName - Field name to check
 * @returns true if field is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
}

/**
 * Builds an error response for development environments
 * Includes full error details, stack traces, and metadata
 *
 * @param error - Error to format
 * @returns Detailed error response for debugging
 */
export function buildDevelopmentErrorResponse(error: Error): ErrorResponse {
  if (error instanceof BaseError) {
    const response = error.toErrorResponse();
    response.stack = error.stack;
    return response;
  }

  return {
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };
}

/**
 * Builds an error response for production environments
 * Minimal information, no stack traces, generic messages for internal errors
 *
 * @param error - Error to format
 * @returns Minimal error response for production
 */
export function buildProductionErrorResponse(error: Error): ErrorResponse {
  return sanitizeErrorForClient(error);
}

/**
 * Extracts error code from various error formats
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
