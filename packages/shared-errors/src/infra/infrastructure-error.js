"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureError = void 0;
const base_error_1 = require("../base/base-error");
class InfrastructureError extends base_error_1.BaseError {
    constructor(message, options) {
        const statusCode = options?.isTransient === true ? 503 : 500;
        super({
            code: 'INFRASTRUCTURE_ERROR',
            message,
            statusCode,
            isOperational: true,
            metadata: {
                service: options?.service,
                isTransient: options?.isTransient ?? false,
                retryAfterSeconds: options?.retryAfterSeconds,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return this.statusCode ?? 500;
    }
    toErrorResponse() {
        const clientMessage = this.metadata.isTransient === true
            ? 'Service temporarily unavailable. Please try again later.'
            : 'An internal error occurred. Please contact support.';
        const details = {};
        if (this.metadata.isTransient === true &&
            typeof this.metadata.retryAfterSeconds === 'number') {
            details.retryAfterSeconds = this.metadata.retryAfterSeconds;
        }
        return {
            status: 'error',
            code: this.code,
            message: clientMessage,
            details: Object.keys(details).length > 0 ? details : undefined,
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
        };
    }
    isRetryable() {
        return this.metadata.isTransient === true;
    }
    isUserError() {
        return false;
    }
    isCritical() {
        return this.metadata.isTransient !== true;
    }
}
exports.InfrastructureError = InfrastructureError;
//# sourceMappingURL=infrastructure-error.js.map