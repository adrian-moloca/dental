export type OrganizationId = string;
export type ClinicId = string;
export type TenantId = string;
export type IntegrationId = string;
export type ProviderId = string;
export declare enum IntegrationType {
    SMS = "SMS",
    EMAIL = "EMAIL",
    PAYMENT = "PAYMENT",
    WHATSAPP = "WHATSAPP",
    DICOM = "DICOM",
    LAB = "LAB",
    E_FACTURA = "E_FACTURA",
    WEBHOOK = "WEBHOOK"
}
export declare enum ProviderStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    FAILED = "FAILED",
    MAINTENANCE = "MAINTENANCE"
}
export declare enum IntegrationStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    RETRYING = "RETRYING"
}
export interface BaseIntegrationConfig {
    integrationId: IntegrationId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    integrationType: IntegrationType;
    providerName: string;
    status: ProviderStatus;
    credentials: Record<string, string>;
    fallbackProviderId?: ProviderId;
    maxRetries: number;
    retryDelayMs: number;
    timeoutMs: number;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IntegrationResult<T = any> {
    success: boolean;
    data?: T;
    error?: IntegrationError;
    providerId: ProviderId;
    timestamp: Date;
    correlationId: string;
    retryCount: number;
}
export interface IntegrationError {
    code: string;
    message: string;
    providerError?: any;
    isRetryable: boolean;
    timestamp: Date;
}
export interface IntegrationAuditLog {
    integrationId: IntegrationId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    integrationType: IntegrationType;
    providerName: string;
    action: string;
    status: IntegrationStatus;
    requestPayload?: any;
    responsePayload?: any;
    errorDetails?: IntegrationError;
    correlationId: string;
    userId?: string;
    timestamp: Date;
    durationMs: number;
}
