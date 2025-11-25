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
};
