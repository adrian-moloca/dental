import type { LabCaseId, LabCaseStatus, LabCaseType } from './sterilization-types';
export interface LabCase {
    id: LabCaseId;
    tenantId: string;
    organizationId: string;
    clinicId: string;
    caseNumber: string;
    type: LabCaseType;
    status: LabCaseStatus;
    patientId: string;
    providerId: string;
    treatmentPlanId?: string;
    appointmentId?: string;
    labId?: string;
    labName?: string;
    labContactEmail?: string;
    labContactPhone?: string;
    description: string;
    specifications?: string;
    shadeGuide?: string;
    toothNumbers?: string[];
    impressionDate?: Date;
    sentToLabAt?: Date;
    expectedReturnDate?: Date;
    receivedFromLabAt?: Date;
    completedAt?: Date;
    courierTrackingNumber?: string;
    courierService?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
    notes?: string;
    attachmentUrls?: string[];
    estimatedCost?: number;
    actualCost?: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
export interface LabCaseEvent {
    id: string;
    labCaseId: LabCaseId;
    eventType: string;
    eventDate: Date;
    description: string;
    performedBy: string;
    metadata?: Record<string, any>;
}
