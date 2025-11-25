"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextGuard = exports.TENANT_CONTEXT_KEY = void 0;
exports.getTenantContext = getTenantContext;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
exports.TENANT_CONTEXT_KEY = 'tenantContext';
let TenantContextGuard = class TenantContextGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const tenantId = this.extractTenantId(request);
        if (!tenantId) {
            throw new common_1.UnauthorizedException('Tenant ID is required');
        }
        const tenantContext = {
            tenantId,
            organizationId: this.extractOrganizationId(request),
            clinicId: this.extractClinicId(request),
            userId: this.extractUserId(request),
            correlationId: this.extractCorrelationId(request),
        };
        request[exports.TENANT_CONTEXT_KEY] = tenantContext;
        return true;
    }
    extractTenantId(request) {
        return (request.headers['x-tenant-id'] ||
            request.query.tenantId ||
            request.user?.tenantId ||
            request.body?.tenantId);
    }
    extractOrganizationId(request) {
        return (request.headers['x-organization-id'] ||
            request.query.organizationId ||
            request.user?.organizationId ||
            request.body?.organizationId);
    }
    extractClinicId(request) {
        return (request.headers['x-clinic-id'] ||
            request.query.clinicId ||
            request.user?.clinicId ||
            request.body?.clinicId);
    }
    extractUserId(request) {
        return request.user?.userId || request.user?.sub || request.user?.id;
    }
    extractCorrelationId(request) {
        return (request.headers['x-correlation-id'] ||
            request.headers['x-request-id'] ||
            `req-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    }
};
exports.TenantContextGuard = TenantContextGuard;
exports.TenantContextGuard = TenantContextGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], TenantContextGuard);
function getTenantContext(request) {
    return request[exports.TENANT_CONTEXT_KEY];
}
//# sourceMappingURL=tenant-context.guard.js.map