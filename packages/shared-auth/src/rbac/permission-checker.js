"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = hasPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.hasAnyPermission = hasAnyPermission;
exports.canAccessResource = canAccessResource;
exports.getResourcePermissions = getResourcePermissions;
exports.hasFullAccess = hasFullAccess;
const shared_types_1 = require("@dentalos/shared-types");
function hasPermission(user, permission) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!permission || !permission.resource || !permission.action) {
        throw new Error('permission must have resource and action');
    }
    return user.permissions.some((p) => p.resource === permission.resource && p.action === permission.action);
}
function hasAllPermissions(user, permissions) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!permissions || permissions.length === 0) {
        throw new Error('permissions array must contain at least one permission');
    }
    return permissions.every((permission) => hasPermission(user, permission));
}
function hasAnyPermission(user, permissions) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!permissions || permissions.length === 0) {
        throw new Error('permissions array must contain at least one permission');
    }
    return permissions.some((permission) => hasPermission(user, permission));
}
function canAccessResource(user, resource, action) {
    if (!resource) {
        throw new Error('resource is required');
    }
    if (!action) {
        throw new Error('action is required');
    }
    return hasPermission(user, { resource, action });
}
function getResourcePermissions(user, resource) {
    if (!user || !user.permissions) {
        return [];
    }
    if (!resource) {
        throw new Error('resource is required');
    }
    return user.permissions.filter((p) => p.resource === resource);
}
function hasFullAccess(user, resource) {
    if (!resource) {
        throw new Error('resource is required');
    }
    const crudActions = [
        shared_types_1.PermissionAction.CREATE,
        shared_types_1.PermissionAction.READ,
        shared_types_1.PermissionAction.UPDATE,
        shared_types_1.PermissionAction.DELETE,
    ];
    return crudActions.every((action) => canAccessResource(user, resource, action));
}
//# sourceMappingURL=permission-checker.js.map