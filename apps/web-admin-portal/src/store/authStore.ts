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

  login: async (email: string, password: string, rememberMe: boolean = false) => {
    set({ isLoading: true, error: null });
    try {
      const response: LoginSmartResponseDto = await authClient.loginSmart({
        email,
        password,
      });

      // If single org: complete login immediately
      if (!response.needsOrgSelection && response.accessToken && response.user) {
        // Validate SUPER_ADMIN role for admin portal
        if (!response.user.roles?.includes('SUPER_ADMIN')) {
          set({
            error: 'Access denied. Admin portal requires SUPER_ADMIN role.',
            isLoading: false,
            isAuthenticated: false,
          });
          throw new Error('Access denied');
        }

        tokenStorage.setAccessToken(response.accessToken, rememberMe);
        tokenStorage.setRefreshToken(response.refreshToken!, rememberMe);
        tokenStorage.setUser(response.user, rememberMe);

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

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

      // Validate SUPER_ADMIN role for admin portal
      if (!response.user.roles?.includes('SUPER_ADMIN')) {
        set({
          error: 'Access denied. Admin portal requires SUPER_ADMIN role.',
          isLoading: false,
          isAuthenticated: false,
        });
        throw new Error('Access denied');
      }

      tokenStorage.setAccessToken(response.accessToken, rememberMe);
      tokenStorage.setRefreshToken(response.refreshToken, rememberMe);
      tokenStorage.setUser(response.user, rememberMe);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Login failed';
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
      window.location.href = '/login';
    }
  },

  loadUserFromStorage: async () => {
    set({ isInitializing: true });

    try {
      const user = tokenStorage.getUser<UserDto>();
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

      // Validate SUPER_ADMIN role
      if (!user.roles?.includes('SUPER_ADMIN')) {
        tokenStorage.clear();
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
          error: 'Access denied. Admin portal requires SUPER_ADMIN role.',
        });
        return;
      }

      // Check if access token is expired
      if (isTokenExpired(accessToken)) {
        try {
          const response = await authClient.refresh({ refreshToken });
          const wasRemembered = !!localStorage.getItem('dentalos_admin_access_token');
          tokenStorage.setAccessToken(response.accessToken, wasRemembered);
          tokenStorage.setRefreshToken(response.refreshToken, wasRemembered);
          tokenStorage.setUser(response.user, wasRemembered);

          set({
            user: response.user,
            isAuthenticated: true,
            isInitializing: false,
          });
        } catch {
          tokenStorage.clear();
          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
          });
        }
      } else {
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
