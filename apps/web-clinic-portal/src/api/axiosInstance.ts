/**
 * Axios Instance Configuration
 *
 * Shared axios instance with interceptors for authentication.
 */

import axios, { AxiosError } from 'axios';
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

  // Request interceptor - attach access token
  instance.interceptors.request.use(
    (config) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - handle token refresh and unwrap standardized responses
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
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true;

        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) {
            tokenStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Attempt token refresh using auth API URL
          const response = await axios.post(`${env.AUTH_API_URL}/auth/refresh`, {
            refreshToken,
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

      return Promise.reject(error);
    },
  );

  return instance;
};
