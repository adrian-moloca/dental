import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class ConflictError extends BaseError {
    constructor(message: string, options?: {
        conflictType?: 'duplicate' | 'version' | 'state' | 'concurrent';
        resourceType?: string;
        existingId?: string;
        expectedVersion?: number;
        actualVersion?: number;
        correlationId?: string;
        cause?: Error;
        tenantContext?: TenantContext;
    });
    toHttpStatus(): number;
    toErrorResponse(): ErrorResponse;
    isRetryable(): boolean;
    isUserError(): boolean;
}
