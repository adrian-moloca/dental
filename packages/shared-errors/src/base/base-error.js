"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
class BaseError extends Error {
    constructor(options) {
        super(options.message);
        this.name = this.constructor.name;
        this.code = options.code;
        this.statusCode = options.statusCode;
        this.isOperational = options.isOperational ?? true;
        this.timestamp = new Date();
        this.correlationId = options.correlationId;
        this.metadata = Object.freeze({ ...(options.metadata || {}) });
        this.tenantContext = options.tenantContext
            ? Object.freeze({
                organizationId: options.tenantContext.organizationId,
                ...(options.tenantContext.clinicId && {
                    clinicId: options.tenantContext.clinicId,
                }),
            })
            : undefined;
        Object.setPrototypeOf(this, new.target.prototype);
        const errorConstructor = Error;
        if (typeof errorConstructor.captureStackTrace === 'function') {
            errorConstructor.captureStackTrace(this, this.constructor);
        }
        if (options.cause && options.cause.stack) {
            this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
        }
    }
    isRetryable() {
        return false;
    }
    isUserError() {
        return this.isOperational;
    }
    isCritical() {
        return !this.isOperational;
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            isOperational: this.isOperational,
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
            metadata: this.metadata,
            tenantContext: this.tenantContext,
        };
    }
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=base-error.js.map