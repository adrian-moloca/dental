import { HealthCheckable, HealthCheckResult, HealthStatus } from './health-check.interface';
export declare class HealthAggregator {
    private components;
    register(name: string, component: HealthCheckable): void;
    unregister(name: string): void;
    checkAll(): Promise<Record<string, HealthCheckResult>>;
    getOverallStatus(): Promise<HealthStatus>;
}
