/**
 * Webhook Domain Types
 */

import {
  BaseIntegrationConfig,
  IntegrationResult,
  TenantId,
  OrganizationId,
  ClinicId,
} from './integration-types';

export enum WebhookDirection {
  OUTGOING = 'OUTGOING',
  INCOMING = 'INCOMING',
}

export enum WebhookStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export enum WebhookEventType {
  APPOINTMENT_BOOKED = 'appointment.booked',
  APPOINTMENT_CANCELED = 'appointment.canceled',
  PATIENT_CREATED = 'patient.created',
  INVOICE_ISSUED = 'invoice.issued',
  PAYMENT_RECEIVED = 'payment.received',
  TREATMENT_COMPLETED = 'treatment.completed',
  LAB_CASE_SUBMITTED = 'lab_case.submitted',
  IMAGING_STUDY_COMPLETED = 'imaging_study.completed',
  CUSTOM = 'custom',
}

export interface WebhookConfig extends BaseIntegrationConfig {
  direction: WebhookDirection;
  targetUrl?: string;
  secret: string;
  eventTypes: WebhookEventType[];
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  };
}

export interface OutgoingWebhookRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  eventType: WebhookEventType;
  payload: any;
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface OutgoingWebhookResponse {
  webhookId: string;
  status: WebhookStatus;
  sentAt: Date;
  deliveredAt?: Date;
  responseCode?: number;
  responseBody?: string;
}

export interface IncomingWebhookEvent {
  webhookId: string;
  provider: string;
  eventType: string;
  payload: any;
  signature: string;
  receivedAt: Date;
}

export interface WebhookDeliveryLog {
  webhookId: string;
  eventType: WebhookEventType;
  status: WebhookStatus;
  targetUrl: string;
  requestBody: any;
  responseCode?: number;
  responseBody?: string;
  attemptNumber: number;
  sentAt: Date;
  deliveredAt?: Date;
  errorMessage?: string;
}

export interface WebhookProviderAdapter {
  sendOutgoing(request: OutgoingWebhookRequest): Promise<IntegrationResult<OutgoingWebhookResponse>>;
  receiveIncoming(event: IncomingWebhookEvent): Promise<IntegrationResult<{ processed: boolean }>>;
  verifySignature(payload: string, signature: string, secret: string): Promise<boolean>;
  getDeliveryLogs(webhookId: string): Promise<IntegrationResult<WebhookDeliveryLog[]>>;
}
