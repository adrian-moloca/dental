/**
 * Auth API Client
 *
 * Endpoints aligned with backend-auth service
 * Base URL: http://localhost:3301
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';
import type {
  LoginDto,
  LoginSmartDto,
  LoginSmartResponseDto,
  SelectOrgDto,
  RegisterDto,
  AuthResponseDto,
  RefreshTokenDto,
  SessionDto,
  UserDto,
  MfaStatusDto,
  MfaEnrollResponseDto,
  MfaVerifyDto,
  BackupCodesDto,
} from '../types/auth.types';

const authApi = createApiClient(env.AUTH_API_URL);

export const authClient = {
  /**
   * POST /auth/register
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const response = await authApi.post<AuthResponseDto>('/auth/register', data);
    return response.data;
  },

  /**
   * POST /auth/login
   * Login with email/password
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await authApi.post<AuthResponseDto>('/auth/login', data);
    return response.data;
  },

  /**
   * POST /auth/login-smart
   * Smart login without organization ID
   * Automatically discovers user's organizations
   */
  async loginSmart(data: LoginSmartDto): Promise<LoginSmartResponseDto> {
    const response = await authApi.post<LoginSmartResponseDto>(
      '/auth/login-smart',
      data
    );

    return response.data;
  },

  /**
   * POST /auth/login-select-org
   * Complete login by selecting organization
   * Used when user belongs to multiple organizations
   */
  async loginSelectOrg(data: SelectOrgDto): Promise<AuthResponseDto> {
    const response = await authApi.post<AuthResponseDto>(
      '/auth/login-select-org',
      data
    );
    return response.data;
  },

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  async me(): Promise<UserDto> {
    const response = await authApi.get<UserDto>('/auth/me');
    return response.data;
  },

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  async refresh(data: RefreshTokenDto): Promise<AuthResponseDto> {
    const response = await authApi.post<AuthResponseDto>('/auth/refresh', data);
    return response.data;
  },

  /**
   * POST /auth/logout-silent
   * Graceful logout that doesn't require valid session
   * Always succeeds - frontend should clear local tokens regardless
   */
  async logout(): Promise<void> {
    await authApi.post('/auth/logout-silent');
  },

  /**
   * GET /auth/sessions
   * List user sessions
   */
  async getSessions(): Promise<SessionDto[]> {
    const response = await authApi.get<SessionDto[]>('/auth/sessions');
    return response.data;
  },

  /**
   * DELETE /auth/sessions/:id
   * Delete specific session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await authApi.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * DELETE /auth/sessions
   * Revoke all other sessions (except current)
   */
  async revokeAllOtherSessions(): Promise<void> {
    await authApi.delete('/auth/sessions');
  },

  /**
   * GET /mfa/factors
   * Check if MFA is enabled for the current user
   * Returns list of MFA factors (empty if none enabled)
   */
  async getMfaStatus(): Promise<MfaStatusDto> {
    const response = await authApi.get<MfaStatusDto>('/mfa/factors');
    return response.data;
  },

  /**
   * POST /mfa/totp/enroll
   * Generate TOTP secret and QR code for MFA enrollment
   * Requires organizationId in request body
   */
  async enrollMfa(data: { organizationId: string; factorName?: string }): Promise<MfaEnrollResponseDto> {
    const response = await authApi.post<MfaEnrollResponseDto>('/mfa/totp/enroll', data);
    return response.data;
  },

  /**
   * POST /mfa/totp/verify
   * Verify TOTP code and enable MFA
   * Requires organizationId, factorId, and token in request body
   */
  async verifyMfa(data: MfaVerifyDto & { organizationId: string; factorId: string }): Promise<{ verified: boolean }> {
    const response = await authApi.post<{ verified: boolean }>('/mfa/totp/verify', data);
    return response.data;
  },

  /**
   * DELETE /mfa/factors/:factorId
   * Disable MFA (delete specific factor)
   */
  async disableMfa(factorId: string, organizationId: string): Promise<{ deleted: boolean }> {
    const response = await authApi.delete<{ deleted: boolean }>(`/mfa/factors/${factorId}?organizationId=${organizationId}`);
    return response.data;
  },

  /**
   * POST /mfa/backup-codes/generate
   * Generate backup codes
   * Requires organizationId in request body
   */
  async getBackupCodes(organizationId: string): Promise<BackupCodesDto> {
    const response = await authApi.post<BackupCodesDto>('/mfa/backup-codes/generate', { organizationId });
    return response.data;
  },

  /**
   * POST /mfa/backup-codes/generate
   * Regenerate backup codes (invalidates old ones)
   * Same endpoint as getBackupCodes - generates fresh codes
   */
  async regenerateBackupCodes(organizationId: string): Promise<BackupCodesDto> {
    const response = await authApi.post<BackupCodesDto>('/mfa/backup-codes/generate', { organizationId });
    return response.data;
  },

  /**
   * POST /auth/forgot-password
   * Request password reset link via email
   */
  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    const response = await authApi.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * POST /auth/reset-password
   * Complete password reset with token and new password
   */
  async resetPassword(data: { token: string; newPassword: string }): Promise<{ message: string }> {
    const response = await authApi.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};
