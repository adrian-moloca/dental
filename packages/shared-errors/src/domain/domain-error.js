"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
const base_error_1 = require("../base/base-error");
class DomainError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'DOMAIN_ERROR',
            message,
            statusCode: 422,
            isOperational: true,
            metadata: {
                rule: options?.rule,
                ruleType: options?.ruleType,
                resourceType: options?.resourceType,
                allowedActions: options?.allowedActions,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 422;
    }
    toErrorResponse() {
        const details = {};
        if (this.metadata.rule) {
            details.rule = this.metadata.rule;
        }
        if (this.metadata.ruleType) {
            details.ruleType = this.metadata.ruleType;
        }
        if (this.metadata.resourceType) {
            details.resourceType = this.metadata.resourceType;
        }
        if (this.metadata.ruleType === 'state_transition' &&
            this.metadata.allowedActions &&
            Array.isArray(this.metadata.allowedActions)) {
            details.allowedActions = this.metadata.allowedActions;
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
        return false;
    }
    isUserError() {
        return true;
    }
    isCritical() {
        return this.metadata.ruleType === 'invariant';
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain-error.js.map