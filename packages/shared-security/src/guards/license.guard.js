"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseGuard = exports.RequiresModule = exports.REQUIRED_MODULE_KEY = exports.PaymentRequiredException = void 0;
exports.isGracePeriodAllowed = isGracePeriodAllowed;
exports.hasModuleAccess = hasModuleAccess;
exports.isSubscriptionActive = isSubscriptionActive;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const shared_auth_1 = require("@dentalos/shared-auth");
class PaymentRequiredException extends common_1.HttpException {
    constructor(message) {
        super(message, common_1.HttpStatus.PAYMENT_REQUIRED);
    }
}
exports.PaymentRequiredException = PaymentRequiredException;
exports.REQUIRED_MODULE_KEY = 'requiredModule';
const RequiresModule = (moduleCode) => (0, common_1.SetMetadata)(exports.REQUIRED_MODULE_KEY, moduleCode);
exports.RequiresModule = RequiresModule;
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
let LicenseGuard = class LicenseGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const requiredModule = this.reflector.getAllAndOverride(exports.REQUIRED_MODULE_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredModule) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated. License validation requires authentication.');
        }
        if (!user.subscription) {
            throw new common_1.ForbiddenException('Subscription context missing from authentication token. Please re-authenticate.');
        }
        const { status, modules } = user.subscription;
        if (status === shared_auth_1.SubscriptionStatus.SUSPENDED) {
            throw new common_1.ForbiddenException('Your subscription has been suspended. Please contact support to restore access.');
        }
        if (status === shared_auth_1.SubscriptionStatus.EXPIRED) {
            throw new PaymentRequiredException('Your subscription has expired. Please renew to continue using this feature.');
        }
        if (status === shared_auth_1.SubscriptionStatus.CANCELLED) {
            throw new common_1.ForbiddenException('Your subscription has been cancelled. Please subscribe to access this feature.');
        }
        const hasModuleAccess = modules.includes(requiredModule);
        if (!hasModuleAccess) {
            throw new common_1.ForbiddenException(`Access denied. The module "${requiredModule}" is not included in your subscription plan. Please upgrade to access this feature.`);
        }
        if (status === shared_auth_1.SubscriptionStatus.TRIAL) {
        }
        return true;
    }
};
exports.LicenseGuard = LicenseGuard;
exports.LicenseGuard = LicenseGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector])
], LicenseGuard);
function isGracePeriodAllowed(httpMethod) {
    return READ_ONLY_METHODS.includes(httpMethod.toUpperCase());
}
function hasModuleAccess(user, moduleCode) {
    if (!user?.subscription?.modules) {
        return false;
    }
    return user.subscription.modules.includes(moduleCode);
}
function isSubscriptionActive(user) {
    if (!user?.subscription?.status) {
        return false;
    }
    const activeStatuses = [
        shared_auth_1.SubscriptionStatus.ACTIVE,
        shared_auth_1.SubscriptionStatus.TRIAL,
    ];
    return activeStatuses.includes(user.subscription.status);
}
//# sourceMappingURL=license.guard.js.map