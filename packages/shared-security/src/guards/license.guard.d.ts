import { CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleCode } from '@dentalos/shared-auth';
import type { CurrentUser } from '@dentalos/shared-auth';
export declare class PaymentRequiredException extends HttpException {
    constructor(message: string);
}
export declare const REQUIRED_MODULE_KEY = "requiredModule";
export declare const RequiresModule: (moduleCode: ModuleCode) => import("@nestjs/common").CustomDecorator<string>;
export declare class LicenseGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare function isGracePeriodAllowed(httpMethod: string): boolean;
export declare function hasModuleAccess(user: CurrentUser, moduleCode: ModuleCode): boolean;
export declare function isSubscriptionActive(user: CurrentUser): boolean;
