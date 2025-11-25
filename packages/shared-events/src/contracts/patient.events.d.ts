import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
export declare class PatientCreated extends DomainEvent {
    readonly patientId: UUID;
    readonly firstName: string;
    readonly lastName: string;
    readonly email?: string;
    readonly phone?: string;
    readonly dateOfBirth?: ISODateString;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    constructor(params: {
        aggregateId: UUID;
        patientId: UUID;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        dateOfBirth?: ISODateString;
        organizationId: OrganizationId;
        clinicId: ClinicId;
    });
}
export declare class PatientUpdated extends DomainEvent {
    readonly patientId: UUID;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly email?: string;
    readonly phone?: string;
    readonly dateOfBirth?: ISODateString;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly updatedFields: readonly string[];
    constructor(params: {
        aggregateId: UUID;
        patientId: UUID;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        dateOfBirth?: ISODateString;
        organizationId: OrganizationId;
        clinicId: ClinicId;
        updatedFields: readonly string[];
    });
}
export declare class PatientDeleted extends DomainEvent {
    readonly patientId: UUID;
    readonly firstName: string;
    readonly lastName: string;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly deletedBy: UUID;
    readonly reason?: string;
    constructor(params: {
        aggregateId: UUID;
        patientId: UUID;
        firstName: string;
        lastName: string;
        organizationId: OrganizationId;
        clinicId: ClinicId;
        deletedBy: UUID;
        reason?: string;
    });
}
