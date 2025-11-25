import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * AuthorizationError represents failures in permission checks
 *
 * Use cases:
 * - Insufficient permissions (RBAC)
 * - Attribute-based access control violations (ABAC)
 * - Resource ownership violations
 * - Tenant isolation violations (accessing resources from another tenant)
 * - Feature flags (user doesn't have access to feature)
 * - Time-based access restrictions
 *
 * HTTP Status: 403 Forbidden
 *
 * Edge cases handled:
 * - Never exposes what permissions user lacks (security)
 * - Generic messages to prevent permission enumeration
 * - Distinguishes from authentication errors (403 vs 401)
 * - Never includes actual permission definitions or policy details
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class AuthorizationError extends BaseError {
  constructor(
    message: string,
    options?: {
      reason?: string;
      userId?: string;
      requiredPermission?: string;
      resourceType?: string;
      organizationId?: string;
      targetUserId?: string;
      attemptedRole?: string;
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'AUTHORIZATION_ERROR',
      message,
      statusCode: 403,
      isOperational: true,
      metadata: {
        // Reason, userId, and permission kept internal for logging
        // Never exposed in toErrorResponse() for security
        reason: options?.reason,
        userId: options?.userId,
        requiredPermission: options?.requiredPermission,
        resourceType: options?.resourceType,
        organizationId: options?.organizationId,
        targetUserId: options?.targetUserId,
        attemptedRole: options?.attemptedRole,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 403;
  }

  public toErrorResponse(): ErrorResponse {
    // Security: Don't expose authorization failure reasons or required permissions
    // Prevents permission enumeration and privilege escalation attempts
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      // Never include details for authorization errors
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Authorization errors are never retryable without changing permissions
   * User's permissions won't change on retry
   */
  public isRetryable(): boolean {
    return false;
  }

  /**
   * Authorization errors are user-facing
   * User needs to know they lack permission
   */
  public isUserError(): boolean {
    return true;
  }

  /**
   * Tenant isolation violations are critical (security breach attempt)
   * Other authorization errors are typically not critical
   */
  public isCritical(): boolean {
    return this.metadata.reason === 'tenant_isolation' ||
           this.metadata.reason === 'System role protection' ||
           this.metadata.reason === 'Privilege escalation prevention';
  }
}
