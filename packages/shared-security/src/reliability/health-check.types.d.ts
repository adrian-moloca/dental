export declare enum HealthStatus {
    UP = "UP",
    DOWN = "DOWN",
    DEGRADED = "DEGRADED"
}
export interface HealthCheckResult {
    status: HealthStatus;
    timestamp: string;
    service: string;
    version?: string;
    uptime?: number;
    dependencies?: Record<string, DependencyHealth>;
    details?: Record<string, any>;
}
export interface DependencyHealth {
    status: HealthStatus;
    responseTime?: number;
    message?: string;
    lastCheck?: string;
}
export interface LivenessResponse {
    status: 'OK' | 'ERROR';
    timestamp: string;
    uptime: number;
}
export interface ReadinessResponse {
    status: 'READY' | 'NOT_READY';
    timestamp: string;
    checks: Record<string, CheckResult>;
}
export interface CheckResult {
    status: 'UP' | 'DOWN';
    message?: string;
    responseTime?: number;
}
export declare function checkDatabaseHealth(checkFn: () => Promise<void>, timeout?: number): Promise<DependencyHealth>;
export declare function checkRedisHealth(checkFn: () => Promise<void>, timeout?: number): Promise<DependencyHealth>;
export declare function createLivenessResponse(): LivenessResponse;
export declare function createReadinessResponse(checks: Record<string, CheckResult>): ReadinessResponse;
