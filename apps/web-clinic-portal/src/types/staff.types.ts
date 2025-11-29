/**
 * Staff/User Types
 *
 * Types for staff management aligned with backend-auth Users API.
 */

/**
 * User status enum (aligned with backend UserStatus)
 */
export type UserStatus = 'INVITED' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

/**
 * Staff member DTO (user response from API)
 */
export interface StaffDto {
  id: string;
  organizationId: string;
  clinicId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated staff response
 */
export interface PaginatedStaffResponse {
  data: StaffDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Query parameters for listing staff
 */
export interface ListStaffQueryDto {
  status?: UserStatus;
  role?: string;
  search?: string;
  clinicId?: string;
  page?: number;
  limit?: number;
}

/**
 * DTO for creating a new staff member
 */
export interface CreateStaffDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  permissions?: string[];
  clinicId?: string;
  status?: UserStatus;
}

/**
 * DTO for updating staff member
 */
export interface UpdateStaffDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  permissions?: string[];
  clinicId?: string;
  status?: UserStatus;
}

/**
 * Staff statistics response
 */
export interface StaffStatsDto {
  total: number;
  active: number;
  inactive: number;
  invited: number;
  blocked: number;
}

/**
 * Frontend display type for staff (extended with UI-specific properties)
 * Maps from StaffDto for display in components
 */
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  department: string;
  specializations: string[];
  status: StaffDisplayStatus;
  avatar?: string;
  hireDate: string;
  schedule?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  patientsCount?: number;
  lastActive?: string;
}

/**
 * Display role type for UI
 */
export type StaffRole = 'doctor' | 'asistent' | 'receptioner' | 'admin' | 'manager';

/**
 * Display status type for UI
 */
export type StaffDisplayStatus = 'activ' | 'inactiv' | 'concediu' | 'suspendat';

/**
 * Helper to convert API status to display status
 */
export function mapUserStatusToDisplay(status: UserStatus): StaffDisplayStatus {
  switch (status) {
    case 'ACTIVE':
      return 'activ';
    case 'INACTIVE':
      return 'inactiv';
    case 'BLOCKED':
      return 'suspendat';
    case 'INVITED':
      return 'inactiv';
    default:
      return 'inactiv';
  }
}

/**
 * Helper to convert display status to API status
 */
export function mapDisplayStatusToUser(status: StaffDisplayStatus): UserStatus {
  switch (status) {
    case 'activ':
      return 'ACTIVE';
    case 'inactiv':
      return 'INACTIVE';
    case 'suspendat':
      return 'BLOCKED';
    case 'concediu':
      return 'INACTIVE'; // No direct mapping, treat as inactive
    default:
      return 'INACTIVE';
  }
}

/**
 * Helper to derive role from API roles array
 */
export function mapRolesToDisplayRole(roles: string[]): StaffRole {
  const roleMap: Record<string, StaffRole> = {
    DENTIST: 'doctor',
    DOCTOR: 'doctor',
    ASSISTANT: 'asistent',
    RECEPTIONIST: 'receptioner',
    SUPER_ADMIN: 'admin',
    CLINIC_ADMIN: 'admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
  };

  for (const role of roles) {
    const upperRole = role.toUpperCase();
    if (roleMap[upperRole]) {
      return roleMap[upperRole];
    }
  }

  return 'asistent'; // Default fallback
}

/**
 * Helper to convert display role to API role
 */
export function mapDisplayRoleToApi(role: StaffRole): string[] {
  const roleMap: Record<StaffRole, string[]> = {
    doctor: ['DENTIST'],
    asistent: ['ASSISTANT'],
    receptioner: ['RECEPTIONIST'],
    admin: ['CLINIC_ADMIN'],
    manager: ['MANAGER'],
  };

  return roleMap[role] || ['STAFF'];
}

/**
 * Convert StaffDto from API to StaffMember for display
 */
export function staffDtoToMember(dto: StaffDto): StaffMember {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: '', // Not stored in User entity
    role: mapRolesToDisplayRole(dto.roles),
    department: deriveDepartment(dto.roles),
    specializations: dto.roles.filter((r) => !isSystemRole(r)),
    status: mapUserStatusToDisplay(dto.status),
    hireDate: dto.createdAt,
    lastActive: dto.lastLoginAt || undefined,
  };
}

/**
 * Helper to derive department from roles
 */
function deriveDepartment(roles: string[]): string {
  const role = mapRolesToDisplayRole(roles);
  const departmentMap: Record<StaffRole, string> = {
    doctor: 'Stomatologie Generala',
    asistent: 'Stomatologie Generala',
    receptioner: 'Receptie',
    admin: 'Administratie',
    manager: 'Management',
  };
  return departmentMap[role] || 'General';
}

/**
 * Check if role is a system role (vs. specialization)
 */
function isSystemRole(role: string): boolean {
  const systemRoles = [
    'SUPER_ADMIN',
    'CLINIC_ADMIN',
    'ADMIN',
    'DENTIST',
    'DOCTOR',
    'ASSISTANT',
    'RECEPTIONIST',
    'MANAGER',
    'STAFF',
  ];
  return systemRoles.includes(role.toUpperCase());
}
