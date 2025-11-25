/**
 * Base entity interfaces and types for domain models
 * @module shared-types/entity
 */

import { ISODateString, UUID, Nullable } from './common.types';
import { TenantScoped } from './multi-tenant.types';

/**
 * Base entity interface
 * All domain entities should extend this interface
 */
export interface BaseEntity {
  /** Unique identifier */
  id: UUID;
  /** Creation timestamp (ISO 8601) */
  createdAt: ISODateString;
  /** Last update timestamp (ISO 8601) */
  updatedAt: ISODateString;
}

/**
 * Soft-deletable entity interface
 * Entities that support soft deletion
 */
export interface SoftDeletable {
  /** Soft deletion timestamp (null if not deleted) */
  deletedAt: Nullable<ISODateString>;
  /** ID of user who performed soft deletion */
  deletedBy?: Nullable<UUID>;
}

/**
 * Auditable entity interface
 * Tracks who created and last modified the entity
 */
export interface Auditable {
  /** ID of user who created the entity */
  createdBy: UUID;
  /** ID of user who last updated the entity */
  updatedBy: UUID;
}

/**
 * Versionable entity interface
 * Supports optimistic locking and version tracking
 */
export interface Versionable {
  /** Version number for optimistic locking */
  version: number;
}

/**
 * Full base entity with all tracking capabilities
 * Combines base entity, soft delete, audit, and version tracking
 */
export interface FullBaseEntity
  extends BaseEntity,
    SoftDeletable,
    Auditable,
    Versionable {}

/**
 * Multi-tenant entity
 * Combines base entity with tenant scoping
 */
export interface TenantEntity extends BaseEntity, TenantScoped {}

/**
 * Full multi-tenant entity
 * Combines all entity interfaces with tenant scoping
 */
export interface FullTenantEntity
  extends BaseEntity,
    TenantScoped,
    SoftDeletable,
    Auditable,
    Versionable {}

/**
 * Entity metadata
 * Additional metadata that can be attached to entities
 */
export interface EntityMetadata {
  /** Entity type identifier */
  entityType: string;
  /** Entity schema version */
  schemaVersion: string;
  /** Custom metadata */
  customData?: Record<string, unknown>;
}

/**
 * Entity with metadata
 */
export interface EntityWithMetadata extends BaseEntity {
  /** Entity metadata */
  metadata: EntityMetadata;
}

/**
 * Entity status lifecycle
 */
export enum EntityStatus {
  /** Entity is in draft state */
  DRAFT = 'DRAFT',
  /** Entity is active and operational */
  ACTIVE = 'ACTIVE',
  /** Entity is inactive but not deleted */
  INACTIVE = 'INACTIVE',
  /** Entity is archived */
  ARCHIVED = 'ARCHIVED',
  /** Entity is pending approval */
  PENDING = 'PENDING',
  /** Entity is suspended */
  SUSPENDED = 'SUSPENDED',
}

/**
 * Entity lifecycle state
 */
export interface EntityLifecycle {
  /** Current status */
  status: EntityStatus;
  /** Status change timestamp */
  statusChangedAt: ISODateString;
  /** User who changed the status */
  statusChangedBy: UUID;
  /** Optional reason for status change */
  statusChangeReason?: string;
}

/**
 * Timestamped entity
 * Minimal entity with only timestamp tracking
 */
export interface TimestampedEntity {
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
}

/**
 * Entity reference
 * Lightweight reference to another entity
 */
export interface EntityReference<T extends string = string> {
  /** Entity ID */
  id: UUID;
  /** Entity type */
  type: T;
  /** Optional display name */
  name?: string;
}

/**
 * Entity change record
 * Tracks changes to entity fields
 */
export interface EntityChange<T = unknown> {
  /** Field that was changed */
  field: string;
  /** Previous value */
  oldValue: Nullable<T>;
  /** New value */
  newValue: Nullable<T>;
  /** Timestamp of change */
  changedAt: ISODateString;
  /** User who made the change */
  changedBy: UUID;
}

/**
 * Entity with change history
 */
export interface EntityWithHistory<T = unknown> extends BaseEntity {
  /** Change history */
  changeHistory: EntityChange<T>[];
}

/**
 * Entity tag for categorization
 */
export interface EntityTag {
  /** Tag key */
  key: string;
  /** Tag value */
  value: string;
}

/**
 * Taggable entity
 */
export interface Taggable {
  /** Entity tags */
  tags: EntityTag[];
}
