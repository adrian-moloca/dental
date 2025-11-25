"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = hasRole;
exports.hasAnyRole = hasAnyRole;
exports.hasAllRoles = hasAllRoles;
exports.isSuperAdmin = isSuperAdmin;
exports.isOrgAdmin = isOrgAdmin;
exports.isClinicAdmin = isClinicAdmin;
exports.isClinicalStaff = isClinicalStaff;
const shared_types_1 = require("@dentalos/shared-types");
function hasRole(user, role) {
    if (!user || !user.roles) {
        return false;
    }
    if (!role) {
        throw new Error('role parameter is required');
    }
    return user.roles.includes(role);
}
function hasAnyRole(user, roles) {
    if (!user || !user.roles) {
        return false;
    }
    if (!roles || roles.length === 0) {
        throw new Error('roles array must contain at least one role');
    }
    return roles.some((role) => user.roles.includes(role));
}
function hasAllRoles(user, roles) {
    if (!user || !user.roles) {
        return false;
    }
    if (!roles || roles.length === 0) {
        throw new Error('roles array must contain at least one role');
    }
    return roles.every((role) => user.roles.includes(role));
}
function isSuperAdmin(user) {
    return hasRole(user, shared_types_1.UserRole.SUPER_ADMIN);
}
function isOrgAdmin(user) {
    return hasAnyRole(user, [shared_types_1.UserRole.SUPER_ADMIN, shared_types_1.UserRole.ORG_ADMIN]);
}
function isClinicAdmin(user) {
    return hasAnyRole(user, [
        shared_types_1.UserRole.SUPER_ADMIN,
        shared_types_1.UserRole.ORG_ADMIN,
        shared_types_1.UserRole.CLINIC_ADMIN,
    ]);
}
function isClinicalStaff(user) {
    return hasAnyRole(user, [
        shared_types_1.UserRole.DENTIST,
        shared_types_1.UserRole.HYGIENIST,
        shared_types_1.UserRole.ASSISTANT,
    ]);
}
//# sourceMappingURL=role-checker.js.map