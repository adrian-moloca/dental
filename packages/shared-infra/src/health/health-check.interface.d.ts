export declare enum HealthStatus {
    HEALTHY = "HEALTHY",
    UNHEALTHY = "UNHEALTHY",
    DEGRADED = "DEGRADED"
}
export interface HealthCheckResult {
    status: HealthStatus;
    timestamp: Date;
    message?: string;
    error?: string;
    metadata?: Record<string, unknown>;
}
export interface HealthCheckable {
    healthCheck(): Promise<HealthCheckResult>;
}
