import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
export declare class TenantCreated extends DomainEvent {
    readonly tenantId: TenantId;
    readonly organizationId: OrganizationId;
    readonly organizationName: string;
    readonly ownerId: UUID;
    constructor(params: {
        aggregateId: UUID;
        tenantId: TenantId;
        organizationId: OrganizationId;
        organizationName: string;
        ownerId: UUID;
    });
}
export declare class TenantUpdated extends DomainEvent {
    readonly tenantId: TenantId;
    readonly organizationId: OrganizationId;
    readonly organizationName?: string;
    readonly updatedFields: readonly string[];
    constructor(params: {
        aggregateId: UUID;
        tenantId: TenantId;
        organizationId: OrganizationId;
        organizationName?: string;
        updatedFields: readonly string[];
    });
}
export declare class TenantDeleted extends DomainEvent {
    readonly tenantId: TenantId;
    readonly organizationId: OrganizationId;
    readonly deletedBy: UUID;
    readonly reason?: string;
    constructor(params: {
        aggregateId: UUID;
        tenantId: TenantId;
        organizationId: OrganizationId;
        deletedBy: UUID;
        reason?: string;
    });
}
export declare class ClinicCreated extends DomainEvent {
    readonly clinicId: ClinicId;
    readonly organizationId: OrganizationId;
    readonly clinicName: string;
    readonly address?: string;
    constructor(params: {
        aggregateId: UUID;
        clinicId: ClinicId;
        organizationId: OrganizationId;
        clinicName: string;
        address?: string;
    });
}
export declare class ClinicUpdated extends DomainEvent {
    readonly clinicId: ClinicId;
    readonly organizationId: OrganizationId;
    readonly clinicName?: string;
    readonly address?: string;
    readonly updatedFields: readonly string[];
    constructor(params: {
        aggregateId: UUID;
        clinicId: ClinicId;
        organizationId: OrganizationId;
        clinicName?: string;
        address?: string;
        updatedFields: readonly string[];
    });
}
export declare class ClinicDeleted extends DomainEvent {
    readonly clinicId: ClinicId;
    readonly organizationId: OrganizationId;
    readonly deletedBy: UUID;
    readonly reason?: string;
    constructor(params: {
        aggregateId: UUID;
        clinicId: ClinicId;
        organizationId: OrganizationId;
        deletedBy: UUID;
        reason?: string;
    });
}
