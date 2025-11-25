import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE: "dental.enterprise.staff.assigned";
export declare const ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION = 1;
export interface EnterpriseStaffAssignedPayload {
    assignmentId: UUID;
    providerId: UUID;
    clinicId: ClinicId;
    organizationId: OrganizationId;
    roles: string[];
    isPrimaryClinic: boolean;
    assignedAt: ISODateString;
    assignedBy: UUID;
}
export type EnterpriseStaffAssignedEvent = EventEnvelope<EnterpriseStaffAssignedPayload>;
export declare function isEnterpriseStaffAssignedEvent(event: EventEnvelope<unknown>): event is EnterpriseStaffAssignedEvent;
export declare function createEnterpriseStaffAssignedEvent(payload: EnterpriseStaffAssignedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): EnterpriseStaffAssignedEvent;
