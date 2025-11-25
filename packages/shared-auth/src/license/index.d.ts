export { GRACE_PERIOD_DAYS, READ_METHODS, WRITE_METHODS, CORE_MODULES, PREMIUM_MODULES, ALL_MODULES, type HttpMethod, type ReadMethod, type WriteMethod, } from './license.constants';
export type { GracePeriodSubscription } from './grace-period.helper';
export { isInGracePeriod, getGracePeriodDaysRemaining, isGracePeriodExpiringSoon, isReadOperation, isWriteOperation, canPerformOperation, canPerformWriteOperation, calculateGracePeriodEnd, getGracePeriodStatusMessage, } from './grace-period.helper';
export { getModuleDependencies, getAllModuleDependencies, hasModuleDependencies, getMissingDependencies, getAllMissingDependencies, areDependenciesSatisfied, getDependencyErrorMessage, validateModuleDependencies, dependsOn, } from './module-dependencies.helper';
export { hasModule, hasAnyModule, hasAllModules, getAvailableModules, isSubscriptionActive, isInGracePeriodSimple, hasPremiumAccess, hasOnlyCoreModules, getCoreModules, getPremiumModules, canAccessModule, getMissingModules, isTrialUser, isSubscriptionExpired, getSubscriptionStatus, } from './license-validator.functions';
export { LicenseValidatorService, LicenseForbiddenException, } from './license-validator.service';
