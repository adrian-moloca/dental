/**
 * Tooth History API Client
 *
 * Handles tooth history and odontogram timeline operations
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const clinicalApi = createApiClient(env.CLINICAL_API_URL);

export interface ToothHistoryEntry {
  id: string;
  date: string;
  condition: string;
  surfaces?: string[];
  providerId: string;
  providerName?: string;
  notes?: string;
  clinicalNoteId?: string;
  procedureCode?: string;
  procedureName?: string;
}

export interface ToothHistoryResponse {
  toothNumber: string;
  history: ToothHistoryEntry[];
  currentState: {
    condition: string;
    surfaces?: string[];
    lastUpdated?: string;
  };
}

export interface OdontogramSnapshot {
  date: string;
  teeth: Record<
    string,
    {
      condition: string;
      surfaces?: string[];
      notes?: string;
    }
  >;
  clinicalNoteId?: string;
  providerName?: string;
}

export interface OdontogramHistoryResponse {
  snapshots: OdontogramSnapshot[];
  dateRange: {
    earliest: string;
    latest: string;
  };
}

export const toothHistoryClient = {
  /**
   * GET /patients/:patientId/teeth/:toothNumber/history
   * Get complete history of a specific tooth
   */
  async getToothHistory(
    patientId: string,
    toothNumber: string
  ): Promise<ToothHistoryResponse> {
    const response = await clinicalApi.get(
      `/patients/${patientId}/teeth/${toothNumber}/history`
    );
    return response.data;
  },

  /**
   * GET /patients/:patientId/odontogram/history
   * Get odontogram snapshots over time
   */
  async getOdontogramHistory(patientId: string): Promise<OdontogramHistoryResponse> {
    const response = await clinicalApi.get(`/patients/${patientId}/odontogram/history`);
    return response.data;
  },

  /**
   * GET /patients/:patientId/odontogram/snapshot/:date
   * Get odontogram state at a specific date
   */
  async getOdontogramSnapshot(
    patientId: string,
    date: string
  ): Promise<OdontogramSnapshot> {
    const response = await clinicalApi.get(
      `/patients/${patientId}/odontogram/snapshot`,
      {
        params: { date },
      }
    );
    return response.data;
  },

  /**
   * GET /patients/:patientId/odontogram/compare
   * Compare odontogram between two dates
   */
  async compareOdontogram(
    patientId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<{
    from: OdontogramSnapshot;
    to: OdontogramSnapshot;
    changes: Array<{
      toothNumber: string;
      changeType: 'added' | 'modified' | 'removed';
      fromCondition?: string;
      toCondition?: string;
    }>;
  }> {
    const response = await clinicalApi.get(`/patients/${patientId}/odontogram/compare`, {
      params: { dateFrom, dateTo },
    });
    return response.data;
  },
};
