import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { PrometheusMetricsService } from './prometheus-metrics';
import { StructuredLogger } from './structured-logger';

/**
 * HTTP interceptor that automatically:
 * - Adds correlation IDs to requests
 * - Logs all requests with structured logging
 * - Records Prometheus metrics
 * - Measures request duration
 * - Enriches logs with tenant/organization context
 *
 * Apply globally in app.module.ts:
 * app.useGlobalInterceptors(new HttpLoggingInterceptor(metricsService));
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {

  constructor(private readonly metricsService?: PrometheusMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Add or extract correlation ID
    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    // Extract tenant context from headers or JWT
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
    const organizationId = request.headers['x-organization-id'] || request.user?.organizationId;
    const clinicId = request.headers['x-clinic-id'] || request.user?.clinicId;

    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    const route = this.getRoutePath(context);

    // Create structured logger for this request
    const structuredLogger = new StructuredLogger('HTTP');
    structuredLogger.setContext({
      correlationId,
      tenantId,
      organizationId,
      clinicId,
      requestId: correlationId,
    });

    // Log incoming request
    structuredLogger.log('Incoming request', {
      method,
      url,
      route,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log successful response
        structuredLogger.log('Request completed', {
          method,
          url,
          route,
          statusCode,
          durationMs: duration,
        });

        // Record Prometheus metrics
        if (this.metricsService) {
          this.metricsService.recordHttpRequest(method, route, statusCode, duration, tenantId);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log error response
        structuredLogger.error(
          'Request failed',
          error,
          {
            method,
            url,
            route,
            statusCode,
            durationMs: duration,
          },
        );

        // Record Prometheus metrics
        if (this.metricsService) {
          this.metricsService.recordHttpRequest(method, route, statusCode, duration, tenantId);
        }

        throw error;
      }),
    );
  }

  /**
   * Extracts the route pattern from the execution context.
   * Handles both REST and GraphQL routes.
   */
  private getRoutePath(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();

    // Try to get route from request route property (REST)
    if (request.route?.path) {
      return request.route.path;
    }

    // Fall back to URL without query params
    const url = request.url?.split('?')[0] || 'unknown';
    return url;
  }
}

/**
 * Audit logging interceptor for sensitive operations.
 * Records all data modifications (POST, PUT, PATCH, DELETE) to audit log.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new StructuredLogger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit modification operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
    const userId = request.user?.userId || request.user?.sub;
    const deviceId = request.headers['x-device-id'] || request.user?.deviceId;
    const route = request.route?.path || request.url;

    this.logger.setContext({
      tenantId,
      userId,
      deviceId,
      correlationId: request.correlationId,
    });

    return next.handle().pipe(
      tap((result) => {
        this.logger.audit(method, route, {
          result: result ? 'success' : 'no_content',
          // Don't log full request body to avoid sensitive data
          // Only log IDs if available
          resourceId: result?.id || result?._id || request.params?.id,
        });
      }),
      catchError((error) => {
        this.logger.audit(method, route, {
          result: 'error',
          errorType: error.name,
          statusCode: error.status || 500,
        });
        throw error;
      }),
    );
  }
}
