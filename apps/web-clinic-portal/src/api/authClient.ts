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
  MfaDisableDto,
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
    console.log('=== AUTH CLIENT - loginSmart CALLED ===');
    console.log('Request data:', JSON.stringify(data, null, 2));

    const response = await authApi.post<LoginSmartResponseDto>(
      '/auth/login-smart',
      data
    );

    console.log('=== AUTH CLIENT - loginSmart RESPONSE ===');
    console.log('Full response object keys:', Object.keys(response));
    console.log('response.data:', JSON.stringify(response.data, null, 2));
    console.log('response.data type:', typeof response.data);
    console.log('response.data keys:', response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A');

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
   * POST /auth/logout
   * Logout current session
   */
  async logout(): Promise<void> {
    await authApi.post('/auth/logout');
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
   * GET /auth/mfa/status
   * Check if MFA is enabled for the current user
   */
  async getMfaStatus(): Promise<MfaStatusDto> {
    const response = await authApi.get<MfaStatusDto>('/auth/mfa/status');
    return response.data;
  },

  /**
   * POST /auth/mfa/enroll
   * Generate TOTP secret and QR code for MFA enrollment
   */
  async enrollMfa(): Promise<MfaEnrollResponseDto> {
    const response = await authApi.post<MfaEnrollResponseDto>('/auth/mfa/enroll');
    return response.data;
  },

  /**
   * POST /auth/mfa/verify
   * Verify TOTP code and enable MFA
   */
  async verifyMfa(data: MfaVerifyDto): Promise<{ success: boolean }> {
    const response = await authApi.post<{ success: boolean }>('/auth/mfa/verify', data);
    return response.data;
  },

  /**
   * POST /auth/mfa/disable
   * Disable MFA (requires password confirmation)
   */
  async disableMfa(data: MfaDisableDto): Promise<{ success: boolean }> {
    const response = await authApi.post<{ success: boolean }>('/auth/mfa/disable', data);
    return response.data;
  },

  /**
   * GET /auth/mfa/backup-codes
   * Get current backup codes
   */
  async getBackupCodes(): Promise<BackupCodesDto> {
    const response = await authApi.get<BackupCodesDto>('/auth/mfa/backup-codes');
    return response.data;
  },

  /**
   * POST /auth/mfa/backup-codes/regenerate
   * Regenerate backup codes (invalidates old ones)
   */
  async regenerateBackupCodes(): Promise<BackupCodesDto> {
    const response = await authApi.post<BackupCodesDto>('/auth/mfa/backup-codes/regenerate');
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
