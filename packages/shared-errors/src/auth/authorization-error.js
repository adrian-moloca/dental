"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationError = void 0;
const base_error_1 = require("../base/base-error");
class AuthorizationError extends base_error_1.BaseError {
    constructor(message, options) {
        super({
            code: 'AUTHORIZATION_ERROR',
            message,
            statusCode: 403,
            isOperational: true,
            metadata: {
                reason: options?.reason,
                userId: options?.userId,
                requiredPermission: options?.requiredPermission,
                resourceType: options?.resourceType,
                organizationId: options?.organizationId,
                targetUserId: options?.targetUserId,
                attemptedRole: options?.attemptedRole,
            },
            correlationId: options?.correlationId,
            cause: options?.cause,
            tenantContext: options?.tenantContext,
        });
    }
    toHttpStatus() {
        return 403;
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
        return false;
    }
    isUserError() {
        return true;
    }
    isCritical() {
        return this.metadata.reason === 'tenant_isolation' ||
            this.metadata.reason === 'System role protection' ||
            this.metadata.reason === 'Privilege escalation prevention';
    }
}
exports.AuthorizationError = AuthorizationError;
//# sourceMappingURL=authorization-error.js.map