/**
 * HR Module Permissions
 * Covers: employee management, timesheets, payroll
 *
 * DESIGN PRINCIPLES:
 * - Privacy protection for employee personal information
 * - Access controls for payroll (highly sensitive)
 * - Self-service vs administrative permissions
 */

/**
 * Human resources and employee management permissions
 */
export const HR_PERMISSIONS = {
  EMPLOYEE: {
    /**
     * Create employee records
     * Grants: Add new staff members to system
     * Used by: tenant_admin
     */
    CREATE: 'hr.employee.create',

    /**
     * View employee details
     * Grants: Read employee profiles and information
     * Used by: clinic_manager (own clinic staff), tenant_admin
     */
    READ: 'hr.employee.read',

    /**
     * Update employee information
     * Grants: Modify employee details, roles, clinic assignments
     * Used by: tenant_admin
     */
    UPDATE: 'hr.employee.update',

    /**
     * Deactivate employee accounts
     * Grants: Terminate or suspend staff access
     * Used by: tenant_admin
     */
    DELETE: 'hr.employee.delete',

    /**
     * View employee directory
     * Grants: List of all staff members
     * Used by: clinic_manager, tenant_admin
     */
    LIST: 'hr.employee.list',
  },

  TIMESHEET: {
    /**
     * Manage employee timesheets
     * Grants: Clock in/out, approve hours, adjust entries
     * Used by: clinic_manager (approve), tenant_admin
     */
    MANAGE: 'hr.timesheet.manage',
  },

  PAYROLL: {
    /**
     * View payroll information
     * Grants: Access to salary and payroll reports
     * Used by: tenant_admin only (highly sensitive)
     */
    VIEW: 'hr.payroll.view',
  },
} as const;

/**
 * Flatten HR permissions into array for validation and iteration
 */
export const HR_PERMISSION_LIST = Object.values(HR_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const HR_PERMISSION_COUNT = HR_PERMISSION_LIST.length;
