import { JSONObject, Nullable } from './common.types';
import { PaginatedResponse } from './pagination.types';
export declare enum ApiResponseStatus {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    PARTIAL = "PARTIAL"
}
export declare enum ErrorSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum ErrorCode {
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    RESOURCE_LOCKED = "RESOURCE_LOCKED",
    OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
    DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
    DEPENDENCY_ERROR = "DEPENDENCY_ERROR",
    TENANT_NOT_FOUND = "TENANT_NOT_FOUND",
    TENANT_MISMATCH = "TENANT_MISMATCH",
    CROSS_TENANT_ACCESS_DENIED = "CROSS_TENANT_ACCESS_DENIED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export interface ValidationError {
    field: string;
    message: string;
    constraint?: string;
    rejectedValue?: unknown;
}
export interface ApiError {
    code: ErrorCode;
    message: string;
    severity: ErrorSeverity;
    validationErrors?: ValidationError[];
    details?: JSONObject;
    stack?: string;
    errorId?: string;
    timestamp?: string;
}
export interface ApiResponse<T = unknown> {
    status: ApiResponseStatus;
    data: Nullable<T>;
    error: Nullable<ApiError>;
    meta?: JSONObject;
    timestamp: string;
}
export interface SuccessResponse<T> extends ApiResponse<T> {
    status: ApiResponseStatus.SUCCESS;
    data: T;
    error: null;
}
export interface ErrorResponse extends ApiResponse<null> {
    status: ApiResponseStatus.ERROR;
    data: null;
    error: ApiError;
}
export interface PaginatedApiResponse<T> extends SuccessResponse<T[]> {
    pagination: PaginatedResponse<T>['pagination'];
}
export interface BatchRequest<T> {
    items: T[];
    stopOnError?: boolean;
    metadata?: JSONObject;
}
export interface BatchItemResult<T> {
    index: number;
    success: boolean;
    data?: T;
    error?: ApiError;
}
export interface BatchResponse<T> {
    total: number;
    successCount: number;
    failureCount: number;
    results: BatchItemResult<T>[];
    metadata?: JSONObject;
}
export declare enum HealthStatus {
    HEALTHY = "HEALTHY",
    DEGRADED = "DEGRADED",
    UNHEALTHY = "UNHEALTHY"
}
export interface HealthCheck {
    service: string;
    status: HealthStatus;
    message?: string;
    responseTime?: number;
    details?: JSONObject;
}
export interface HealthCheckResponse {
    status: HealthStatus;
    timestamp: string;
    checks: HealthCheck[];
    version?: string;
    environment?: string;
}
export interface RequestContext {
    requestId: string;
    userId?: string;
    organizationId?: string;
    clinicId?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
export interface ApiEndpoint {
    method: HttpMethod;
    path: string;
    description?: string;
    requiresAuth: boolean;
    requiredPermissions?: string[];
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetAt: string;
    windowSeconds: number;
}
export interface ApiVersion {
    version: string;
    deprecated: boolean;
    deprecationMessage?: string;
    sunsetDate?: string;
}
