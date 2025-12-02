/**
 * User Preferences API Client
 *
 * Handles user preferences for dashboard layout and other UI customizations.
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.AUTH_API_URL);

export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardPreferences {
  layout?: DashboardLayout[];
  hiddenWidgets?: string[];
  editMode?: boolean;
}

export interface UserPreferences {
  dashboard?: DashboardPreferences;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  [key: string]: any;
}

export interface UserPreferencesResponse {
  id: string;
  userId: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export const preferencesClient = {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferencesResponse> {
    const response = await client.get<UserPreferencesResponse>('/users/me/preferences');
    return response.data;
  },

  /**
   * Update user preferences (partial update)
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferencesResponse> {
    const response = await client.patch<UserPreferencesResponse>('/users/me/preferences', {
      preferences,
    });
    return response.data;
  },

  /**
   * Update dashboard preferences specifically
   */
  async updateDashboardPreferences(
    dashboardPreferences: Partial<DashboardPreferences>
  ): Promise<UserPreferencesResponse> {
    const response = await client.patch<UserPreferencesResponse>('/users/me/preferences', {
      preferences: {
        dashboard: dashboardPreferences,
      },
    });
    return response.data;
  },

  /**
   * Reset preferences to default
   */
  async resetPreferences(): Promise<UserPreferencesResponse> {
    const response = await client.delete<UserPreferencesResponse>('/users/me/preferences');
    return response.data;
  },
};
