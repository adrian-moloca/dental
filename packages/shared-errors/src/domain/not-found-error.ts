import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * NotFoundError represents entities that could not be found
 *
 * Use cases:
 * - Entity not found by ID
 * - Resource does not exist
 * - Deleted or archived entities
 * - Multi-tenant isolation (entity exists but not in user's tenant)
 *
 * HTTP Status: 404 Not Found
 *
 * Edge cases handled:
 * - Generic messages that don't expose entity existence (security)
 * - Resource type included for debugging without exposing entity details
 * - Never includes actual IDs or PHI in user-facing messages
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class NotFoundError extends BaseError {
  constructor(
    message: string,
    options?: {
      resourceType?: string;
      resourceId?: string;
      organizationId?: string;
      context?: Record<string, unknown>;
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'NOT_FOUND',
      message,
      statusCode: 404,
      isOperational: true,
      metadata: {
        resourceType: options?.resourceType,
        // resourceId, organizationId, and context kept in metadata for internal logging only
        // Never exposed in toErrorResponse()
        resourceId: options?.resourceId,
        organizationId: options?.organizationId,
        context: options?.context,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 404;
  }

  public toErrorResponse(): ErrorResponse {
    // Security: Don't expose resource IDs to prevent enumeration attacks
    // Only expose resource type for client-side error handling
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      details: this.metadata.resourceType
        ? { resourceType: this.metadata.resourceType }
        : undefined,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Not found errors are not retryable
   * The resource either doesn't exist or the client lacks access
   */
  public isRetryable(): boolean {
    return false;
  }

  /**
   * Not found errors are user-facing
   * Indicates the requested resource doesn't exist or isn't accessible
   */
  public isUserError(): boolean {
    return true;
  }
}
