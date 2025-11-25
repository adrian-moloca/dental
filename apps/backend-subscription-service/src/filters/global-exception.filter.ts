/**
 * Global Exception Filter
 *
 * Catches all exceptions and transforms them into consistent error responses.
 * Integrates with correlation ID and tenant context for structured logging.
 *
 * Edge cases handled:
 * - BaseError from shared-errors package
 * - NestJS HttpException
 * - Unknown/unexpected errors
 * - Missing correlation ID
 * - Missing tenant context (public routes)
 * - Production vs development error details
 * - No PHI/PII in client responses
 *
 * @module filters/global-exception
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  BaseError,
  mapErrorToHttpStatus,
  buildProductionErrorResponse,
  buildDevelopmentErrorResponse,
} from '@dentalos/shared-errors';
import { getCorrelationId } from '../middleware/correlation-id.middleware';
import type { RequestWithUser } from '../interceptors/tenant-context.interceptor';

/**
 * Global exception filter that catches all errors
 *
 * Formats error responses consistently and logs with context.
 * Never exposes stack traces or PHI/PII in production.
 * Integrates with shared-errors package for standardized error handling.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Catch and handle exceptions
   *
   * Edge cases handled:
   * - BaseError: Use shared-errors utilities for response building
   * - HttpException: Map to standard error format
   * - Unknown errors: Return 500 with generic message
   * - Missing tenant context: Log without tenant info (public routes)
   * - Missing correlation ID: Use 'unknown' as fallback
   *
   * @param exception - The caught exception
   * @param host - Execution context host
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    // Extract correlation ID from AsyncLocalStorage
    const correlationId = getCorrelationId();

    // Extract tenant context from request (attached by TenantContextInterceptor)
    const tenantContext = this.getTenantContext(request);

    // Determine HTTP status and build client response
    let statusCode: number;
    let errorResponse: Record<string, unknown>;

    if (exception instanceof BaseError) {
      // Use shared-errors utilities for BaseError
      statusCode = mapErrorToHttpStatus(exception);

      // Build response based on environment
      const baseResponse = this.isProduction
        ? buildProductionErrorResponse(exception)
        : buildDevelopmentErrorResponse(exception);

      errorResponse = {
        ...baseResponse,
        correlationId,
        path: request.url,
        method: request.method,
      };
    } else if (exception instanceof HttpException) {
      // Handle NestJS HttpException
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        status: 'error',
        statusCode,
        code: `HTTP_${statusCode}`,
        message:
          typeof exceptionResponse === 'object' && exceptionResponse !== null
            ? (exceptionResponse as { message?: string }).message || exception.message
            : exception.message,
        correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        !this.isProduction
          ? { details: exceptionResponse }
          : {}),
      };
    } else {
      // Handle unknown errors - return generic 500
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage =
        exception instanceof Error ? exception.message : 'An unexpected error occurred';

      errorResponse = {
        status: 'error',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: this.isProduction
          ? 'An unexpected error occurred. Please contact support.'
          : errorMessage,
        correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(exception instanceof Error && !this.isProduction && exception.stack
          ? { stack: exception.stack }
          : {}),
      };
    }

    // SERVER-SIDE LOGGING (includes full context including tenant info)
    this.logError(exception, {
      statusCode,
      correlationId,
      tenantContext,
      path: request.url,
      method: request.method,
    });

    // CLIENT RESPONSE (sanitized, no stack traces, no tenant context)
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Extract tenant context from request
   *
   * Tenant context is attached by TenantContextInterceptor.
   * May be undefined for public routes or errors before interceptor runs.
   *
   * @param request - HTTP request
   * @returns Tenant context or empty object
   */
  private getTenantContext(request: RequestWithUser): {
    organizationId?: string;
    clinicId?: string;
  } {
    if (request.tenantContext) {
      return {
        organizationId: request.tenantContext.organizationId,
        clinicId: request.tenantContext.clinicId,
      };
    }

    // Fallback: Try to extract from headers (before interceptor runs)
    const headers = request.headers as unknown as Record<string, string | string[] | undefined>;
    return {
      organizationId:
        typeof headers['x-organization-id'] === 'string' ? headers['x-organization-id'] : undefined,
      clinicId: typeof headers['x-clinic-id'] === 'string' ? headers['x-clinic-id'] : undefined,
    };
  }

  /**
   * Log error with full context
   *
   * Logs include:
   * - Correlation ID for distributed tracing
   * - Tenant context for audit trails (server-side only)
   * - Stack traces in non-production environments
   * - HTTP status code and error code
   *
   * Log level determination:
   * - 5xx errors: ERROR level (server-side issues)
   * - 4xx errors: WARN level (client errors)
   *
   * CRITICAL: Never log PHI/PII. Tenant IDs are safe for audit purposes.
   *
   * @param exception - The caught exception
   * @param context - Request and error context
   */
  private logError(
    exception: unknown,
    context: {
      statusCode: number;
      correlationId: string;
      tenantContext: { organizationId?: string; clinicId?: string };
      path: string;
      method: string;
    },
  ): void {
    const { statusCode, correlationId, tenantContext, path, method } = context;

    // Extract error details
    const errorCode = exception instanceof BaseError ? exception.code : 'UNKNOWN_ERROR';
    const message = exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    // Determine log level based on status code
    const logLevel = statusCode >= 500 ? 'error' : 'warn';

    // Build structured log entry
    const logEntry = {
      message: `Request failed: ${method} ${path}`,
      error: message,
      errorCode,
      statusCode,
      correlationId,
      // Include tenant context for audit trail (CRITICAL for multi-tenant isolation tracking)
      ...(tenantContext.organizationId
        ? {
            tenantContext: {
              organizationId: tenantContext.organizationId,
              ...(tenantContext.clinicId ? { clinicId: tenantContext.clinicId } : {}),
            },
          }
        : {}),
      timestamp: new Date().toISOString(),
      // Include stack trace in non-production for debugging
      ...(stack && !this.isProduction ? { stack } : {}),
    };

    // Log at appropriate level
    this.logger[logLevel](logEntry);
  }
}
