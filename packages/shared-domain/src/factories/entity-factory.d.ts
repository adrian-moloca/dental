import type { UUID, ISODateString } from '@dentalos/shared-types';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';
export interface TenantContext {
    organizationId: OrganizationId;
    clinicId?: ClinicId;
}
export interface EntityCreationOptions {
    id?: UUID;
    createdAt?: ISODateString;
    updatedAt?: ISODateString;
}
export interface BaseEntityFields {
    id: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId | undefined;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export declare class EntityFactory {
    static generateId(): UUID;
    static getCurrentTimestamp(): ISODateString;
    static createBaseFields(tenantContext: TenantContext, options?: EntityCreationOptions): BaseEntityFields;
    static createNewEntity(tenantContext: TenantContext, id?: UUID): BaseEntityFields;
    static createExistingEntity(id: UUID, tenantContext: TenantContext, createdAt: ISODateString, updatedAt: ISODateString): BaseEntityFields;
    private static validateTenantContext;
    static validateUUID(id: string, paramName?: string): void;
    static validateISODateString(date: string, paramName?: string): void;
}
