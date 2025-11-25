import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
export declare class AppointmentBooked extends DomainEvent {
    readonly appointmentId: UUID;
    readonly patientId: UUID;
    readonly providerId: UUID;
    readonly scheduledAt: ISODateString;
    readonly duration: number;
    readonly appointmentType: string;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    constructor(params: {
        aggregateId: UUID;
        appointmentId: UUID;
        patientId: UUID;
        providerId: UUID;
        scheduledAt: ISODateString;
        duration: number;
        appointmentType: string;
        organizationId: OrganizationId;
        clinicId: ClinicId;
    });
}
export declare class AppointmentRescheduled extends DomainEvent {
    readonly appointmentId: UUID;
    readonly patientId: UUID;
    readonly providerId: UUID;
    readonly previousScheduledAt: ISODateString;
    readonly newScheduledAt: ISODateString;
    readonly duration: number;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly rescheduledBy: UUID;
    readonly reason?: string;
    constructor(params: {
        aggregateId: UUID;
        appointmentId: UUID;
        patientId: UUID;
        providerId: UUID;
        previousScheduledAt: ISODateString;
        newScheduledAt: ISODateString;
        duration: number;
        organizationId: OrganizationId;
        clinicId: ClinicId;
        rescheduledBy: UUID;
        reason?: string;
    });
}
export declare class AppointmentCancelled extends DomainEvent {
    readonly appointmentId: UUID;
    readonly patientId: UUID;
    readonly providerId: UUID;
    readonly scheduledAt: ISODateString;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly cancelledBy: UUID;
    readonly reason?: string;
    readonly cancellationType: 'patient' | 'provider' | 'system' | 'no_show';
    constructor(params: {
        aggregateId: UUID;
        appointmentId: UUID;
        patientId: UUID;
        providerId: UUID;
        scheduledAt: ISODateString;
        organizationId: OrganizationId;
        clinicId: ClinicId;
        cancelledBy: UUID;
        reason?: string;
        cancellationType: 'patient' | 'provider' | 'system' | 'no_show';
    });
}
export declare class AppointmentCompleted extends DomainEvent {
    readonly appointmentId: UUID;
    readonly patientId: UUID;
    readonly providerId: UUID;
    readonly scheduledAt: ISODateString;
    readonly completedAt: ISODateString;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly completedBy: UUID;
    readonly notes?: string;
    constructor(params: {
        aggregateId: UUID;
        appointmentId: UUID;
        patientId: UUID;
        providerId: UUID;
        scheduledAt: ISODateString;
        completedAt: ISODateString;
        organizationId: OrganizationId;
        clinicId: ClinicId;
        completedBy: UUID;
        notes?: string;
    });
}
