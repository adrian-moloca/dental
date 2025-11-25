"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_METADATA_KEY = void 0;
exports.RequirePermissions = RequirePermissions;
exports.RequireAnyPermission = RequireAnyPermission;
exports.getPermissionMetadata = getPermissionMetadata;
require("reflect-metadata");
exports.PERMISSION_METADATA_KEY = 'auth:permissions';
function RequirePermissions(...permissions) {
    return (_target, _propertyKey, descriptor) => {
        const metadata = {
            permissions: Object.freeze([...permissions]),
            requireAll: true,
        };
        Reflect.defineMetadata(exports.PERMISSION_METADATA_KEY, metadata, descriptor.value);
        return descriptor;
    };
}
function RequireAnyPermission(...permissions) {
    return (_target, _propertyKey, descriptor) => {
        const metadata = {
            permissions: Object.freeze([...permissions]),
            requireAll: false,
        };
        Reflect.defineMetadata(exports.PERMISSION_METADATA_KEY, metadata, descriptor.value);
        return descriptor;
    };
}
function getPermissionMetadata(target) {
    return Reflect.getMetadata(exports.PERMISSION_METADATA_KEY, target);
}
//# sourceMappingURL=permission.decorator.js.map