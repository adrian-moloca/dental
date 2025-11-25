/**
 * User, role, and permission type definitions
 * @module shared-types/user
 */

import { Email, UUID, ISODateString, PhoneNumber, Nullable } from './common.types';
import { FullTenantEntity } from './entity.types';
import { ClinicId, OrganizationId } from './multi-tenant.types';

/**
 * User role enumeration
 * Defines hierarchical roles in the system
 */
export enum UserRole {
  /** System administrator with full access */
  SUPER_ADMIN = 'SUPER_ADMIN',
  /** Organization administrator */
  ORG_ADMIN = 'ORG_ADMIN',
  /** Clinic administrator */
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  /** Dentist/Doctor */
  DENTIST = 'DENTIST',
  /** Dental hygienist */
  HYGIENIST = 'HYGIENIST',
  /** Dental assistant */
  ASSISTANT = 'ASSISTANT',
  /** Front desk/receptionist */
  RECEPTIONIST = 'RECEPTIONIST',
  /** Office manager */
  OFFICE_MANAGER = 'OFFICE_MANAGER',
  /** Billing specialist */
  BILLING_SPECIALIST = 'BILLING_SPECIALIST',
  /** Read-only viewer */
  VIEWER = 'VIEWER',
}

/**
 * Permission action types
 */
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

/**
 * Resource types for permission management
 */
export enum ResourceType {
  PATIENT = 'PATIENT',
  APPOINTMENT = 'APPOINTMENT',
  TREATMENT = 'TREATMENT',
  INVOICE = 'INVOICE',
  PRESCRIPTION = 'PRESCRIPTION',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  USER = 'USER',
  CLINIC = 'CLINIC',
  ORGANIZATION = 'ORGANIZATION',
  REPORT = 'REPORT',
  SETTINGS = 'SETTINGS',
}

/**
 * Permission definition
 */
export interface Permission {
  /** Resource type */
  resource: ResourceType;
  /** Allowed action */
  action: PermissionAction;
  /** Optional resource-specific constraints */
  constraints?: Record<string, unknown>;
}

/**
 * Role definition with permissions
 */
export interface Role {
  /** Role identifier */
  role: UserRole;
  /** Role display name */
  name: string;
  /** Role description */
  description: string;
  /** Permissions granted to this role */
  permissions: Permission[];
  /** Whether this is a system-defined role */
  isSystem: boolean;
}

/**
 * User status enumeration
 */
export enum UserStatus {
  /** User account is active */
  ACTIVE = 'ACTIVE',
  /** User account is inactive */
  INACTIVE = 'INACTIVE',
  /** User account is pending activation */
  PENDING = 'PENDING',
  /** User account is suspended */
  SUSPENDED = 'SUSPENDED',
  /** User account is locked due to security */
  LOCKED = 'LOCKED',
}

/**
 * User profile information
 */
export interface UserProfile {
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Display name (computed or custom) */
  displayName?: string;
  /** Profile photo URL */
  photoUrl?: string;
  /** Job title */
  title?: string;
  /** Professional license number */
  licenseNumber?: string;
  /** License expiration date */
  licenseExpiresAt?: ISODateString;
  /** Phone number */
  phoneNumber?: PhoneNumber;
  /** Date of birth */
  dateOfBirth?: ISODateString;
  /** Professional bio */
  bio?: string;
}

/**
 * User authentication information
 */
export interface UserAuth {
  /** Email address (used for login) */
  email: Email;
  /** Whether email is verified */
  emailVerified: boolean;
  /** Password hash (never expose in API responses) */
  passwordHash?: string;
  /** Whether multi-factor authentication is enabled */
  mfaEnabled: boolean;
  /** MFA secret (never expose in API responses) */
  mfaSecret?: string;
  /** Last login timestamp */
  lastLoginAt?: Nullable<ISODateString>;
  /** Failed login attempt count */
  failedLoginAttempts: number;
  /** Account locked until timestamp */
  lockedUntil?: Nullable<ISODateString>;
  /** Password last changed timestamp */
  passwordChangedAt?: ISODateString;
}

/**
 * User entity
 */
export interface User extends FullTenantEntity {
  /** User profile information */
  profile: UserProfile;
  /** Authentication information */
  auth: UserAuth;
  /** User's primary role */
  role: UserRole;
  /** Additional roles (for multi-role users) */
  additionalRoles?: UserRole[];
  /** User status */
  status: UserStatus;
  /** Clinics this user has access to */
  clinicIds: ClinicId[];
  /** User preferences */
  preferences?: Record<string, unknown>;
  /** Custom permissions (overrides role permissions) */
  customPermissions?: Permission[];
}

/**
 * User session information
 */
export interface UserSession {
  /** Session identifier */
  sessionId: UUID;
  /** User identifier */
  userId: UUID;
  /** Organization context */
  organizationId: OrganizationId;
  /** Clinic context (if applicable) */
  clinicId?: ClinicId;
  /** User role in this session */
  role: UserRole;
  /** Session creation timestamp */
  createdAt: ISODateString;
  /** Session expiration timestamp */
  expiresAt: ISODateString;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
}

/**
 * Simplified user DTO for API responses
 * Excludes sensitive authentication data
 */
export interface UserDTO {
  id: UUID;
  email: Email;
  firstName: string;
  lastName: string;
  displayName?: string;
  photoUrl?: string;
  role: UserRole;
  status: UserStatus;
  organizationId: OrganizationId;
  clinicIds: ClinicId[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * User invitation
 */
export interface UserInvitation {
  id: UUID;
  email: Email;
  role: UserRole;
  organizationId: OrganizationId;
  clinicIds: ClinicId[];
  invitedBy: UUID;
  invitedAt: ISODateString;
  expiresAt: ISODateString;
  acceptedAt?: Nullable<ISODateString>;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}
