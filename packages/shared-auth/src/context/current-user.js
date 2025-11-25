"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurrentUser = createCurrentUser;
function createCurrentUser(params) {
    if (!params.userId) {
        throw new Error('userId is required');
    }
    if (!params.email) {
        throw new Error('email is required');
    }
    if (!params.roles || params.roles.length === 0) {
        throw new Error('At least one role is required');
    }
    if (!params.permissions) {
        throw new Error('permissions array is required (can be empty)');
    }
    if (!params.organizationId) {
        throw new Error('organizationId is required');
    }
    const tenantId = (params.clinicId ?? params.organizationId);
    return {
        userId: params.userId,
        email: params.email,
        roles: Object.freeze([...params.roles]),
        permissions: Object.freeze([...params.permissions]),
        cabinetId: params.cabinetId,
        subscription: params.subscription ? Object.freeze({
            status: params.subscription.status,
            modules: Object.freeze([...params.subscription.modules]),
        }) : undefined,
        tenantContext: Object.freeze({
            organizationId: params.organizationId,
            clinicId: params.clinicId,
            cabinetId: params.cabinetId,
            tenantId,
        }),
        organizationId: params.organizationId,
        clinicId: params.clinicId,
        tenantId,
    };
}
//# sourceMappingURL=current-user.js.map