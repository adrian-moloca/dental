import * as client from 'prom-client';
export declare class PrometheusMetricsService {
    private readonly logger;
    private readonly registry;
    private readonly httpRequestDuration;
    private readonly httpRequestsTotal;
    private readonly httpRequestErrors;
    private readonly dbQueryDuration;
    private readonly dbQueriesTotal;
    private readonly dbConnectionPoolSize;
    private readonly externalServiceDuration;
    private readonly externalServiceErrors;
    private readonly circuitBreakerState;
    private readonly circuitBreakerTrips;
    private readonly customCounters;
    private readonly customGauges;
    private readonly customHistograms;
    constructor();
    recordHttpRequest(method: string, route: string, statusCode: number, durationMs: number, tenantId?: string): void;
    recordDatabaseQuery(table: string, operation: string, durationMs: number, tenantId?: string): void;
    setDbConnectionPoolSize(database: string, active: number, idle: number): void;
    recordExternalServiceCall(service: string, operation: string, durationMs: number, success: boolean): void;
    recordCircuitBreakerState(service: string, state: 'CLOSED' | 'HALF_OPEN' | 'OPEN'): void;
    incrementCounter(name: string, labels?: Record<string, string>): void;
    setGauge(name: string, value: number, labels?: Record<string, string>): void;
    recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
    getMetrics(): Promise<string>;
    getMetricsJSON(): Promise<client.MetricObjectWithValues<client.MetricValue<string>>[]>;
}
