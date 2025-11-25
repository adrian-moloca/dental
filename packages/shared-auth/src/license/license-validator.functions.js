"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasModule = hasModule;
exports.hasAnyModule = hasAnyModule;
exports.hasAllModules = hasAllModules;
exports.getAvailableModules = getAvailableModules;
exports.isSubscriptionActive = isSubscriptionActive;
exports.isInGracePeriodSimple = isInGracePeriodSimple;
exports.hasPremiumAccess = hasPremiumAccess;
exports.hasOnlyCoreModules = hasOnlyCoreModules;
exports.getCoreModules = getCoreModules;
exports.getPremiumModules = getPremiumModules;
exports.canAccessModule = canAccessModule;
exports.getMissingModules = getMissingModules;
exports.isTrialUser = isTrialUser;
exports.isSubscriptionExpired = isSubscriptionExpired;
exports.getSubscriptionStatus = getSubscriptionStatus;
const jwt_payload_types_1 = require("../jwt/jwt-payload.types");
const license_constants_1 = require("./license.constants");
function hasModule(user, moduleCode) {
    if (!user || !user.subscription) {
        return false;
    }
    return user.subscription.modules.includes(moduleCode);
}
function hasAnyModule(user, moduleCodes) {
    if (!user || !user.subscription || !moduleCodes || moduleCodes.length === 0) {
        return false;
    }
    return moduleCodes.some((code) => hasModule(user, code));
}
function hasAllModules(user, moduleCodes) {
    if (!user || !user.subscription || !moduleCodes || moduleCodes.length === 0) {
        return false;
    }
    return moduleCodes.every((code) => hasModule(user, code));
}
function getAvailableModules(user) {
    if (!user || !user.subscription) {
        return [];
    }
    return user.subscription.modules;
}
function isSubscriptionActive(user) {
    if (!user || !user.subscription) {
        return false;
    }
    return (user.subscription.status === jwt_payload_types_1.SubscriptionStatus.ACTIVE ||
        user.subscription.status === jwt_payload_types_1.SubscriptionStatus.TRIAL);
}
function isInGracePeriodSimple(user) {
    if (!user || !user.subscription) {
        return false;
    }
    return user.subscription.status === jwt_payload_types_1.SubscriptionStatus.SUSPENDED;
}
function hasPremiumAccess(user) {
    if (!user || !user.subscription) {
        return false;
    }
    return license_constants_1.PREMIUM_MODULES.some((code) => hasModule(user, code));
}
function hasOnlyCoreModules(user) {
    if (!user || !user.subscription) {
        return false;
    }
    const userModules = user.subscription.modules;
    const hasPremium = license_constants_1.PREMIUM_MODULES.some((code) => userModules.includes(code));
    return !hasPremium && userModules.length > 0;
}
function getCoreModules(user) {
    if (!user || !user.subscription) {
        return [];
    }
    return user.subscription.modules.filter((code) => license_constants_1.CORE_MODULES.includes(code));
}
function getPremiumModules(user) {
    if (!user || !user.subscription) {
        return [];
    }
    return user.subscription.modules.filter((code) => license_constants_1.PREMIUM_MODULES.includes(code));
}
function canAccessModule(user, moduleCode) {
    if (!user || !user.subscription) {
        return false;
    }
    if (!hasModule(user, moduleCode)) {
        return false;
    }
    if (isSubscriptionActive(user)) {
        return true;
    }
    if (isInGracePeriodSimple(user)) {
        return true;
    }
    return false;
}
function getMissingModules(user, requiredModules) {
    if (!user || !user.subscription) {
        return requiredModules;
    }
    return requiredModules.filter((code) => !hasModule(user, code));
}
function isTrialUser(user) {
    if (!user || !user.subscription) {
        return false;
    }
    return user.subscription.status === jwt_payload_types_1.SubscriptionStatus.TRIAL;
}
function isSubscriptionExpired(user) {
    if (!user || !user.subscription) {
        return true;
    }
    return (user.subscription.status === jwt_payload_types_1.SubscriptionStatus.EXPIRED ||
        user.subscription.status === jwt_payload_types_1.SubscriptionStatus.CANCELLED);
}
function getSubscriptionStatus(user) {
    if (!user || !user.subscription) {
        return null;
    }
    return user.subscription.status;
}
//# sourceMappingURL=license-validator.functions.js.map