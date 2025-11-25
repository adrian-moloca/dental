import { Email, UUID, ISODateString, PhoneNumber, Nullable } from './common.types';
import { FullTenantEntity } from './entity.types';
import { ClinicId, OrganizationId } from './multi-tenant.types';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ORG_ADMIN = "ORG_ADMIN",
    CLINIC_ADMIN = "CLINIC_ADMIN",
    DENTIST = "DENTIST",
    HYGIENIST = "HYGIENIST",
    ASSISTANT = "ASSISTANT",
    RECEPTIONIST = "RECEPTIONIST",
    OFFICE_MANAGER = "OFFICE_MANAGER",
    BILLING_SPECIALIST = "BILLING_SPECIALIST",
    VIEWER = "VIEWER"
}
export declare enum PermissionAction {
    CREATE = "CREATE",
    READ = "READ",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    EXECUTE = "EXECUTE",
    APPROVE = "APPROVE",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT"
}
export declare enum ResourceType {
    PATIENT = "PATIENT",
    APPOINTMENT = "APPOINTMENT",
    TREATMENT = "TREATMENT",
    INVOICE = "INVOICE",
    PRESCRIPTION = "PRESCRIPTION",
    MEDICAL_RECORD = "MEDICAL_RECORD",
    USER = "USER",
    CLINIC = "CLINIC",
    ORGANIZATION = "ORGANIZATION",
    REPORT = "REPORT",
    SETTINGS = "SETTINGS"
}
export interface Permission {
    resource: ResourceType;
    action: PermissionAction;
    constraints?: Record<string, unknown>;
}
export interface Role {
    role: UserRole;
    name: string;
    description: string;
    permissions: Permission[];
    isSystem: boolean;
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED",
    LOCKED = "LOCKED"
}
export interface UserProfile {
    firstName: string;
    lastName: string;
    displayName?: string;
    photoUrl?: string;
    title?: string;
    licenseNumber?: string;
    licenseExpiresAt?: ISODateString;
    phoneNumber?: PhoneNumber;
    dateOfBirth?: ISODateString;
    bio?: string;
}
export interface UserAuth {
    email: Email;
    emailVerified: boolean;
    passwordHash?: string;
    mfaEnabled: boolean;
    mfaSecret?: string;
    lastLoginAt?: Nullable<ISODateString>;
    failedLoginAttempts: number;
    lockedUntil?: Nullable<ISODateString>;
    passwordChangedAt?: ISODateString;
}
export interface User extends FullTenantEntity {
    profile: UserProfile;
    auth: UserAuth;
    role: UserRole;
    additionalRoles?: UserRole[];
    status: UserStatus;
    clinicIds: ClinicId[];
    preferences?: Record<string, unknown>;
    customPermissions?: Permission[];
}
export interface UserSession {
    sessionId: UUID;
    userId: UUID;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    role: UserRole;
    createdAt: ISODateString;
    expiresAt: ISODateString;
    ipAddress?: string;
    userAgent?: string;
}
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
