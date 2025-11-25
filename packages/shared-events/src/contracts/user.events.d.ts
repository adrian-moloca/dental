import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
export declare class UserCreated extends DomainEvent {
    readonly userId: UUID;
    readonly email: string;
    readonly roles: readonly string[];
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    constructor(params: {
        aggregateId: UUID;
        userId: UUID;
        email: string;
        roles: readonly string[];
        organizationId: OrganizationId;
        clinicId?: ClinicId;
    });
}
export declare class UserUpdated extends DomainEvent {
    readonly userId: UUID;
    readonly email?: string;
    readonly roles?: readonly string[];
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly updatedFields: readonly string[];
    constructor(params: {
        aggregateId: UUID;
        userId: UUID;
        email?: string;
        roles?: readonly string[];
        organizationId: OrganizationId;
        clinicId?: ClinicId;
        updatedFields: readonly string[];
    });
}
export declare class UserDeleted extends DomainEvent {
    readonly userId: UUID;
    readonly email: string;
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly deletedBy?: UUID;
    readonly reason?: string;
    constructor(params: {
        aggregateId: UUID;
        userId: UUID;
        email: string;
        organizationId: OrganizationId;
        clinicId?: ClinicId;
        deletedBy?: UUID;
        reason?: string;
    });
}
