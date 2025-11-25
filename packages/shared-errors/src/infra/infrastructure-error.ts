import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * InfrastructureError represents failures in external dependencies
 *
 * Use cases:
 * - Database connection failures
 * - Database query timeouts
 * - Cache service unavailable (Redis)
 * - Message queue failures (RabbitMQ, SQS)
 * - External API failures (third-party services)
 * - File system errors
 * - Network timeouts
 *
 * HTTP Status: 500 Internal Server Error (503 for temporary unavailability)
 *
 * Edge cases handled:
 * - Never exposes internal infrastructure details to clients
 * - Distinguishes between permanent failures and temporary unavailability
 * - Includes retry hints for transient failures
 * - Never includes connection strings, credentials, or internal hostnames
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class InfrastructureError extends BaseError {
  constructor(
    message: string,
    options?: {
      service?:
        | 'database'
        | 'cache'
        | 'queue'
        | 'external_api'
        | 'filesystem'
        | 'network';
      isTransient?: boolean;
      retryAfterSeconds?: number;
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    // Use 503 for transient failures, 500 for permanent failures
    const statusCode = options?.isTransient === true ? 503 : 500;

    super({
      code: 'INFRASTRUCTURE_ERROR',
      message,
      statusCode,
      isOperational: true,
      metadata: {
        service: options?.service,
        isTransient: options?.isTransient ?? false,
        retryAfterSeconds: options?.retryAfterSeconds,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    // Return actual status code (503 for transient, 500 for permanent)
    return this.statusCode ?? 500;
  }

  public toErrorResponse(): ErrorResponse {
    // Generic message for clients, no internal infrastructure details
    const clientMessage =
      this.metadata.isTransient === true
        ? 'Service temporarily unavailable. Please try again later.'
        : 'An internal error occurred. Please contact support.';

    const details: Record<string, unknown> = {};

    // Include retry hint for transient failures
    if (
      this.metadata.isTransient === true &&
      typeof this.metadata.retryAfterSeconds === 'number'
    ) {
      details.retryAfterSeconds = this.metadata.retryAfterSeconds;
    }

    return {
      status: 'error',
      code: this.code,
      message: clientMessage,
      details: Object.keys(details).length > 0 ? details : undefined,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Infrastructure errors are retryable if transient
   * - Transient failures: network timeouts, temporary unavailability
   * - Permanent failures: configuration errors, missing resources
   */
  public isRetryable(): boolean {
    return this.metadata.isTransient === true;
  }

  /**
   * Infrastructure errors are not user errors
   * They indicate system-level problems
   */
  public isUserError(): boolean {
    return false;
  }

  /**
   * Permanent infrastructure failures are critical
   * Transient failures are not critical (expected in distributed systems)
   */
  public isCritical(): boolean {
    return this.metadata.isTransient !== true;
  }
}
