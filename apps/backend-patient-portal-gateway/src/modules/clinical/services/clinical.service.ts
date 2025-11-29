import { Injectable } from '@nestjs/common';
import { ClinicalServiceClient } from '@/common/http/clients/clinical-service.client';
import { ClinicalDataAdapter } from '@/common/adapters/clinical-data.adapter';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class ClinicalService {
  constructor(
    private readonly clinicalClient: ClinicalServiceClient,
    private readonly clinicalAdapter: ClinicalDataAdapter,
  ) {}

  async getClinicalSummary(patientId: string, tenantContext: TenantContext) {
    return this.clinicalClient.getClinicalSummary(patientId, tenantContext);
  }

  async listVisits(patientId: string, tenantContext: TenantContext) {
    const visits = await this.clinicalClient.listVisits(patientId, tenantContext);
    return visits.map((v) => this.clinicalAdapter.transformVisit(v));
  }

  async getVisit(visitId: string, tenantContext: TenantContext) {
    const visit = await this.clinicalClient.getVisit(visitId, tenantContext);
    return this.clinicalAdapter.transformVisit(visit);
  }

  async listTreatmentPlans(patientId: string, tenantContext: TenantContext) {
    const plans = await this.clinicalClient.listTreatmentPlans(patientId, tenantContext);
    return plans.map((p) => this.clinicalAdapter.transformTreatmentPlan(p));
  }

  async getTreatmentPlan(planId: string, tenantContext: TenantContext) {
    const plan = await this.clinicalClient.getTreatmentPlan(planId, tenantContext);
    return this.clinicalAdapter.transformTreatmentPlan(plan);
  }
}
