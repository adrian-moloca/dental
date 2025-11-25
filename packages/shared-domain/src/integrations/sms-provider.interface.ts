/**
 * SMS Provider Domain Types
 */

import {
  BaseIntegrationConfig,
  IntegrationResult,
  TenantId,
  OrganizationId,
  ClinicId,
} from './integration-types';

export enum SmsProvider {
  TWILIO = 'TWILIO',
  NEXMO = 'NEXMO',
}

export enum SmsStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  UNDELIVERED = 'UNDELIVERED',
}

export interface SmsProviderConfig extends BaseIntegrationConfig {
  provider: SmsProvider;
  fromNumber: string;
  enableDeliveryReports: boolean;
  maxMessageLength: number;
}

export interface SendSmsRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  to: string;
  message: string;
  fromNumber?: string;
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface SendSmsResponse {
  messageId: string;
  status: SmsStatus;
  provider: SmsProvider;
  sentAt: Date;
  deliveredAt?: Date;
  cost?: number;
  currency?: string;
}

export interface SmsDeliveryReport {
  messageId: string;
  status: SmsStatus;
  providerId: string;
  errorCode?: string;
  errorMessage?: string;
  deliveredAt?: Date;
  timestamp: Date;
}

export interface SmsProviderAdapter {
  send(request: SendSmsRequest): Promise<IntegrationResult<SendSmsResponse>>;
  getDeliveryStatus(messageId: string): Promise<IntegrationResult<SmsDeliveryReport>>;
  validatePhoneNumber(phoneNumber: string): Promise<boolean>;
}
