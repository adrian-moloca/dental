"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityError = void 0;
const base_error_1 = require("../base/base-error");
class SecurityError extends base_error_1.BaseError {
    constructor(options) {
        super({
            code: options.code,
            message: options.message,
            statusCode: 500,
            isOperational: true,
            metadata: options.metadata || {},
            correlationId: options.correlationId,
            cause: options.cause,
            tenantContext: options.tenantContext,
        });
    }
    toHttpStatus() {
        return 500;
    }
    toErrorResponse() {
        return {
            status: 'error',
            code: this.code,
            message: 'A security error occurred. Please contact support.',
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
        };
    }
    isRetryable() {
        return false;
    }
    isUserError() {
        return false;
    }
    isCritical() {
        return true;
    }
}
exports.SecurityError = SecurityError;
//# sourceMappingURL=security-error.js.map