"use strict";
var LicenseGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseGuard = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const requires_module_decorator_1 = require("./requires-module.decorator");
let LicenseGuard = LicenseGuard_1 = class LicenseGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(LicenseGuard_1.name);
    }
    canActivate(context) {
        const requiredModule = this.reflector.getAllAndOverride(requires_module_decorator_1.MODULE_METADATA_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredModule) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.error({
                message: 'LicenseGuard: No user in request',
                path: request.url,
                method: request.method,
                requiredModule,
            });
            throw new common_1.ForbiddenException('Authentication required. Please log in to access this resource.');
        }
        const subscription = user.subscription;
        if (!subscription) {
            this.logger.warn({
                message: 'LicenseGuard: No subscription in user context',
                userId: user.userId || user.sub,
                email: user.email,
                organizationId: user.tenantContext?.organizationId,
                path: request.url,
                method: request.method,
                requiredModule,
            });
            throw new common_1.ForbiddenException(`Access denied: Module '${requiredModule}' is required but no subscription information found. Please contact your administrator.`);
        }
        const userModules = subscription.modules || [];
        if (!Array.isArray(userModules)) {
            this.logger.error({
                message: 'LicenseGuard: Invalid modules data type',
                userId: user.userId || user.sub,
                email: user.email,
                modulesType: typeof userModules,
                path: request.url,
                method: request.method,
                requiredModule,
            });
            throw new common_1.ForbiddenException('Invalid subscription data. Please contact your administrator.');
        }
        const hasModule = userModules.includes(requiredModule);
        if (!hasModule) {
            this.logger.warn({
                message: 'LicenseGuard: Module access denied',
                userId: user.userId || user.sub,
                email: user.email,
                organizationId: user.tenantContext?.organizationId,
                requiredModule,
                userModules,
                path: request.url,
                method: request.method,
            });
            throw new common_1.ForbiddenException(`Access denied: Module '${requiredModule}' is required but not enabled in your subscription. Please upgrade your plan to access this feature.`);
        }
        this.logger.debug({
            message: 'LicenseGuard: Module access granted',
            userId: user.userId || user.sub,
            requiredModule,
            path: request.url,
            method: request.method,
        });
        return true;
    }
};
exports.LicenseGuard = LicenseGuard;
exports.LicenseGuard = LicenseGuard = LicenseGuard_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector])
], LicenseGuard);
//# sourceMappingURL=license.guard.js.map