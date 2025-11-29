/**
 * Patient Timeline API Client
 *
 * Handles patient activity timeline operations
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const timelineApi = createApiClient(env.PATIENT_API_URL);

export interface TimelineFilters {
  activityTypes?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}

export interface TimelineActivity {
  id: string;
  type: 'appointment' | 'clinical_note' | 'treatment' | 'document' | 'payment' | 'communication';
  title: string;
  description?: string;
  date: string;
  metadata: Record<string, any>;
  icon: string;
  color: string;
  relatedId?: string;
  providerName?: string;
}

export interface TimelineResponse {
  data: TimelineActivity[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export const timelineClient = {
  /**
   * GET /patients/:patientId/timeline
   * Get patient activity timeline with infinite scroll support
   */
  async getTimeline(
    patientId: string,
    filters: TimelineFilters = {}
  ): Promise<TimelineResponse> {
    const response = await timelineApi.get(`/patients/${patientId}/timeline`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * GET /patients/:patientId/timeline/stats
   * Get timeline statistics
   */
  async getTimelineStats(patientId: string): Promise<{
    totalActivities: number;
    activityBreakdown: Record<string, number>;
    lastActivityDate?: string;
  }> {
    const response = await timelineApi.get(`/patients/${patientId}/timeline/stats`);
    return response.data;
  },
};
