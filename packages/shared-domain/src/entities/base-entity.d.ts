import type { UUID, ISODateString, BaseEntity as IBaseEntity } from '@dentalos/shared-types';
import type { OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
export declare abstract class BaseEntity implements IBaseEntity {
    private readonly _id;
    private readonly _organizationId;
    private readonly _clinicId;
    private readonly _tenantId;
    private readonly _createdAt;
    private _updatedAt;
    protected constructor(id: UUID, organizationId: OrganizationId, clinicId: ClinicId | undefined, createdAt?: ISODateString, updatedAt?: ISODateString);
    get id(): UUID;
    get organizationId(): OrganizationId;
    get clinicId(): ClinicId | undefined;
    get tenantId(): TenantId;
    get createdAt(): ISODateString;
    get updatedAt(): ISODateString;
    protected touch(): void;
    equals(other: BaseEntity | null | undefined): boolean;
    belongsToOrganization(organizationId: OrganizationId): boolean;
    belongsToClinic(clinicId: ClinicId): boolean;
    isInTenantScope(organizationId: OrganizationId, clinicId?: ClinicId): boolean;
    private validateId;
    private validateOrganizationId;
    private validateClinicId;
}
