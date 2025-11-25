import { ChangeOperation } from '@dentalos/shared-domain';
export interface ChangeLogCreatedEvent {
    eventType: 'offline-sync.changelog.created';
    changeId: string;
    sequenceNumber: number;
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    entityType: string;
    entityId: string;
    operation: ChangeOperation;
    sourceDeviceId?: string;
    eventId?: string;
    createdAt: string;
    timestamp: string;
    correlationId?: string;
}
