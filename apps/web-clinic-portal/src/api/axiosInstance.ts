/**
 * Axios Instance Configuration
 *
 * Shared axios instance with interceptors for authentication and tenant context.
 */

import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { tokenStorage } from '../utils/tokenStorage';
import { env } from '../config/env';

export const createApiClient = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - attach access token and tenant context headers
  instance.interceptors.request.use(
    (config) => {
      const token = tokenStorage.getAccessToken();
      const user = tokenStorage.getUser();

      // Add authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add tenant context headers for multi-tenant isolation
      if (user) {
        if (user.organizationId) {
          config.headers['X-Organization-Id'] = user.organizationId;
        }
        // Backend uses 'tenantId' which is the same as organizationId
        if (user.organizationId) {
          config.headers['X-Tenant-Id'] = user.organizationId;
        }
        // Optional: clinic-specific context
        if (user.clinicId) {
          config.headers['X-Clinic-Id'] = user.clinicId;
        }
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - handle token refresh, unwrap responses, and show errors
  instance.interceptors.response.use(
    (response) => {
      console.log('=== AXIOS INTERCEPTOR - RAW RESPONSE ===');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A');

      // Unwrap standardized backend response format: {success, data, timestamp}
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        'data' in response.data &&
        'timestamp' in response.data
      ) {
        console.log('=== UNWRAPPING STANDARDIZED RESPONSE ===');
        console.log('Unwrapped data:', JSON.stringify(response.data.data, null, 2));
        response.data = response.data.data;
      }

      return response;
    },
    async (error: AxiosError<any>) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true;

        try {
          const refreshToken = tokenStorage.getRefreshToken();
          const user = tokenStorage.getUser();

          if (!refreshToken || !user?.organizationId) {
            tokenStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Attempt token refresh using auth API URL
          const response = await axios.post(`${env.AUTH_API_URL}/auth/refresh`, {
            refreshToken,
            organizationId: user.organizationId,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(newRefreshToken);

          originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          tokenStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors with toast notifications
      // Extract error message from backend response
      let errorMessage = 'A aparut o eroare. Va rugam incercati din nou.';

      if (error.response?.data) {
        // Check for standardized error format
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        // Network errors or timeout
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Cererea a expirat. Verificati conexiunea la internet.';
        } else if (error.message === 'Network Error') {
          errorMessage = 'Eroare de retea. Verificati conexiunea la internet.';
        } else {
          errorMessage = error.message;
        }
      }

      // Show toast for specific error types (skip for 401 as we handle redirect)
      if (error.response?.status !== 401) {
        // Don't show toast for expected validation errors (400) - let the forms handle it
        if (error.response?.status !== 400) {
          toast.error(errorMessage);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};
