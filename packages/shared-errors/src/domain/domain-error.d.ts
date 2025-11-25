import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class DomainError extends BaseError {
    constructor(message: string, options?: {
        rule?: string;
        ruleType?: 'invariant' | 'state_transition' | 'business_constraint' | 'authorization';
        resourceType?: string;
        allowedActions?: string[];
        correlationId?: string;
        cause?: Error;
        tenantContext?: TenantContext;
    });
    toHttpStatus(): number;
    toErrorResponse(): ErrorResponse;
    isRetryable(): boolean;
    isUserError(): boolean;
    isCritical(): boolean;
}
