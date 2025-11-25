import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * ValidationError represents input validation failures
 *
 * Use cases:
 * - Zod schema validation failures
 * - Missing required fields
 * - Invalid field formats (email, phone, date)
 * - Out of range values
 * - Type mismatches
 *
 * HTTP Status: 400 Bad Request
 *
 * Edge cases handled:
 * - Multiple validation errors aggregated in metadata
 * - Field-level validation details for client-side error display
 * - Never exposes internal validation logic or PHI
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    options?: {
      field?: string;
      value?: unknown;
      errors?: Array<{ field: string; message: string; value?: unknown }>;
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      statusCode: 400,
      isOperational: true,
      metadata: {
        field: options?.field,
        value: options?.value,
        errors: options?.errors,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 400;
  }

  public toErrorResponse(): ErrorResponse {
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      details: this.metadata.errors || this.metadata.field,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
    };
  }

  /**
   * Validation errors are never retryable
   * The client must change their input before retrying
   */
  public isRetryable(): boolean {
    return false;
  }

  /**
   * Validation errors are always user-facing
   * They indicate problems with user input
   */
  public isUserError(): boolean {
    return true;
  }
}
