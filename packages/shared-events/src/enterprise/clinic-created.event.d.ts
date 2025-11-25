import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { ClinicStatus } from '@dentalos/shared-domain';
export declare const ENTERPRISE_CLINIC_CREATED_EVENT_TYPE: "dental.enterprise.clinic.created";
export declare const ENTERPRISE_CLINIC_CREATED_EVENT_VERSION = 1;
export interface EnterpriseClinicCreatedPayload {
    clinicId: ClinicId;
    organizationId: OrganizationId;
    name: string;
    code: string;
    status: ClinicStatus;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    phone: string;
    email: string;
    timezone: string;
    managerUserId?: UUID;
    managerName?: string;
    createdAt: ISODateString;
    createdBy: UUID;
}
export type EnterpriseClinicCreatedEvent = EventEnvelope<EnterpriseClinicCreatedPayload>;
export declare function isEnterpriseClinicCreatedEvent(event: EventEnvelope<unknown>): event is EnterpriseClinicCreatedEvent;
export declare function createEnterpriseClinicCreatedEvent(payload: EnterpriseClinicCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): EnterpriseClinicCreatedEvent;
