import { BaseIntegrationConfig, IntegrationResult, TenantId, OrganizationId, ClinicId } from './integration-types';
export declare enum PaymentProvider {
    STRIPE = "STRIPE",
    EUPLATESC = "EUPLATESC",
    MOBILPAY = "MOBILPAY"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    AUTHORIZED = "AUTHORIZED",
    CAPTURED = "CAPTURED",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    CANCELED = "CANCELED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}
export declare enum PaymentMethod {
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    CASH = "CASH",
    SEPA_DEBIT = "SEPA_DEBIT"
}
export interface PaymentProviderConfig extends BaseIntegrationConfig {
    provider: PaymentProvider;
    merchantId: string;
    publicKey?: string;
    webhookSecret: string;
    currency: string;
    supportedPaymentMethods: PaymentMethod[];
}
export interface CreatePaymentIntentRequest {
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    customerId?: string;
    description?: string;
    invoiceId?: string;
    patientId?: string;
    metadata?: Record<string, any>;
    correlationId: string;
}
export interface PaymentIntent {
    intentId: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    clientSecret?: string;
    checkoutUrl?: string;
    createdAt: Date;
    expiresAt?: Date;
    metadata?: Record<string, any>;
}
export interface ConfirmPaymentRequest {
    intentId: string;
    paymentMethodId?: string;
    returnUrl?: string;
}
export interface PaymentConfirmation {
    intentId: string;
    transactionId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    paidAt?: Date;
    refundedAmount?: number;
    fee?: number;
}
export interface RefundPaymentRequest {
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    transactionId: string;
    amount?: number;
    reason?: string;
    correlationId: string;
}
export interface RefundResponse {
    refundId: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    refundedAt: Date;
}
export interface WebhookEvent {
    provider: PaymentProvider;
    eventType: string;
    eventId: string;
    timestamp: Date;
    data: any;
    signature: string;
}
export interface PaymentProviderAdapter {
    createIntent(request: CreatePaymentIntentRequest): Promise<IntegrationResult<PaymentIntent>>;
    confirmPayment(request: ConfirmPaymentRequest): Promise<IntegrationResult<PaymentConfirmation>>;
    refundPayment(request: RefundPaymentRequest): Promise<IntegrationResult<RefundResponse>>;
    getPaymentStatus(intentId: string): Promise<IntegrationResult<PaymentConfirmation>>;
    verifyWebhook(event: WebhookEvent): Promise<boolean>;
}
