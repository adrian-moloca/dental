"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleGuard = exports.Roles = exports.ROLES_KEY = exports.PermissionGuard = exports.Permissions = exports.PERMISSIONS_KEY = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
exports.PERMISSIONS_KEY = 'permissions';
const Permissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.Permissions = Permissions;
let PermissionGuard = class PermissionGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(exports.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const userPermissions = user.permissions || [];
        const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission));
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector])
], PermissionGuard);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
let RoleGuard = class RoleGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const userRoles = user.roles || [];
        const hasRole = requiredRoles.some((role) => userRoles.includes(role));
        if (!hasRole) {
            throw new common_1.ForbiddenException(`Missing required roles: ${requiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector])
], RoleGuard);
//# sourceMappingURL=permission.guard.js.map