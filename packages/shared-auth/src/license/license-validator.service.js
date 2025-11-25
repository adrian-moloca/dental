"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseValidatorService = exports.LicenseForbiddenException = void 0;
const jwt_payload_types_1 = require("../jwt/jwt-payload.types");
const license_validator_functions_1 = require("./license-validator.functions");
class LicenseForbiddenException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
        this.name = 'LicenseForbiddenException';
        this.response = message;
    }
}
exports.LicenseForbiddenException = LicenseForbiddenException;
class LicenseValidatorService {
    hasModule(user, moduleCode) {
        return (0, license_validator_functions_1.hasModule)(user, moduleCode);
    }
    requireModule(user, moduleCode) {
        if (!(0, license_validator_functions_1.hasModule)(user, moduleCode)) {
            throw new LicenseForbiddenException(`Access denied: Module '${moduleCode}' is required but not enabled in your subscription`);
        }
    }
    requireAnyModule(user, moduleCodes) {
        if (!(0, license_validator_functions_1.hasAnyModule)(user, moduleCodes)) {
            throw new LicenseForbiddenException(`Access denied: At least one of the following modules is required: ${moduleCodes.join(', ')}`);
        }
    }
    requireAllModules(user, moduleCodes) {
        const missing = (0, license_validator_functions_1.getMissingModules)(user, moduleCodes);
        if (missing.length > 0) {
            throw new LicenseForbiddenException(`Access denied: The following modules are required but not enabled: ${missing.join(', ')}`);
        }
    }
    hasAnyModule(user, moduleCodes) {
        return (0, license_validator_functions_1.hasAnyModule)(user, moduleCodes);
    }
    hasAllModules(user, moduleCodes) {
        return (0, license_validator_functions_1.hasAllModules)(user, moduleCodes);
    }
    isSubscriptionActive(user) {
        return (0, license_validator_functions_1.isSubscriptionActive)(user);
    }
    requireActiveSubscription(user) {
        if (!(0, license_validator_functions_1.isSubscriptionActive)(user)) {
            const status = (0, license_validator_functions_1.getSubscriptionStatus)(user);
            let message = 'Active subscription required';
            if (status === jwt_payload_types_1.SubscriptionStatus.SUSPENDED) {
                message =
                    'Your subscription payment has failed. Please update your payment method.';
            }
            else if (status === jwt_payload_types_1.SubscriptionStatus.EXPIRED ||
                status === jwt_payload_types_1.SubscriptionStatus.CANCELLED) {
                message =
                    'Your subscription has expired. Please renew to continue using this feature.';
            }
            else if (status === jwt_payload_types_1.SubscriptionStatus.TRIAL) {
                message = 'Your trial has limitations on this feature.';
            }
            throw new LicenseForbiddenException(message);
        }
    }
    isInGracePeriod(user) {
        return (0, license_validator_functions_1.isInGracePeriodSimple)(user);
    }
    getAvailableModules(user) {
        return (0, license_validator_functions_1.getAvailableModules)(user);
    }
    getCoreModules(user) {
        return (0, license_validator_functions_1.getCoreModules)(user);
    }
    getPremiumModules(user) {
        return (0, license_validator_functions_1.getPremiumModules)(user);
    }
    hasPremiumAccess(user) {
        return (0, license_validator_functions_1.hasPremiumAccess)(user);
    }
    hasOnlyCoreModules(user) {
        return (0, license_validator_functions_1.hasOnlyCoreModules)(user);
    }
    canAccessModule(user, moduleCode) {
        return (0, license_validator_functions_1.canAccessModule)(user, moduleCode);
    }
    getMissingModules(user, requiredModules) {
        return (0, license_validator_functions_1.getMissingModules)(user, requiredModules);
    }
    isTrialUser(user) {
        return (0, license_validator_functions_1.isTrialUser)(user);
    }
    isSubscriptionExpired(user) {
        return (0, license_validator_functions_1.isSubscriptionExpired)(user);
    }
    requireNotExpired(user) {
        if ((0, license_validator_functions_1.isSubscriptionExpired)(user)) {
            throw new LicenseForbiddenException('Your subscription has expired. Please renew to continue.');
        }
    }
    getSubscriptionStatus(user) {
        return (0, license_validator_functions_1.getSubscriptionStatus)(user);
    }
    getModuleRequiredMessage(moduleCode) {
        return `Module '${moduleCode}' is required but not enabled in your subscription`;
    }
    getModulesRequiredMessage(moduleCodes) {
        if (moduleCodes.length === 0) {
            return '';
        }
        if (moduleCodes.length === 1) {
            return this.getModuleRequiredMessage(moduleCodes[0]);
        }
        return `The following modules are required but not enabled: ${moduleCodes.join(', ')}`;
    }
}
exports.LicenseValidatorService = LicenseValidatorService;
//# sourceMappingURL=license-validator.service.js.map