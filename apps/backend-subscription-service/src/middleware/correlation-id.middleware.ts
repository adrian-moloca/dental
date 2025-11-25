/**
 * Correlation ID Storage
 *
 * Provides getCorrelationId() helper for retrieving correlation ID
 * from shared-tracing package's AsyncLocalStorage.
 *
 * Note: The actual CorrelationMiddleware is imported from @dentalos/shared-tracing
 * and configured in app.module.ts. This file only provides access to the
 * correlation ID that middleware sets.
 *
 * @module middleware/correlation-id
 */

import { getCorrelationId as getSharedCorrelationId } from '@dentalos/shared-tracing';

/**
 * Get current correlation ID from shared-tracing package
 *
 * Safe to call from any context within a request lifecycle.
 *
 * @returns Correlation ID or 'unknown' if not in request context
 */
export function getCorrelationId(): string {
  return getSharedCorrelationId() ?? 'unknown';
}
