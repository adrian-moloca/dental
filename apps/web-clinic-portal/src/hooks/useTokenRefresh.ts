/**
 * Token Refresh Hook
 *
 * Manages automatic token refresh scheduling
 */

import { useEffect, useRef } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { getTokenExpiryTime, isTokenExpired } from '../utils/jwtUtils';
import { authClient } from '../api/authClient';
import { useAuthStore } from '../store/authStore';

const REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const scheduleTokenRefresh = async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return;
    }

    // Check if token is already expired
    if (isTokenExpired(accessToken)) {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed during initialization:', error);
        await logout();
      }
      return;
    }

    // Schedule refresh before token expires
    const expiryTime = getTokenExpiryTime(accessToken);
    const refreshTime = Math.max(0, expiryTime - REFRESH_BUFFER);

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Scheduled token refresh failed:', error);
        await logout();
      }
    }, refreshTime);
  };

  const refreshAccessToken = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const user = tokenStorage.getUser();
    if (!user?.organizationId) {
      throw new Error('No organization ID available');
    }

    try {
      const response = await authClient.refresh({
        refreshToken,
        organizationId: user.organizationId,
      });

      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      tokenStorage.setUser(response.user);

      // Schedule next refresh
      await scheduleTokenRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      scheduleTokenRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated]);

  return { scheduleTokenRefresh };
}
