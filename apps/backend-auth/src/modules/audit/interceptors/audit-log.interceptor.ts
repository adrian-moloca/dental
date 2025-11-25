/**
 * Audit Log Interceptor
 *
 * NestJS interceptor that automatically logs audit events for controller methods
 * decorated with @AuditLog decorator.
 *
 * ARCHITECTURE:
 * - Registered globally in app.module.ts (applies to all controllers)
 * - Checks for @AuditLog metadata on each method
 * - Captures request/response data and timing
 * - Delegates to AuditLoggerService for persistence
 *
 * EXECUTION FLOW:
 * 1. Request arrives at controller method
 * 2. Interceptor checks for @AuditLog metadata
 * 3. If present, captures pre-execution state
 * 4. Method executes
 * 5. On success: Logs with status=SUCCESS, captures response
 * 6. On error: Logs with status=FAILURE, captures error message
 *
 * PERFORMANCE IMPACT:
 * - Minimal overhead (~5-10ms) due to async logging
 * - AuditLoggerService never throws (silent failure)
 * - No blocking I/O in critical path
 *
 * @module modules/audit/interceptors
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import type { UUID } from '@dentalos/shared-types';
import { AuditLoggerService } from '../services/audit-logger.service';
import { AuditAction } from '../types/audit-action.enum';
import { AuditStatus } from '../entities/audit-log.entity';
import { createAuditEvent } from '../dto/audit-event.dto';
import {
  AUDIT_ACTION_KEY,
  AUDIT_RESOURCE_KEY,
  AUDIT_CAPTURE_STATE_KEY,
} from '../decorators/audit-log.decorator';

/**
 * JWT payload structure (from request.user)
 *
 * Populated by JwtStrategy after successful authentication
 * @internal
 */
interface JwtPayload {
  sub: string; // User ID
  email: string;
  organizationId: string;
  clinicId?: string;
  roles: string[];
}

/**
 * Audit Log Interceptor
 *
 * Intercepts controller method execution to automatically log audit events.
 * Works seamlessly with @AuditLog decorator.
 *
 * CRITICAL: Must be registered globally in app.module.ts:
 * ```typescript
 * {
 *   provide: APP_INTERCEPTOR,
 *   useClass: AuditLogInterceptor,
 * }
 * ```
 *
 * @security
 * - Never logs PHI/PII (sanitized by AuditLoggerService)
 * - Never throws exceptions (audit failures don't break app)
 * - Validates user authentication (requires JWT)
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditLogger: AuditLoggerService,
    private readonly reflector: Reflector
  ) {}

  /**
   * Intercept method execution
   *
   * @param context - Execution context (contains request, handler metadata)
   * @param next - Call handler (proceeds to controller method)
   * @returns Observable stream with audit logging side effects
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if method has @AuditLog decorator
    const auditAction = this.reflector.get<AuditAction>(AUDIT_ACTION_KEY, context.getHandler());

    if (!auditAction) {
      // No audit logging required - proceed normally
      return next.handle();
    }

    // Extract request data
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    // CRITICAL: Audit logging requires authenticated user
    if (!user || !user.sub) {
      this.logger.warn({
        message: 'Audit logging skipped - no authenticated user',
        action: auditAction,
        path: request.url,
      });
      return next.handle();
    }

    // Get audit metadata
    const resourceName =
      this.reflector.get<string>(AUDIT_RESOURCE_KEY, context.getHandler()) ||
      this.getResourceName(context);

    const captureState =
      this.reflector.get<boolean>(AUDIT_CAPTURE_STATE_KEY, context.getHandler()) ?? true;

    // Get correlation ID (from header or generate new)
    const correlationId = ((request.headers['x-correlation-id'] as string) ||
      (request.correlationId as string) ||
      uuidv4()) as UUID;

    // Capture timing
    const startTime = Date.now();

    // Extract resourceId from request (if available)
    const resourceId = this.extractResourceId(request, context);

    // Proceed with method execution and capture result
    return next.handle().pipe(
      tap({
        next: (response) => {
          // SUCCESS - Log audit event
          const duration = Date.now() - startTime;

          const auditEventData: any = {
            // Actor
            userId: user.sub as UUID,
            userEmail: user.email,
            userRoles: user.roles || [],

            // Action
            action: auditAction,
            resource: resourceName,
            resourceId: (resourceId || this.extractResourceIdFromResponse(response)) as
              | UUID
              | undefined,

            // Tenant context
            organizationId: user.organizationId as UUID,
            clinicId: user.clinicId as UUID | undefined,

            // Request context
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'] || 'Unknown',
            correlationId,

            // Result
            status: AuditStatus.SUCCESS,

            // State changes (if enabled)
            changesBefore: captureState ? this.extractRequestData(request) : undefined,
            changesAfter: captureState ? this.extractResponseData(response) : undefined,

            // Metadata
            metadata: {
              endpoint: request.url,
              method: request.method,
              duration,
              statusCode: 200,
            },
          };

          this.auditLogger.logEvent(createAuditEvent(auditEventData));
        },
        error: (error) => {
          // FAILURE - Log audit event with error
          const duration = Date.now() - startTime;

          const auditEventData: any = {
            // Actor
            userId: user.sub as UUID,
            userEmail: user.email,
            userRoles: user.roles || [],

            // Action
            action: auditAction,
            resource: resourceName,
            resourceId: resourceId as UUID | undefined,

            // Tenant context
            organizationId: user.organizationId as UUID,
            clinicId: user.clinicId as UUID | undefined,

            // Request context
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'] || 'Unknown',
            correlationId,

            // Result
            status: AuditStatus.FAILURE,
            errorMessage: this.sanitizeErrorMessage(error),

            // State changes
            changesBefore: captureState ? this.extractRequestData(request) : undefined,

            // Metadata
            metadata: {
              endpoint: request.url,
              method: request.method,
              duration,
              statusCode: error.status || 500,
              errorType: error.constructor?.name || 'Error',
            },
          };

          this.auditLogger.logEvent(createAuditEvent(auditEventData));
        },
      }),
      // Re-throw errors to maintain normal error handling flow
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get resource name from controller class
   *
   * Extracts resource name from controller class name
   * Example: 'RBACController' => 'RBAC'
   *
   * @param context - Execution context
   * @returns Resource name
   */
  private getResourceName(context: ExecutionContext): string {
    const className = context.getClass().name;
    // Remove 'Controller' suffix
    return className.replace(/Controller$/, '');
  }

  /**
   * Extract resource ID from request parameters
   *
   * Looks for common parameter names: id, roleId, userId, resourceId
   *
   * @param request - HTTP request
   * @param context - Execution context
   * @returns Resource ID or undefined
   */
  private extractResourceId(request: any, _context: ExecutionContext): string | undefined {
    // Check route parameters
    const params = request.params || {};

    // Common ID parameter names (in priority order)
    const idParams = ['resourceId', 'id', 'roleId', 'userId', 'permissionId'];

    for (const param of idParams) {
      if (params[param]) {
        return params[param];
      }
    }

    return undefined;
  }

  /**
   * Extract resource ID from response
   *
   * Looks for 'id' field in response object
   *
   * @param response - HTTP response
   * @returns Resource ID or undefined
   */
  private extractResourceIdFromResponse(response: any): string | undefined {
    if (response && typeof response === 'object' && response.id) {
      return response.id;
    }
    return undefined;
  }

  /**
   * Extract request data for changesBefore
   *
   * Captures request body and relevant parameters
   * SECURITY: Sanitized by AuditLoggerService before storage
   *
   * @param request - HTTP request
   * @returns Request data object
   */
  private extractRequestData(request: any): Record<string, unknown> {
    return {
      body: request.body,
      params: request.params,
      query: request.query,
    };
  }

  /**
   * Extract response data for changesAfter
   *
   * Captures response body (if object)
   * SECURITY: Sanitized by AuditLoggerService before storage
   *
   * @param response - HTTP response
   * @returns Response data object or undefined
   */
  private extractResponseData(response: any): Record<string, unknown> | undefined {
    if (response && typeof response === 'object') {
      return response;
    }
    return undefined;
  }

  /**
   * Get client IP address
   *
   * Extracts IP from request headers (supports proxies)
   * Checks: X-Forwarded-For, X-Real-IP, request.ip
   *
   * SECURITY: IP will be masked by AuditLoggerService (GDPR compliance)
   *
   * @param request - HTTP request
   * @returns Client IP address
   */
  private getClientIp(request: any): string {
    // Check X-Forwarded-For header (proxy/load balancer)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
      // First IP is the original client
      return forwardedFor.split(',')[0].trim();
    }

    // Check X-Real-IP header (Nginx)
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    // Fallback to request.ip (direct connection)
    return request.ip || request.connection?.remoteAddress || '0.0.0.0';
  }

  /**
   * Sanitize error message
   *
   * Removes sensitive information from error messages
   * Prevents stack traces and system internals from leaking into audit logs
   *
   * @param error - Error object
   * @returns Sanitized error message
   */
  private sanitizeErrorMessage(error: any): string {
    if (!error) return 'Unknown error';

    // Use error message if available (usually safe)
    if (error.message) {
      // Truncate very long error messages
      const message = error.message.substring(0, 500);

      // Remove stack traces (security risk)
      return message.split('\n')[0].trim();
    }

    // Use error name if message not available
    if (error.name) {
      return error.name;
    }

    // Fallback
    return 'Unknown error';
  }
}
