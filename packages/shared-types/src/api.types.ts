/**
 * API request and response type definitions
 * @module shared-types/api
 */

import { JSONObject, Nullable } from './common.types';
import { PaginatedResponse } from './pagination.types';

/**
 * API response status
 */
export enum ApiResponseStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PARTIAL = 'PARTIAL',
}

/**
 * Error severity level
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Error code enumeration
 */
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Business logic errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',

  // Multi-tenant errors
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  CROSS_TENANT_ACCESS_DENIED = 'CROSS_TENANT_ACCESS_DENIED',

  // Unknown error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Validation error detail
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Validation error message */
  message: string;
  /** Validation constraint that failed */
  constraint?: string;
  /** Actual value that failed */
  rejectedValue?: unknown;
}

/**
 * API error detail
 */
export interface ApiError {
  /** Error code */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Error severity */
  severity: ErrorSeverity;
  /** Field-specific validation errors */
  validationErrors?: ValidationError[];
  /** Additional error details */
  details?: JSONObject;
  /** Stack trace (only in development) */
  stack?: string;
  /** Unique error ID for tracking */
  errorId?: string;
  /** Timestamp when error occurred */
  timestamp?: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Response status */
  status: ApiResponseStatus;
  /** Response data (null on error) */
  data: Nullable<T>;
  /** Error information (null on success) */
  error: Nullable<ApiError>;
  /** Additional metadata */
  meta?: JSONObject;
  /** Request timestamp */
  timestamp: string;
}

/**
 * Success response
 */
export interface SuccessResponse<T> extends ApiResponse<T> {
  status: ApiResponseStatus.SUCCESS;
  data: T;
  error: null;
}

/**
 * Error response
 */
export interface ErrorResponse extends ApiResponse<null> {
  status: ApiResponseStatus.ERROR;
  data: null;
  error: ApiError;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends SuccessResponse<T[]> {
  pagination: PaginatedResponse<T>['pagination'];
}

/**
 * Batch operation request
 */
export interface BatchRequest<T> {
  /** Items to process in batch */
  items: T[];
  /** Whether to stop on first error */
  stopOnError?: boolean;
  /** Batch metadata */
  metadata?: JSONObject;
}

/**
 * Batch operation result for single item
 */
export interface BatchItemResult<T> {
  /** Index of item in original batch */
  index: number;
  /** Success status */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error (if failed) */
  error?: ApiError;
}

/**
 * Batch operation response
 */
export interface BatchResponse<T> {
  /** Total items processed */
  total: number;
  /** Number of successful operations */
  successCount: number;
  /** Number of failed operations */
  failureCount: number;
  /** Individual results */
  results: BatchItemResult<T>[];
  /** Overall batch metadata */
  metadata?: JSONObject;
}

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
}

/**
 * Service health check
 */
export interface HealthCheck {
  /** Service name */
  service: string;
  /** Health status */
  status: HealthStatus;
  /** Status message */
  message?: string;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Additional details */
  details?: JSONObject;
}

/**
 * Overall health check response
 */
export interface HealthCheckResponse {
  /** Overall status */
  status: HealthStatus;
  /** Timestamp */
  timestamp: string;
  /** Individual service checks */
  checks: HealthCheck[];
  /** Application version */
  version?: string;
  /** Environment */
  environment?: string;
}

/**
 * API request context
 */
export interface RequestContext {
  /** Request ID for tracing */
  requestId: string;
  /** User ID (if authenticated) */
  userId?: string;
  /** Organization ID */
  organizationId?: string;
  /** Clinic ID */
  clinicId?: string;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Request timestamp */
  timestamp: string;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * API endpoint metadata
 */
export interface ApiEndpoint {
  /** HTTP method */
  method: HttpMethod;
  /** Endpoint path */
  path: string;
  /** Description */
  description?: string;
  /** Whether authentication is required */
  requiresAuth: boolean;
  /** Required permissions */
  requiredPermissions?: string[];
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /** Maximum requests allowed */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when limit resets */
  resetAt: string;
  /** Window duration in seconds */
  windowSeconds: number;
}

/**
 * API versioning
 */
export interface ApiVersion {
  /** API version number */
  version: string;
  /** Whether this version is deprecated */
  deprecated: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
  /** Sunset date (when version will be removed) */
  sunsetDate?: string;
}
