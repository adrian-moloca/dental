import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { extractCorrelationId } from '../common/correlation-id.util';

/**
 * Error response structure
 */
export interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  correlationId?: string;
  stack?: string;
}

/**
 * Global exception filter for the Health Aggregator Service
 *
 * Handles all errors thrown in the application and converts them to
 * standardized error responses.
 *
 * Edge cases handled:
 * - NestJS HttpException instances
 * - Unknown errors (programmer errors, unexpected exceptions)
 * - Development vs production error formatting
 * - PHI-safe logging (no sensitive data in logs)
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
    const correlationId = extractCorrelationId(request);

    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Process the exception and build appropriate response
    const { statusCode, errorResponse } = this.processException(
      exception,
      correlationId,
      isDevelopment,
    );

    // Log the error with appropriate severity and context
    this.logError(exception, statusCode, correlationId, request);

    // Send the error response to the client
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Processes an exception and returns status code and error response
   *
   * Edge cases handled:
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
   * - PHI-safe logging (no sensitive data in logs)
   * - Correlation ID for distributed tracing
   * - Request metadata (method, URL, user agent)
   * - Stack traces for server errors
   *
   * @param exception - The exception to log
   * @param statusCode - HTTP status code
   * @param correlationId - Correlation ID for distributed tracing
   * @param request - Express request object
   */
  private logError(
    exception: unknown,
    statusCode: number,
    correlationId: string,
    request: Request,
  ): void {
    // Build log context with request metadata
    // Edge case: PHI-safe logging - no sensitive data, only request metadata
    const logContext = {
      correlationId,
      method: request.method,
      url: request.url,
      statusCode,
      userAgent: request.get('user-agent'),
      ip: request.ip,
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
