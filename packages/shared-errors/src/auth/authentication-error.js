"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationError = void 0;
const base_error_1 = require("../base/base-error");
class AuthenticationError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'AUTHENTICATION_ERROR',
            message,
            statusCode: 401,
            isOperational: true,
            metadata: {
                reason: options?.reason,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 401;
    }
    toErrorResponse() {
        return {
            status: 'error',
            code: this.code,
            message: this.message,
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
        };
    }
    isRetryable() {
        return this.metadata.reason === 'expired_token';
    }
    isUserError() {
        return true;
    }
    isCritical() {
        return this.metadata.reason === 'revoked_token';
    }
}
exports.AuthenticationError = AuthenticationError;
//# sourceMappingURL=authentication-error.js.map