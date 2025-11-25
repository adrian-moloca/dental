"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInGracePeriod = isInGracePeriod;
exports.getGracePeriodDaysRemaining = getGracePeriodDaysRemaining;
exports.isGracePeriodExpiringSoon = isGracePeriodExpiringSoon;
exports.isReadOperation = isReadOperation;
exports.isWriteOperation = isWriteOperation;
exports.canPerformOperation = canPerformOperation;
exports.canPerformWriteOperation = canPerformWriteOperation;
exports.calculateGracePeriodEnd = calculateGracePeriodEnd;
exports.getGracePeriodStatusMessage = getGracePeriodStatusMessage;
exports.hasFullAccess = hasFullAccess;
const jwt_payload_types_1 = require("../jwt/jwt-payload.types");
const license_constants_1 = require("./license.constants");
function isInGracePeriod(subscription) {
    if (subscription.status !== jwt_payload_types_1.SubscriptionStatus.SUSPENDED ||
        !subscription.inGracePeriod) {
        return false;
    }
    if (!subscription.gracePeriodEndsAt) {
        return false;
    }
    const now = new Date();
    const graceEnd = new Date(subscription.gracePeriodEndsAt);
    return now <= graceEnd;
}
function getGracePeriodDaysRemaining(subscription) {
    if (!isInGracePeriod(subscription)) {
        return 0;
    }
    const now = new Date();
    const graceEnd = new Date(subscription.gracePeriodEndsAt);
    const diffMs = graceEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}
function isGracePeriodExpiringSoon(subscription) {
    const daysRemaining = getGracePeriodDaysRemaining(subscription);
    return daysRemaining > 0 && daysRemaining <= 3;
}
function isReadOperation(method) {
    const upperMethod = method.toUpperCase();
    return license_constants_1.READ_METHODS.includes(upperMethod);
}
function isWriteOperation(method) {
    const upperMethod = method.toUpperCase();
    return license_constants_1.WRITE_METHODS.includes(upperMethod);
}
function canPerformOperation(subscription, httpMethod) {
    if (isInGracePeriod(subscription)) {
        return isReadOperation(httpMethod);
    }
    return (subscription.status === jwt_payload_types_1.SubscriptionStatus.ACTIVE ||
        subscription.status === jwt_payload_types_1.SubscriptionStatus.TRIAL);
}
function canPerformWriteOperation(subscription, httpMethod) {
    if (!isWriteOperation(httpMethod)) {
        return true;
    }
    if (isInGracePeriod(subscription)) {
        return false;
    }
    return (subscription.status === jwt_payload_types_1.SubscriptionStatus.ACTIVE ||
        subscription.status === jwt_payload_types_1.SubscriptionStatus.TRIAL);
}
function calculateGracePeriodEnd(startDate, gracePeriodDays = license_constants_1.GRACE_PERIOD_DAYS) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + gracePeriodDays);
    return endDate;
}
function getGracePeriodStatusMessage(subscription) {
    if (!isInGracePeriod(subscription)) {
        return '';
    }
    const daysRemaining = getGracePeriodDaysRemaining(subscription);
    if (daysRemaining === 0) {
        return 'Your grace period has ended. Please update your payment method.';
    }
    if (daysRemaining === 1) {
        return 'Your account is in grace period. 1 day remaining. Write operations are disabled.';
    }
    return `Your account is in grace period. ${daysRemaining} days remaining. Write operations are disabled.`;
}
function hasFullAccess(subscription) {
    return ((subscription.status === jwt_payload_types_1.SubscriptionStatus.ACTIVE ||
        subscription.status === jwt_payload_types_1.SubscriptionStatus.TRIAL) &&
        !isInGracePeriod(subscription));
}
//# sourceMappingURL=grace-period.helper.js.map