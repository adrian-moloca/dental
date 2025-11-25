import { ISODateString, UUID, Nullable } from './common.types';
import { TenantScoped } from './multi-tenant.types';
export interface BaseEntity {
    id: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export interface SoftDeletable {
    deletedAt: Nullable<ISODateString>;
    deletedBy?: Nullable<UUID>;
}
export interface Auditable {
    createdBy: UUID;
    updatedBy: UUID;
}
export interface Versionable {
    version: number;
}
export interface FullBaseEntity extends BaseEntity, SoftDeletable, Auditable, Versionable {
}
export interface TenantEntity extends BaseEntity, TenantScoped {
}
export interface FullTenantEntity extends BaseEntity, TenantScoped, SoftDeletable, Auditable, Versionable {
}
export interface EntityMetadata {
    entityType: string;
    schemaVersion: string;
    customData?: Record<string, unknown>;
}
export interface EntityWithMetadata extends BaseEntity {
    metadata: EntityMetadata;
}
export declare enum EntityStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ARCHIVED = "ARCHIVED",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED"
}
export interface EntityLifecycle {
    status: EntityStatus;
    statusChangedAt: ISODateString;
    statusChangedBy: UUID;
    statusChangeReason?: string;
}
export interface TimestampedEntity {
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export interface EntityReference<T extends string = string> {
    id: UUID;
    type: T;
    name?: string;
}
export interface EntityChange<T = unknown> {
    field: string;
    oldValue: Nullable<T>;
    newValue: Nullable<T>;
    changedAt: ISODateString;
    changedBy: UUID;
}
export interface EntityWithHistory<T = unknown> extends BaseEntity {
    changeHistory: EntityChange<T>[];
}
export interface EntityTag {
    key: string;
    value: string;
}
export interface Taggable {
    tags: EntityTag[];
}
