/**
 * Token Storage Utility
 *
 * Manages JWT token persistence with rememberMe support.
 * - If rememberMe: stores in localStorage (persistent)
 * - If not rememberMe: stores in sessionStorage (expires on browser close)
 */

import type { UserDto } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'dentalos_access_token';
const REFRESH_TOKEN_KEY = 'dentalos_refresh_token';
const USER_KEY = 'dentalos_user';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string, rememberMe: boolean = true): void {
    if (rememberMe) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string, rememberMe: boolean = true): void {
    if (rememberMe) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  getUser(): UserDto | null {
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setUser(user: UserDto, rememberMe: boolean = true): void {
    if (rememberMe) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.removeItem(USER_KEY);
    }
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
