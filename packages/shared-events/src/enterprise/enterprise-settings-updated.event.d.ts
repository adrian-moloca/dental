import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE: "dental.enterprise.settings.updated";
export declare const ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION = 1;
export interface EnterpriseSettingsUpdatedPayload {
    entityType: 'ORGANIZATION' | 'CLINIC';
    entityId: OrganizationId | ClinicId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    settingsChanged: string[];
    previousValues: Record<string, any>;
    newValues: Record<string, any>;
    updatedAt: ISODateString;
    updatedBy: UUID;
}
export type EnterpriseSettingsUpdatedEvent = EventEnvelope<EnterpriseSettingsUpdatedPayload>;
export declare function isEnterpriseSettingsUpdatedEvent(event: EventEnvelope<unknown>): event is EnterpriseSettingsUpdatedEvent;
export declare function createEnterpriseSettingsUpdatedEvent(payload: EnterpriseSettingsUpdatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): EnterpriseSettingsUpdatedEvent;
