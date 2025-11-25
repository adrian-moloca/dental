"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildErrorResponse = buildErrorResponse;
exports.sanitizeErrorForClient = sanitizeErrorForClient;
exports.sanitizeMetadata = sanitizeMetadata;
exports.buildDevelopmentErrorResponse = buildDevelopmentErrorResponse;
exports.buildProductionErrorResponse = buildProductionErrorResponse;
exports.extractErrorCode = extractErrorCode;
const base_error_1 = require("../base/base-error");
const SENSITIVE_FIELD_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /auth/i,
    /credential/i,
    /ssn/i,
    /social[_-]?security/i,
    /credit[_-]?card/i,
    /card[_-]?number/i,
    /cvv/i,
    /pin/i,
    /patient[_-]?id/i,
    /mrn/i,
    /diagnosis/i,
    /treatment/i,
    /medication/i,
    /insurance/i,
    /medical[_-]?history/i,
    /tenant[_-]?id/i,
    /organization[_-]?id/i,
    /clinic[_-]?id/i,
    /org[_-]?id/i,
    /tenant[_-]?context/i,
    /email/i,
    /date[_-]?of[_-]?birth/i,
    /dob/i,
    /phone/i,
    /address/i,
    /zip[_-]?code/i,
    /postal[_-]?code/i,
];
function buildErrorResponse(error, includeStack = false) {
    const response = error.toErrorResponse();
    if (includeStack && error.stack) {
        response.stack = error.stack;
    }
    return response;
}
function sanitizeErrorForClient(error) {
    if (error instanceof base_error_1.BaseError) {
        return error.toErrorResponse();
    }
    return {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please contact support.',
        timestamp: new Date().toISOString(),
    };
}
function sanitizeMetadata(metadata, depth = 0) {
    if (depth > 5) {
        return undefined;
    }
    if (typeof metadata !== 'object' || metadata === null) {
        return undefined;
    }
    if (Array.isArray(metadata)) {
        return {
            items: metadata
                .map((item) => sanitizeMetadata(item, depth + 1))
                .filter((item) => item !== undefined),
        };
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (isSensitiveField(key)) {
            continue;
        }
        if (typeof value === 'object' && value !== null) {
            const sanitizedValue = sanitizeMetadata(value, depth + 1);
            if (sanitizedValue !== undefined) {
                sanitized[key] = sanitizedValue;
            }
        }
        else {
            sanitized[key] = value;
        }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
function isSensitiveField(fieldName) {
    return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
}
function buildDevelopmentErrorResponse(error) {
    if (error instanceof base_error_1.BaseError) {
        const response = error.toErrorResponse();
        response.stack = error.stack;
        return response;
    }
    return {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        stack: error.stack,
    };
}
function buildProductionErrorResponse(error) {
    return sanitizeErrorForClient(error);
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
//# sourceMappingURL=error-response-builder.js.map