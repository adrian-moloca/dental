import { BaseIntegrationConfig, IntegrationResult, TenantId, OrganizationId, ClinicId } from './integration-types';
export declare enum EmailProvider {
    SENDGRID = "SENDGRID",
    SMTP = "SMTP"
}
export declare enum EmailStatus {
    QUEUED = "QUEUED",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    OPENED = "OPENED",
    CLICKED = "CLICKED",
    BOUNCED = "BOUNCED",
    SPAM = "SPAM",
    FAILED = "FAILED"
}
export interface EmailProviderConfig extends BaseIntegrationConfig {
    provider: EmailProvider;
    fromEmail: string;
    fromName: string;
    replyToEmail?: string;
    enableTracking: boolean;
    enableClickTracking: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
}
export interface EmailAttachment {
    filename: string;
    content: string | Uint8Array;
    contentType: string;
    encoding?: string;
}
export interface SendEmailRequest {
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    htmlBody: string;
    textBody?: string;
    fromEmail?: string;
    fromName?: string;
    replyTo?: string;
    attachments?: EmailAttachment[];
    templateId?: string;
    templateData?: Record<string, any>;
    correlationId: string;
    metadata?: Record<string, any>;
}
export interface SendEmailResponse {
    messageId: string;
    status: EmailStatus;
    provider: EmailProvider;
    sentAt: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
}
export interface EmailDeliveryReport {
    messageId: string;
    status: EmailStatus;
    providerId: string;
    errorCode?: string;
    errorMessage?: string;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    timestamp: Date;
}
export interface EmailProviderAdapter {
    send(request: SendEmailRequest): Promise<IntegrationResult<SendEmailResponse>>;
    getDeliveryStatus(messageId: string): Promise<IntegrationResult<EmailDeliveryReport>>;
    validateEmail(email: string): Promise<boolean>;
}
