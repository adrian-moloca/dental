/**
 * Authentication Types
 *
 * Aligned with backend-auth DTOs
 */

export interface LoginDto {
  email: string;
  password: string;
  organizationId: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  clinicId?: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  clinicId?: string;
  roles: string[];
  permissions: string[];
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface SessionDto {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: Date;
  lastActiveAt: Date;
}

/**
 * DTO for smart login (email + password only, no organizationId)
 */
export interface LoginSmartDto {
  email: string;
  password: string;
}

/**
 * Organization summary for multi-org selection
 */
export interface OrganizationSummaryDto {
  id: string;
  name: string;
  logoUrl?: string;
}

/**
 * Response for smart login
 * Contains different fields based on single vs multiple organizations
 */
export interface LoginSmartResponseDto {
  needsOrgSelection: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: UserDto;
  organizations?: OrganizationSummaryDto[];
}

/**
 * DTO for selecting organization during multi-org login
 */
export interface SelectOrgDto {
  email: string;
  password: string;
  organizationId: string;
}
