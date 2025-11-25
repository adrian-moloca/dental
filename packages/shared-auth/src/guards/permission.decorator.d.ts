import 'reflect-metadata';
import { Permission } from '@dentalos/shared-types';
export declare const PERMISSION_METADATA_KEY = "auth:permissions";
export interface PermissionMetadata {
    readonly permissions: readonly Permission[];
    readonly requireAll: boolean;
}
export declare function RequirePermissions(...permissions: Permission[]): MethodDecorator;
export declare function RequireAnyPermission(...permissions: Permission[]): MethodDecorator;
export declare function getPermissionMetadata(target: object): PermissionMetadata | undefined;
