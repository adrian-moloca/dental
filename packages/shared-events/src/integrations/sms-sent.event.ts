export interface SmsSentEvent {
  eventType: 'integrations.sms.sent';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string;
  message: string;
  status: string;
  sentAt: string;
  cost?: number;
  currency?: string;
  correlationId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SmsDeliveredEvent {
  eventType: 'integrations.sms.delivered';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string;
  deliveredAt: string;
  correlationId: string;
  timestamp: string;
}

export interface SmsFailedEvent {
  eventType: 'integrations.sms.failed';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string;
  errorCode: string;
  errorMessage: string;
  correlationId: string;
  timestamp: string;
}
