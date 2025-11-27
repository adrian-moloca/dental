export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roles: UserRole[];
  permissions: string[];
  organizationId?: string;
  clinicId?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationOption {
  id: string;
  name: string;
  clinicCount: number;
}

export interface LoginSmartResponseDto {
  needsOrgSelection: boolean;
  organizations?: OrganizationOption[];
  accessToken?: string;
  refreshToken?: string;
  user?: UserDto;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginSelectOrgDto {
  email: string;
  password: string;
  organizationId: string;
}

export interface RefreshDto {
  refreshToken: string;
}
