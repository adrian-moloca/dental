export interface ErrorResponse {
    status: 'error';
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    correlationId?: string;
    stack?: string;
}
export interface TenantContext {
    organizationId: string;
    clinicId?: string;
}
export interface BaseErrorOptions {
    code: string;
    message: string;
    statusCode?: number;
    metadata?: Record<string, unknown>;
    isOperational?: boolean;
    correlationId?: string;
    cause?: Error;
    tenantContext?: TenantContext;
}
export declare abstract class BaseError extends Error {
    readonly code: string;
    readonly statusCode?: number;
    readonly metadata: Readonly<Record<string, unknown>>;
    readonly isOperational: boolean;
    readonly timestamp: Date;
    readonly correlationId?: string;
    readonly tenantContext?: Readonly<TenantContext>;
    constructor(options: BaseErrorOptions);
    abstract toHttpStatus(): number;
    abstract toErrorResponse(): ErrorResponse;
    isRetryable(): boolean;
    isUserError(): boolean;
    isCritical(): boolean;
    toJSON(): Record<string, unknown>;
    toString(): string;
}
