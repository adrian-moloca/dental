import { BaseError, type ErrorResponse, type TenantContext } from '../base/base-error';
export declare class InfrastructureError extends BaseError {
    constructor(message: string, options?: {
        service?: 'database' | 'cache' | 'queue' | 'external_api' | 'filesystem' | 'network';
        isTransient?: boolean;
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
