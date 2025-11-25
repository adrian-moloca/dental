"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTenantContext = extractTenantContext;
exports.createTenantContext = createTenantContext;
exports.isOrganizationLevel = isOrganizationLevel;
exports.isClinicLevel = isClinicLevel;
function extractTenantContext(user) {
    if (!user || !user.tenantContext) {
        throw new Error('Invalid user: missing tenant context');
    }
    return {
        organizationId: user.tenantContext.organizationId,
        clinicId: user.tenantContext.clinicId,
        tenantId: user.tenantContext.tenantId,
    };
}
function createTenantContext(organizationId, clinicId) {
    if (!organizationId) {
        throw new Error('organizationId is required');
    }
    const tenantId = (clinicId ?? organizationId);
    return Object.freeze({
        organizationId,
        clinicId,
        tenantId,
    });
}
function isOrganizationLevel(tenant) {
    return !tenant.clinicId;
}
function isClinicLevel(tenant) {
    return !!tenant.clinicId;
}
//# sourceMappingURL=current-tenant.js.map