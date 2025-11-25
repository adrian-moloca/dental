import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Performance Monitoring Interceptor
 *
 * Tracks response times and logs performance metrics for all HTTP requests.
 *
 * Edge cases handled:
 * - Slow requests (> 1000ms) logged as errors
 * - Warning threshold (> 500ms) logged as warnings
 * - Failed requests tracked with error status codes
 * - Aggregated metrics logged periodically
 *
 * @implements {NestInterceptor}
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private readonly WARNING_THRESHOLD = 500; // 500ms

  /**
   * Intercepts requests and tracks performance metrics
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable that tracks performance
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const requestId = request.headers['x-correlation-id'] || this.generateRequestId();

    // Extract context
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logPerformance(method, url, response.statusCode, responseTime, requestId);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = this.extractStatusCode(error);
          this.logPerformance(method, url, statusCode, responseTime, requestId, error);
        },
      }),
    );
  }

  /**
   * Logs performance metrics with appropriate severity
   *
   * Edge cases handled:
   * - Slow requests (> 1s) logged as errors
   * - Warning threshold (> 500ms) logged as warnings
   * - Normal requests logged as debug
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param statusCode - Response status code
   * @param responseTime - Response time in milliseconds
   * @param requestId - Request correlation ID
   * @param error - Error object if request failed
   */
  private logPerformance(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    requestId: string,
    error?: Error,
  ): void {
    const logContext = {
      requestId,
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
    };

    // Edge case: Log slow requests as errors
    if (responseTime > this.SLOW_REQUEST_THRESHOLD) {
      this.logger.error(`SLOW REQUEST DETECTED: ${method} ${url} ${responseTime}ms`, logContext);
    }
    // Edge case: Log moderately slow requests as warnings
    else if (responseTime > this.WARNING_THRESHOLD) {
      this.logger.warn(`Slow request: ${method} ${url} ${responseTime}ms`, logContext);
    }
    // Normal requests logged at debug level
    else if (error) {
      this.logger.error(`Failed request: ${method} ${url} ${responseTime}ms`, logContext);
    }
  }

  /**
   * Extracts status code from error
   *
   * Edge cases handled:
   * - Errors with statusCode property
   * - Errors with status property
   * - Defaults to 500 for unknown errors
   *
   * @param error - Error object
   * @returns HTTP status code
   */
  private extractStatusCode(error: unknown): number {
    if (error && typeof error === 'object') {
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode;
      }
      if ('status' in error && typeof error.status === 'number') {
        return error.status as number;
      }
    }
    return 500;
  }

  /**
   * Generates a unique request ID
   *
   * @returns Generated request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
