import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { ClinicalLogisticsTaskType } from '@dentalos/shared-domain';

export const CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE = 'dental.clinical.room.prep.required' as const;
export const CLINICAL_ROOM_PREP_REQUIRED_EVENT_VERSION = 1;

export interface ClinicalRoomPrepRequiredPayload {
  taskId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  taskType: ClinicalLogisticsTaskType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  roomId?: string;
  roomName?: string;

  appointmentId?: UUID;
  procedureId?: UUID;

  dueAt?: ISODateString;
  assigneeId?: UUID;

  createdAt: ISODateString;
  createdBy: UUID;
}

export type ClinicalRoomPrepRequiredEvent = EventEnvelope<ClinicalRoomPrepRequiredPayload>;

export function isClinicalRoomPrepRequiredEvent(event: EventEnvelope<unknown>): event is ClinicalRoomPrepRequiredEvent {
  return event.type === CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE;
}

export function createClinicalRoomPrepRequiredEvent(
  payload: ClinicalRoomPrepRequiredPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ClinicalRoomPrepRequiredEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE,
    version: CLINICAL_ROOM_PREP_REQUIRED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
