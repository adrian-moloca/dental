import { Injectable, Logger } from '@nestjs/common';
import * as client from 'prom-client';

/**
 * Centralized Prometheus metrics manager for all DentalOS services.
 * Provides standardized metrics for HTTP requests, database operations,
 * external service calls, and business-level metrics.
 *
 * @example
 * // In a service
 * metricsService.recordHttpRequest('GET', '/api/patients', 200, 150);
 * metricsService.recordDatabaseQuery('patients', 'SELECT', 45);
 * metricsService.incrementCounter('patients.created', { tenantId: 'tenant-123' });
 */
@Injectable()
export class PrometheusMetricsService {
  private readonly logger = new Logger(PrometheusMetricsService.name);
  private readonly registry: client.Registry;

  // HTTP Metrics
  private readonly httpRequestDuration: client.Histogram;
  private readonly httpRequestsTotal: client.Counter;
  private readonly httpRequestErrors: client.Counter;

  // Database Metrics
  private readonly dbQueryDuration: client.Histogram;
  private readonly dbQueriesTotal: client.Counter;
  private readonly dbConnectionPoolSize: client.Gauge;

  // External Service Metrics
  private readonly externalServiceDuration: client.Histogram;
  private readonly externalServiceErrors: client.Counter;

  // Circuit Breaker Metrics
  private readonly circuitBreakerState: client.Gauge;
  private readonly circuitBreakerTrips: client.Counter;

  // Business Metrics
  private readonly customCounters = new Map<string, client.Counter>();
  private readonly customGauges = new Map<string, client.Gauge>();
  private readonly customHistograms = new Map<string, client.Histogram>();

  constructor() {
    this.registry = new client.Registry();

    // Collect default Node.js metrics (CPU, memory, event loop, etc.)
    client.collectDefaultMetrics({ register: this.registry });

    // HTTP Metrics
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'route', 'status_code', 'tenant_id'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'tenant_id'],
      registers: [this.registry],
    });

    this.httpRequestErrors = new client.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type', 'tenant_id'],
      registers: [this.registry],
    });

    // Database Metrics
    this.dbQueryDuration = new client.Histogram({
      name: 'db_query_duration_ms',
      help: 'Duration of database queries in milliseconds',
      labelNames: ['table', 'operation', 'tenant_id'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    this.dbQueriesTotal = new client.Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['table', 'operation', 'tenant_id'],
      registers: [this.registry],
    });

    this.dbConnectionPoolSize = new client.Gauge({
      name: 'db_connection_pool_size',
      help: 'Current database connection pool size',
      labelNames: ['database', 'state'],
      registers: [this.registry],
    });

    // External Service Metrics
    this.externalServiceDuration = new client.Histogram({
      name: 'external_service_duration_ms',
      help: 'Duration of external service calls in milliseconds',
      labelNames: ['service', 'operation', 'status'],
      buckets: [100, 250, 500, 1000, 2500, 5000, 10000],
      registers: [this.registry],
    });

    this.externalServiceErrors = new client.Counter({
      name: 'external_service_errors_total',
      help: 'Total number of external service errors',
      labelNames: ['service', 'operation', 'error_type'],
      registers: [this.registry],
    });

    // Circuit Breaker Metrics
    this.circuitBreakerState = new client.Gauge({
      name: 'circuit_breaker_state',
      help: 'Circuit breaker state (0=closed, 1=half-open, 2=open)',
      labelNames: ['service'],
      registers: [this.registry],
    });

    this.circuitBreakerTrips = new client.Counter({
      name: 'circuit_breaker_trips_total',
      help: 'Total number of circuit breaker trips',
      labelNames: ['service'],
      registers: [this.registry],
    });

    this.logger.log('Prometheus metrics initialized');
  }

  /**
   * Records an HTTP request with duration and status code.
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
    tenantId?: string,
  ): void {
    const labels = { method, route, status_code: statusCode.toString(), tenant_id: tenantId || 'none' };
    this.httpRequestDuration.observe(labels, durationMs);
    this.httpRequestsTotal.inc(labels);

    if (statusCode >= 400) {
      this.httpRequestErrors.inc({
        method,
        route,
        error_type: statusCode >= 500 ? 'server_error' : 'client_error',
        tenant_id: tenantId || 'none',
      });
    }
  }

  /**
   * Records a database query with duration.
   */
  recordDatabaseQuery(
    table: string,
    operation: string,
    durationMs: number,
    tenantId?: string,
  ): void {
    const labels = { table, operation, tenant_id: tenantId || 'none' };
    this.dbQueryDuration.observe(labels, durationMs);
    this.dbQueriesTotal.inc(labels);
  }

  /**
   * Sets the database connection pool size.
   */
  setDbConnectionPoolSize(database: string, active: number, idle: number): void {
    this.dbConnectionPoolSize.set({ database, state: 'active' }, active);
    this.dbConnectionPoolSize.set({ database, state: 'idle' }, idle);
  }

  /**
   * Records an external service call.
   */
  recordExternalServiceCall(
    service: string,
    operation: string,
    durationMs: number,
    success: boolean,
  ): void {
    const labels = { service, operation, status: success ? 'success' : 'failure' };
    this.externalServiceDuration.observe(labels, durationMs);

    if (!success) {
      this.externalServiceErrors.inc({ service, operation, error_type: 'call_failed' });
    }
  }

  /**
   * Records circuit breaker state (0=closed, 1=half-open, 2=open).
   */
  recordCircuitBreakerState(service: string, state: 'CLOSED' | 'HALF_OPEN' | 'OPEN'): void {
    const stateValue = state === 'CLOSED' ? 0 : state === 'HALF_OPEN' ? 1 : 2;
    this.circuitBreakerState.set({ service }, stateValue);

    if (state === 'OPEN') {
      this.circuitBreakerTrips.inc({ service });
    }
  }

  /**
   * Increments a custom counter.
   */
  incrementCounter(name: string, labels: Record<string, string> = {}): void {
    if (!this.customCounters.has(name)) {
      this.customCounters.set(
        name,
        new client.Counter({
          name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
          help: `Custom counter: ${name}`,
          labelNames: Object.keys(labels),
          registers: [this.registry],
        }),
      );
    }
    this.customCounters.get(name)!.inc(labels);
  }

  /**
   * Sets a custom gauge value.
   */
  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    if (!this.customGauges.has(name)) {
      this.customGauges.set(
        name,
        new client.Gauge({
          name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
          help: `Custom gauge: ${name}`,
          labelNames: Object.keys(labels),
          registers: [this.registry],
        }),
      );
    }
    this.customGauges.get(name)!.set(labels, value);
  }

  /**
   * Records a custom histogram observation.
   */
  recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    if (!this.customHistograms.has(name)) {
      this.customHistograms.set(
        name,
        new client.Histogram({
          name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
          help: `Custom histogram: ${name}`,
          labelNames: Object.keys(labels),
          registers: [this.registry],
        }),
      );
    }
    this.customHistograms.get(name)!.observe(labels, value);
  }

  /**
   * Gets metrics in Prometheus format for /metrics endpoint.
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Gets metrics as JSON for debugging.
   */
  async getMetricsJSON() {
    return this.registry.getMetricsAsJSON();
  }
}
