/**
 * Logging Interceptor
 *
 * Logs all HTTP requests and responses with timing, correlation ID,
 * and tenant context. Sanitizes sensitive fields.
 *
 * Edge cases handled:
 * - Missing correlation ID
 * - Missing tenant context
 * - Request/response errors
 * - Sensitive field sanitization (password, token, secret)
 *
 * @module interceptors/logging
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Sensitive field patterns to sanitize in logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /api[_-]?key/i,
  /access[_-]?key/i,
  /private[_-]?key/i,
];

/**
 * Logging interceptor for request/response logging
 *
 * Logs request start, completion, and errors with full context.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercept HTTP requests and log details
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable with logging side effects
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Only process HTTP requests
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Extract request details
    const { method, url, headers, body } = request;
    const correlationId = (headers['x-correlation-id'] as string) || 'unknown';
    const organizationId = headers['x-organization-id'] as string | undefined;
    const clinicId = headers['x-clinic-id'] as string | undefined;

    // Record start time
    const startTime = Date.now();

    // Log request start
    this.logger.log({
      message: 'Request started',
      method,
      url,
      correlationId,
      organizationId,
      clinicId,
      body: this.sanitize(body),
    });

    return next.handle().pipe(
      tap(() => {
        // Log successful response
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log({
          message: 'Request completed',
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          correlationId,
          organizationId,
          clinicId,
        });
      }),
      catchError((error) => {
        // Log error response
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 500;

        this.logger.error({
          message: 'Request failed',
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          correlationId,
          organizationId,
          clinicId,
          error: error.message,
        });

        // Re-throw to allow error filter to handle
        throw error;
      }),
    );
  }

  /**
   * Sanitize sensitive fields from data
   *
   * @param data - Data to sanitize
   * @returns Sanitized data
   */
  private sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Check if field name matches sensitive patterns
   *
   * @param fieldName - Field name to check
   * @returns True if field is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(fieldName));
  }
}
