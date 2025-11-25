/**
 * Permission Catalog - Canonical permission definitions for DentalOS RBAC
 *
 * This file defines ALL permissions available in the DentalOS platform.
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

/* ============================================================================
 * SCHEDULING MODULE - Appointment and calendar management
 * ============================================================================ */

export const SCHEDULING_PERMISSIONS = {
  APPOINTMENT: {
    /**
     * Create new patient appointments
     * Grants: Schedule appointments in the calendar
     * Used by: receptionist, clinic_manager, doctor (own schedule)
     */
    CREATE: 'scheduling.appointment.create',

    /**
     * View individual appointment details
     * Grants: Read appointment information including patient, provider, and notes
     * Used by: All clinical and front-desk staff
     */
    READ: 'scheduling.appointment.read',

    /**
     * Modify existing appointments
     * Grants: Reschedule, update notes, change provider assignment
     * Used by: receptionist, clinic_manager
     */
    UPDATE: 'scheduling.appointment.update',

    /**
     * Cancel appointments
     * Grants: Cancel or delete appointments from calendar
     * Used by: receptionist, clinic_manager
     */
    DELETE: 'scheduling.appointment.delete',

    /**
     * View appointment lists and calendar views
     * Grants: Access to calendar, agenda, and appointment search
     * Used by: All staff members
     */
    LIST: 'scheduling.appointment.list',

    /**
     * Full appointment management (CRUD)
     * Grants: All appointment operations
     * Used by: receptionist, clinic_manager
     * Note: This is a convenience permission. Prefer granular permissions when possible.
     */
    MANAGE: 'scheduling.appointment.manage',
  },

  AVAILABILITY: {
    /**
     * Manage provider availability and schedules
     * Grants: Set working hours, time blocks, PTO, recurring schedules
     * Used by: clinic_manager, doctor (own schedule)
     */
    MANAGE: 'scheduling.availability.manage',
  },

  REMINDER: {
    /**
     * Configure appointment reminder settings
     * Grants: Manage reminder rules, templates, and delivery channels
     * Used by: clinic_manager, tenant_admin
     */
    MANAGE: 'scheduling.reminder.manage',
  },
} as const;

/* ============================================================================
 * CLINICAL MODULE - Patient care and electronic health records
 * ============================================================================ */

export const CLINICAL_PERMISSIONS = {
  DIAGNOSIS: {
    /**
     * Create new patient diagnoses
     * Grants: Record diagnosis codes and clinical findings
     * Used by: doctor only (clinical decision-making)
     */
    CREATE: 'clinical.diagnosis.create',

    /**
     * View patient diagnoses
     * Grants: Read diagnosis history and details
     * Used by: doctor, assistant (supporting care)
     */
    READ: 'clinical.diagnosis.read',

    /**
     * Update existing diagnoses
     * Grants: Modify diagnosis codes or notes
     * Used by: doctor only (clinical authority)
     */
    UPDATE: 'clinical.diagnosis.update',

    /**
     * View patient diagnosis history
     * Grants: Access to diagnosis lists and timelines
     * Used by: doctor, assistant
     */
    LIST: 'clinical.diagnosis.list',
  },

  TREATMENT: {
    /**
     * Create treatment plans
     * Grants: Design treatment plans with procedures and timeline
     * Used by: doctor only
     */
    CREATE: 'clinical.treatment.create',

    /**
     * View treatment plan details
     * Grants: Read treatment plan stages and procedures
     * Used by: doctor, assistant, receptionist (for scheduling)
     */
    READ: 'clinical.treatment.read',

    /**
     * Update treatment plans
     * Grants: Modify treatment stages, mark procedures complete
     * Used by: doctor only
     */
    UPDATE: 'clinical.treatment.update',

    /**
     * View all treatment plans
     * Grants: List of patient treatment plans
     * Used by: doctor, assistant
     */
    LIST: 'clinical.treatment.list',

    /**
     * Approve treatment plans
     * Grants: Mark treatment plan as approved for execution
     * Used by: doctor only (final authorization)
     */
    APPROVE: 'clinical.treatment.approve',
  },

  CHART: {
    /**
     * View complete patient clinical chart
     * Grants: Access to full EHR including history, notes, vitals
     * Used by: doctor, assistant, receptionist (limited demographics)
     */
    READ: 'clinical.chart.read',

    /**
     * Update patient charting and clinical notes
     * Grants: Add progress notes, update vitals, modify chart sections
     * Used by: doctor, assistant (limited sections)
     */
    UPDATE: 'clinical.chart.update',
  },

  PRESCRIPTION: {
    /**
     * Create prescriptions
     * Grants: Prescribe medications and controlled substances
     * Used by: doctor only (requires DEA license validation)
     */
    CREATE: 'clinical.prescription.create',

    /**
     * View prescription history
     * Grants: Read patient medication records
     * Used by: doctor, assistant
     */
    READ: 'clinical.prescription.read',

    /**
     * Cancel or modify prescriptions
     * Grants: Revoke or amend prescriptions
     * Used by: doctor only
     */
    UPDATE: 'clinical.prescription.update',
  },

  IMAGING: {
    /**
     * Upload clinical imaging
     * Grants: Upload X-rays, photos, CBCT scans
     * Used by: doctor, assistant
     */
    UPLOAD: 'clinical.imaging.upload',

    /**
     * View patient imaging
     * Grants: Access to radiographs and clinical photos
     * Used by: doctor, assistant
     */
    READ: 'clinical.imaging.read',

    /**
     * Delete imaging files
     * Grants: Remove images from patient record
     * Used by: doctor only (permanent deletion restricted)
     */
    DELETE: 'clinical.imaging.delete',
  },

  RECORDS: {
    /**
     * Export patient clinical records
     * Grants: Generate patient record exports (PDF, CCDA)
     * Used by: doctor, tenant_admin (GDPR/data portability compliance)
     */
    EXPORT: 'clinical.records.export',
  },
} as const;

/* ============================================================================
 * BILLING MODULE - Financial operations and revenue cycle management
 * ============================================================================ */

export const BILLING_PERMISSIONS = {
  INVOICE: {
    /**
     * Create invoices for services
     * Grants: Generate invoices with line items and tax
     * Used by: receptionist, billing_specialist, doctor (procedure-triggered)
     */
    CREATE: 'billing.invoice.create',

    /**
     * View invoice details
     * Grants: Read invoice line items, amounts, and status
     * Used by: receptionist, billing_specialist, clinic_manager
     */
    READ: 'billing.invoice.read',

    /**
     * Modify invoice line items
     * Grants: Edit invoice before finalization
     * Used by: billing_specialist only (to prevent fraud)
     */
    UPDATE: 'billing.invoice.update',

    /**
     * Void or cancel invoices
     * Grants: Permanently cancel invoices (requires audit trail)
     * Used by: billing_specialist, tenant_admin
     */
    DELETE: 'billing.invoice.delete',

    /**
     * View invoice lists
     * Grants: Access to invoice history and search
     * Used by: receptionist, billing_specialist
     */
    LIST: 'billing.invoice.list',
  },

  PAYMENT: {
    /**
     * Record patient payments
     * Grants: Process cash, card, check, or payment plan payments
     * Used by: receptionist, billing_specialist
     */
    CREATE: 'billing.payment.create',

    /**
     * View payment history
     * Grants: Read payment records and receipts
     * Used by: receptionist, billing_specialist
     */
    READ: 'billing.payment.read',

    /**
     * Issue refunds
     * Grants: Process refunds to patients (requires reason)
     * Used by: billing_specialist, tenant_admin (requires approval)
     */
    REFUND: 'billing.payment.refund',

    /**
     * View payment lists
     * Grants: Access to payment history and reconciliation
     * Used by: billing_specialist, clinic_manager
     */
    LIST: 'billing.payment.list',
  },

  INSURANCE: {
    /**
     * Manage insurance claims
     * Grants: Submit claims, verify eligibility, post EOBs
     * Used by: billing_specialist only (specialized workflow)
     */
    MANAGE: 'billing.insurance.manage',
  },

  REPORTS: {
    /**
     * View financial reports
     * Grants: Access to revenue, AR aging, collection reports
     * Used by: billing_specialist, clinic_manager, tenant_admin
     */
    VIEW: 'billing.reports.view',
  },
} as const;

/* ============================================================================
 * INVENTORY MODULE - Supply chain and stock management
 * ============================================================================ */

export const INVENTORY_PERMISSIONS = {
  ITEM: {
    /**
     * Create inventory items
     * Grants: Add new items to catalog
     * Used by: clinic_manager, tenant_admin
     */
    CREATE: 'inventory.item.create',

    /**
     * View inventory item details
     * Grants: Read item information, pricing, suppliers
     * Used by: All staff (for procedure planning)
     */
    READ: 'inventory.item.read',

    /**
     * Update inventory item information
     * Grants: Modify item details, reorder points, pricing
     * Used by: clinic_manager
     */
    UPDATE: 'inventory.item.update',

    /**
     * Delete inventory items
     * Grants: Remove items from catalog (soft delete)
     * Used by: clinic_manager, tenant_admin
     */
    DELETE: 'inventory.item.delete',

    /**
     * View inventory catalog
     * Grants: List and search inventory items
     * Used by: All staff
     */
    LIST: 'inventory.item.list',
  },

  STOCK: {
    /**
     * Adjust stock levels
     * Grants: Manual stock adjustments (receives, usage, waste)
     * Used by: clinic_manager, assigned staff
     */
    ADJUST: 'inventory.stock.adjust',

    /**
     * View current stock levels
     * Grants: Read inventory quantities and alerts
     * Used by: All staff (to check availability)
     */
    VIEW: 'inventory.stock.view',
  },

  ORDER: {
    /**
     * Create purchase orders
     * Grants: Order supplies from vendors
     * Used by: clinic_manager
     */
    CREATE: 'inventory.order.create',

    /**
     * Approve purchase orders
     * Grants: Authorize orders for fulfillment
     * Used by: tenant_admin (financial approval)
     */
    APPROVE: 'inventory.order.approve',

    /**
     * View purchase order history
     * Grants: Access to order tracking and history
     * Used by: clinic_manager, tenant_admin
     */
    VIEW: 'inventory.order.view',
  },

  VENDOR: {
    /**
     * Manage supplier information
     * Grants: Add, update, or remove vendors
     * Used by: clinic_manager, tenant_admin
     */
    MANAGE: 'inventory.vendor.manage',
  },
} as const;

/* ============================================================================
 * MARKETING MODULE - Patient engagement and campaign management
 * ============================================================================ */

export const MARKETING_PERMISSIONS = {
  CAMPAIGN: {
    /**
     * Create marketing campaigns
     * Grants: Design email, SMS, or mail campaigns
     * Used by: tenant_admin, marketing staff
     */
    CREATE: 'marketing.campaign.create',

    /**
     * View campaign details
     * Grants: Read campaign configuration and content
     * Used by: tenant_admin, clinic_manager
     */
    READ: 'marketing.campaign.read',

    /**
     * Modify campaigns
     * Grants: Edit campaign settings and content
     * Used by: tenant_admin
     */
    UPDATE: 'marketing.campaign.update',

    /**
     * View campaign list
     * Grants: Access to campaign history
     * Used by: tenant_admin, clinic_manager
     */
    LIST: 'marketing.campaign.list',

    /**
     * Launch campaigns
     * Grants: Execute campaign sends
     * Used by: tenant_admin only (requires review)
     */
    LAUNCH: 'marketing.campaign.launch',
  },

  SEGMENT: {
    /**
     * Manage patient segments
     * Grants: Create targeting rules and audience segments
     * Used by: tenant_admin
     */
    MANAGE: 'marketing.segment.manage',
  },

  AUTOMATION: {
    /**
     * Manage marketing automation
     * Grants: Configure automated workflows and triggers
     * Used by: tenant_admin
     */
    MANAGE: 'marketing.automation.manage',
  },

  ANALYTICS: {
    /**
     * View marketing analytics
     * Grants: Campaign performance metrics and ROI
     * Used by: tenant_admin, clinic_manager
     */
    VIEW: 'marketing.analytics.view',
  },
} as const;

/* ============================================================================
 * ANALYTICS MODULE - Reporting and business intelligence
 * ============================================================================ */

export const ANALYTICS_PERMISSIONS = {
  DASHBOARD: {
    /**
     * View analytics dashboards
     * Grants: Access to pre-built KPI dashboards
     * Used by: clinic_manager, tenant_admin
     */
    VIEW: 'analytics.dashboard.view',
  },

  REPORTS: {
    /**
     * View standard reports
     * Grants: Access to report library
     * Used by: clinic_manager, billing_specialist, tenant_admin
     */
    VIEW: 'analytics.reports.view',

    /**
     * Export reports
     * Grants: Download reports as CSV, Excel, or PDF
     * Used by: tenant_admin, clinic_manager
     */
    EXPORT: 'analytics.reports.export',
  },

  DATA: {
    /**
     * Run custom data queries
     * Grants: Ad-hoc querying and custom report building
     * Used by: tenant_admin only (requires data literacy)
     */
    QUERY: 'analytics.data.query',
  },
} as const;

/* ============================================================================
 * HR MODULE - Human resources and employee management
 * ============================================================================ */

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

/* ============================================================================
 * ADMIN MODULE - System administration and configuration
 * ============================================================================ */

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

/* ============================================================================
 * PERMISSION REGISTRY - Flattened permission list
 * ============================================================================ */

/**
 * Complete permission catalog combining all modules
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

/* ============================================================================
 * TYPE DEFINITIONS AND HELPERS
 * ============================================================================ */

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
 */
export const getAllPermissions = (): Permission[] => {
  const permissions: Permission[] = [];

  const extractPermissions = (obj: any): void => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        permissions.push(obj[key] as Permission);
      } else if (typeof obj[key] === 'object') {
        extractPermissions(obj[key]);
      }
    }
  };

  extractPermissions(PERMISSIONS);
  return permissions;
};

/**
 * Validate if a string is a valid permission code
 */
export const isValidPermission = (permission: string): permission is Permission => {
  return getAllPermissions().includes(permission as Permission);
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
export const TOTAL_PERMISSION_COUNT = getAllPermissions().length;
