import 'reflect-metadata';
import { UserRole } from '@dentalos/shared-types';
export declare const ROLE_METADATA_KEY = "auth:roles";
export interface RoleMetadata {
    readonly roles: readonly UserRole[];
    readonly requireAll: boolean;
}
export declare function RequireRoles(...roles: UserRole[]): MethodDecorator;
export declare function RequireAllRoles(...roles: UserRole[]): MethodDecorator;
export declare function getRoleMetadata(target: object): RoleMetadata | undefined;
