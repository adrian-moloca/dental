import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * AccountLockedError represents account lockout due to brute-force protection
 *
 * Use cases:
 * - Too many failed login attempts (typically 5)
 * - Account temporarily locked after exceeding threshold
 * - Administrative lockout
 *
 * HTTP Status: 423 Locked
 *
 * Security considerations:
 * - Never expose exact lockout duration to prevent timing attacks
 * - Use generic messages that don't confirm account existence
 * - Log lockout events for security monitoring
 * - Supports tenant context for HIPAA-compliant audit trails
 *
 * Edge cases handled:
 * - Provides remaining lockout time (rounded to prevent precise timing attacks)
 * - Distinguishes between automatic lockout and administrative lockout
 * - Never includes user ID or email in error response
 */
export class AccountLockedError extends BaseError {
  constructor(
    message: string,
    options?: {
      remainingSeconds?: number;
      reason?: 'too_many_attempts' | 'administrative' | 'security_incident';
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'ACCOUNT_LOCKED',
      message,
      statusCode: 423,
      isOperational: true,
      metadata: {
        // Round to nearest minute to prevent timing attacks
        remainingSeconds: options?.remainingSeconds
          ? Math.ceil(options.remainingSeconds / 60) * 60
          : undefined,
        reason: options?.reason || 'too_many_attempts',
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 423;
  }

  public toErrorResponse(): ErrorResponse {
    // Security: Provide limited information about lockout
    // Only expose rounded remaining time, never user details
    const response: ErrorResponse = {
      status: 'error',
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };

    // Include remaining time if available (already rounded in constructor)
    if (this.metadata.remainingSeconds) {
      response.details = {
        retryAfterSeconds: this.metadata.remainingSeconds,
      };
    }

    return response;
  }

  /**
   * Account lockout is retryable after the lockout period expires
   */
  public isRetryable(): boolean {
    return true;
  }

  /**
   * Account lockout is a user-facing error
   * User needs to wait for lockout to expire
   */
  public isUserError(): boolean {
    return true;
  }

  /**
   * Administrative lockouts or security incidents are critical
   * Automatic lockouts from failed attempts are not critical
   */
  public isCritical(): boolean {
    return (
      this.metadata.reason === 'administrative' || this.metadata.reason === 'security_incident'
    );
  }

  /**
   * Get the rounded remaining lockout time in seconds
   * @returns Remaining seconds (rounded to nearest minute)
   */
  public getRemainingSeconds(): number {
    return (this.metadata.remainingSeconds as number) || 0;
  }
}
