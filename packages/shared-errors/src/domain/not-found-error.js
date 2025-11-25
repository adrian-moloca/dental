"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const base_error_1 = require("../base/base-error");
class NotFoundError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'NOT_FOUND',
            message,
            statusCode: 404,
            isOperational: true,
            metadata: {
                resourceType: options?.resourceType,
                resourceId: options?.resourceId,
                organizationId: options?.organizationId,
                context: options?.context,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 404;
    }
    toErrorResponse() {
        return {
            status: 'error',
            code: this.code,
            message: this.message,
            details: this.metadata.resourceType
                ? { resourceType: this.metadata.resourceType }
                : undefined,
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
        };
    }
    isRetryable() {
        return false;
    }
    isUserError() {
        return true;
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=not-found-error.js.map