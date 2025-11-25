import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';

/**
 * Performance Monitoring Interceptor
 * Tracks response times, database queries, and cache performance
 */

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  organizationId?: string;
  clinicId?: string;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private readonly WARNING_THRESHOLD = 500; // 500ms

  // In-memory metrics aggregation (consider moving to Redis for distributed systems)
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  constructor(private readonly cacheService: CacheService) {
    // Log aggregated metrics every 60 seconds
    setInterval(() => {
      this.logAggregatedMetrics();
    }, 60000);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const requestId = request.headers['x-correlation-id'] || this.generateRequestId();

    // Extract context
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers['user-agent'];
    const organizationId = request.headers['x-organization-id'];
    const clinicId = request.headers['x-clinic-id'];

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics({
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            responseTime: Date.now() - startTime,
            timestamp: new Date(),
            userAgent,
            organizationId,
            clinicId,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.recordMetrics({
            requestId,
            method,
            url,
            statusCode: error.status || 500,
            responseTime,
            timestamp: new Date(),
            userAgent,
            organizationId,
            clinicId,
          });

          this.logger.error({
            message: 'Request failed',
            requestId,
            method,
            url,
            statusCode: error.status || 500,
            responseTime,
            error: error.message,
          });
        },
      }),
    );
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    // Add to metrics array
    this.metrics.push(metrics);

    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow requests immediately
    if (metrics.responseTime > this.SLOW_REQUEST_THRESHOLD) {
      this.logger.error({
        message: 'SLOW REQUEST DETECTED',
        ...metrics,
        threshold: this.SLOW_REQUEST_THRESHOLD,
      });
    } else if (metrics.responseTime > this.WARNING_THRESHOLD) {
      this.logger.warn({
        message: 'Slow request warning',
        ...metrics,
        threshold: this.WARNING_THRESHOLD,
      });
    }

    // Store in cache for analytics
    this.storeMetricsInCache(metrics);
  }

  private async storeMetricsInCache(metrics: PerformanceMetrics): Promise<void> {
    try {
      const key = `metrics:${metrics.requestId}`;
      await this.cacheService.set(key, metrics, { ttl: 3600 }); // 1 hour retention

      // Increment endpoint counter
      const endpointKey = `metrics:endpoint:${metrics.method}:${this.normalizeUrl(metrics.url)}`;
      await this.cacheService.increment(endpointKey);
    } catch (error) {
      // Don't fail request if metrics storage fails
      this.logger.error('Failed to store metrics in cache', error);
    }
  }

  private logAggregatedMetrics(): void {
    if (this.metrics.length === 0) {
      return;
    }

    // Calculate aggregated statistics
    const responseTimes = this.metrics.map((m) => m.responseTime);
    const statusCodes = this.metrics.reduce(
      (acc, m) => {
        acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const sorted = [...responseTimes].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const max = Math.max(...responseTimes);
    const min = Math.min(...responseTimes);

    // Endpoint breakdown
    const endpointStats = this.metrics.reduce(
      (acc, m) => {
        const key = `${m.method} ${this.normalizeUrl(m.url)}`;
        if (!acc[key]) {
          acc[key] = { count: 0, totalTime: 0, maxTime: 0 };
        }
        acc[key].count++;
        acc[key].totalTime += m.responseTime;
        acc[key].maxTime = Math.max(acc[key].maxTime, m.responseTime);
        return acc;
      },
      {} as Record<string, { count: number; totalTime: number; maxTime: number }>,
    );

    // Find slowest endpoints
    const slowestEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: stats.totalTime / stats.count,
        maxTime: stats.maxTime,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    this.logger.log({
      message: 'Performance metrics summary',
      period: '60s',
      totalRequests: this.metrics.length,
      responseTimes: {
        avg: Math.round(avg),
        p50,
        p95,
        p99,
        max,
        min,
      },
      statusCodes,
      slowestEndpoints,
      cacheStats: this.cacheService.getStats(),
    });

    // Clear old metrics
    this.metrics = this.metrics.slice(-100); // Keep last 100 for next cycle
  }

  private normalizeUrl(url: string): string {
    // Remove query parameters
    const baseUrl = url.split('?')[0];

    // Replace UUIDs and IDs with placeholders
    return baseUrl
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/[0-9a-f]{24}/gi, '/:id')
      .replace(/\/\d+/g, '/:id');
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get current metrics (for monitoring endpoints)
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}
