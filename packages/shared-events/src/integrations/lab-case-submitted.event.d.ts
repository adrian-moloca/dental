export interface LabCaseSubmittedEvent {
    eventType: 'integrations.lab.case.submitted';
    tenantId: string;
    organizationId: string;
    clinicId: string;
    externalCaseId: string;
    internalCaseId: string;
    labName: string;
    labType: string;
    patientId: string;
    providerId: string;
    priority: string;
    estimatedDeliveryDate?: string;
    submittedAt: string;
    correlationId: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface LabCaseStatusUpdatedEvent {
    eventType: 'integrations.lab.case.status.updated';
    tenantId: string;
    organizationId: string;
    clinicId: string;
    externalCaseId: string;
    internalCaseId: string;
    labName: string;
    previousStatus: string;
    newStatus: string;
    statusUpdatedAt: string;
    trackingNumber?: string;
    notes?: string;
    correlationId: string;
    timestamp: string;
}
export interface LabCaseDeliveredEvent {
    eventType: 'integrations.lab.case.delivered';
    tenantId: string;
    organizationId: string;
    clinicId: string;
    externalCaseId: string;
    internalCaseId: string;
    labName: string;
    deliveredAt: string;
    trackingNumber?: string;
    correlationId: string;
    timestamp: string;
}
export interface LabCaseFailedEvent {
    eventType: 'integrations.lab.case.failed';
    tenantId: string;
    organizationId: string;
    clinicId: string;
    externalCaseId?: string;
    internalCaseId: string;
    labName: string;
    errorCode: string;
    errorMessage: string;
    correlationId: string;
    timestamp: string;
}
