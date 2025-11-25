/**
 * Marketing Service Client
 *
 * Client for making requests to the backend-marketing-service microservice.
 *
 * @module common/http/clients/marketing-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface LoyaltyInfo {
  patientId: string;
  tier: string;
  points: number;
  lifetimePoints: number;
  pointsToNextTier?: number;
  history: Array<{
    transactionId: string;
    date: string;
    type: string;
    points: number;
    description: string;
  }>;
}

export interface ReferralInfo {
  patientId: string;
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  successfulReferrals: number;
  referrals: Array<{
    referralId: string;
    referredEmail: string;
    status: string;
    referredAt: string;
    convertedAt?: string;
  }>;
}

export interface Offer {
  offerId: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  status: string;
  conditions?: string;
}

export interface SubmitFeedbackDto {
  category: string;
  subject: string;
  message: string;
  rating?: number;
}

export interface SubmitNpsDto {
  score: number;
  comment?: string;
}

@Injectable()
export class MarketingServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.marketingServiceUrl', {
      infer: true,
    });
  }

  /**
   * Get loyalty info for patient
   */
  async getLoyaltyInfo(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<LoyaltyInfo> {
    return this.httpClient.get<LoyaltyInfo>(
      this.baseUrl,
      `/api/loyalty/patients/${patientId}`,
      tenantContext,
    );
  }

  /**
   * Get referral info for patient
   */
  async getReferralInfo(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<ReferralInfo> {
    return this.httpClient.get<ReferralInfo>(
      this.baseUrl,
      `/api/referrals/patients/${patientId}`,
      tenantContext,
    );
  }

  /**
   * Get personalized offers for patient
   */
  async getOffers(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<Offer[]> {
    return this.httpClient.get<Offer[]>(
      this.baseUrl,
      `/api/campaigns/patients/${patientId}/offers`,
      tenantContext,
    );
  }

  /**
   * Submit feedback
   */
  async submitFeedback(
    patientId: string,
    dto: SubmitFeedbackDto,
    tenantContext: TenantContext,
  ): Promise<any> {
    return this.httpClient.post<any>(
      this.baseUrl,
      `/api/feedback`,
      tenantContext,
      { ...dto, patientId },
    );
  }

  /**
   * Submit NPS score
   */
  async submitNps(
    patientId: string,
    dto: SubmitNpsDto,
    tenantContext: TenantContext,
  ): Promise<any> {
    return this.httpClient.post<any>(
      this.baseUrl,
      `/api/nps`,
      tenantContext,
      { ...dto, patientId },
    );
  }
}
