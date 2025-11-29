/**
 * Clinical Service Client
 *
 * Client for making requests to the backend-clinical microservice.
 *
 * @module common/http/clients/clinical-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface ClinicalSummary {
  patientId: string;
  conditions: Array<{
    conditionId: string;
    name: string;
    icdCode: string;
    diagnosedDate: string;
    status: string;
  }>;
  allergies: Array<{
    allergyId: string;
    allergen: string;
    severity: string;
    reaction: string;
  }>;
  alerts: Array<{
    alertId: string;
    type: string;
    message: string;
    severity: string;
  }>;
}

export interface Visit {
  visitId: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentSummary: string;
  provider: {
    firstName: string;
    lastName: string;
    title: string;
  };
  procedures: Array<{
    procedureId: string;
    code: string;
    description: string;
    toothNumber?: string;
  }>;
}

export interface TreatmentPlan {
  treatmentPlanId: string;
  patientId: string;
  providerId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  items: Array<{
    itemId: string;
    procedureCode: string;
    procedureName: string;
    toothNumber?: string;
    surfaces?: string[];
    priority: string;
    estimatedCost: number;
    status: string;
  }>;
}

@Injectable()
export class ClinicalServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.clinicalServiceUrl', {
      infer: true,
    });
  }

  /**
   * Get clinical summary for patient
   */
  async getClinicalSummary(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<ClinicalSummary> {
    return this.httpClient.get<ClinicalSummary>(
      this.baseUrl,
      `/api/patients/${patientId}/clinical-summary`,
      tenantContext,
    );
  }

  /**
   * List visits for patient
   */
  async listVisits(patientId: string, tenantContext: TenantContext): Promise<Visit[]> {
    return this.httpClient.get<Visit[]>(
      this.baseUrl,
      `/api/patients/${patientId}/visits`,
      tenantContext,
    );
  }

  /**
   * Get visit by ID
   */
  async getVisit(visitId: string, tenantContext: TenantContext): Promise<Visit> {
    return this.httpClient.get<Visit>(this.baseUrl, `/api/visits/${visitId}`, tenantContext);
  }

  /**
   * List treatment plans for patient
   */
  async listTreatmentPlans(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<TreatmentPlan[]> {
    return this.httpClient.get<TreatmentPlan[]>(
      this.baseUrl,
      `/api/patients/${patientId}/treatment-plans`,
      tenantContext,
    );
  }

  /**
   * Get treatment plan by ID
   */
  async getTreatmentPlan(
    treatmentPlanId: string,
    tenantContext: TenantContext,
  ): Promise<TreatmentPlan> {
    return this.httpClient.get<TreatmentPlan>(
      this.baseUrl,
      `/api/treatment-plans/${treatmentPlanId}`,
      tenantContext,
    );
  }
}
