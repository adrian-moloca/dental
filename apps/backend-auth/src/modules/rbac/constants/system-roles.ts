/**
 * System Roles - Canonical role definitions for DentalOS RBAC
 *
 * These are the immutable, built-in roles that define the core permission structure
 * of the DentalOS platform. Each role represents a specific organizational function
 * with predefined responsibilities and scope.
 *
 * DESIGN DECISIONS:
 *
 * 1. **Immutability**: System roles cannot be deleted or renamed. They are the foundation
 *    of the permission model and must remain stable across all deployments.
 *
 * 2. **Scope Hierarchy**: Roles are scoped to different organizational levels:
 *    - Global (super_admin only)
 *    - Organization (tenant_admin, billing_specialist)
 *    - Clinic (clinic_manager, doctor, assistant, receptionist)
 *
 * 3. **Role Count**: Limited to 7 core roles to maintain simplicity. Organizations
 *    can create custom roles by combining permissions, but these 7 cover 95% of use cases.
 *
 * 4. **Naming Convention**: snake_case for role codes (database keys), descriptive
 *    display names for UI presentation.
 *
 * 5. **No Role Inheritance**: Initially implementing flat role structure. Permission
 *    inheritance adds complexity and can be added in future iterations if needed.
 */

export const SYSTEM_ROLES = {
  /**
   * Super Administrator - Platform-level administrative access
   *
   * Scope: Global (all organizations)
   * Typical Users: Platform administrators, DevOps, support team
   *
   * Capabilities:
   * - Full access to all organizations and clinics
   * - System configuration and maintenance
   * - User impersonation for support
   * - Audit log access across all tenants
   * - Cannot be assigned by tenant admins
   */
  SUPER_ADMIN: 'super_admin',

  /**
   * Organization Administrator - Full organizational control
   *
   * Scope: Organization (single tenant)
   * Typical Users: Practice owners, CFO, operations directors
   *
   * Capabilities:
   * - Manage all clinics within organization
   * - User and role management
   * - Billing and financial oversight
   * - Organization-wide settings and policies
   * - Analytics and reporting access
   * - Cannot access other organizations
   */
  TENANT_ADMIN: 'tenant_admin',

  /**
   * Clinic Manager - Single clinic operations management
   *
   * Scope: Clinic (single location)
   * Typical Users: Office managers, head nurses, site administrators
   *
   * Capabilities:
   * - Staff scheduling and availability
   * - Appointment oversight
   * - Inventory management for clinic
   * - Staff timesheet approval
   * - Clinic-level reporting
   * - Cannot manage users or roles
   */
  CLINIC_MANAGER: 'clinic_manager',

  /**
   * Doctor/Dentist - Clinical care provider
   *
   * Scope: Clinic (can access multiple clinics if assigned)
   * Typical Users: Dentists, oral surgeons, specialists
   *
   * Capabilities:
   * - Full clinical access (diagnosis, treatment planning, charting)
   * - Prescription creation
   * - Imaging review and annotation
   * - Treatment authorization
   * - Invoice creation for services rendered
   * - Cannot modify clinic settings or manage staff
   */
  DOCTOR: 'doctor',

  /**
   * Dental Assistant - Clinical support staff
   *
   * Scope: Clinic
   * Typical Users: Dental assistants, dental hygienists (depending on practice)
   *
   * Capabilities:
   * - View and assist with patient care
   * - Limited charting (notes, vitals)
   * - Upload clinical imaging
   * - View treatment plans (read-only)
   * - View inventory levels
   * - Cannot diagnose or prescribe
   */
  ASSISTANT: 'assistant',

  /**
   * Receptionist - Front desk and scheduling
   *
   * Scope: Clinic
   * Typical Users: Front desk staff, schedulers
   *
   * Capabilities:
   * - Full appointment scheduling (create, update, cancel)
   * - Patient check-in/check-out
   * - Basic billing (create invoices, record payments)
   * - View patient demographic info
   * - Limited clinical access (view only)
   * - Patient record export for GDPR compliance (Article 15: Right to Data Portability)
   * - Cannot access financial reports or modify treatment plans
   *
   * GDPR Compliance Note:
   * - Export permission scoped to patient's own records only
   * - Service layer enforces patient-receptionist clinic relationship
   * - All exports logged for audit trail
   */
  RECEPTIONIST: 'receptionist',

  /**
   * Billing Specialist - Financial operations
   *
   * Scope: Organization or Clinic (depending on practice structure)
   * Typical Users: Billing coordinators, insurance specialists, accountants
   *
   * Capabilities:
   * - Full billing access (invoices, payments, refunds)
   * - Insurance claim management
   * - Financial reporting
   * - Payment plan management
   * - View appointments and clinical data (for billing context)
   * - Cannot modify clinical records or diagnoses
   */
  BILLING_SPECIALIST: 'billing_specialist',
} as const;

/**
 * Type-safe role name extraction
 */
export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * Role metadata for display and validation
 */
export interface RoleMetadata {
  code: SystemRole;
  displayName: string;
  description: string;
  scope: 'global' | 'organization' | 'clinic';
  isSystemRole: true;
  canBeAssignedBy: SystemRole[];
  color?: string; // For UI badge display
}

/**
 * Complete role metadata catalog
 */
export const ROLE_METADATA: Record<SystemRole, RoleMetadata> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: {
    code: SYSTEM_ROLES.SUPER_ADMIN,
    displayName: 'Super Administrator',
    description: 'Full platform access across all organizations',
    scope: 'global',
    isSystemRole: true,
    canBeAssignedBy: [SYSTEM_ROLES.SUPER_ADMIN], // Only super admins can create other super admins
    color: '#DC2626', // red-600
  },
  [SYSTEM_ROLES.TENANT_ADMIN]: {
    code: SYSTEM_ROLES.TENANT_ADMIN,
    displayName: 'Organization Administrator',
    description: 'Full access within organization, manages users and settings',
    scope: 'organization',
    isSystemRole: true,
    canBeAssignedBy: [SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.TENANT_ADMIN],
    color: '#7C3AED', // violet-600
  },
  [SYSTEM_ROLES.CLINIC_MANAGER]: {
    code: SYSTEM_ROLES.CLINIC_MANAGER,
    displayName: 'Clinic Manager',
    description: 'Manages clinic operations and staff scheduling',
    scope: 'clinic',
    isSystemRole: true,
    canBeAssignedBy: [SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.TENANT_ADMIN],
    color: '#2563EB', // blue-600
  },
  [SYSTEM_ROLES.DOCTOR]: {
    code: SYSTEM_ROLES.DOCTOR,
    displayName: 'Doctor/Dentist',
    description: 'Clinical care provider with full diagnostic and treatment capabilities',
    scope: 'clinic',
    isSystemRole: true,
    canBeAssignedBy: [
      SYSTEM_ROLES.SUPER_ADMIN,
      SYSTEM_ROLES.TENANT_ADMIN,
      SYSTEM_ROLES.CLINIC_MANAGER,
    ],
    color: '#059669', // emerald-600
  },
  [SYSTEM_ROLES.ASSISTANT]: {
    code: SYSTEM_ROLES.ASSISTANT,
    displayName: 'Dental Assistant',
    description: 'Clinical support staff with limited charting access',
    scope: 'clinic',
    isSystemRole: true,
    canBeAssignedBy: [
      SYSTEM_ROLES.SUPER_ADMIN,
      SYSTEM_ROLES.TENANT_ADMIN,
      SYSTEM_ROLES.CLINIC_MANAGER,
    ],
    color: '#0891B2', // cyan-600
  },
  [SYSTEM_ROLES.RECEPTIONIST]: {
    code: SYSTEM_ROLES.RECEPTIONIST,
    displayName: 'Receptionist',
    description:
      'Front desk staff managing scheduling, basic billing, and patient data export requests (GDPR compliance)',
    scope: 'clinic',
    isSystemRole: true,
    canBeAssignedBy: [
      SYSTEM_ROLES.SUPER_ADMIN,
      SYSTEM_ROLES.TENANT_ADMIN,
      SYSTEM_ROLES.CLINIC_MANAGER,
    ],
    color: '#D97706', // amber-600
  },
  [SYSTEM_ROLES.BILLING_SPECIALIST]: {
    code: SYSTEM_ROLES.BILLING_SPECIALIST,
    displayName: 'Billing Specialist',
    description: 'Financial operations specialist managing billing and insurance',
    scope: 'organization',
    isSystemRole: true,
    canBeAssignedBy: [SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.TENANT_ADMIN],
    color: '#DB2777', // pink-600
  },
};

/**
 * Helper to get all system role codes as an array
 */
export const getAllSystemRoles = (): SystemRole[] => {
  return Object.values(SYSTEM_ROLES);
};

/**
 * Helper to validate if a role code is a valid system role
 */
export const isValidSystemRole = (role: string): role is SystemRole => {
  return getAllSystemRoles().includes(role as SystemRole);
};

/**
 * Helper to get role metadata
 */
export const getRoleMetadata = (role: SystemRole): RoleMetadata => {
  return ROLE_METADATA[role];
};
