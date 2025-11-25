import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE = 'dental.enterprise.staff.assigned' as const;
export const ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION = 1;

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

export function isEnterpriseStaffAssignedEvent(event: EventEnvelope<unknown>): event is EnterpriseStaffAssignedEvent {
  return event.type === ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE;
}

export function createEnterpriseStaffAssignedEvent(
  payload: EnterpriseStaffAssignedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): EnterpriseStaffAssignedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE,
    version: ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION,
    payload,
    metadata,
    tenantContext,
    occurredAt: new Date(),
  };
}
