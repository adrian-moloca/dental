import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Logging Interceptor
 *
 * Logs all HTTP requests with:
 * - HTTP method and URL
 * - Request duration (in milliseconds)
 * - Response status code
 * - Correlation ID (if present in headers)
 * - Tenant context (organization ID, clinic ID)
 * - User agent and IP address
 *
 * Edge cases handled:
 * - Missing correlation ID (generates new one)
 * - Missing tenant context (logged as undefined)
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
    const correlationId = this.extractCorrelationId(request);
    const tenantContext = this.extractTenantContext(request);

    // Log incoming request
    // Edge case: Log before processing to capture all requests, even those that fail
    this.logIncomingRequest(method, url, correlationId, tenantContext, request);

    // Process request and log response
    return next.handle().pipe(
      tap({
        // Log successful response
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logOutgoingResponse(method, url, statusCode, duration, correlationId, tenantContext);
        },
        // Log failed response
        // Edge case: Log errors with their status codes for debugging
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          // Try to extract status code from error
          const statusCode = this.extractStatusCode(error, response);

          this.logOutgoingResponse(
            method,
            url,
            statusCode,
            duration,
            correlationId,
            tenantContext,
            error,
          );
        },
      }),
    );
  }

  /**
   * Logs incoming HTTP request
   *
   * Edge cases handled:
   * - Missing correlation ID (logged as 'none')
   * - Missing tenant context (logged as undefined)
   * - PHI-safe: No request body logging
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @param correlationId - Correlation ID for distributed tracing
   * @param tenantContext - Tenant context
   * @param request - Express request object
   */
  private logIncomingRequest(
    method: string,
    url: string,
    correlationId: string,
    tenantContext: { organizationId?: string; clinicId?: string },
    request: Request,
  ): void {
    this.logger.log(`→ ${method} ${url}`, {
      correlationId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
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
   * @param tenantContext - Tenant context
   * @param error - Error object if request failed
   */
  private logOutgoingResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId: string,
    tenantContext: { organizationId?: string; clinicId?: string },
    error?: Error,
  ): void {
    const logContext = {
      correlationId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
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
   * Extracts correlation ID from request headers
   *
   * Edge cases handled:
   * - Falls back to generating new correlation ID if not present
   * - Handles both lowercase and uppercase header names
   *
   * @param request - Express request object
   * @returns Correlation ID
   */
  private extractCorrelationId(request: Request): string {
    return (
      request.get('x-correlation-id') ||
      request.get('X-Correlation-ID') ||
      this.generateCorrelationId()
    );
  }

  /**
   * Extracts tenant context from request headers
   *
   * Edge cases handled:
   * - Returns undefined values if headers not present
   * - Handles both lowercase and uppercase header names
   * - PHI-safe: Only extracts tenant identifiers
   *
   * @param request - Express request object
   * @returns Tenant context
   */
  private extractTenantContext(request: Request): {
    organizationId?: string;
    clinicId?: string;
  } {
    const organizationId = request.get('x-organization-id') || request.get('X-Organization-ID');
    const clinicId = request.get('x-clinic-id') || request.get('X-Clinic-ID');

    return {
      organizationId: organizationId || undefined,
      clinicId: clinicId || undefined,
    };
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

  /**
   * Generates a new correlation ID
   *
   * Edge case: Uses timestamp + random string for uniqueness
   *
   * @returns Generated correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
