/**
 * Correlation ID Utility
 *
 * Shared utility for generating and extracting correlation IDs for distributed tracing.
 */

import { Request } from 'express';

/**
 * Generates a new correlation ID
 *
 * Format: timestamp-randomString
 * Example: 1234567890123-abc123def456
 *
 * @returns Generated correlation ID
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generates a unique request ID
 *
 * Format: req-timestamp-randomString
 * Example: req-1234567890123-abc123
 *
 * @returns Generated request ID
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extracts correlation ID from request headers
 *
 * Checks multiple header formats (case-insensitive).
 * Falls back to generating new correlation ID if not present.
 *
 * @param request - Express request object
 * @returns Correlation ID from headers or newly generated
 */
export function extractCorrelationId(request: Request): string {
  return (
    request.get('x-correlation-id') ||
    request.get('X-Correlation-ID') ||
    generateCorrelationId()
  );
}
