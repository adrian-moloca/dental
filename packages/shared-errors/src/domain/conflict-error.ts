import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * ConflictError represents conflicts with existing data or business state
 *
 * Use cases:
 * - Duplicate entries (unique constraint violations)
 * - Version conflicts (optimistic locking)
 * - Race conditions (concurrent modifications)
 * - State transitions that are no longer valid
 * - Resource already exists with same identifier
 *
 * HTTP Status: 409 Conflict
 *
 * Edge cases handled:
 * - Exposes conflict type without revealing entity details
 * - Includes expected vs actual version for optimistic locking
 * - Never includes PHI or sensitive data in conflict details
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class ConflictError extends BaseError {
  constructor(
    message: string,
    options?: {
      conflictType?: 'duplicate' | 'version' | 'state' | 'concurrent';
      resourceType?: string;
      existingId?: string;
      expectedVersion?: number;
      actualVersion?: number;
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'CONFLICT',
      message,
      statusCode: 409,
      isOperational: true,
      metadata: {
        conflictType: options?.conflictType,
        resourceType: options?.resourceType,
        existingId: options?.existingId,
        expectedVersion: options?.expectedVersion,
        actualVersion: options?.actualVersion,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 409;
  }

  public toErrorResponse(): ErrorResponse {
    // Expose conflict details for client-side retry logic
    // But never expose entity IDs or PHI
    const details: Record<string, unknown> = {};

    if (this.metadata.conflictType) {
      details.conflictType = this.metadata.conflictType;
    }

    if (this.metadata.resourceType) {
      details.resourceType = this.metadata.resourceType;
    }

    // For version conflicts, expose versions so client can retry
    if (
      this.metadata.conflictType === 'version' &&
      this.metadata.expectedVersion !== undefined &&
      this.metadata.actualVersion !== undefined
    ) {
      details.expectedVersion = this.metadata.expectedVersion;
      details.actualVersion = this.metadata.actualVersion;
    }

    return {
      status: 'error',
      code: this.code,
      message: this.message,
      details: Object.keys(details).length > 0 ? details : undefined,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Conflict errors may be retryable depending on the conflict type
   * - Version conflicts: retryable with updated version
   * - Concurrent modifications: retryable after refresh
   * - Duplicate entries: not retryable without changing data
   */
  public isRetryable(): boolean {
    return (
      this.metadata.conflictType === 'version' ||
      this.metadata.conflictType === 'concurrent'
    );
  }

  /**
   * Conflict errors are user-facing
   * Indicates the operation conflicts with existing data
   */
  public isUserError(): boolean {
    return true;
  }
}
