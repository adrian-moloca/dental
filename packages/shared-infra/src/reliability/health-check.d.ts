export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy"
}
export interface HealthCheckResult {
    status: HealthStatus;
    checks: Record<string, ComponentHealth>;
    timestamp: string;
    uptime: number;
}
export interface ComponentHealth {
    status: HealthStatus;
    message?: string;
    responseTime?: number;
    lastCheck?: string;
}
export declare class HealthCheckService {
    private readonly logger;
    private readonly checks;
    private readonly startTime;
    private readonly checkCache;
    private readonly CACHE_TTL;
    register(name: string, checkFn: () => Promise<ComponentHealth>): void;
    check(): Promise<HealthCheckResult>;
    liveness(): Promise<{
        status: 'ok';
        timestamp: string;
    }>;
    readiness(): Promise<HealthCheckResult>;
    private timeout;
    static createDatabaseCheck(_db: any, testQuery: () => Promise<any>): () => Promise<ComponentHealth>;
    static createRedisCheck(redis: any): () => Promise<ComponentHealth>;
    static createExternalServiceCheck(serviceName: string, checkFn: () => Promise<boolean>): () => Promise<ComponentHealth>;
}
