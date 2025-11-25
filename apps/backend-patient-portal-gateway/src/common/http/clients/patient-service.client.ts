/**
 * Patient Service Client
 *
 * Client for making requests to the backend-patient-service microservice.
 *
 * @module common/http/clients/patient-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface PatientProfile {
  patientId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: string;
  phoneNumber: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  preferences?: {
    communicationMethod: string;
    language: string;
    timezone: string;
    marketingOptIn: boolean;
  };
}

export interface UpdatePatientProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: any;
  emergencyContact?: any;
}

export interface UpdatePreferencesDto {
  communicationMethod?: string;
  language?: string;
  timezone?: string;
  marketingOptIn?: boolean;
}

@Injectable()
export class PatientServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.patientServiceUrl', {
      infer: true,
    });
  }

  /**
   * Get patient profile by ID
   */
  async getPatientById(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<PatientProfile> {
    return this.httpClient.get<PatientProfile>(
      this.baseUrl,
      `/api/patients/${patientId}`,
      tenantContext,
    );
  }

  /**
   * Update patient profile
   */
  async updatePatient(
    patientId: string,
    dto: UpdatePatientProfileDto,
    tenantContext: TenantContext,
  ): Promise<PatientProfile> {
    return this.httpClient.patch<PatientProfile>(
      this.baseUrl,
      `/api/patients/${patientId}`,
      tenantContext,
      dto,
    );
  }

  /**
   * Get patient preferences
   */
  async getPreferences(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<any> {
    return this.httpClient.get<any>(
      this.baseUrl,
      `/api/patients/${patientId}/preferences`,
      tenantContext,
    );
  }

  /**
   * Update patient preferences
   */
  async updatePreferences(
    patientId: string,
    dto: UpdatePreferencesDto,
    tenantContext: TenantContext,
  ): Promise<any> {
    return this.httpClient.patch<any>(
      this.baseUrl,
      `/api/patients/${patientId}/preferences`,
      tenantContext,
      dto,
    );
  }

  /**
   * Export patient data (GDPR)
   */
  async exportPatientData(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<any> {
    return this.httpClient.get<any>(
      this.baseUrl,
      `/api/gdpr/patients/${patientId}/export`,
      tenantContext,
    );
  }

  /**
   * Request patient data deletion (GDPR)
   */
  async requestDeletion(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<any> {
    return this.httpClient.post<any>(
      this.baseUrl,
      `/api/gdpr/patients/${patientId}/deletion-request`,
      tenantContext,
    );
  }

  /**
   * Get patient consents
   */
  async getConsents(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<any[]> {
    return this.httpClient.get<any[]>(
      this.baseUrl,
      `/api/patients/${patientId}/consents`,
      tenantContext,
    );
  }
}
