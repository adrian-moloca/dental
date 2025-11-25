import { UserRole } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';
export declare function hasRole(user: CurrentUser, role: UserRole): boolean;
export declare function hasAnyRole(user: CurrentUser, roles: UserRole[]): boolean;
export declare function hasAllRoles(user: CurrentUser, roles: UserRole[]): boolean;
export declare function isSuperAdmin(user: CurrentUser): boolean;
export declare function isOrgAdmin(user: CurrentUser): boolean;
export declare function isClinicAdmin(user: CurrentUser): boolean;
export declare function isClinicalStaff(user: CurrentUser): boolean;
