import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * AuthenticationError represents failures in verifying user identity
 *
 * Use cases:
 * - Invalid credentials (wrong username/password)
 * - Expired tokens (JWT, refresh tokens)
 * - Malformed tokens
 * - Missing authentication headers
 * - Invalid authentication scheme
 * - Token revocation/blacklisting
 *
 * HTTP Status: 401 Unauthorized
 *
 * Edge cases handled:
 * - Never exposes why authentication failed (security)
 * - Generic messages to prevent username enumeration
 * - Distinguishes between expired tokens (retryable) and invalid credentials (not retryable)
 * - Never includes actual credentials or tokens in errors
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class AuthenticationError extends BaseError {
  constructor(
    message: string,
    options?: {
      reason?:
        | 'invalid_credentials'
        | 'expired_token'
        | 'malformed_token'
        | 'missing_credentials'
        | 'revoked_token'
        | 'email_not_verified';
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'AUTHENTICATION_ERROR',
      message,
      statusCode: 401,
      isOperational: true,
      metadata: {
        // Reason kept internal for logging
        // Never exposed in toErrorResponse() for security
        reason: options?.reason,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 401;
  }

  public toErrorResponse(): ErrorResponse {
    // Security: Don't expose authentication failure reasons
    // Generic message prevents username enumeration and credential guessing
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      // Never include details for authentication errors
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Authentication errors may be retryable depending on the reason
   * - Expired tokens: retryable with token refresh
   * - Invalid credentials: not retryable without user input
   * - Malformed tokens: not retryable (client bug)
   */
  public isRetryable(): boolean {
    return this.metadata.reason === 'expired_token';
  }

  /**
   * Authentication errors are user-facing
   * User needs to re-authenticate
   */
  public isUserError(): boolean {
    return true;
  }

  /**
   * Revoked tokens may indicate compromised accounts (critical)
   * Other authentication errors are typically not critical
   */
  public isCritical(): boolean {
    return this.metadata.reason === 'revoked_token';
  }
}
