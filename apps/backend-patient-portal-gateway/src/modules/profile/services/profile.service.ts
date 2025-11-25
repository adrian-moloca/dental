import { Injectable } from '@nestjs/common';
import { PatientServiceClient } from '@/common/http/clients/patient-service.client';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class ProfileService {
  constructor(private readonly patientClient: PatientServiceClient) {}

  async getProfile(patientId: string, tenantContext: TenantContext) {
    return this.patientClient.getPatientById(patientId, tenantContext);
  }

  async updateProfile(patientId: string, dto: any, tenantContext: TenantContext) {
    return this.patientClient.updatePatient(patientId, dto, tenantContext);
  }

  async getPreferences(patientId: string, tenantContext: TenantContext) {
    return this.patientClient.getPreferences(patientId, tenantContext);
  }

  async updatePreferences(patientId: string, dto: any, tenantContext: TenantContext) {
    return this.patientClient.updatePreferences(patientId, dto, tenantContext);
  }
}
