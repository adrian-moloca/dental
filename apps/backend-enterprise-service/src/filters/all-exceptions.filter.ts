import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BaseError,
  type ErrorResponse,
  buildDevelopmentErrorResponse,
  buildProductionErrorResponse,
} from '@dentalos/shared-errors';

/**
 * Global exception filter for the Enterprise Service
 *
 * Handles all errors thrown in the application and converts them to
 * standardized error responses.
 *
 * Edge cases handled:
 * - BaseError instances (from @dentalos/shared-errors)
 * - NestJS HttpException instances
 * - Unknown errors (programmer errors, unexpected exceptions)
 * - Development vs production error formatting
 * - PHI-safe logging (no patient data in logs)
 * - Tenant context extraction from request headers
 * - Correlation ID tracking for distributed tracing
 *
 * @implements {ExceptionFilter}
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Catches and handles all exceptions thrown in the application
   *
   * @param exception - The exception that was thrown
   * @param host - ArgumentsHost providing access to the execution context
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract correlation ID from request headers for distributed tracing
    const correlationId = this.extractCorrelationId(request);

    // Extract tenant context from request headers for audit logging
    const tenantContext = this.extractTenantContext(request);

    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Process the exception and build appropriate response
    const { statusCode, errorResponse } = this.processException(
      exception,
      correlationId,
      isDevelopment,
    );

    // Log the error with appropriate severity and context
    this.logError(exception, statusCode, correlationId, tenantContext, request);

    // Send the error response to the client
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Processes an exception and returns status code and error response
   *
   * Edge cases handled:
   * - BaseError instances use their toErrorResponse() method
   * - HttpException instances are converted to ErrorResponse format
   * - Unknown errors get generic messages in production
   * - Development mode includes full error details
   * - Correlation ID is injected into all error responses
   *
   * @param exception - The exception to process
   * @param correlationId - Correlation ID for distributed tracing
   * @param isDevelopment - Whether we're in development mode
   * @returns Status code and error response
   */
  private processException(
    exception: unknown,
    correlationId: string,
    isDevelopment: boolean,
  ): { statusCode: number; errorResponse: ErrorResponse } {
    // Handle BaseError instances (from @dentalos/shared-errors)
    if (exception instanceof BaseError) {
      const statusCode = exception.toHttpStatus();
      const errorResponse = isDevelopment
        ? buildDevelopmentErrorResponse(exception)
        : buildProductionErrorResponse(exception);

      // Inject correlation ID if not already present
      if (!errorResponse.correlationId) {
        errorResponse.correlationId = correlationId;
      }

      return { statusCode, errorResponse };
    }

    // Handle NestJS HttpException instances
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // HttpException response can be a string or an object
      let errorResponse: ErrorResponse;

      if (typeof exceptionResponse === 'string') {
        errorResponse = {
          status: 'error',
          code: this.httpStatusToErrorCode(statusCode),
          message: exceptionResponse,
          timestamp: new Date().toISOString(),
          correlationId,
        };
      } else if (typeof exceptionResponse === 'object') {
        // NestJS validation errors have a specific format
        const responseObj = exceptionResponse as Record<string, unknown>;
        errorResponse = {
          status: 'error',
          code:
            typeof responseObj.error === 'string'
              ? responseObj.error.toUpperCase().replace(/\s+/g, '_')
              : this.httpStatusToErrorCode(statusCode),
          message:
            typeof responseObj.message === 'string' ? responseObj.message : 'An error occurred',
          details: responseObj.message, // Validation errors often have array of messages
          timestamp: new Date().toISOString(),
          correlationId,
        };
      } else {
        // Fallback for unexpected response format
        errorResponse = {
          status: 'error',
          code: this.httpStatusToErrorCode(statusCode),
          message: exception.message || 'An error occurred',
          timestamp: new Date().toISOString(),
          correlationId,
        };
      }

      // Include stack trace in development mode
      if (isDevelopment && exception.stack) {
        errorResponse.stack = exception.stack;
      }

      return { statusCode, errorResponse };
    }

    // Handle unknown errors (programmer errors, unexpected exceptions)
    // Edge case: Never expose internal error details to clients in production
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: ErrorResponse;

    if (isDevelopment) {
      // In development, provide full error details for debugging
      errorResponse = {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: exception instanceof Error ? exception.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        correlationId,
        stack: exception instanceof Error ? exception.stack : new Error().stack,
      };
    } else {
      // In production, provide generic error message
      // Edge case: Never expose implementation details or stack traces
      errorResponse = {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please contact support.',
        timestamp: new Date().toISOString(),
        correlationId,
      };
    }

    return { statusCode, errorResponse };
  }

  /**
   * Logs an error with appropriate severity and context
   *
   * Edge cases handled:
   * - Different log levels based on error type and status code
   * - PHI-safe logging (no patient data in logs)
   * - Tenant context included for audit trail
   * - Correlation ID for distributed tracing
   * - Request metadata (method, URL, user agent)
   * - Stack traces for server errors
   *
   * @param exception - The exception to log
   * @param statusCode - HTTP status code
   * @param correlationId - Correlation ID for distributed tracing
   * @param tenantContext - Tenant context for audit logging
   * @param request - Express request object
   */
  private logError(
    exception: unknown,
    statusCode: number,
    correlationId: string,
    tenantContext: { organizationId?: string; clinicId?: string },
    request: Request,
  ): void {
    // Build log context with request metadata
    // Edge case: PHI-safe logging - no patient data, only request metadata
    const logContext = {
      correlationId,
      method: request.method,
      url: request.url,
      statusCode,
      userAgent: request.get('user-agent'),
      ip: request.ip,
      // Include tenant context for audit trail
      // Edge case: Only log tenant IDs, never any patient/PHI data
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
    };

    // Determine log level based on status code
    // Edge case: 4xx errors are warnings, 5xx errors are errors
    if (statusCode >= 500) {
      // Server errors are logged as errors with full details
      this.logger.error(
        `${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
        logContext,
      );
    } else if (statusCode >= 400) {
      // Client errors are logged as warnings (expected errors)
      this.logger.warn(
        `${exception instanceof Error ? exception.message : 'Client error'}`,
        logContext,
      );
    } else {
      // Other exceptions (should not happen, but defensive programming)
      this.logger.log(
        `${exception instanceof Error ? exception.message : 'Exception'}`,
        logContext,
      );
    }

    // For critical errors (non-operational), log additional alert
    // Edge case: Programmer errors need immediate attention
    if (exception instanceof BaseError && exception.isCritical()) {
      this.logger.error(`CRITICAL ERROR: ${exception.code} - This requires immediate attention`, {
        ...logContext,
        errorCode: exception.code,
        isOperational: exception.isOperational,
      });
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
    // Try to get correlation ID from headers
    // Edge case: Support both lowercase and uppercase header names
    const correlationId =
      request.get('x-correlation-id') ||
      request.get('X-Correlation-ID') ||
      // Fallback: Generate new correlation ID if not present
      this.generateCorrelationId();

    return correlationId;
  }

  /**
   * Extracts tenant context from request headers
   *
   * Edge cases handled:
   * - Returns undefined values if headers not present
   * - Handles both lowercase and uppercase header names
   * - PHI-safe: Only extracts tenant identifiers, no patient data
   *
   * @param request - Express request object
   * @returns Tenant context
   */
  private extractTenantContext(request: Request): {
    organizationId?: string;
    clinicId?: string;
  } {
    // Extract organization ID from headers
    // Edge case: Support both lowercase and uppercase header names
    const organizationId = request.get('x-organization-id') || request.get('X-Organization-ID');

    // Extract clinic ID from headers
    const clinicId = request.get('x-clinic-id') || request.get('X-Clinic-ID');

    return {
      organizationId: organizationId || undefined,
      clinicId: clinicId || undefined,
    };
  }

  /**
   * Generates a new correlation ID
   *
   * Edge case: Uses timestamp + random string for uniqueness
   *
   * @returns Generated correlation ID
   */
  private generateCorrelationId(): string {
    // Simple correlation ID generation: timestamp + random string
    // Edge case: Good enough for tracing, not cryptographically secure
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Converts HTTP status code to error code
   *
   * @param statusCode - HTTP status code
   * @returns Error code string
   */
  private httpStatusToErrorCode(statusCode: number): string {
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return statusCodeMap[statusCode] || 'UNKNOWN_ERROR';
  }
}
