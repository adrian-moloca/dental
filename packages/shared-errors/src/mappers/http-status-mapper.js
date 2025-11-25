"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapErrorToHttpStatus = mapErrorToHttpStatus;
exports.mapErrorCodeToHttpStatus = mapErrorCodeToHttpStatus;
exports.isClientError = isClientError;
exports.isServerError = isServerError;
exports.getStatusDescription = getStatusDescription;
const base_error_1 = require("../base/base-error");
function mapErrorToHttpStatus(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.toHttpStatus();
    }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode;
    }
    if ('status' in error && typeof error.status === 'number') {
        return error.status;
    }
    return 500;
}
function mapErrorCodeToHttpStatus(code) {
    const normalizedCode = code.toUpperCase();
    const codeToStatusMap = {
        VALIDATION_ERROR: 400,
        NOT_FOUND: 404,
        CONFLICT: 409,
        DOMAIN_ERROR: 422,
        AUTHENTICATION_ERROR: 401,
        AUTHORIZATION_ERROR: 403,
        INFRASTRUCTURE_ERROR: 500,
        RATE_LIMIT_EXCEEDED: 429,
        TENANT_ISOLATION_ERROR: 403,
    };
    return codeToStatusMap[normalizedCode] ?? 500;
}
function isClientError(statusCode) {
    return statusCode >= 400 && statusCode < 500;
}
function isServerError(statusCode) {
    return statusCode >= 500 && statusCode < 600;
}
function getStatusDescription(statusCode) {
    const statusDescriptions = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        503: 'Service Unavailable',
    };
    return statusDescriptions[statusCode] ?? 'Unknown';
}
//# sourceMappingURL=http-status-mapper.js.map