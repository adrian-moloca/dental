export interface EFacturaSubmittedEvent {
    eventType: 'integrations.efactura.submitted';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    submissionId: string;
    downloadId: string;
    invoiceNumber: string;
    documentType: string;
    customerCui: string;
    totalAmount: number;
    currency: string;
    submittedAt: string;
    correlationId: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface EFacturaAcceptedEvent {
    eventType: 'integrations.efactura.accepted';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    submissionId: string;
    downloadId: string;
    invoiceNumber: string;
    acceptedAt: string;
    correlationId: string;
    timestamp: string;
}
export interface EFacturaRejectedEvent {
    eventType: 'integrations.efactura.rejected';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    submissionId: string;
    downloadId: string;
    invoiceNumber: string;
    rejectionReason: string;
    validationErrors?: string[];
    rejectedAt: string;
    correlationId: string;
    timestamp: string;
}
export interface EFacturaCanceledEvent {
    eventType: 'integrations.efactura.canceled';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    submissionId: string;
    downloadId: string;
    invoiceNumber: string;
    reason: string;
    canceledAt: string;
    correlationId: string;
    timestamp: string;
}
