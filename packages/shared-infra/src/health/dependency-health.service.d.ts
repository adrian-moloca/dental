import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
export interface DependencyHealthCheck {
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
    metadata?: Record<string, any>;
}
export interface HttpHealthCheckOptions {
    url: string;
    timeout?: number;
    expectedStatus?: number;
    retries?: number;
}
export declare class DependencyHealthService {
    private readonly logger;
    checkHttpEndpoint(options: HttpHealthCheckOptions): Promise<DependencyHealthCheck>;
    checkDatabaseConnection(dataSource: DataSource, name?: string): Promise<DependencyHealthCheck>;
    checkRedisConnection(redis: Redis, name?: string): Promise<DependencyHealthCheck>;
    checkMultipleEndpoints(endpoints: HttpHealthCheckOptions[]): Promise<DependencyHealthCheck[]>;
    aggregateHealthStatus(checks: DependencyHealthCheck[]): 'up' | 'down' | 'degraded';
    calculateAverageResponseTime(checks: DependencyHealthCheck[]): number;
    calculateUptime(successfulChecks: number, totalChecks: number): number;
    private extractServiceName;
    private extractErrorMessage;
    private sleep;
}
