/**
 * Correlation ID generation and context management
 *
 * Uses Node.js AsyncLocalStorage to maintain correlation context
 * across async operations without explicit parameter passing.
 *
 * @module shared-tracing/correlation-id
 */

import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';
import type { CorrelationContext } from './types';

/**
 * AsyncLocalStorage instance for correlation context
 *
 * Maintains correlation context across async boundaries within
 * a single Node.js execution context (e.g., HTTP request).
 */
const correlationStorage = new AsyncLocalStorage<CorrelationContext>();

/**
 * Generate a new correlation ID
 *
 * Uses UUID v4 for globally unique identifiers with
 * negligible collision probability.
 *
 * @returns A new correlation ID
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Get the current correlation context from AsyncLocalStorage
 *
 * @returns The current correlation context, or undefined if not set
 */
export function getCorrelationContext(): CorrelationContext | undefined {
  return correlationStorage.getStore();
}

/**
 * Get the current correlation ID from AsyncLocalStorage
 *
 * @returns The current correlation ID, or undefined if not set
 */
export function getCorrelationId(): string | undefined {
  return correlationStorage.getStore()?.correlationId;
}

/**
 * Get the current causation ID from AsyncLocalStorage
 *
 * @returns The current causation ID, or undefined if not set
 */
export function getCausationId(): string | undefined {
  return correlationStorage.getStore()?.causationId;
}

/**
 * Set correlation context for the current async execution
 *
 * This should be called at the entry point of each request/event handler
 * to establish the correlation context for all subsequent operations.
 *
 * @param context - The correlation context to set
 * @param callback - Function to execute within the correlation context
 * @returns The result of the callback
 */
export function runWithCorrelationContext<T>(
  context: CorrelationContext,
  callback: () => T
): T {
  return correlationStorage.run(context, callback);
}

/**
 * Create a new correlation context
 *
 * Generates a new context with a unique correlation ID and
 * optional causation ID for event chains.
 *
 * @param options - Options for creating the context
 * @returns A new correlation context
 */
export function createCorrelationContext(options?: {
  correlationId?: string;
  causationId?: string;
  source?: { service: string; version: string };
  metadata?: Record<string, unknown>;
}): CorrelationContext {
  return {
    correlationId: options?.correlationId ?? generateCorrelationId(),
    causationId: options?.causationId,
    timestamp: new Date(),
    source: options?.source,
    metadata: options?.metadata,
  };
}

/**
 * Extract correlation ID from HTTP headers
 *
 * Checks for standard correlation ID headers and returns
 * the value if present, otherwise generates a new ID.
 *
 * @param headers - HTTP headers object
 * @returns Correlation ID from headers or a new ID
 */
export function extractCorrelationId(
  headers: Record<string, string | string[] | undefined>
): string {
  const headerValue =
    headers['x-correlation-id'] ??
    headers['X-Correlation-Id'] ??
    headers['x-request-id'] ??
    headers['X-Request-Id'];

  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }

  if (Array.isArray(headerValue) && headerValue.length > 0) {
    return headerValue[0];
  }

  return generateCorrelationId();
}

/**
 * Extract causation ID from HTTP headers
 *
 * @param headers - HTTP headers object
 * @returns Causation ID from headers or undefined
 */
export function extractCausationId(
  headers: Record<string, string | string[] | undefined>
): string | undefined {
  const headerValue =
    headers['x-causation-id'] ?? headers['X-Causation-Id'];

  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }

  if (Array.isArray(headerValue) && headerValue.length > 0) {
    return headerValue[0];
  }

  return undefined;
}

/**
 * Inject correlation ID into event payload
 *
 * Helper function to ensure all events include correlation metadata.
 * This should be used when emitting events to other services.
 *
 * @param payload - The event payload
 * @returns The payload with correlation metadata injected
 */
export function injectCorrelationId<T extends Record<string, unknown>>(
  payload: T
): T & { correlationId: string; causationId?: string; timestamp: Date } {
  const context = getCorrelationContext();

  return {
    ...payload,
    correlationId: context?.correlationId ?? generateCorrelationId(),
    causationId: context?.causationId,
    timestamp: new Date(),
  };
}

/**
 * Create headers for HTTP requests with correlation context
 *
 * Injects correlation and causation IDs into HTTP headers
 * for propagation to downstream services.
 *
 * @returns Headers object with correlation metadata
 */
export function createCorrelationHeaders(): Record<string, string> {
  const context = getCorrelationContext();

  const headers: Record<string, string> = {};

  if (context?.correlationId) {
    headers['x-correlation-id'] = context.correlationId;
  }

  if (context?.causationId) {
    headers['x-causation-id'] = context.causationId;
  }

  return headers;
}

/**
 * Export the AsyncLocalStorage instance for advanced use cases
 */
export { correlationStorage };
