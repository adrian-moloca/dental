export interface EmailSentEvent {
  eventType: 'integrations.email.sent';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string[];
  subject: string;
  status: string;
  sentAt: string;
  correlationId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EmailDeliveredEvent {
  eventType: 'integrations.email.delivered';
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

export interface EmailOpenedEvent {
  eventType: 'integrations.email.opened';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string;
  openedAt: string;
  correlationId: string;
  timestamp: string;
}

export interface EmailClickedEvent {
  eventType: 'integrations.email.clicked';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string;
  clickedUrl: string;
  clickedAt: string;
  correlationId: string;
  timestamp: string;
}

export interface EmailBouncedEvent {
  eventType: 'integrations.email.bounced';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string;
  bounceType: string;
  bounceReason: string;
  bouncedAt: string;
  correlationId: string;
  timestamp: string;
}

export interface EmailFailedEvent {
  eventType: 'integrations.email.failed';
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  messageId: string;
  provider: string;
  to: string[];
  errorCode: string;
  errorMessage: string;
  correlationId: string;
  timestamp: string;
}
