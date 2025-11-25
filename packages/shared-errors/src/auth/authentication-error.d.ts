import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class AuthenticationError extends BaseError {
    constructor(message: string, options?: {
        reason?: 'invalid_credentials' | 'expired_token' | 'malformed_token' | 'missing_credentials' | 'revoked_token';
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
