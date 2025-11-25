/**
 * Error mapping and response building utilities
 * @module mappers
 */

export {
  mapErrorToHttpStatus,
  mapErrorCodeToHttpStatus,
  isClientError,
  isServerError,
  getStatusDescription,
} from './http-status-mapper';

export {
  buildErrorResponse,
  sanitizeErrorForClient,
  sanitizeMetadata,
  buildDevelopmentErrorResponse,
  buildProductionErrorResponse,
  extractErrorCode,
} from './error-response-builder';
