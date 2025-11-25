/**
 * Permission Catalog - Canonical permission definitions for DentalOS RBAC
 *
 * This file re-exports all permissions from modular files.
 * Permissions follow a strict hierarchical naming convention:
 *
 * Format: {module}.{resource}.{action}
 *
 * - Module: High-level domain area (scheduling, clinical, billing, etc.)
 * - Resource: Specific entity or capability being controlled
 * - Action: Operation being performed (create, read, update, delete, list, manage)
 *
 * DESIGN DECISIONS:
 *
 * 1. **Granularity**: Permissions are fine-grained to enable precise access control.
 *    This allows organizations to create custom roles by composing permissions.
 *
 * 2. **Standard Actions**: We use consistent action verbs across all modules:
 *    - create: Create new resources
 *    - read: View individual resource details
 *    - update: Modify existing resources
 *    - delete: Remove resources (usually soft delete)
 *    - list: View collection of resources
 *    - manage: Full CRUD access (shorthand for create+read+update+delete+list)
 *
 * 3. **Manage Permissions**: High-level "manage" permissions are provided for
 *    convenience but should be used sparingly. They grant all actions on a resource.
 *
 * 4. **Immutability**: Permission codes are immutable once deployed. They are referenced
 *    in JWT tokens, database records, and audit logs. Never rename or delete permissions.
 *
 * 5. **Module Count**: 8 core modules cover all DentalOS functionality:
 *    - Scheduling: Appointment management
 *    - Clinical: Patient care and medical records
 *    - Billing: Financial operations
 *    - Inventory: Supply chain management
 *    - Marketing: Patient engagement and campaigns
 *    - Analytics: Reporting and business intelligence
 *    - HR: Employee management
 *    - Admin: System administration and user management
 *
 * 6. **Total Permission Count**: ~85 permissions (carefully scoped to avoid permission bloat)
 */

// Re-export all module permissions
export * from './scheduling.permissions';
export * from './clinical.permissions';
export * from './billing.permissions';
export * from './inventory.permissions';
export * from './marketing.permissions';
export * from './analytics.permissions';
export * from './hr.permissions';
export * from './admin.permissions';

// Import for aggregation
import {
  SCHEDULING_PERMISSIONS,
  SCHEDULING_PERMISSION_LIST,
  SCHEDULING_PERMISSION_COUNT,
} from './scheduling.permissions';
import {
  CLINICAL_PERMISSIONS,
  CLINICAL_PERMISSION_LIST,
  CLINICAL_PERMISSION_COUNT,
} from './clinical.permissions';
import {
  BILLING_PERMISSIONS,
  BILLING_PERMISSION_LIST,
  BILLING_PERMISSION_COUNT,
} from './billing.permissions';
import {
  INVENTORY_PERMISSIONS,
  INVENTORY_PERMISSION_LIST,
  INVENTORY_PERMISSION_COUNT,
} from './inventory.permissions';
import {
  MARKETING_PERMISSIONS,
  MARKETING_PERMISSION_LIST,
  MARKETING_PERMISSION_COUNT,
} from './marketing.permissions';
import {
  ANALYTICS_PERMISSIONS,
  ANALYTICS_PERMISSION_LIST,
  ANALYTICS_PERMISSION_COUNT,
} from './analytics.permissions';
import { HR_PERMISSIONS, HR_PERMISSION_LIST, HR_PERMISSION_COUNT } from './hr.permissions';
import {
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_LIST,
  ADMIN_PERMISSION_COUNT,
} from './admin.permissions';

/**
 * Complete permission catalog combining all modules
 * This maintains backward compatibility with the original structure
 */
export const PERMISSIONS = {
  SCHEDULING: SCHEDULING_PERMISSIONS,
  CLINICAL: CLINICAL_PERMISSIONS,
  BILLING: BILLING_PERMISSIONS,
  INVENTORY: INVENTORY_PERMISSIONS,
  MARKETING: MARKETING_PERMISSIONS,
  ANALYTICS: ANALYTICS_PERMISSIONS,
  HR: HR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
} as const;

/**
 * All permissions flattened into a single array (for seeding database)
 */
export const ALL_PERMISSIONS = [
  ...SCHEDULING_PERMISSION_LIST,
  ...CLINICAL_PERMISSION_LIST,
  ...BILLING_PERMISSION_LIST,
  ...INVENTORY_PERMISSION_LIST,
  ...MARKETING_PERMISSION_LIST,
  ...ANALYTICS_PERMISSION_LIST,
  ...HR_PERMISSION_LIST,
  ...ADMIN_PERMISSION_LIST,
];

/**
 * Extract all permission string literals as a union type
 */
type ExtractPermissions<T> = T extends string
  ? T
  : T extends object
    ? { [K in keyof T]: ExtractPermissions<T[K]> }[keyof T]
    : never;

export type Permission = ExtractPermissions<typeof PERMISSIONS>;

/**
 * Permission metadata for display and validation
 */
export interface PermissionMetadata {
  code: Permission;
  displayName: string;
  description: string;
  module: string;
  resource: string;
  action: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Flatten nested permission structure into array of permission codes
 * Deprecated: Use ALL_PERMISSIONS instead (more efficient)
 */
export const getAllPermissions = (): Permission[] => {
  return ALL_PERMISSIONS as Permission[];
};

/**
 * Validate if a string is a valid permission code
 */
export const isValidPermission = (permission: string): permission is Permission => {
  return ALL_PERMISSIONS.includes(permission as Permission);
};

/**
 * Parse permission code into components
 */
export const parsePermission = (
  permission: Permission
): { module: string; resource: string; action: string } => {
  const [module, resource, action] = permission.split('.');
  return { module, resource, action };
};

/**
 * Total permission count (for reference)
 */
export const TOTAL_PERMISSION_COUNT =
  SCHEDULING_PERMISSION_COUNT +
  CLINICAL_PERMISSION_COUNT +
  BILLING_PERMISSION_COUNT +
  INVENTORY_PERMISSION_COUNT +
  MARKETING_PERMISSION_COUNT +
  ANALYTICS_PERMISSION_COUNT +
  HR_PERMISSION_COUNT +
  ADMIN_PERMISSION_COUNT;

/**
 * Permission count by module (for metrics and validation)
 */
export const PERMISSION_COUNT_BY_MODULE = {
  SCHEDULING: SCHEDULING_PERMISSION_COUNT,
  CLINICAL: CLINICAL_PERMISSION_COUNT,
  BILLING: BILLING_PERMISSION_COUNT,
  INVENTORY: INVENTORY_PERMISSION_COUNT,
  MARKETING: MARKETING_PERMISSION_COUNT,
  ANALYTICS: ANALYTICS_PERMISSION_COUNT,
  HR: HR_PERMISSION_COUNT,
  ADMIN: ADMIN_PERMISSION_COUNT,
} as const;
