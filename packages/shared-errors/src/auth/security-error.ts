import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * SecurityError represents security-related failures in the system
 *
 * Use cases:
 * - Password hashing failures
 * - Cryptographic operation failures
 * - Security policy violations
 * - Invalid security configurations
 * - Encryption/decryption errors
 * - Key management errors
 *
 * HTTP Status: 500 Internal Server Error (security operations should not fail)
 *
 * Edge cases handled:
 * - Never exposes sensitive information (keys, passwords, hashes)
 * - Provides generic error messages to clients
 * - Includes detailed context in server logs only
 * - Distinguishes between configuration errors and runtime errors
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class SecurityError extends BaseError {
  constructor(
    options: {
      code: string;
      message: string;
      cause?: Error;
      correlationId?: string;
      tenantContext?: TenantContext;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      code: options.code,
      message: options.message,
      statusCode: 500,
      isOperational: true,
      metadata: options.metadata || {},
      correlationId: options.correlationId,
      cause: options.cause,
      tenantContext: options.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 500;
  }

  public toErrorResponse(): ErrorResponse {
    // Security: Don't expose security implementation details
    // Generic message prevents information disclosure
    return {
      status: 'error',
      code: this.code,
      message: 'A security error occurred. Please contact support.',
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Security errors are not retryable
   * They indicate fundamental issues that require investigation
   */
  public isRetryable(): boolean {
    return false;
  }

  /**
   * Security errors should not expose details to users
   * Return generic message instead
   */
  public isUserError(): boolean {
    return false;
  }

  /**
   * All security errors are critical and require immediate attention
   */
  public isCritical(): boolean {
    return true;
  }
}
