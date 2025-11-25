import { Permission, ResourceType, PermissionAction } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';
export declare function hasPermission(user: CurrentUser, permission: Permission): boolean;
export declare function hasAllPermissions(user: CurrentUser, permissions: Permission[]): boolean;
export declare function hasAnyPermission(user: CurrentUser, permissions: Permission[]): boolean;
export declare function canAccessResource(user: CurrentUser, resource: ResourceType, action: PermissionAction): boolean;
export declare function getResourcePermissions(user: CurrentUser, resource: ResourceType): readonly Permission[];
export declare function hasFullAccess(user: CurrentUser, resource: ResourceType): boolean;
