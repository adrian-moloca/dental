/**
 * Shared Tracing Package
 *
 * Provides distributed tracing utilities for Dental OS microservices,
 * including correlation ID management, OpenTelemetry integration,
 * and NestJS middleware for request tracing.
 *
 * @module @dentalos/shared-tracing
 */

// Correlation ID utilities
export {
  generateCorrelationId,
  getCorrelationContext,
  getCorrelationId,
  getCausationId,
  runWithCorrelationContext,
  createCorrelationContext,
  extractCorrelationId,
  extractCausationId,
  injectCorrelationId,
  createCorrelationHeaders,
  correlationStorage,
} from './correlation-id';

// Middleware
export {
  CorrelationMiddleware,
  createCorrelationMiddleware,
  type CorrelationMiddlewareConfig,
} from './middleware/correlation.middleware';

// Interceptors
export {
  CorrelationInterceptor,
  LoggingInterceptor,
} from './interceptors/correlation.interceptor';

// Decorators
export {
  CorrelationId,
  CausationId,
  CorrelationContextParam,
} from './decorators/correlation-id.decorator';

// OpenTelemetry
export {
  initializeTracer,
  shutdownTracer,
  startSpan,
  endSpan,
  addSpanAttributes,
  setSpanStatus,
  recordSpanError,
  withSpan,
  getActiveSpan,
  startChildSpan,
  openTelemetryApi,
} from './otel/tracer';

// Types
export {
  type CorrelationContext,
  type TracerConfig,
  type SpanAttributes,
  type EventCorrelationMetadata,
  CORRELATION_ID_HEADER,
  CAUSATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from './types';
