/**
 * NestJS Interceptor for Correlation ID in Responses
 *
 * Automatically adds correlation metadata to HTTP responses
 * for improved debugging and request tracing.
 *
 * @module shared-tracing/interceptors
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getCorrelationContext } from '../correlation-id';
import { CORRELATION_ID_HEADER, CAUSATION_ID_HEADER } from '../types';

/**
 * Correlation Interceptor
 *
 * Adds correlation ID to response headers and optionally
 * to the response body for easier debugging.
 *
 * Apply globally in main.ts:
 * ```typescript
 * app.useGlobalInterceptors(new CorrelationInterceptor());
 * ```
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CorrelationInterceptor.name);

  /**
   * Intercept handler
   *
   * Adds correlation context to response headers and logs
   * request completion with timing information.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const correlationContext = getCorrelationContext();

    // Add correlation headers if context exists
    if (correlationContext) {
      response.setHeader(
        CORRELATION_ID_HEADER,
        correlationContext.correlationId
      );
      if (correlationContext.causationId) {
        response.setHeader(
          CAUSATION_ID_HEADER,
          correlationContext.causationId
        );
      }
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.debug(
            `Request completed: ${request.method} ${request.url}`,
            {
              correlationId: correlationContext?.correlationId,
              causationId: correlationContext?.causationId,
              method: request.method,
              url: request.url,
              statusCode: response.statusCode,
              duration_ms: duration,
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request failed: ${request.method} ${request.url}`,
            {
              correlationId: correlationContext?.correlationId,
              causationId: correlationContext?.causationId,
              method: request.method,
              url: request.url,
              error: error.message,
              duration_ms: duration,
            }
          );
        },
      })
    );
  }
}

/**
 * Logging Interceptor with Correlation Context
 *
 * Enhanced logging interceptor that includes correlation metadata
 * in all log entries for complete request tracing.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const correlationContext = getCorrelationContext();

    const logContext = {
      correlationId: correlationContext?.correlationId,
      causationId: correlationContext?.causationId,
      method: request.method,
      url: request.url,
      userAgent: request.get('user-agent'),
      ip: request.ip,
    };

    this.logger.log(`Incoming request: ${request.method} ${request.url}`, logContext);

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `Request successful: ${request.method} ${request.url}`,
            {
              ...logContext,
              statusCode: response.statusCode,
              duration_ms: duration,
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request failed: ${request.method} ${request.url} - ${error.message}`,
            {
              ...logContext,
              error: error.message,
              stack: error.stack,
              duration_ms: duration,
            }
          );
        },
      })
    );
  }
}
