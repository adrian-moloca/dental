import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class RateLimitError extends BaseError {
    constructor(message: string, options?: {
        limitType?: 'user' | 'tenant' | 'ip' | 'global' | 'concurrent';
        limit?: number;
        remaining?: number;
        resetAt?: Date;
        retryAfterSeconds?: number;
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
