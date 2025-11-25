import { CurrentUser } from '../context/current-user';
import { ModuleCode, SubscriptionStatus } from '../jwt/jwt-payload.types';
export declare class LicenseForbiddenException extends Error {
    readonly statusCode: number;
    readonly response: string | object;
    constructor(message: string);
}
export declare class LicenseValidatorService {
    hasModule(user: CurrentUser, moduleCode: ModuleCode): boolean;
    requireModule(user: CurrentUser, moduleCode: ModuleCode): void;
    requireAnyModule(user: CurrentUser, moduleCodes: ModuleCode[]): void;
    requireAllModules(user: CurrentUser, moduleCodes: ModuleCode[]): void;
    hasAnyModule(user: CurrentUser, moduleCodes: ModuleCode[]): boolean;
    hasAllModules(user: CurrentUser, moduleCodes: ModuleCode[]): boolean;
    isSubscriptionActive(user: CurrentUser): boolean;
    requireActiveSubscription(user: CurrentUser): void;
    isInGracePeriod(user: CurrentUser): boolean;
    getAvailableModules(user: CurrentUser): readonly ModuleCode[];
    getCoreModules(user: CurrentUser): ModuleCode[];
    getPremiumModules(user: CurrentUser): ModuleCode[];
    hasPremiumAccess(user: CurrentUser): boolean;
    hasOnlyCoreModules(user: CurrentUser): boolean;
    canAccessModule(user: CurrentUser, moduleCode: ModuleCode): boolean;
    getMissingModules(user: CurrentUser, requiredModules: ModuleCode[]): ModuleCode[];
    isTrialUser(user: CurrentUser): boolean;
    isSubscriptionExpired(user: CurrentUser): boolean;
    requireNotExpired(user: CurrentUser): void;
    getSubscriptionStatus(user: CurrentUser): SubscriptionStatus | null;
    getModuleRequiredMessage(moduleCode: ModuleCode): string;
    getModulesRequiredMessage(moduleCodes: ModuleCode[]): string;
}
