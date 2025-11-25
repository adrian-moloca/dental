import { HealthCheckable, HealthCheckResult, HealthStatus } from './health-check.interface';

/**
 * Aggregates health checks from multiple infrastructure components
 */
export class HealthAggregator {
  private components: Map<string, HealthCheckable> = new Map();

  /**
   * Register a component for health checking
   */
  public register(name: string, component: HealthCheckable): void {
    this.components.set(name, component);
  }

  /**
   * Unregister a component
   */
  public unregister(name: string): void {
    this.components.delete(name);
  }

  /**
   * Check health of all registered components
   */
  public async checkAll(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};

    const checks = Array.from(this.components.entries()).map(async ([name, component]) => {
      try {
        results[name] = await component.healthCheck();
      } catch (error) {
        results[name] = {
          status: HealthStatus.UNHEALTHY,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    await Promise.all(checks);
    return results;
  }

  /**
   * Get overall health status based on all components
   */
  public async getOverallStatus(): Promise<HealthStatus> {
    const results = await this.checkAll();
    const statuses = Object.values(results).map((r) => r.status);

    if (statuses.some((s) => s === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }

    if (statuses.some((s) => s === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }
}
