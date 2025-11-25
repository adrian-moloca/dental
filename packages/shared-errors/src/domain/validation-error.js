"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const base_error_1 = require("../base/base-error");
class ValidationError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'VALIDATION_ERROR',
            message,
            statusCode: 400,
            isOperational: true,
            metadata: {
                field: options?.field,
                value: options?.value,
                errors: options?.errors,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 400;
    }
    toErrorResponse() {
        return {
            status: 'error',
            code: this.code,
            message: this.message,
            details: this.metadata.errors || this.metadata.field,
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
exports.ValidationError = ValidationError;
//# sourceMappingURL=validation-error.js.map