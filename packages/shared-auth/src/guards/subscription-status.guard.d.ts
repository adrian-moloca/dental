import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare const ALLOW_GRACE_PERIOD_KEY = "allow_grace_period";
export declare class SubscriptionStatusGuard implements CanActivate {
    private readonly reflector;
    private readonly logger;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
