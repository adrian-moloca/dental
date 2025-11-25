"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_METADATA_KEY = void 0;
exports.RequireRoles = RequireRoles;
exports.RequireAllRoles = RequireAllRoles;
exports.getRoleMetadata = getRoleMetadata;
require("reflect-metadata");
exports.ROLE_METADATA_KEY = 'auth:roles';
function RequireRoles(...roles) {
    return (_target, _propertyKey, descriptor) => {
        const metadata = {
            roles: Object.freeze([...roles]),
            requireAll: false,
        };
        Reflect.defineMetadata(exports.ROLE_METADATA_KEY, metadata, descriptor.value);
        return descriptor;
    };
}
function RequireAllRoles(...roles) {
    return (_target, _propertyKey, descriptor) => {
        const metadata = {
            roles: Object.freeze([...roles]),
            requireAll: true,
        };
        Reflect.defineMetadata(exports.ROLE_METADATA_KEY, metadata, descriptor.value);
        return descriptor;
    };
}
function getRoleMetadata(target) {
    return Reflect.getMetadata(exports.ROLE_METADATA_KEY, target);
}
//# sourceMappingURL=role.decorator.js.map