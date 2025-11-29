import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { extractCorrelationId } from '../common/correlation-id.util';

/**
 * Logging Interceptor
 *
 * Logs all HTTP requests with:
 * - HTTP method and URL
 * - Request duration (in milliseconds)
 * - Response status code
 * - Correlation ID (if present in headers)
 * - User agent and IP address
 *
 * Edge cases handled:
 * - Missing correlation ID (generates new one)
 * - Request failures (logs error status codes)
 * - Long-running requests (logged with duration)
 * - PHI-safe logging (no request/response bodies)
 *
 * @implements {NestInterceptor}
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercepts requests and logs timing and metadata
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable that logs on completion
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Record start time for duration calculation
    const startTime = Date.now();

    // Get request and response objects
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Extract request metadata
    const { method, url } = request;
    const correlationId = extractCorrelationId(request);

    // Log incoming request
    // Edge case: Log before processing to capture all requests, even those that fail
    this.logIncomingRequest(method, url, correlationId, request);

    // Process request and log response
    return next.handle().pipe(
      tap({
        // Log successful response
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logOutgoingResponse(method, url, statusCode, duration, correlationId);
        },
        // Log failed response
        // Edge case: Log errors with their status codes for debugging
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          // Try to extract status code from error
          const statusCode = this.extractStatusCode(error, response);

          this.logOutgoingResponse(method, url, statusCode, duration, correlationId, error);
        },
      }),
    );
  }

  /**
   * Logs incoming HTTP request
   *
   * Edge cases handled:
   * - Missing correlation ID (logged as 'none')
   * - PHI-safe: No request body logging
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param correlationId - Correlation ID for distributed tracing
   * @param request - Express request object
   */
  private logIncomingRequest(
    method: string,
    url: string,
    correlationId: string,
    request: Request,
  ): void {
    this.logger.log(`→ ${method} ${url}`, {
      correlationId,
      userAgent: request.get('user-agent'),
      ip: request.ip,
    });
  }

  /**
   * Logs outgoing HTTP response
   *
   * Edge cases handled:
   * - Success responses (status 2xx, 3xx)
   * - Client error responses (status 4xx) - logged as warnings
   * - Server error responses (status 5xx) - logged as errors
   * - Long-running requests (duration > 1000ms) - logged with warning
   * - PHI-safe: No response body logging
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param statusCode - Response status code
   * @param duration - Request duration in milliseconds
   * @param correlationId - Correlation ID for distributed tracing
   * @param error - Error object if request failed
   */
  private logOutgoingResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId: string,
    error?: Error,
  ): void {
    const logContext = {
      correlationId,
      duration: `${duration}ms`,
      statusCode,
    };

    const message = `← ${method} ${url} ${statusCode} ${duration}ms`;

    // Edge case: Log level based on status code
    if (statusCode >= 500) {
      // Server errors
      this.logger.error(message, error?.stack, logContext);
    } else if (statusCode >= 400) {
      // Client errors
      this.logger.warn(message, logContext);
    } else if (duration > 1000) {
      // Edge case: Successful but slow requests
      this.logger.warn(`${message} (SLOW REQUEST)`, logContext);
    } else {
      // Successful requests
      this.logger.log(message, logContext);
    }
  }

  /**
   * Extracts status code from error or response
   *
   * Edge cases handled:
   * - Errors with statusCode property
   * - Errors with status property
   * - Falls back to response status code
   * - Defaults to 500 for unknown errors
   *
   * @param error - Error object
   * @param response - Express response object
   * @returns HTTP status code
   */
  private extractStatusCode(error: Error, response: Response): number {
    // Try to get status code from error
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }

    if ('status' in error && typeof error.status === 'number') {
      return error.status as number;
    }

    // Fall back to response status code
    if (response.statusCode) {
      return response.statusCode;
    }

    // Default to 500 for unknown errors
    return 500;
  }
}
