import { ResourceType, PermissionAction } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';
export type Scope = `${string}:${string}`;
export declare function extractScopes(user: CurrentUser): readonly Scope[];
export declare function hasScope(user: CurrentUser, scope: Scope | string): boolean;
export declare function hasScopeForResource(user: CurrentUser, resource: string): boolean;
export declare function hasAllScopes(user: CurrentUser, scopes: Array<Scope | string>): boolean;
export declare function hasAnyScope(user: CurrentUser, scopes: Array<Scope | string>): boolean;
export declare function toScope(resource: ResourceType, action: PermissionAction): Scope;
