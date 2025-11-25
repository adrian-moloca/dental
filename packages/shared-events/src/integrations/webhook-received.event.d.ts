export interface WebhookReceivedEvent {
    eventType: 'integrations.webhook.received';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    webhookId: string;
    provider: string;
    webhookEventType: string;
    payload: any;
    receivedAt: string;
    correlationId: string;
    timestamp: string;
}
export interface WebhookSentEvent {
    eventType: 'integrations.webhook.sent';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    webhookId: string;
    targetUrl: string;
    webhookEventType: string;
    status: string;
    sentAt: string;
    correlationId: string;
    timestamp: string;
}
export interface WebhookDeliveredEvent {
    eventType: 'integrations.webhook.delivered';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    webhookId: string;
    targetUrl: string;
    responseCode: number;
    deliveredAt: string;
    correlationId: string;
    timestamp: string;
}
export interface WebhookFailedEvent {
    eventType: 'integrations.webhook.failed';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    webhookId: string;
    targetUrl: string;
    webhookEventType: string;
    errorCode: string;
    errorMessage: string;
    attemptNumber: number;
    correlationId: string;
    timestamp: string;
}
export interface WebhookRetryingEvent {
    eventType: 'integrations.webhook.retrying';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    webhookId: string;
    targetUrl: string;
    attemptNumber: number;
    nextRetryAt: string;
    correlationId: string;
    timestamp: string;
}
