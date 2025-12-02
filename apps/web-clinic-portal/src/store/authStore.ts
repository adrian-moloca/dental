/**
 * Authentication Store
 *
 * Zustand store for managing authentication state
 */

import { create } from 'zustand';
import type {
  UserDto,
  AuthResponseDto,
  LoginSmartResponseDto,
} from '../types/auth.types';
import { tokenStorage } from '../utils/tokenStorage';
import { authClient } from '../api/authClient';
import { isTokenExpired } from '../utils/jwtUtils';

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginSmartResponseDto>;
  loginSelectOrg: (
    email: string,
    password: string,
    organizationId: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  /**
   * Smart login with email and password only
   * Returns response indicating if org selection is needed
   */
  login: async (email: string, password: string, rememberMe: boolean = false) => {
    set({ isLoading: true, error: null });
    try {
      console.log('=== AUTH STORE - login CALLED ===');
      console.log('Email:', email);
      console.log('Remember Me:', rememberMe);

      const response: LoginSmartResponseDto = await authClient.loginSmart({
        email,
        password,
      });

      console.log('=== AUTH STORE - RECEIVED RESPONSE ===');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('Response type:', typeof response);
      console.log('Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
      console.log('response.needsOrgSelection:', response.needsOrgSelection);
      console.log('response.accessToken:', response.accessToken ? 'EXISTS' : 'MISSING');
      console.log('response.user:', response.user ? 'EXISTS' : 'MISSING');

      // If single org: complete login immediately
      if (!response.needsOrgSelection && response.accessToken && response.user) {
        tokenStorage.setAccessToken(response.accessToken, rememberMe);
        tokenStorage.setRefreshToken(response.refreshToken!, rememberMe);
        tokenStorage.setUser(response.user, rememberMe);
        // Store CSRF token for state-changing requests
        if (response.csrfToken) {
          tokenStorage.setCsrfToken(response.csrfToken, rememberMe);
        }

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Multiple orgs: caller handles org selection
        set({ isLoading: false });
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Complete login by selecting organization
   * Used after smart login returns multiple organizations
   */
  loginSelectOrg: async (
    email: string,
    password: string,
    organizationId: string,
    rememberMe: boolean = false
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponseDto = await authClient.loginSelectOrg({
        email,
        password,
        organizationId,
      });

      tokenStorage.setAccessToken(response.accessToken, rememberMe);
      tokenStorage.setRefreshToken(response.refreshToken, rememberMe);
      tokenStorage.setUser(response.user, rememberMe);
      // Store CSRF token for state-changing requests
      if (response.csrfToken) {
        tokenStorage.setCsrfToken(response.csrfToken, rememberMe);
      }

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      tokenStorage.clear();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });

      // Redirect to login page
      window.location.href = '/login';
    }
  },

  /**
   * Load and validate user session from storage
   * Checks token expiry and attempts refresh if needed
   */
  loadUserFromStorage: async () => {
    set({ isInitializing: true });

    try {
      const user = tokenStorage.getUser();
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      // No stored session
      if (!user || !accessToken || !refreshToken) {
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        });
        return;
      }

      // Check if access token is expired
      if (isTokenExpired(accessToken)) {
        // Attempt to refresh
        try {
          const response = await authClient.refresh({ refreshToken });

          // Determine if user was using rememberMe (if tokens were in localStorage)
          const wasRemembered = !!localStorage.getItem('dentalos_access_token');
          tokenStorage.setAccessToken(response.accessToken, wasRemembered);
          tokenStorage.setRefreshToken(response.refreshToken, wasRemembered);
          tokenStorage.setUser(response.user, wasRemembered);
          // Store new CSRF token if provided
          if (response.csrfToken) {
            tokenStorage.setCsrfToken(response.csrfToken, wasRemembered);
          }

          set({
            user: response.user,
            isAuthenticated: true,
            isInitializing: false,
          });
        } catch (refreshError) {
          // Refresh failed - clear session
          console.error('Token refresh failed during initialization:', refreshError);
          tokenStorage.clear();
          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
          });
        }
      } else {
        // Token is valid, restore session
        set({
          user,
          isAuthenticated: true,
          isInitializing: false,
        });
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      tokenStorage.clear();
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
