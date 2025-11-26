/**
 * @dentalos/shared-errors
 *
 * Framework-agnostic centralized error handling for Dental OS platform
 *
 * Features:
 * - Type-safe error classes with standardized interfaces
 * - HTTP status code mapping
 * - Error response building and sanitization
 * - PHI-safe error messages and metadata
 * - Multi-tenant and authorization error support
 * - Distributed tracing with correlation IDs
 * - Retry logic for transient failures
 *
 * @packageDocumentation
 */

// Base error class and interfaces
export {
  BaseError,
  type BaseErrorOptions,
  type ErrorResponse,
  type TenantContext,
} from './base';

// Domain errors (4xx client errors)
export { ValidationError } from './domain';
export { NotFoundError } from './domain';
export { ConflictError } from './domain';
export { DomainError } from './domain';

// Authentication and authorization errors
export { AuthenticationError } from './auth';
export { AuthorizationError } from './auth';
export { SecurityError } from './auth';
export { AccountLockedError } from './auth';

// Infrastructure errors (5xx server errors)
export { InfrastructureError } from './infra';
export { RateLimitError } from './infra';

// Tenant isolation errors (re-exported from shared-auth)
export { TenantIsolationError } from './tenant';

// HTTP status mapping utilities
export {
  mapErrorToHttpStatus,
  mapErrorCodeToHttpStatus,
  isClientError,
  isServerError,
  getStatusDescription,
} from './mappers';

// Error response building utilities
export {
  buildErrorResponse,
  sanitizeErrorForClient,
  sanitizeMetadata,
  buildDevelopmentErrorResponse,
  buildProductionErrorResponse,
  extractErrorCode as extractErrorCodeFromBuilder,
} from './mappers';

// Error classification utilities
export {
  isRetryableError,
  isUserError,
  isCriticalError,
  extractErrorCode,
  extractCorrelationId,
  isOperationalError,
  isTransientError,
  calculateRetryDelay,
  shouldLogError,
} from './utils';
