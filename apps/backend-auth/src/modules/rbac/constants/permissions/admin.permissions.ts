/**
 * Admin Module Permissions
 * Covers: organization settings, clinics, users, roles, audit logs, system configuration
 *
 * DESIGN PRINCIPLES:
 * - Highest privilege permissions for system administration
 * - Clear separation between org-level and clinic-level admin tasks
 * - Audit trail requirements for all administrative actions
 */

/**
 * System administration and configuration permissions
 */
export const ADMIN_PERMISSIONS = {
  ORGANIZATION: {
    /**
     * View organization settings
     * Grants: Read org configuration and preferences
     * Used by: tenant_admin
     */
    READ: 'admin.organization.read',

    /**
     * Update organization settings
     * Grants: Modify org name, branding, business rules
     * Used by: tenant_admin
     */
    UPDATE: 'admin.organization.update',
  },

  CLINIC: {
    /**
     * Create clinic locations
     * Grants: Add new clinics to organization
     * Used by: tenant_admin
     */
    CREATE: 'admin.clinic.create',

    /**
     * View clinic details
     * Grants: Read clinic information and settings
     * Used by: clinic_manager (own clinic), tenant_admin
     */
    READ: 'admin.clinic.read',

    /**
     * Update clinic settings
     * Grants: Modify clinic configuration
     * Used by: clinic_manager (own clinic), tenant_admin
     */
    UPDATE: 'admin.clinic.update',

    /**
     * Delete clinic locations
     * Grants: Remove clinics from organization
     * Used by: tenant_admin only
     */
    DELETE: 'admin.clinic.delete',
  },

  USER: {
    /**
     * Create user accounts
     * Grants: Add new users to system
     * Used by: tenant_admin
     */
    CREATE: 'admin.user.create',

    /**
     * View user profiles
     * Grants: Read user account details
     * Used by: tenant_admin
     */
    READ: 'admin.user.read',

    /**
     * Update user accounts
     * Grants: Modify user information and settings
     * Used by: tenant_admin
     */
    UPDATE: 'admin.user.update',

    /**
     * Deactivate user accounts
     * Grants: Suspend or delete user access
     * Used by: tenant_admin
     */
    DELETE: 'admin.user.delete',

    /**
     * List all users
     * Grants: View user directory
     * Used by: tenant_admin
     */
    LIST: 'admin.user.list',
  },

  ROLE: {
    /**
     * Create custom roles
     * Grants: Define new roles with permission sets
     * Used by: tenant_admin
     */
    CREATE: 'admin.role.create',

    /**
     * View role definitions
     * Grants: Read role permissions and metadata
     * Used by: tenant_admin
     */
    READ: 'admin.role.read',

    /**
     * Update role permissions
     * Grants: Modify role permission assignments
     * Used by: tenant_admin
     */
    UPDATE: 'admin.role.update',

    /**
     * Delete custom roles
     * Grants: Remove custom roles (system roles protected)
     * Used by: tenant_admin
     */
    DELETE: 'admin.role.delete',

    /**
     * Assign roles to users
     * Grants: Grant or revoke user roles
     * Used by: tenant_admin
     */
    ASSIGN: 'admin.role.assign',
  },

  AUDIT: {
    /**
     * View audit logs
     * Grants: Access to system audit trail
     * Used by: tenant_admin, super_admin
     */
    VIEW: 'admin.audit.view',
  },

  SETTINGS: {
    /**
     * Manage system settings
     * Grants: Configure system-wide preferences
     * Used by: tenant_admin
     */
    MANAGE: 'admin.settings.manage',
  },
} as const;

/**
 * Flatten admin permissions into array for validation and iteration
 */
export const ADMIN_PERMISSION_LIST = Object.values(ADMIN_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const ADMIN_PERMISSION_COUNT = ADMIN_PERMISSION_LIST.length;
