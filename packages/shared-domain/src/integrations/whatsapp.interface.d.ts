import { BaseIntegrationConfig, IntegrationResult, TenantId, OrganizationId, ClinicId } from './integration-types';
export declare enum WhatsAppMessageType {
    TEXT = "TEXT",
    TEMPLATE = "TEMPLATE",
    IMAGE = "IMAGE",
    DOCUMENT = "DOCUMENT"
}
export declare enum WhatsAppMessageStatus {
    QUEUED = "QUEUED",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED"
}
export declare enum WhatsAppTemplateCategory {
    APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
    APPOINTMENT_CONFIRMATION = "APPOINTMENT_CONFIRMATION",
    PAYMENT_REMINDER = "PAYMENT_REMINDER",
    TREATMENT_FOLLOWUP = "TREATMENT_FOLLOWUP",
    MARKETING = "MARKETING"
}
export interface WhatsAppProviderConfig extends BaseIntegrationConfig {
    phoneNumberId: string;
    businessAccountId: string;
    apiVersion: string;
}
export interface WhatsAppTemplateParameter {
    type: 'text' | 'currency' | 'date_time';
    text?: string;
    currency?: {
        fallback_value: string;
        code: string;
        amount_1000: number;
    };
    date_time?: {
        fallback_value: string;
    };
}
export interface WhatsAppTemplate {
    templateId: string;
    name: string;
    language: string;
    category: WhatsAppTemplateCategory;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    components: {
        type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
        text?: string;
        parameters?: WhatsAppTemplateParameter[];
    }[];
}
export interface SendWhatsAppMessageRequest {
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    to: string;
    messageType: WhatsAppMessageType;
    templateName?: string;
    templateLanguage?: string;
    templateParameters?: WhatsAppTemplateParameter[];
    textMessage?: string;
    mediaUrl?: string;
    correlationId: string;
    metadata?: Record<string, any>;
}
export interface SendWhatsAppMessageResponse {
    messageId: string;
    status: WhatsAppMessageStatus;
    sentAt: Date;
    deliveredAt?: Date;
    readAt?: Date;
}
export interface WhatsAppDeliveryReport {
    messageId: string;
    status: WhatsAppMessageStatus;
    errorCode?: string;
    errorMessage?: string;
    deliveredAt?: Date;
    readAt?: Date;
    timestamp: Date;
}
export interface WhatsAppProviderAdapter {
    sendMessage(request: SendWhatsAppMessageRequest): Promise<IntegrationResult<SendWhatsAppMessageResponse>>;
    getTemplates(): Promise<IntegrationResult<WhatsAppTemplate[]>>;
    getDeliveryStatus(messageId: string): Promise<IntegrationResult<WhatsAppDeliveryReport>>;
}
