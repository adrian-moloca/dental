"use strict";
var PrometheusMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusMetricsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const client = require("prom-client");
let PrometheusMetricsService = PrometheusMetricsService_1 = class PrometheusMetricsService {
    constructor() {
        this.logger = new common_1.Logger(PrometheusMetricsService_1.name);
        this.customCounters = new Map();
        this.customGauges = new Map();
        this.customHistograms = new Map();
        this.registry = new client.Registry();
        client.collectDefaultMetrics({ register: this.registry });
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
    recordHttpRequest(method, route, statusCode, durationMs, tenantId) {
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
    recordDatabaseQuery(table, operation, durationMs, tenantId) {
        const labels = { table, operation, tenant_id: tenantId || 'none' };
        this.dbQueryDuration.observe(labels, durationMs);
        this.dbQueriesTotal.inc(labels);
    }
    setDbConnectionPoolSize(database, active, idle) {
        this.dbConnectionPoolSize.set({ database, state: 'active' }, active);
        this.dbConnectionPoolSize.set({ database, state: 'idle' }, idle);
    }
    recordExternalServiceCall(service, operation, durationMs, success) {
        const labels = { service, operation, status: success ? 'success' : 'failure' };
        this.externalServiceDuration.observe(labels, durationMs);
        if (!success) {
            this.externalServiceErrors.inc({ service, operation, error_type: 'call_failed' });
        }
    }
    recordCircuitBreakerState(service, state) {
        const stateValue = state === 'CLOSED' ? 0 : state === 'HALF_OPEN' ? 1 : 2;
        this.circuitBreakerState.set({ service }, stateValue);
        if (state === 'OPEN') {
            this.circuitBreakerTrips.inc({ service });
        }
    }
    incrementCounter(name, labels = {}) {
        if (!this.customCounters.has(name)) {
            this.customCounters.set(name, new client.Counter({
                name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
                help: `Custom counter: ${name}`,
                labelNames: Object.keys(labels),
                registers: [this.registry],
            }));
        }
        this.customCounters.get(name).inc(labels);
    }
    setGauge(name, value, labels = {}) {
        if (!this.customGauges.has(name)) {
            this.customGauges.set(name, new client.Gauge({
                name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
                help: `Custom gauge: ${name}`,
                labelNames: Object.keys(labels),
                registers: [this.registry],
            }));
        }
        this.customGauges.get(name).set(labels, value);
    }
    recordHistogram(name, value, labels = {}) {
        if (!this.customHistograms.has(name)) {
            this.customHistograms.set(name, new client.Histogram({
                name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
                help: `Custom histogram: ${name}`,
                labelNames: Object.keys(labels),
                registers: [this.registry],
            }));
        }
        this.customHistograms.get(name).observe(labels, value);
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    async getMetricsJSON() {
        return this.registry.getMetricsAsJSON();
    }
};
exports.PrometheusMetricsService = PrometheusMetricsService;
exports.PrometheusMetricsService = PrometheusMetricsService = PrometheusMetricsService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], PrometheusMetricsService);
//# sourceMappingURL=prometheus-metrics.js.map