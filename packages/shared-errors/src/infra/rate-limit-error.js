"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = void 0;
const base_error_1 = require("../base/base-error");
class RateLimitError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            statusCode: 429,
            isOperational: true,
            metadata: {
                limitType: options?.limitType,
                limit: options?.limit,
                remaining: options?.remaining ?? 0,
                resetAt: options?.resetAt,
                retryAfterSeconds: options?.retryAfterSeconds,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 429;
    }
    toErrorResponse() {
        const details = {};
        if (typeof this.metadata.limit === 'number') {
            details.limit = this.metadata.limit;
        }
        if (typeof this.metadata.remaining === 'number') {
            details.remaining = this.metadata.remaining;
        }
        if (this.metadata.resetAt instanceof Date) {
            details.resetAt = this.metadata.resetAt.toISOString();
        }
        if (typeof this.metadata.retryAfterSeconds === 'number') {
            details.retryAfterSeconds = this.metadata.retryAfterSeconds;
        }
        return {
            status: 'error',
            code: this.code,
            message: this.message,
            details: Object.keys(details).length > 0 ? details : undefined,
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
        };
    }
    isRetryable() {
        return true;
    }
    isUserError() {
        return true;
    }
    isCritical() {
        return false;
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=rate-limit-error.js.map