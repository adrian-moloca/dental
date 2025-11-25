import { Injectable, Logger } from '@nestjs/common';
// Note: prom-client package must be installed: pnpm add prom-client
// import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

// Placeholder types until prom-client is installed
type Counter = unknown;
type Histogram = unknown;
type Gauge = unknown;
type Registry = { metrics: () => Promise<string>; contentType: string };

/**
 * Metrics Service
 *
 * Provides Prometheus metrics for observability:
 * - HTTP request metrics (RED: Rate, Errors, Duration)
 * - Database operation metrics
 * - Business metrics (users, sessions, tenants)
 * - System metrics (memory, CPU, event loop lag)
 * - Auth-specific metrics (logins, MFA, token operations)
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  public readonly registry: Registry;

  // HTTP Metrics (RED) - disabled until prom-client is installed
  // Note: These fields are reserved for future use when prom-client is installed
  // They are initialized in the constructor to maintain type safety
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _httpRequestsTotal: Counter;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _httpRequestDuration: Histogram;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _httpRequestsInFlight: Gauge;

  // Database Metrics
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _dbOperationsTotal: Counter;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _dbOperationDuration: Histogram;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _dbConnectionsActive: Gauge;

  // Business Metrics
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _usersTotal: Gauge;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _sessionsTotal: Gauge;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _tenantsTotal: Gauge;

  // Auth-specific Metrics
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _loginAttemptsTotal: Counter;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _mfaChallengesTotal: Counter;
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _tokenOperationsTotal: Counter;

  // Error Metrics
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _errorsTotal: Counter;

  // Event Loop Metrics
  // @ts-expect-error - Reserved for future prom-client integration
  private readonly _eventLoopLag: Gauge;

  constructor() {
    // Note: Metrics disabled until prom-client package is installed
    this.registry = { metrics: async () => '', contentType: 'text/plain' } as unknown as Registry;

    // collectDefaultMetrics({
    //   register: this.registry,
    //   prefix: 'auth_service_',
    //   gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    // });

    // Initialize HTTP metrics (disabled until prom-client is installed)
    this._httpRequestsTotal = null as unknown as Counter;
    this._httpRequestDuration = null as unknown as Histogram;
    this._httpRequestsInFlight = null as unknown as Gauge;
    this._dbOperationsTotal = null as unknown as Counter;
    this._dbOperationDuration = null as unknown as Histogram;
    this._dbConnectionsActive = null as unknown as Gauge;
    this._usersTotal = null as unknown as Gauge;
    this._sessionsTotal = null as unknown as Gauge;
    this._tenantsTotal = null as unknown as Gauge;
    this._loginAttemptsTotal = null as unknown as Counter;
    this._mfaChallengesTotal = null as unknown as Counter;
    this._tokenOperationsTotal = null as unknown as Counter;
    this._errorsTotal = null as unknown as Counter;
    this._eventLoopLag = null as unknown as Gauge;

    /* Commented out until prom-client is installed
    this.httpRequestsTotal = new Counter({
      name: 'auth_service_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'auth_service_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'auth_service_http_requests_in_flight',
      help: 'Current number of HTTP requests being processed',
      labelNames: ['method'],
      registers: [this.registry],
    });

    // Initialize database metrics
    this.dbOperationsTotal = new Counter({
      name: 'auth_service_db_operations_total',
      help: 'Total number of database operations',
      labelNames: ['operation', 'table', 'status'],
      registers: [this.registry],
    });

    this.dbOperationDuration = new Histogram({
      name: 'auth_service_db_operation_duration_seconds',
      help: 'Database operation duration in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'auth_service_db_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    // Initialize business metrics
    this.usersTotal = new Gauge({
      name: 'auth_service_users_total',
      help: 'Total number of users',
      registers: [this.registry],
    });

    this.sessionsTotal = new Gauge({
      name: 'auth_service_sessions_total',
      help: 'Total number of active sessions',
      registers: [this.registry],
    });

    this.tenantsTotal = new Gauge({
      name: 'auth_service_tenants_total',
      help: 'Total number of tenants',
      registers: [this.registry],
    });

    // Initialize auth-specific metrics
    this.loginAttemptsTotal = new Counter({
      name: 'auth_service_login_attempts_total',
      help: 'Total number of login attempts',
      labelNames: ['status', 'method'],
      registers: [this.registry],
    });

    this.mfaChallengesTotal = new Counter({
      name: 'auth_service_mfa_challenges_total',
      help: 'Total number of MFA challenges',
      labelNames: ['status', 'factor_type'],
      registers: [this.registry],
    });

    this.tokenOperationsTotal = new Counter({
      name: 'auth_service_token_operations_total',
      help: 'Total number of token operations',
      labelNames: ['operation', 'token_type'],
      registers: [this.registry],
    });

    // Initialize error metrics
    this.errorsTotal = new Counter({
      name: 'auth_service_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Initialize event loop lag
    this.eventLoopLag = new Gauge({
      name: 'auth_service_event_loop_lag_seconds',
      help: 'Event loop lag in seconds',
      registers: [this.registry],
    });

    // Start event loop lag monitoring
    // this.monitorEventLoopLag();
    */

    this.logger.log('Metrics service initialized (disabled - install prom-client to enable)');
  }

  /**
   * Record HTTP request metrics (disabled)
   */
  recordHttpRequest(_method: string, _route: string, _statusCode: number, _duration: number): void {
    // Disabled until prom-client is installed
  }

  /**
   * Increment in-flight requests (disabled)
   */
  incrementInFlightRequests(_method: string): void {
    // Disabled until prom-client is installed
  }

  /**
   * Decrement in-flight requests (disabled)
   */
  decrementInFlightRequests(_method: string): void {
    // Disabled until prom-client is installed
  }

  /**
   * Record database operation metrics (disabled)
   */
  recordDatabaseOperation(
    _operation: string,
    _table: string,
    _duration: number,
    _status: 'success' | 'error'
  ): void {
    // Disabled until prom-client is installed
  }

  /**
   * Update active database connections (disabled)
   */
  setActiveConnections(_count: number): void {
    // Disabled until prom-client is installed
  }

  /**
   * Update business metrics (disabled)
   */
  setUsersTotal(_count: number): void {
    // Disabled until prom-client is installed
  }

  setSessionsTotal(_count: number): void {
    // Disabled until prom-client is installed
  }

  setTenantsTotal(_count: number): void {
    // Disabled until prom-client is installed
  }

  /**
   * Record login attempt (disabled)
   */
  recordLoginAttempt(_status: 'success' | 'failure', _method: 'password' | 'sso'): void {
    // Disabled until prom-client is installed
  }

  /**
   * Record MFA challenge (disabled)
   */
  recordMfaChallenge(_status: 'success' | 'failure', _factorType: string): void {
    // Disabled until prom-client is installed
  }

  /**
   * Record token operation (disabled)
   */
  recordTokenOperation(
    _operation: 'generate' | 'validate' | 'refresh' | 'revoke',
    _tokenType: 'access' | 'refresh'
  ): void {
    // Disabled until prom-client is installed
  }

  /**
   * Record error (disabled)
   */
  recordError(_type: string, _route: string, _statusCode: number): void {
    // Disabled until prom-client is installed
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get content type for Prometheus metrics
   */
  getContentType(): string {
    return this.registry.contentType;
  }
}
