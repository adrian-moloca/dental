import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class ValidationError extends BaseError {
    constructor(message: string, options?: {
        field?: string;
        value?: unknown;
        errors?: Array<{
            field: string;
            message: string;
            value?: unknown;
        }>;
        correlationId?: string;
        cause?: Error;
        tenantContext?: TenantContext;
    });
    toHttpStatus(): number;
    toErrorResponse(): ErrorResponse;
    isRetryable(): boolean;
    isUserError(): boolean;
}
