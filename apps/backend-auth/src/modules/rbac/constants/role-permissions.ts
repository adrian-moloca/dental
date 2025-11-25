/**
 * Role-to-Permission Mapping - Default permission assignments for system roles
 *
 * This file defines the default permission sets for each system role. When a user
 * is assigned a role, they automatically receive all permissions in that role's set.
 *
 * DESIGN DECISIONS:
 *
 * 1. **Least Privilege Principle**: Each role receives the minimum permissions needed
 *    to perform their job functions. Additional permissions can be granted explicitly.
 *
 * 2. **Wildcard Support**: The super_admin role uses '*' wildcard to indicate full access.
 *    This is the ONLY role that uses wildcards. All other roles use explicit permissions.
 *
 * 3. **Permission Groups**: Permissions are organized by module for readability but
 *    stored as a flat array for efficient JWT token inclusion and database storage.
 *
 * 4. **Read-Access Pattern**: Most roles have broad read access but restricted write access.
 *    This supports collaboration while maintaining data integrity.
 *
 * 5. **Scoped Restrictions**: Permission mappings define capabilities, but actual access
 *    is further restricted by tenant/clinic scoping enforced at the guard/middleware layer.
 *
 * 6. **Custom Roles**: Organizations can create custom roles by selecting from this
 *    permission catalog. These mappings serve as templates and best-practice guides.
 */

import { PERMISSIONS } from './permissions';
import { SYSTEM_ROLES, SystemRole } from './system-roles';
import type { Permission } from './permissions';

/**
 * Role permission set definition
 */
export interface RolePermissionSet {
  role: SystemRole;
  permissions: Permission[] | ['*']; // '*' means all permissions (super_admin only)
  description: string;
}

/* ============================================================================
 * SUPER ADMIN - Full platform access
 * ============================================================================ */

const SUPER_ADMIN_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.SUPER_ADMIN,
  permissions: ['*'], // Wildcard: all current and future permissions
  description:
    'Unrestricted access to all platform capabilities across all organizations. ' +
    'Used for platform maintenance, support, and emergency interventions.',
};

/* ============================================================================
 * TENANT ADMIN - Full organizational control
 * ============================================================================ */

const TENANT_ADMIN_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.TENANT_ADMIN,
  permissions: [
    // ===== SCHEDULING: Full access =====
    PERMISSIONS.SCHEDULING.APPOINTMENT.MANAGE,
    PERMISSIONS.SCHEDULING.AVAILABILITY.MANAGE,
    PERMISSIONS.SCHEDULING.REMINDER.MANAGE,

    // ===== CLINICAL: Full access (can delegate to doctors) =====
    PERMISSIONS.CLINICAL.DIAGNOSIS.CREATE,
    PERMISSIONS.CLINICAL.DIAGNOSIS.READ,
    PERMISSIONS.CLINICAL.DIAGNOSIS.UPDATE,
    PERMISSIONS.CLINICAL.DIAGNOSIS.LIST,
    PERMISSIONS.CLINICAL.TREATMENT.CREATE,
    PERMISSIONS.CLINICAL.TREATMENT.READ,
    PERMISSIONS.CLINICAL.TREATMENT.UPDATE,
    PERMISSIONS.CLINICAL.TREATMENT.LIST,
    PERMISSIONS.CLINICAL.TREATMENT.APPROVE,
    PERMISSIONS.CLINICAL.CHART.READ,
    PERMISSIONS.CLINICAL.CHART.UPDATE,
    PERMISSIONS.CLINICAL.PRESCRIPTION.CREATE,
    PERMISSIONS.CLINICAL.PRESCRIPTION.READ,
    PERMISSIONS.CLINICAL.PRESCRIPTION.UPDATE,
    PERMISSIONS.CLINICAL.IMAGING.UPLOAD,
    PERMISSIONS.CLINICAL.IMAGING.READ,
    PERMISSIONS.CLINICAL.IMAGING.DELETE,
    PERMISSIONS.CLINICAL.RECORDS.EXPORT,

    // ===== BILLING: Full financial access =====
    PERMISSIONS.BILLING.INVOICE.CREATE,
    PERMISSIONS.BILLING.INVOICE.READ,
    PERMISSIONS.BILLING.INVOICE.UPDATE,
    PERMISSIONS.BILLING.INVOICE.DELETE,
    PERMISSIONS.BILLING.INVOICE.LIST,
    PERMISSIONS.BILLING.PAYMENT.CREATE,
    PERMISSIONS.BILLING.PAYMENT.READ,
    PERMISSIONS.BILLING.PAYMENT.REFUND,
    PERMISSIONS.BILLING.PAYMENT.LIST,
    PERMISSIONS.BILLING.INSURANCE.MANAGE,
    PERMISSIONS.BILLING.REPORTS.VIEW,

    // ===== INVENTORY: Full supply chain access =====
    PERMISSIONS.INVENTORY.ITEM.CREATE,
    PERMISSIONS.INVENTORY.ITEM.READ,
    PERMISSIONS.INVENTORY.ITEM.UPDATE,
    PERMISSIONS.INVENTORY.ITEM.DELETE,
    PERMISSIONS.INVENTORY.ITEM.LIST,
    PERMISSIONS.INVENTORY.STOCK.ADJUST,
    PERMISSIONS.INVENTORY.STOCK.VIEW,
    PERMISSIONS.INVENTORY.ORDER.CREATE,
    PERMISSIONS.INVENTORY.ORDER.APPROVE,
    PERMISSIONS.INVENTORY.ORDER.VIEW,
    PERMISSIONS.INVENTORY.VENDOR.MANAGE,

    // ===== MARKETING: Full campaign management =====
    PERMISSIONS.MARKETING.CAMPAIGN.CREATE,
    PERMISSIONS.MARKETING.CAMPAIGN.READ,
    PERMISSIONS.MARKETING.CAMPAIGN.UPDATE,
    PERMISSIONS.MARKETING.CAMPAIGN.LIST,
    PERMISSIONS.MARKETING.CAMPAIGN.LAUNCH,
    PERMISSIONS.MARKETING.SEGMENT.MANAGE,
    PERMISSIONS.MARKETING.AUTOMATION.MANAGE,
    PERMISSIONS.MARKETING.ANALYTICS.VIEW,

    // ===== ANALYTICS: Full reporting access =====
    PERMISSIONS.ANALYTICS.DASHBOARD.VIEW,
    PERMISSIONS.ANALYTICS.REPORTS.VIEW,
    PERMISSIONS.ANALYTICS.REPORTS.EXPORT,
    PERMISSIONS.ANALYTICS.DATA.QUERY,

    // ===== HR: Full employee management =====
    PERMISSIONS.HR.EMPLOYEE.CREATE,
    PERMISSIONS.HR.EMPLOYEE.READ,
    PERMISSIONS.HR.EMPLOYEE.UPDATE,
    PERMISSIONS.HR.EMPLOYEE.DELETE,
    PERMISSIONS.HR.EMPLOYEE.LIST,
    PERMISSIONS.HR.TIMESHEET.MANAGE,
    PERMISSIONS.HR.PAYROLL.VIEW,

    // ===== ADMIN: Full administrative access =====
    PERMISSIONS.ADMIN.ORGANIZATION.READ,
    PERMISSIONS.ADMIN.ORGANIZATION.UPDATE,
    PERMISSIONS.ADMIN.CLINIC.CREATE,
    PERMISSIONS.ADMIN.CLINIC.READ,
    PERMISSIONS.ADMIN.CLINIC.UPDATE,
    PERMISSIONS.ADMIN.CLINIC.DELETE,
    PERMISSIONS.ADMIN.USER.CREATE,
    PERMISSIONS.ADMIN.USER.READ,
    PERMISSIONS.ADMIN.USER.UPDATE,
    PERMISSIONS.ADMIN.USER.DELETE,
    PERMISSIONS.ADMIN.USER.LIST,
    PERMISSIONS.ADMIN.ROLE.CREATE,
    PERMISSIONS.ADMIN.ROLE.READ,
    PERMISSIONS.ADMIN.ROLE.UPDATE,
    PERMISSIONS.ADMIN.ROLE.DELETE,
    PERMISSIONS.ADMIN.ROLE.ASSIGN,
    PERMISSIONS.ADMIN.AUDIT.VIEW,
    PERMISSIONS.ADMIN.SETTINGS.MANAGE,
  ],
  description:
    'Complete control over organization operations, settings, and personnel. ' +
    'Can manage all clinics, users, roles, and access all data within the organization.',
};

/* ============================================================================
 * CLINIC MANAGER - Single clinic operations
 * ============================================================================ */

const CLINIC_MANAGER_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.CLINIC_MANAGER,
  permissions: [
    // ===== SCHEDULING: Full appointment management =====
    PERMISSIONS.SCHEDULING.APPOINTMENT.MANAGE,
    PERMISSIONS.SCHEDULING.AVAILABILITY.MANAGE,

    // ===== CLINICAL: Read access for oversight =====
    PERMISSIONS.CLINICAL.CHART.READ,
    PERMISSIONS.CLINICAL.TREATMENT.READ,
    PERMISSIONS.CLINICAL.TREATMENT.LIST,

    // ===== BILLING: View financial performance =====
    PERMISSIONS.BILLING.INVOICE.READ,
    PERMISSIONS.BILLING.INVOICE.LIST,
    PERMISSIONS.BILLING.PAYMENT.READ,
    PERMISSIONS.BILLING.PAYMENT.LIST,
    PERMISSIONS.BILLING.REPORTS.VIEW,

    // ===== INVENTORY: Manage clinic supplies =====
    PERMISSIONS.INVENTORY.ITEM.READ,
    PERMISSIONS.INVENTORY.ITEM.LIST,
    PERMISSIONS.INVENTORY.STOCK.ADJUST,
    PERMISSIONS.INVENTORY.STOCK.VIEW,
    PERMISSIONS.INVENTORY.ORDER.CREATE,
    PERMISSIONS.INVENTORY.ORDER.VIEW,

    // ===== ANALYTICS: Clinic performance metrics =====
    PERMISSIONS.ANALYTICS.DASHBOARD.VIEW,
    PERMISSIONS.ANALYTICS.REPORTS.VIEW,
    PERMISSIONS.ANALYTICS.REPORTS.EXPORT,

    // ===== HR: Manage clinic staff =====
    PERMISSIONS.HR.EMPLOYEE.READ,
    PERMISSIONS.HR.EMPLOYEE.LIST,
    PERMISSIONS.HR.TIMESHEET.MANAGE,

    // ===== ADMIN: Limited clinic configuration =====
    PERMISSIONS.ADMIN.CLINIC.READ,
    PERMISSIONS.ADMIN.CLINIC.UPDATE, // Own clinic only (enforced by guards)
  ],
  description:
    'Manages day-to-day clinic operations including scheduling, staff oversight, ' +
    'and inventory. Cannot modify clinical records or manage users/roles.',
};

/* ============================================================================
 * DOCTOR - Clinical care provider
 * ============================================================================ */

const DOCTOR_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.DOCTOR,
  permissions: [
    // ===== SCHEDULING: View own schedule =====
    PERMISSIONS.SCHEDULING.APPOINTMENT.READ,
    PERMISSIONS.SCHEDULING.APPOINTMENT.LIST,
    PERMISSIONS.SCHEDULING.AVAILABILITY.MANAGE, // Own availability only

    // ===== CLINICAL: Full clinical access =====
    PERMISSIONS.CLINICAL.DIAGNOSIS.CREATE,
    PERMISSIONS.CLINICAL.DIAGNOSIS.READ,
    PERMISSIONS.CLINICAL.DIAGNOSIS.UPDATE,
    PERMISSIONS.CLINICAL.DIAGNOSIS.LIST,
    PERMISSIONS.CLINICAL.TREATMENT.CREATE,
    PERMISSIONS.CLINICAL.TREATMENT.READ,
    PERMISSIONS.CLINICAL.TREATMENT.UPDATE,
    PERMISSIONS.CLINICAL.TREATMENT.LIST,
    PERMISSIONS.CLINICAL.TREATMENT.APPROVE,
    PERMISSIONS.CLINICAL.CHART.READ,
    PERMISSIONS.CLINICAL.CHART.UPDATE,
    PERMISSIONS.CLINICAL.PRESCRIPTION.CREATE,
    PERMISSIONS.CLINICAL.PRESCRIPTION.READ,
    PERMISSIONS.CLINICAL.PRESCRIPTION.UPDATE,
    PERMISSIONS.CLINICAL.IMAGING.UPLOAD,
    PERMISSIONS.CLINICAL.IMAGING.READ,
    PERMISSIONS.CLINICAL.IMAGING.DELETE,
    PERMISSIONS.CLINICAL.RECORDS.EXPORT,

    // ===== BILLING: Create invoices for procedures =====
    PERMISSIONS.BILLING.INVOICE.CREATE,
    PERMISSIONS.BILLING.INVOICE.READ,
    PERMISSIONS.BILLING.INVOICE.LIST,

    // ===== INVENTORY: View supplies =====
    PERMISSIONS.INVENTORY.ITEM.READ,
    PERMISSIONS.INVENTORY.ITEM.LIST,
    PERMISSIONS.INVENTORY.STOCK.VIEW,
  ],
  description:
    'Full clinical authority including diagnosis, treatment planning, and prescribing. ' +
    'Can create invoices for services rendered but cannot manage payments or refunds.',
};

/* ============================================================================
 * ASSISTANT - Clinical support staff
 * ============================================================================ */

const ASSISTANT_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.ASSISTANT,
  permissions: [
    // ===== SCHEDULING: View appointments =====
    PERMISSIONS.SCHEDULING.APPOINTMENT.READ,
    PERMISSIONS.SCHEDULING.APPOINTMENT.LIST,

    // ===== CLINICAL: Limited charting and imaging =====
    PERMISSIONS.CLINICAL.DIAGNOSIS.READ,
    PERMISSIONS.CLINICAL.DIAGNOSIS.LIST,
    PERMISSIONS.CLINICAL.TREATMENT.READ,
    PERMISSIONS.CLINICAL.TREATMENT.LIST,
    PERMISSIONS.CLINICAL.CHART.READ,
    PERMISSIONS.CLINICAL.CHART.UPDATE, // Limited sections (e.g., vitals, notes)
    PERMISSIONS.CLINICAL.PRESCRIPTION.READ,
    PERMISSIONS.CLINICAL.IMAGING.UPLOAD,
    PERMISSIONS.CLINICAL.IMAGING.READ,

    // ===== INVENTORY: View supplies =====
    PERMISSIONS.INVENTORY.ITEM.READ,
    PERMISSIONS.INVENTORY.ITEM.LIST,
    PERMISSIONS.INVENTORY.STOCK.VIEW,
  ],
  description:
    'Supports clinical care by assisting with charting, imaging upload, and patient preparation. ' +
    'Cannot diagnose, prescribe, or approve treatment plans.',
};

/* ============================================================================
 * RECEPTIONIST - Front desk and scheduling
 * ============================================================================ */

const RECEPTIONIST_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.RECEPTIONIST,
  permissions: [
    // ===== SCHEDULING: Full appointment management =====
    PERMISSIONS.SCHEDULING.APPOINTMENT.MANAGE,

    // ===== CLINICAL: Read-only patient information =====
    PERMISSIONS.CLINICAL.CHART.READ, // Demographics and basic info only (enforced by field-level access)
    PERMISSIONS.CLINICAL.TREATMENT.READ, // For scheduling context
    PERMISSIONS.CLINICAL.TREATMENT.LIST,
    PERMISSIONS.CLINICAL.RECORDS.EXPORT, // GDPR Article 15 compliance - patient data export requests

    // ===== BILLING: Basic billing operations =====
    PERMISSIONS.BILLING.INVOICE.CREATE,
    PERMISSIONS.BILLING.INVOICE.READ,
    PERMISSIONS.BILLING.INVOICE.LIST,
    PERMISSIONS.BILLING.PAYMENT.CREATE,
    PERMISSIONS.BILLING.PAYMENT.READ,
    PERMISSIONS.BILLING.PAYMENT.LIST,

    // ===== INVENTORY: View availability =====
    PERMISSIONS.INVENTORY.ITEM.READ,
    PERMISSIONS.INVENTORY.ITEM.LIST,
    PERMISSIONS.INVENTORY.STOCK.VIEW,
  ],
  description:
    'Manages patient scheduling, check-in/out, and basic billing. ' +
    'Has limited clinical access (demographics only) and GDPR data export capabilities. ' +
    'Cannot process refunds or modify treatment.',
};

/* ============================================================================
 * BILLING SPECIALIST - Financial operations
 * ============================================================================ */

const BILLING_SPECIALIST_PERMISSIONS: RolePermissionSet = {
  role: SYSTEM_ROLES.BILLING_SPECIALIST,
  permissions: [
    // ===== SCHEDULING: View appointments for billing context =====
    PERMISSIONS.SCHEDULING.APPOINTMENT.READ,
    PERMISSIONS.SCHEDULING.APPOINTMENT.LIST,

    // ===== CLINICAL: Read clinical data for billing =====
    PERMISSIONS.CLINICAL.DIAGNOSIS.READ,
    PERMISSIONS.CLINICAL.DIAGNOSIS.LIST,
    PERMISSIONS.CLINICAL.TREATMENT.READ,
    PERMISSIONS.CLINICAL.TREATMENT.LIST,

    // ===== BILLING: Full billing access =====
    PERMISSIONS.BILLING.INVOICE.CREATE,
    PERMISSIONS.BILLING.INVOICE.READ,
    PERMISSIONS.BILLING.INVOICE.UPDATE,
    PERMISSIONS.BILLING.INVOICE.DELETE,
    PERMISSIONS.BILLING.INVOICE.LIST,
    PERMISSIONS.BILLING.PAYMENT.CREATE,
    PERMISSIONS.BILLING.PAYMENT.READ,
    PERMISSIONS.BILLING.PAYMENT.REFUND,
    PERMISSIONS.BILLING.PAYMENT.LIST,
    PERMISSIONS.BILLING.INSURANCE.MANAGE,
    PERMISSIONS.BILLING.REPORTS.VIEW,

    // ===== ANALYTICS: Financial reports =====
    PERMISSIONS.ANALYTICS.DASHBOARD.VIEW,
    PERMISSIONS.ANALYTICS.REPORTS.VIEW,
    PERMISSIONS.ANALYTICS.REPORTS.EXPORT,
  ],
  description:
    'Specializes in billing operations, insurance claims, and financial reporting. ' +
    'Has read access to clinical data needed for billing but cannot modify patient records.',
};

/* ============================================================================
 * ROLE PERMISSION REGISTRY
 * ============================================================================ */

/**
 * Complete mapping of roles to their default permission sets
 */
export const ROLE_PERMISSION_MAPPING: Record<SystemRole, RolePermissionSet> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: SUPER_ADMIN_PERMISSIONS,
  [SYSTEM_ROLES.TENANT_ADMIN]: TENANT_ADMIN_PERMISSIONS,
  [SYSTEM_ROLES.CLINIC_MANAGER]: CLINIC_MANAGER_PERMISSIONS,
  [SYSTEM_ROLES.DOCTOR]: DOCTOR_PERMISSIONS,
  [SYSTEM_ROLES.ASSISTANT]: ASSISTANT_PERMISSIONS,
  [SYSTEM_ROLES.RECEPTIONIST]: RECEPTIONIST_PERMISSIONS,
  [SYSTEM_ROLES.BILLING_SPECIALIST]: BILLING_SPECIALIST_PERMISSIONS,
};

/* ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================ */

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = (role: SystemRole): Permission[] | ['*'] => {
  return ROLE_PERMISSION_MAPPING[role].permissions;
};

/**
 * Get permissions for multiple roles (union of all permissions)
 */
export const getPermissionsForRoles = (roles: SystemRole[]): Permission[] | ['*'] => {
  // If any role is super_admin, return wildcard
  if (roles.includes(SYSTEM_ROLES.SUPER_ADMIN)) {
    return ['*'];
  }

  // Otherwise, merge all permissions from all roles (deduplicated)
  const permissionSet = new Set<Permission>();

  for (const role of roles) {
    const rolePermissions = getPermissionsForRole(role);
    if (rolePermissions[0] === '*') {
      // This shouldn't happen (only super_admin has wildcard), but handle it
      return ['*'];
    }
    (rolePermissions as Permission[]).forEach((permission) => permissionSet.add(permission));
  }

  return Array.from(permissionSet);
};

/**
 * Check if a role has a specific permission
 */
export const roleHasPermission = (role: SystemRole, permission: Permission): boolean => {
  const rolePermissions = getPermissionsForRole(role);

  // Wildcard grants all permissions
  if (rolePermissions[0] === '*') {
    return true;
  }

  return (rolePermissions as Permission[]).includes(permission);
};

/**
 * Check if any of the provided roles has a specific permission
 */
export const rolesHavePermission = (roles: SystemRole[], permission: Permission): boolean => {
  return roles.some((role) => roleHasPermission(role, permission));
};

/**
 * Get permission count for each role (for documentation)
 */
export const getRolePermissionCounts = (): Record<SystemRole, number | 'all'> => {
  const counts: Partial<Record<SystemRole, number | 'all'>> = {};

  Object.entries(ROLE_PERMISSION_MAPPING).forEach(([role, config]) => {
    counts[role as SystemRole] = config.permissions[0] === '*' ? 'all' : config.permissions.length;
  });

  return counts as Record<SystemRole, number | 'all'>;
};
