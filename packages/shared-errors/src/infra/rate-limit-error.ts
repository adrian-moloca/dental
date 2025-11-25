import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * RateLimitError represents API rate limiting violations
 *
 * Use cases:
 * - API rate limits exceeded (per user, per tenant, per IP)
 * - Concurrent request limits exceeded
 * - Quota limits exceeded (daily, monthly)
 * - Throttling for resource protection
 * - Anti-abuse mechanisms
 *
 * HTTP Status: 429 Too Many Requests
 *
 * Edge cases handled:
 * - Includes retry-after information for client-side backoff
 * - Exposes limit and remaining quota for transparency
 * - Never includes internal rate limiting configuration details
 * - Distinguishes between different limit types (user, tenant, global)
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class RateLimitError extends BaseError {
  constructor(
    message: string,
    options?: {
      limitType?: 'user' | 'tenant' | 'ip' | 'global' | 'concurrent';
      limit?: number;
      remaining?: number;
      resetAt?: Date;
      retryAfterSeconds?: number;
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'RATE_LIMIT_EXCEEDED',
      message,
      statusCode: 429,
      isOperational: true,
      metadata: {
        limitType: options?.limitType,
        limit: options?.limit,
        remaining: options?.remaining ?? 0,
        resetAt: options?.resetAt,
        retryAfterSeconds: options?.retryAfterSeconds,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 429;
  }

  public toErrorResponse(): ErrorResponse {
    // Expose rate limit details for client-side retry logic
    const details: Record<string, unknown> = {};

    if (typeof this.metadata.limit === 'number') {
      details.limit = this.metadata.limit;
    }

    if (typeof this.metadata.remaining === 'number') {
      details.remaining = this.metadata.remaining;
    }

    // Include reset time for quota-based limits
    if (this.metadata.resetAt instanceof Date) {
      details.resetAt = this.metadata.resetAt.toISOString();
    }

    // Include retry-after for immediate client retry guidance
    if (typeof this.metadata.retryAfterSeconds === 'number') {
      details.retryAfterSeconds = this.metadata.retryAfterSeconds;
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
   * Rate limit errors are always retryable after waiting
   * Client should respect retry-after or reset time
   */
  public isRetryable(): boolean {
    return true;
  }

  /**
   * Rate limit errors are user-facing
   * User needs to slow down their requests
   */
  public isUserError(): boolean {
    return true;
  }

  /**
   * Rate limit errors are not critical
   * They're expected in high-load scenarios
   */
  public isCritical(): boolean {
    return false;
  }
}
