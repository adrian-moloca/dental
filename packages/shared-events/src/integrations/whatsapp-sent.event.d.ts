export interface WhatsAppSentEvent {
    eventType: 'integrations.whatsapp.sent';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    messageId: string;
    to: string;
    messageType: string;
    templateName?: string;
    status: string;
    sentAt: string;
    correlationId: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface WhatsAppDeliveredEvent {
    eventType: 'integrations.whatsapp.delivered';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    messageId: string;
    to: string;
    deliveredAt: string;
    correlationId: string;
    timestamp: string;
}
export interface WhatsAppReadEvent {
    eventType: 'integrations.whatsapp.read';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    messageId: string;
    to: string;
    readAt: string;
    correlationId: string;
    timestamp: string;
}
export interface WhatsAppFailedEvent {
    eventType: 'integrations.whatsapp.failed';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    messageId: string;
    to: string;
    errorCode: string;
    errorMessage: string;
    correlationId: string;
    timestamp: string;
}
