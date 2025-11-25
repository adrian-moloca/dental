"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameTenant = isSameTenant;
exports.belongsToOrganization = belongsToOrganization;
exports.belongsToClinic = belongsToClinic;
exports.canAccessOrganization = canAccessOrganization;
exports.canAccessClinic = canAccessClinic;
exports.hasOrganizationLevelAccess = hasOrganizationLevelAccess;
exports.hasClinicLevelAccess = hasClinicLevelAccess;
function isSameTenant(context1, context2) {
    if (!context1 || !context2) {
        throw new Error('Both tenant contexts are required');
    }
    return context1.tenantId === context2.tenantId;
}
function belongsToOrganization(context, organizationId) {
    if (!context) {
        throw new Error('Tenant context is required');
    }
    if (!organizationId) {
        throw new Error('organizationId is required');
    }
    return context.organizationId === organizationId;
}
function belongsToClinic(context, clinicId) {
    if (!context) {
        throw new Error('Tenant context is required');
    }
    if (!clinicId) {
        throw new Error('clinicId is required');
    }
    if (!context.clinicId) {
        return false;
    }
    return context.clinicId === clinicId;
}
function canAccessOrganization(user, organizationId) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    if (!organizationId) {
        throw new Error('organizationId is required');
    }
    return user.tenantContext.organizationId === organizationId;
}
function canAccessClinic(user, clinicId) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    if (!clinicId) {
        throw new Error('clinicId is required');
    }
    if (user.tenantContext.clinicId === clinicId) {
        return true;
    }
    return false;
}
function hasOrganizationLevelAccess(user) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    return !user.tenantContext.clinicId;
}
function hasClinicLevelAccess(user) {
    if (!user || !user.tenantContext) {
        throw new Error('Valid user with tenant context is required');
    }
    return !!user.tenantContext.clinicId;
}
//# sourceMappingURL=tenant-checker.js.map