import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class SecurityError extends BaseError {
    constructor(options: {
        code: string;
        message: string;
        cause?: Error;
        correlationId?: string;
        tenantContext?: TenantContext;
        metadata?: Record<string, unknown>;
    });
    toHttpStatus(): number;
    toErrorResponse(): ErrorResponse;
    isRetryable(): boolean;
    isUserError(): boolean;
    isCritical(): boolean;
}
