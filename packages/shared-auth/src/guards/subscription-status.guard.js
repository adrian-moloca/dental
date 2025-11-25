"use strict";
var SubscriptionStatusGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatusGuard = exports.ALLOW_GRACE_PERIOD_KEY = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_payload_types_1 = require("../jwt/jwt-payload.types");
exports.ALLOW_GRACE_PERIOD_KEY = 'allow_grace_period';
const ACTIVE_STATUSES = [
    jwt_payload_types_1.SubscriptionStatus.ACTIVE,
    jwt_payload_types_1.SubscriptionStatus.TRIAL,
];
const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];
let SubscriptionStatusGuard = SubscriptionStatusGuard_1 = class SubscriptionStatusGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(SubscriptionStatusGuard_1.name);
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.error({
                message: 'SubscriptionStatusGuard: No user in request',
                path: request.url,
                method: request.method,
            });
            throw new common_1.ForbiddenException('Authentication required. Please log in to access this resource.');
        }
        const subscription = user.subscription;
        if (!subscription) {
            this.logger.warn({
                message: 'SubscriptionStatusGuard: No subscription in user context',
                userId: user.userId || user.sub,
                email: user.email,
                organizationId: user.tenantContext?.organizationId,
                path: request.url,
                method: request.method,
            });
            throw new common_1.ForbiddenException('No active subscription. Please contact your administrator to set up a subscription.');
        }
        const status = subscription.status;
        if (ACTIVE_STATUSES.includes(status)) {
            this.logger.debug({
                message: 'SubscriptionStatusGuard: Active subscription',
                userId: user.userId || user.sub,
                status,
                path: request.url,
                method: request.method,
            });
            return true;
        }
        if (status === jwt_payload_types_1.SubscriptionStatus.EXPIRED) {
            this.logger.warn({
                message: 'SubscriptionStatusGuard: Expired subscription',
                userId: user.userId || user.sub,
                email: user.email,
                organizationId: user.tenantContext?.organizationId,
                status,
                path: request.url,
                method: request.method,
            });
            throw new common_1.HttpException('Your subscription has expired. Please renew your subscription to continue using this feature.', common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        if (status === jwt_payload_types_1.SubscriptionStatus.SUSPENDED) {
            const allowGracePeriod = this.reflector.getAllAndOverride(exports.ALLOW_GRACE_PERIOD_KEY, [context.getHandler(), context.getClass()]);
            const isReadOperation = READ_METHODS.includes(request.method.toUpperCase());
            if (allowGracePeriod && isReadOperation) {
                this.logger.debug({
                    message: 'SubscriptionStatusGuard: Grace period read-only access granted',
                    userId: user.userId || user.sub,
                    status,
                    method: request.method,
                    path: request.url,
                });
                return true;
            }
            this.logger.warn({
                message: 'SubscriptionStatusGuard: Suspended subscription',
                userId: user.userId || user.sub,
                email: user.email,
                organizationId: user.tenantContext?.organizationId,
                status,
                method: request.method,
                isReadOperation,
                allowGracePeriod,
                path: request.url,
            });
            throw new common_1.ForbiddenException('Your subscription payment has failed. Please update your payment method to continue using this feature.');
        }
        if (status === jwt_payload_types_1.SubscriptionStatus.CANCELLED) {
            this.logger.warn({
                message: 'SubscriptionStatusGuard: Cancelled subscription',
                userId: user.userId || user.sub,
                email: user.email,
                organizationId: user.tenantContext?.organizationId,
                status,
                path: request.url,
                method: request.method,
            });
            throw new common_1.ForbiddenException('Your subscription has been cancelled. Please reactivate your subscription to continue.');
        }
        this.logger.error({
            message: 'SubscriptionStatusGuard: Unknown subscription status',
            userId: user.userId || user.sub,
            email: user.email,
            status,
            path: request.url,
            method: request.method,
        });
        throw new common_1.ForbiddenException('Invalid subscription status. Please contact support.');
    }
};
exports.SubscriptionStatusGuard = SubscriptionStatusGuard;
exports.SubscriptionStatusGuard = SubscriptionStatusGuard = SubscriptionStatusGuard_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector])
], SubscriptionStatusGuard);
//# sourceMappingURL=subscription-status.guard.js.map