import axios from 'axios';
import { API_CONFIG } from '../config/api';
import type {
  LoginDto,
  LoginSelectOrgDto,
  RefreshDto,
  LoginSmartResponseDto,
  AuthResponseDto,
} from '../types/auth.types';
import { tokenStorage } from '../utils/tokenStorage';

const client = axios.create({
  baseURL: API_CONFIG.AUTH_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authClient = {
  async loginSmart(dto: LoginDto): Promise<LoginSmartResponseDto> {
    const response = await client.post<LoginSmartResponseDto>('/auth/login-smart', dto);
    return response.data;
  },

  async loginSelectOrg(dto: LoginSelectOrgDto): Promise<AuthResponseDto> {
    const response = await client.post<AuthResponseDto>('/auth/login-select-org', dto);
    return response.data;
  },

  async refresh(dto: RefreshDto): Promise<AuthResponseDto> {
    const response = await client.post<AuthResponseDto>('/auth/refresh', dto);
    return response.data;
  },

  async logout(): Promise<void> {
    const token = tokenStorage.getAccessToken();
    if (token) {
      try {
        await client.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore logout errors
      }
    }
  },
};
