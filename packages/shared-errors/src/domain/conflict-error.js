"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const base_error_1 = require("../base/base-error");
class ConflictError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'CONFLICT',
            message,
            statusCode: 409,
            isOperational: true,
            metadata: {
                conflictType: options?.conflictType,
                resourceType: options?.resourceType,
                existingId: options?.existingId,
                expectedVersion: options?.expectedVersion,
                actualVersion: options?.actualVersion,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 409;
    }
    toErrorResponse() {
        const details = {};
        if (this.metadata.conflictType) {
            details.conflictType = this.metadata.conflictType;
        }
        if (this.metadata.resourceType) {
            details.resourceType = this.metadata.resourceType;
        }
        if (this.metadata.conflictType === 'version' &&
            this.metadata.expectedVersion !== undefined &&
            this.metadata.actualVersion !== undefined) {
            details.expectedVersion = this.metadata.expectedVersion;
            details.actualVersion = this.metadata.actualVersion;
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
        return (this.metadata.conflictType === 'version' ||
            this.metadata.conflictType === 'concurrent');
    }
    isUserError() {
        return true;
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=conflict-error.js.map