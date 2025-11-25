import { Permission, TenantId } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';
export interface AuthGuard {
    canActivate(context: unknown): boolean | Promise<boolean>;
}
export interface PermissionGuard extends AuthGuard {
    readonly requiredPermissions: readonly Permission[];
    canActivate(context: unknown): boolean | Promise<boolean>;
}
export interface TenantGuard extends AuthGuard {
    validateTenantAccess(user: CurrentUser, targetTenantId: TenantId): boolean;
}
export interface PermissionTenantGuard extends PermissionGuard, TenantGuard {
    readonly requiredPermissions: readonly Permission[];
    canActivate(context: unknown): boolean | Promise<boolean>;
    validateTenantAccess(user: CurrentUser, targetTenantId: TenantId): boolean;
}
export interface GuardContext<TRequest = unknown> {
    getRequest(): TRequest;
    getUser(): CurrentUser | undefined;
}
