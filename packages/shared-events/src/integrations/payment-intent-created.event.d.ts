export interface PaymentIntentCreatedEvent {
    eventType: 'integrations.payment.intent.created';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    intentId: string;
    provider: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    customerId?: string;
    invoiceId?: string;
    patientId?: string;
    clientSecret?: string;
    checkoutUrl?: string;
    status: string;
    createdAt: string;
    correlationId: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface PaymentConfirmedEvent {
    eventType: 'integrations.payment.confirmed';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    intentId: string;
    transactionId: string;
    provider: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    customerId?: string;
    invoiceId?: string;
    patientId?: string;
    paidAt: string;
    fee?: number;
    correlationId: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface PaymentFailedEvent {
    eventType: 'integrations.payment.failed';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    intentId: string;
    provider: string;
    amount: number;
    currency: string;
    errorCode: string;
    errorMessage: string;
    correlationId: string;
    timestamp: string;
}
export interface PaymentRefundedEvent {
    eventType: 'integrations.payment.refunded';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    refundId: string;
    transactionId: string;
    provider: string;
    amount: number;
    currency: string;
    reason?: string;
    refundedAt: string;
    correlationId: string;
    timestamp: string;
}
