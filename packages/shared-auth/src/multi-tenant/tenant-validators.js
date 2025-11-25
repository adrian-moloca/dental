"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantIsolationError = void 0;
exports.validateTenantAccess = validateTenantAccess;
exports.ensureTenantIsolation = ensureTenantIsolation;
exports.canAccessOrganization = canAccessOrganization;
exports.validateOrganizationAccess = validateOrganizationAccess;
exports.canAccessClinic = canAccessClinic;
exports.validateClinicAccess = validateClinicAccess;
class TenantIsolationError extends Error {
    constructor(message, userTenantId, targetTenantId) {
        super(message);
        this.userTenantId = userTenantId;
        this.targetTenantId = targetTenantId;
        this.name = 'TenantIsolationError';
        Object.setPrototypeOf(this, TenantIsolationError.prototype);
    }
}
exports.TenantIsolationError = TenantIsolationError;
function validateTenantAccess(user, targetTenantId) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    if (!targetTenantId) {
        throw new Error('targetTenantId is required');
    }
    if (user.tenantContext.tenantId !== targetTenantId) {
        throw new TenantIsolationError(`Tenant isolation violation: User from tenant ${user.tenantContext.tenantId} ` +
            `attempted to access data from tenant ${targetTenantId}`, user.tenantContext.tenantId, targetTenantId);
    }
}
function ensureTenantIsolation(userContext, dataContext) {
    if (!userContext || !dataContext) {
        throw new Error('Both user and data contexts are required');
    }
    if (userContext.organizationId !== dataContext.organizationId) {
        throw new TenantIsolationError(`Organization isolation violation: User from organization ${userContext.organizationId} ` +
            `attempted to access data from organization ${dataContext.organizationId}`, userContext.tenantId, dataContext.tenantId);
    }
    if (userContext.tenantId !== dataContext.tenantId) {
        throw new TenantIsolationError(`Tenant isolation violation: User tenant ${userContext.tenantId} ` +
            `attempted to access data from tenant ${dataContext.tenantId}`, userContext.tenantId, dataContext.tenantId);
    }
}
function canAccessOrganization(user, organizationId) {
    if (!user || !user.tenantContext) {
        return false;
    }
    if (!organizationId) {
        return false;
    }
    return user.tenantContext.organizationId === organizationId;
}
function validateOrganizationAccess(user, organizationId) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    if (!organizationId) {
        throw new Error('organizationId is required');
    }
    if (user.tenantContext.organizationId !== organizationId) {
        throw new TenantIsolationError(`Organization access denied: User from organization ${user.tenantContext.organizationId} ` +
            `attempted to access organization ${organizationId}`, user.tenantContext.tenantId, organizationId);
    }
}
function canAccessClinic(user, clinicId) {
    if (!user || !user.tenantContext) {
        return false;
    }
    if (!clinicId) {
        return false;
    }
    if (user.tenantContext.clinicId === clinicId) {
        return true;
    }
    return false;
}
function validateClinicAccess(user, clinicId) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    if (!clinicId) {
        throw new Error('clinicId is required');
    }
    if (!canAccessClinic(user, clinicId)) {
        throw new TenantIsolationError(`Clinic access denied: User from tenant ${user.tenantContext.tenantId} ` +
            `attempted to access clinic ${clinicId}`, user.tenantContext.tenantId, clinicId);
    }
}
//# sourceMappingURL=tenant-validators.js.map