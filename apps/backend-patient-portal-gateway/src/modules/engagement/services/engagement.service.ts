import { Injectable } from '@nestjs/common';
import { MarketingServiceClient } from '@/common/http/clients/marketing-service.client';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class EngagementService {
  constructor(private readonly marketingClient: MarketingServiceClient) {}

  async getLoyalty(patientId: string, tenantContext: TenantContext) {
    return this.marketingClient.getLoyaltyInfo(patientId, tenantContext);
  }

  async getReferrals(patientId: string, tenantContext: TenantContext) {
    return this.marketingClient.getReferralInfo(patientId, tenantContext);
  }

  async getOffers(patientId: string, tenantContext: TenantContext) {
    return this.marketingClient.getOffers(patientId, tenantContext);
  }

  async submitFeedback(patientId: string, dto: any, tenantContext: TenantContext) {
    return this.marketingClient.submitFeedback(patientId, dto, tenantContext);
  }

  async submitNps(patientId: string, dto: any, tenantContext: TenantContext) {
    return this.marketingClient.submitNps(patientId, dto, tenantContext);
  }
}
