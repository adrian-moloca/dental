import { Injectable, Logger } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Metrics Service
 *
 * Provides Prometheus metrics for observability:
 * - HTTP request metrics (RED: Rate, Errors, Duration)
 * - Database operation metrics
 * - Business metrics (organizations, clinics, assignments)
 * - System metrics (memory, CPU, event loop lag)
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  public readonly registry: Registry;

  // HTTP Metrics (RED)
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestsInFlight: Gauge;

  // Database Metrics
  private readonly dbOperationsTotal: Counter;
  private readonly dbOperationDuration: Histogram;
  private readonly dbConnectionsActive: Gauge;

  // Business Metrics
  private readonly organizationsTotal: Gauge;
  private readonly clinicsTotal: Gauge;
  private readonly assignmentsTotal: Gauge;
  private readonly rbacOperationsTotal: Counter;

  // Error Metrics
  private readonly errorsTotal: Counter;

  // Event Loop Metrics
  private readonly eventLoopLag: Gauge;

  constructor() {
    this.registry = new Registry();

    // Collect default Node.js metrics (memory, CPU, GC, etc.)
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'enterprise_service_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });

    // Initialize HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'enterprise_service_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'enterprise_service_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'enterprise_service_http_requests_in_flight',
      help: 'Current number of HTTP requests being processed',
      labelNames: ['method'],
      registers: [this.registry],
    });

    // Initialize database metrics
    this.dbOperationsTotal = new Counter({
      name: 'enterprise_service_db_operations_total',
      help: 'Total number of database operations',
      labelNames: ['operation', 'collection', 'status'],
      registers: [this.registry],
    });

    this.dbOperationDuration = new Histogram({
      name: 'enterprise_service_db_operation_duration_seconds',
      help: 'Database operation duration in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'enterprise_service_db_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    // Initialize business metrics
    this.organizationsTotal = new Gauge({
      name: 'enterprise_service_organizations_total',
      help: 'Total number of organizations',
      registers: [this.registry],
    });

    this.clinicsTotal = new Gauge({
      name: 'enterprise_service_clinics_total',
      help: 'Total number of clinics',
      registers: [this.registry],
    });

    this.assignmentsTotal = new Gauge({
      name: 'enterprise_service_assignments_total',
      help: 'Total number of provider-clinic assignments',
      registers: [this.registry],
    });

    this.rbacOperationsTotal = new Counter({
      name: 'enterprise_service_rbac_operations_total',
      help: 'Total number of RBAC operations',
      labelNames: ['operation', 'resource'],
      registers: [this.registry],
    });

    // Initialize error metrics
    this.errorsTotal = new Counter({
      name: 'enterprise_service_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Initialize event loop lag
    this.eventLoopLag = new Gauge({
      name: 'enterprise_service_event_loop_lag_seconds',
      help: 'Event loop lag in seconds',
      registers: [this.registry],
    });

    // Start event loop lag monitoring
    this.monitorEventLoopLag();

    this.logger.log('Metrics service initialized with Prometheus registry');
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  }

  /**
   * Increment in-flight requests
   */
  incrementInFlightRequests(method: string): void {
    this.httpRequestsInFlight.inc({ method });
  }

  /**
   * Decrement in-flight requests
   */
  decrementInFlightRequests(method: string): void {
    this.httpRequestsInFlight.dec({ method });
  }

  /**
   * Record database operation metrics
   */
  recordDatabaseOperation(
    operation: string,
    collection: string,
    duration: number,
    status: 'success' | 'error',
  ): void {
    this.dbOperationsTotal.inc({ operation, collection, status });
    this.dbOperationDuration.observe({ operation, collection }, duration);
  }

  /**
   * Update active database connections
   */
  setActiveConnections(count: number): void {
    this.dbConnectionsActive.set(count);
  }

  /**
   * Update business metrics
   */
  setOrganizationsTotal(count: number): void {
    this.organizationsTotal.set(count);
  }

  setClinicsTotal(count: number): void {
    this.clinicsTotal.set(count);
  }

  setAssignmentsTotal(count: number): void {
    this.assignmentsTotal.set(count);
  }

  /**
   * Record RBAC operation
   */
  recordRbacOperation(operation: string, resource: string): void {
    this.rbacOperationsTotal.inc({ operation, resource });
  }

  /**
   * Record error
   */
  recordError(type: string, route: string, statusCode: number): void {
    this.errorsTotal.inc({ type, route, status_code: statusCode });
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Monitor event loop lag
   * This is a critical metric for detecting performance issues
   */
  private monitorEventLoopLag(): void {
    let lastCheck = Date.now();

    setInterval(() => {
      const now = Date.now();
      const lag = (now - lastCheck - 100) / 1000; // Expected interval is 100ms
      this.eventLoopLag.set(Math.max(0, lag));
      lastCheck = now;
    }, 100);
  }

  /**
   * Get content type for Prometheus metrics
   */
  getContentType(): string {
    return this.registry.contentType;
  }
}
