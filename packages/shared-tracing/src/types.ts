/**
 * Type definitions for distributed tracing
 *
 * @module shared-tracing/types
 */

/**
 * Correlation context stored in AsyncLocalStorage
 *
 * Contains all tracing information that should be propagated
 * across async boundaries within a single service.
 */
export interface CorrelationContext {
  /**
   * Unique identifier for the entire distributed transaction
   *
   * This ID should remain constant across all services involved
   * in processing a single user request or business operation.
   */
  correlationId: string;

  /**
   * ID of the event or request that caused the current operation
   *
   * Forms a causal chain allowing reconstruction of the sequence
   * of events that led to the current state.
   */
  causationId?: string;

  /**
   * Timestamp when the correlation context was created
   */
  timestamp: Date;

  /**
   * Source service that initiated this correlation context
   */
  source?: {
    service: string;
    version: string;
  };

  /**
   * Additional context data for tracing
   */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for OpenTelemetry tracer
 */
export interface TracerConfig {
  /**
   * Enable/disable OpenTelemetry tracing
   */
  enabled: boolean;

  /**
   * Service name for tracing
   */
  serviceName: string;

  /**
   * Service version
   */
  serviceVersion: string;

  /**
   * Environment (development, staging, production)
   */
  environment: string;

  /**
   * Exporter configuration
   */
  exporter?: {
    type: 'jaeger' | 'zipkin' | 'otlp';
    endpoint?: string;
  };

  /**
   * Sampling configuration
   */
  sampling?: {
    /**
     * Sample all errors
     */
    alwaysSampleErrors: boolean;

    /**
     * Sampling ratio for successful requests (0.0 to 1.0)
     */
    successSampleRate: number;
  };
}

/**
 * Span attributes for custom tracing
 */
export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

/**
 * HTTP headers for correlation ID propagation
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const CAUSATION_ID_HEADER = 'x-causation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Event metadata fields for correlation
 */
export interface EventCorrelationMetadata {
  correlationId: string;
  causationId?: string;
  timestamp: Date;
  source: {
    service: string;
    version: string;
  };
}
