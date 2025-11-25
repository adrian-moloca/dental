/**
 * OpenTelemetry Tracer Wrapper
 *
 * Provides a simplified interface for OpenTelemetry distributed tracing
 * with support for Jaeger, Zipkin, and OTLP exporters.
 *
 * Enable via environment variables:
 * - OTEL_ENABLED=true
 * - OTEL_SERVICE_NAME=service-name
 * - OTEL_EXPORTER_TYPE=jaeger|zipkin|otlp
 * - OTEL_EXPORTER_ENDPOINT=http://localhost:14268/api/traces
 *
 * @module shared-tracing/otel
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as api from '@opentelemetry/api';
import type { Span, SpanStatusCode } from '@opentelemetry/api';
import type { TracerConfig, SpanAttributes } from '../types';
import { getCorrelationContext } from '../correlation-id';

/**
 * Global OpenTelemetry SDK instance
 */
let sdk: NodeSDK | null = null;

/**
 * Global tracer instance
 */
let tracer: api.Tracer | null = null;

/**
 * Initialize OpenTelemetry SDK
 *
 * Call this once in your application bootstrap (main.ts)
 * BEFORE starting the HTTP server.
 *
 * @param config - Tracer configuration
 */
export function initializeTracer(config: TracerConfig): void {
  if (!config.enabled) {
    console.log('OpenTelemetry tracing is disabled');
    return;
  }

  // Configure exporter
  let exporter;
  if (config.exporter?.type === 'jaeger') {
    exporter = new JaegerExporter({
      endpoint: config.exporter.endpoint || 'http://localhost:14268/api/traces',
    });
  } else if (config.exporter?.type === 'zipkin') {
    exporter = new ZipkinExporter({
      url: config.exporter.endpoint || 'http://localhost:9411/api/v2/spans',
    });
  }
  // OTLP exporter would be configured here

  // Create resource with service information
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
    })
  );

  // Initialize SDK
  sdk = new NodeSDK({
    resource,
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable fs instrumentation to reduce noise
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();

  // Get tracer instance
  tracer = api.trace.getTracer(config.serviceName, config.serviceVersion);

  console.log(`OpenTelemetry initialized for ${config.serviceName} v${config.serviceVersion}`);
}

/**
 * Shutdown OpenTelemetry SDK
 *
 * Call this during application shutdown to flush pending spans.
 */
export async function shutdownTracer(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  }
}

/**
 * Start a new span
 *
 * Creates a new tracing span for the current operation.
 * Automatically includes correlation ID from AsyncLocalStorage.
 *
 * @param name - Span name (e.g., "ServiceName.OperationName")
 * @param attributes - Additional span attributes
 * @returns Span instance or null if tracing is disabled
 */
export function startSpan(
  name: string,
  attributes?: SpanAttributes
): Span | null {
  if (!tracer) {
    return null;
  }

  const context = getCorrelationContext();
  const spanAttributes: SpanAttributes = {
    ...attributes,
  };

  // Add correlation context to span attributes
  if (context?.correlationId) {
    spanAttributes['correlation.id'] = context.correlationId;
  }
  if (context?.causationId) {
    spanAttributes['causation.id'] = context.causationId;
  }
  if (context?.source?.service) {
    spanAttributes['source.service'] = context.source.service;
  }

  return tracer.startSpan(name, { attributes: spanAttributes });
}

/**
 * End a span
 *
 * @param span - Span to end
 */
export function endSpan(span: Span | null): void {
  if (span) {
    span.end();
  }
}

/**
 * Add attributes to a span
 *
 * @param span - Span to modify
 * @param attributes - Attributes to add
 */
export function addSpanAttributes(
  span: Span | null,
  attributes: SpanAttributes
): void {
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Set span status
 *
 * @param span - Span to modify
 * @param status - Status code
 * @param message - Optional error message
 */
export function setSpanStatus(
  span: Span | null,
  status: SpanStatusCode,
  message?: string
): void {
  if (span) {
    span.setStatus({ code: status, message });
  }
}

/**
 * Record an error in a span
 *
 * @param span - Span to record error in
 * @param error - Error object
 */
export function recordSpanError(span: Span | null, error: Error): void {
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: api.SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

/**
 * Execute a function within a traced span
 *
 * Automatically creates a span, executes the function,
 * and ends the span when complete or on error.
 *
 * @param name - Span name
 * @param fn - Function to execute
 * @param attributes - Span attributes
 * @returns Result of the function
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span | null) => Promise<T>,
  attributes?: SpanAttributes
): Promise<T> {
  const span = startSpan(name, attributes);

  try {
    const result = await fn(span);
    setSpanStatus(span, api.SpanStatusCode.OK);
    return result;
  } catch (error) {
    recordSpanError(span, error as Error);
    throw error;
  } finally {
    endSpan(span);
  }
}

/**
 * Get the current active span
 *
 * @returns Current active span or undefined
 */
export function getActiveSpan(): Span | undefined {
  return api.trace.getActiveSpan();
}

/**
 * Create a child span within the current context
 *
 * @param name - Span name
 * @param attributes - Span attributes
 * @returns New child span
 */
export function startChildSpan(
  name: string,
  attributes?: SpanAttributes
): Span | null {
  if (!tracer) {
    return null;
  }

  const context = getCorrelationContext();
  const activeSpan = getActiveSpan();

  const spanAttributes: SpanAttributes = {
    ...attributes,
  };

  if (context?.correlationId) {
    spanAttributes['correlation.id'] = context.correlationId;
  }

  // Create span with current context as parent
  const ctx = activeSpan
    ? api.trace.setSpan(api.context.active(), activeSpan)
    : api.context.active();

  return tracer.startSpan(name, { attributes: spanAttributes }, ctx);
}

/**
 * Export API for direct OpenTelemetry usage
 */
export { api as openTelemetryApi };
