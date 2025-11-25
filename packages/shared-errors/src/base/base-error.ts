/**
 * ErrorResponse interface for API responses
 * Used by all error types to provide consistent error responses
 */
export interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  correlationId?: string;
  stack?: string; // Only in development
}

/**
 * Tenant context for multi-tenant audit trails
 * Required for HIPAA-compliant audit logging
 */
export interface TenantContext {
  organizationId: string;
  clinicId?: string;
}

/**
 * Configuration options for BaseError
 */
export interface BaseErrorOptions {
  code: string;
  message: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
  isOperational?: boolean;
  correlationId?: string;
  cause?: Error;
  /**
   * Tenant context for audit trail
   * CRITICAL: Only used for server-side audit logs
   * Never exposed to clients via toErrorResponse()
   */
  tenantContext?: TenantContext;
}

/**
 * Abstract base class for all errors in the Dental OS platform
 *
 * Design Principles:
 * - Framework-agnostic: No dependencies on NestJS, Express, or any framework
 * - PHI-safe: Never include PHI/PII in error messages or metadata
 * - Immutable: Error metadata is frozen to prevent accidental modification
 * - Traceable: Includes correlation ID for distributed tracing
 * - Type-safe: Explicit types for all properties and methods
 *
 * @abstract
 * @extends Error
 */
export abstract class BaseError extends Error {
  /**
   * Machine-readable error code (e.g., "VALIDATION_ERROR", "NOT_FOUND")
   * Used for programmatic error handling and internationalization
   */
  public readonly code: string;

  /**
   * HTTP status code (e.g., 400, 401, 404, 500)
   * Optional because not all errors map to HTTP contexts
   */
  public readonly statusCode?: number;

  /**
   * Additional context about the error
   * CRITICAL: Never include PHI/PII in metadata
   * Metadata is frozen to prevent accidental modification
   */
  public readonly metadata: Readonly<Record<string, unknown>>;

  /**
   * Distinguishes between expected errors (true) and programmer errors (false)
   * - Operational errors: Expected errors like validation failures, network issues
   * - Programmer errors: Bugs, type errors, undefined variables
   */
  public readonly isOperational: boolean;

  /**
   * Timestamp when the error occurred
   * Used for logging and debugging
   */
  public readonly timestamp: Date;

  /**
   * Correlation ID for distributed tracing
   * Links errors across microservices and requests
   */
  public readonly correlationId?: string;

  /**
   * Tenant context for multi-tenant audit trails
   * CRITICAL: Only used for server-side audit logs (toJSON)
   * Never exposed to clients via toErrorResponse()
   * Frozen to prevent accidental modification
   */
  public readonly tenantContext?: Readonly<TenantContext>;

  constructor(options: BaseErrorOptions) {
    super(options.message);

    // Set error name to the class name for better stack traces
    this.name = this.constructor.name;

    // Initialize all properties
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date();
    this.correlationId = options.correlationId;

    // Freeze metadata to prevent accidental modification
    this.metadata = Object.freeze({ ...(options.metadata || {}) });

    // Store and freeze tenant context for audit logs
    // Edge case: Ensure tenant context is deeply frozen and immutable
    this.tenantContext = options.tenantContext
      ? Object.freeze({
          organizationId: options.tenantContext.organizationId,
          ...(options.tenantContext.clinicId && {
            clinicId: options.tenantContext.clinicId,
          }),
        })
      : undefined;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace, excluding the constructor call
    // Error.captureStackTrace is a V8-specific feature (Node.js, Chrome)
    // Type assertion needed because TypeScript doesn't include this in ErrorConstructor type
    const errorConstructor = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor: Function) => void;
    };
    if (typeof errorConstructor.captureStackTrace === 'function') {
      errorConstructor.captureStackTrace(this, this.constructor);
    }

    // If there's a cause, append it to the stack trace
    if (options.cause && options.cause.stack) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }

  /**
   * Maps the error to an HTTP status code
   * Must be implemented by all concrete error classes
   *
   * @returns HTTP status code (e.g., 400, 404, 500)
   */
  abstract toHttpStatus(): number;

  /**
   * Converts the error to a standardized API response format
   * Must be implemented by all concrete error classes
   *
   * @returns ErrorResponse object for API responses
   */
  abstract toErrorResponse(): ErrorResponse;

  /**
   * Determines if the operation that caused this error can be retried
   *
   * Edge cases handled:
   * - Infrastructure errors (database, network) are typically retryable
   * - Validation errors are not retryable without changing input
   * - Authentication errors may be retryable if tokens can be refreshed
   *
   * @returns true if the operation can be retried
   */
  public isRetryable(): boolean {
    // Default: operational errors are not retryable
    // Concrete classes can override this based on error type
    return false;
  }

  /**
   * Determines if this error should be shown to end users
   *
   * Edge cases handled:
   * - User errors (validation, not found) should be shown to users
   * - Internal errors (programmer errors) should not expose implementation details
   * - Infrastructure errors should show generic messages, not internal details
   *
   * @returns true if this is a user-facing error
   */
  public isUserError(): boolean {
    // Default: operational errors are user-facing
    return this.isOperational;
  }

  /**
   * Determines if this error requires immediate attention
   *
   * Edge cases handled:
   * - Programmer errors (bugs) are always critical
   * - Infrastructure failures may be critical depending on severity
   * - User errors (validation, not found) are typically not critical
   *
   * @returns true if the error requires immediate attention
   */
  public isCritical(): boolean {
    // Programmer errors are always critical
    return !this.isOperational;
  }

  /**
   * Creates a sanitized copy of the error safe for logging
   * Ensures no PHI/PII is exposed in logs
   *
   * Edge cases handled:
   * - Includes tenant context for server-side audit logs
   * - Tenant context is NEVER exposed to clients via toErrorResponse()
   * - Provides HIPAA-compliant audit trail with tenant isolation tracking
   *
   * @returns Sanitized error representation for server logs
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      metadata: this.metadata,
      // Include tenant context for server-side audit logs only
      // This enables HIPAA-compliant audit trails with tenant isolation
      tenantContext: this.tenantContext,
    };
  }

  /**
   * Returns a string representation of the error
   * Safe for logging (no PHI)
   *
   * @returns String representation
   */
  public toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}
