import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';

/**
 * DomainError represents business rule violations
 *
 * Use cases:
 * - Business logic constraints violated
 * - Invariant violations (e.g., appointment duration < 0)
 * - State transition rules (e.g., can't cancel completed appointment)
 * - Authorization based on business rules (e.g., can't delete appointment with treatments)
 * - Domain-specific validation beyond input validation
 *
 * HTTP Status: 422 Unprocessable Entity
 *
 * Edge cases handled:
 * - Distinguishes from validation errors (422 vs 400)
 * - Exposes rule violation type for client-side handling
 * - Provides actionable error messages without exposing internal logic
 * - Never includes PHI or sensitive business data
 * - Supports tenant context for HIPAA-compliant audit trails
 */
export class DomainError extends BaseError {
  constructor(
    message: string,
    options?: {
      rule?: string;
      ruleType?:
        | 'invariant'
        | 'state_transition'
        | 'business_constraint'
        | 'authorization';
      resourceType?: string;
      allowedActions?: string[];
      correlationId?: string;
      cause?: Error;
      tenantContext?: TenantContext;
    }
  ) {
    super({
      code: 'DOMAIN_ERROR',
      message,
      statusCode: 422,
      isOperational: true,
      metadata: {
        rule: options?.rule,
        ruleType: options?.ruleType,
        resourceType: options?.resourceType,
        allowedActions: options?.allowedActions,
      },
      correlationId: options?.correlationId,
      cause: options?.cause,
      tenantContext: options?.tenantContext,
    });
  }

  public toHttpStatus(): number {
    return 422;
  }

  public toErrorResponse(): ErrorResponse {
    // Expose rule violation details for client-side handling
    // Help clients understand what actions are allowed
    const details: Record<string, unknown> = {};

    if (this.metadata.rule) {
      details.rule = this.metadata.rule;
    }

    if (this.metadata.ruleType) {
      details.ruleType = this.metadata.ruleType;
    }

    if (this.metadata.resourceType) {
      details.resourceType = this.metadata.resourceType;
    }

    // For state transition errors, expose allowed actions
    if (
      this.metadata.ruleType === 'state_transition' &&
      this.metadata.allowedActions &&
      Array.isArray(this.metadata.allowedActions)
    ) {
      details.allowedActions = this.metadata.allowedActions;
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
   * Domain errors are not retryable without changing application state
   * The business rule will continue to be violated on retry
   */
  public isRetryable(): boolean {
    return false;
  }

  /**
   * Domain errors are user-facing
   * They indicate the action violates business rules
   */
  public isUserError(): boolean {
    return true;
  }

  /**
   * Domain errors involving invariants or critical business rules may be critical
   * This helps identify data corruption or serious business logic failures
   */
  public isCritical(): boolean {
    return this.metadata.ruleType === 'invariant';
  }
}
