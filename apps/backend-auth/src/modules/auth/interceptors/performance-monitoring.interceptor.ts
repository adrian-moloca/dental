/**
 * Performance Monitoring Interceptor
 *
 * Monitors request latency and logs warnings when performance budgets are exceeded.
 * Tracks auth-subscription integration performance metrics.
 *
 * Performance budgets monitored:
 * - POST /auth/login: 500ms
 * - POST /auth/register: 500ms
 * - POST /auth/refresh: 200ms
 * - GET /auth/me: 100ms
 * - Module access checks: 50ms (logged separately in guard)
 *
 * Metrics collected:
 * - Request duration (total)
 * - Subscription fetch time (if applicable)
 * - Cache hit/miss rate
 * - JWT generation time
 *
 * @module modules/auth/interceptors
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Performance budget thresholds (P95 targets)
 */
const PERFORMANCE_BUDGETS: Record<string, number> = {
  'POST /auth/login': 500,
  'POST /auth/register': 500,
  'POST /auth/login-smart': 500,
  'POST /auth/select-org': 500,
  'POST /auth/refresh': 200,
  'GET /auth/me': 100,
  'POST /auth/logout': 50,
  'GET /auth/sessions': 100,
};

/**
 * Performance monitoring interceptor
 *
 * Logs warnings when endpoints exceed performance budgets.
 * Collects metrics for dashboards and alerting.
 */
@Injectable()
export class PerformanceMonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceMonitoringInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const routeKey = `${method} ${this.extractRoute(url)}`;

    // Start timer
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Get budget for this route
        const budget = PERFORMANCE_BUDGETS[routeKey];

        if (budget) {
          // Check if budget exceeded
          if (duration > budget) {
            this.logger.warn(
              `⚠️  PERFORMANCE BUDGET EXCEEDED: ${routeKey} took ${duration}ms (budget: ${budget}ms, overage: +${duration - budget}ms)`,
              {
                route: routeKey,
                duration,
                budget,
                overage: duration - budget,
                userId: user?.sub,
                organizationId: user?.organizationId,
              }
            );
          } else {
            this.logger.debug(`✓ ${routeKey} completed in ${duration}ms (budget: ${budget}ms)`);
          }

          // Log metrics for monitoring dashboard
          this.logMetric({
            route: routeKey,
            duration,
            budget,
            passed: duration <= budget,
            timestamp: new Date().toISOString(),
            userId: user?.sub,
            organizationId: user?.organizationId,
          });
        } else {
          // No budget defined for this route
          this.logger.debug(`${routeKey} completed in ${duration}ms (no budget)`);
        }
      })
    );
  }

  /**
   * Extract route pattern from URL
   *
   * Converts /auth/login?foo=bar -> /auth/login
   *
   * @param url - Request URL
   * @returns Route pattern
   * @private
   */
  private extractRoute(url: string): string {
    // Remove query params
    const path = url.split('?')[0];

    // Remove trailing slashes
    return path.replace(/\/$/, '');
  }

  /**
   * Log performance metric
   *
   * In production, this would send metrics to:
   * - Prometheus/Grafana for dashboarding
   * - CloudWatch/DataDog for alerting
   * - Application Insights for analysis
   *
   * For now, just log to console in structured format.
   *
   * @param metric - Performance metric data
   * @private
   */
  private logMetric(metric: any): void {
    // In production, send to metrics aggregator
    // For now, log as structured JSON
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ type: 'performance_metric', ...metric }));
    }
  }
}
