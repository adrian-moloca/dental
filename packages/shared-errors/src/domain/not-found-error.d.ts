import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class NotFoundError extends BaseError {
    constructor(message: string, options?: {
        resourceType?: string;
        resourceId?: string;
        organizationId?: string;
        context?: Record<string, unknown>;
        correlationId?: string;
        cause?: Error;
        tenantContext?: TenantContext;
    });
    toHttpStatus(): number;
    toErrorResponse(): ErrorResponse;
    isRetryable(): boolean;
    isUserError(): boolean;
}
