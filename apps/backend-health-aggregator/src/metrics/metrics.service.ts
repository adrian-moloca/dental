import { Injectable } from '@nestjs/common';

/**
 * Metrics Service
 *
 * Provides basic metrics tracking and reporting for the health aggregator service.
 * Tracks request counts, service health checks, and performance metrics.
 */
@Injectable()
export class MetricsService {
  private readonly metrics: Map<string, number> = new Map();

  /**
   * Increments a metric counter
   *
   * @param name - Metric name
   * @param value - Value to increment by (default: 1)
   */
  increment(name: string, value: number = 1): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  /**
   * Sets a metric value
   *
   * @param name - Metric name
   * @param value - Metric value
   */
  set(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  /**
   * Gets a metric value
   *
   * @param name - Metric name
   * @returns Metric value or 0 if not found
   */
  get(name: string): number {
    return this.metrics.get(name) || 0;
  }

  /**
   * Gets all metrics
   *
   * @returns Object containing all metrics
   */
  getAll(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Resets a specific metric
   *
   * @param name - Metric name
   */
  reset(name: string): void {
    this.metrics.delete(name);
  }

  /**
   * Resets all metrics
   */
  resetAll(): void {
    this.metrics.clear();
  }

  /**
   * Returns metrics in Prometheus text format
   *
   * @returns Prometheus-formatted metrics string
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    for (const [name, value] of this.metrics.entries()) {
      // Convert metric name to Prometheus format
      const prometheusName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`# TYPE ${prometheusName} gauge`);
      lines.push(`${prometheusName} ${value}`);
    }

    return lines.join('\n');
  }
}
