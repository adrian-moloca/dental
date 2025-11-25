import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class AuthorizationError extends BaseError {
    constructor(message: string, options?: {
        reason?: string;
        userId?: string;
        requiredPermission?: string;
        resourceType?: string;
        organizationId?: string;
        targetUserId?: string;
        attemptedRole?: string;
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
