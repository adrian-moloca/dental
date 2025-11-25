import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

/**
 * Metrics Interceptor
 *
 * Automatically records HTTP request metrics for all endpoints:
 * - Request count by method, route, and status code
 * - Request duration (latency)
 * - In-flight requests gauge
 *
 * This interceptor should be registered globally in main.ts
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Get route pattern (e.g., /api/v1/organizations/:id instead of /api/v1/organizations/123)
    const route = this.getRoutePattern(context);

    // Skip metrics endpoint to avoid recursion
    if (route === '/metrics' || route === '/api/v1/metrics') {
      return next.handle();
    }

    const startTime = Date.now();

    // Increment in-flight requests
    this.metricsService.incrementInFlightRequests(method);

    return next.handle().pipe(
      tap({
        next: () => {
          // Success case
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode || 200;
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds

          this.metricsService.recordHttpRequest(method, route, statusCode, duration);
          this.metricsService.decrementInFlightRequests(method);
        },
        error: (error) => {
          // Error case
          const statusCode = error.status || 500;
          const duration = (Date.now() - startTime) / 1000;

          this.metricsService.recordHttpRequest(method, route, statusCode, duration);
          this.metricsService.recordError(error.name || 'UnknownError', route, statusCode);
          this.metricsService.decrementInFlightRequests(method);
        },
      }),
    );
  }

  /**
   * Extract route pattern from execution context
   * Returns the route template (e.g., /api/v1/organizations/:id)
   * instead of the actual path with parameter values
   */
  private getRoutePattern(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();

    // Try to get the route from the request object
    // NestJS stores the route pattern in request.route.path
    if (request.route && request.route.path) {
      return request.route.path;
    }

    // Fallback to URL if route pattern is not available
    return request.url.split('?')[0]; // Remove query string
  }
}
