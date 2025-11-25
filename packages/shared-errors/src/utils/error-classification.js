"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetryableError = isRetryableError;
exports.isUserError = isUserError;
exports.isCriticalError = isCriticalError;
exports.extractErrorCode = extractErrorCode;
exports.extractCorrelationId = extractCorrelationId;
exports.isOperationalError = isOperationalError;
exports.isTransientError = isTransientError;
exports.calculateRetryDelay = calculateRetryDelay;
exports.shouldLogError = shouldLogError;
const base_error_1 = require("../base/base-error");
const infrastructure_error_1 = require("../infra/infrastructure-error");
const rate_limit_error_1 = require("../infra/rate-limit-error");
function isRetryableError(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.isRetryable();
    }
    if ('code' in error && typeof error.code === 'string') {
        const retryableCodes = [
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'ENETUNREACH',
            'EHOSTUNREACH',
        ];
        return retryableCodes.includes(error.code);
    }
    return false;
}
function isUserError(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.isUserError();
    }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode >= 400 && error.statusCode < 500;
    }
    return false;
}
function isCriticalError(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.isCritical();
    }
    return true;
}
function extractErrorCode(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.code;
    }
    if ('code' in error && typeof error.code === 'string') {
        return error.code;
    }
    return 'UNKNOWN_ERROR';
}
function extractCorrelationId(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.correlationId;
    }
    if ('correlationId' in error && typeof error.correlationId === 'string') {
        return error.correlationId;
    }
    return undefined;
}
function isOperationalError(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.isOperational;
    }
    return false;
}
function isTransientError(error) {
    if (error instanceof infrastructure_error_1.InfrastructureError) {
        return error.metadata.isTransient === true;
    }
    if ('code' in error && typeof error.code === 'string') {
        const transientCodes = [
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'ENETUNREACH',
            'EHOSTUNREACH',
        ];
        return transientCodes.includes(error.code);
    }
    return false;
}
function calculateRetryDelay(attemptNumber, baseDelayMs = 1000, maxDelayMs = 30000) {
    const delay = baseDelayMs * Math.pow(2, attemptNumber - 1);
    const jitter = delay * (0.75 + Math.random() * 0.5);
    return Math.min(jitter, maxDelayMs);
}
function shouldLogError(error) {
    if (isCriticalError(error)) {
        return true;
    }
    if (!isOperationalError(error)) {
        return true;
    }
    if (error instanceof rate_limit_error_1.RateLimitError) {
        return false;
    }
    return true;
}
//# sourceMappingURL=error-classification.js.map