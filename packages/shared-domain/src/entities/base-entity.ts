/**
 * Base Entity class for all domain entities
 *
 * Entities are domain objects with a unique identity that persists over time.
 * Unlike value objects, entities are distinguished by their ID, not their attributes.
 *
 * This base class provides:
 * - Unique identification (UUID)
 * - Multi-tenant isolation (organizationId, clinicId, tenantId)
 * - Timestamp tracking (createdAt, updatedAt)
 * - Identity-based equality
 *
 * @module shared-domain/entities
 *
 * @example
 * ```typescript
 * class Patient extends BaseEntity {
 *   constructor(
 *     id: UUID,
 *     organizationId: OrganizationId,
 *     clinicId: ClinicId,
 *     private readonly name: PersonName,
 *     private readonly email: Email
 *   ) {
 *     super(id, organizationId, clinicId);
 *   }
 * }
 * ```
 */

import type {
  UUID,
  ISODateString,
  BaseEntity as IBaseEntity,
} from '@dentalos/shared-types';
import type {
  OrganizationId,
  ClinicId,
  TenantId,
} from '@dentalos/shared-types';

/**
 * Base Entity implementation
 *
 * All domain entities should extend this class to ensure:
 * - Unique identification
 * - Multi-tenant data isolation
 * - Proper timestamp tracking
 * - Immutable ID after construction
 */
export abstract class BaseEntity implements IBaseEntity {
  private readonly _id: UUID;
  private readonly _organizationId: OrganizationId;
  private readonly _clinicId: ClinicId | undefined;
  private readonly _tenantId: TenantId;
  private readonly _createdAt: ISODateString;
  private _updatedAt: ISODateString;

  /**
   * Creates a new entity instance
   *
   * @param id - Unique entity identifier (UUID v4)
   * @param organizationId - Organization this entity belongs to
   * @param clinicId - Optional clinic scope for clinic-specific entities
   * @param createdAt - Creation timestamp (defaults to current time)
   * @param updatedAt - Last update timestamp (defaults to current time)
   *
   * @throws {Error} If id, organizationId, or timestamps are invalid
   */
  protected constructor(
    id: UUID,
    organizationId: OrganizationId,
    clinicId: ClinicId | undefined,
    createdAt?: ISODateString,
    updatedAt?: ISODateString
  ) {
    // Validate required fields
    this.validateId(id);
    this.validateOrganizationId(organizationId);

    if (clinicId !== undefined) {
      this.validateClinicId(clinicId);
    }

    // Initialize immutable fields
    this._id = id;
    this._organizationId = organizationId;
    this._clinicId = clinicId;
    this._tenantId = (clinicId || organizationId) as unknown as TenantId;

    // Initialize timestamps
    const now = new Date().toISOString() as ISODateString;
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;

    // Validate timestamp order
    if (new Date(this._updatedAt) < new Date(this._createdAt)) {
      throw new Error('updatedAt cannot be earlier than createdAt');
    }
  }

  /**
   * Gets the unique identifier of this entity
   * @readonly
   */
  public get id(): UUID {
    return this._id;
  }

  /**
   * Gets the organization ID this entity belongs to
   * @readonly
   */
  public get organizationId(): OrganizationId {
    return this._organizationId;
  }

  /**
   * Gets the clinic ID if this entity is clinic-scoped
   * @readonly
   */
  public get clinicId(): ClinicId | undefined {
    return this._clinicId;
  }

  /**
   * Gets the effective tenant ID (clinic ID if present, otherwise organization ID)
   * @readonly
   */
  public get tenantId(): TenantId {
    return this._tenantId;
  }

  /**
   * Gets the creation timestamp
   * @readonly
   */
  public get createdAt(): ISODateString {
    return this._createdAt;
  }

  /**
   * Gets the last update timestamp
   * @readonly
   */
  public get updatedAt(): ISODateString {
    return this._updatedAt;
  }

  /**
   * Updates the updatedAt timestamp to the current time
   *
   * Call this method whenever the entity is modified to maintain
   * accurate timestamp tracking.
   *
   * @protected
   */
  protected touch(): void {
    this._updatedAt = new Date().toISOString() as ISODateString;
  }

  /**
   * Compares this entity with another for equality
   *
   * Two entities are considered equal if they have the same ID,
   * regardless of their other attributes.
   *
   * @param other - The entity to compare with
   * @returns true if the entities have the same ID, false otherwise
   */
  public equals(other: BaseEntity | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (!(other instanceof BaseEntity)) {
      return false;
    }

    // Entities are equal if they have the same ID
    return this._id === other._id;
  }

  /**
   * Checks if this entity belongs to the specified organization
   *
   * @param organizationId - The organization ID to check
   * @returns true if the entity belongs to the organization
   */
  public belongsToOrganization(organizationId: OrganizationId): boolean {
    return this._organizationId === organizationId;
  }

  /**
   * Checks if this entity belongs to the specified clinic
   *
   * @param clinicId - The clinic ID to check
   * @returns true if the entity belongs to the clinic
   */
  public belongsToClinic(clinicId: ClinicId): boolean {
    return this._clinicId === clinicId;
  }

  /**
   * Checks if this entity is within the specified tenant scope
   *
   * An entity is in scope if:
   * - It belongs to the specified organization, AND
   * - If a clinic ID is provided, it belongs to that clinic or is organization-scoped
   *
   * @param organizationId - The organization ID to check
   * @param clinicId - Optional clinic ID to check
   * @returns true if the entity is within the tenant scope
   */
  public isInTenantScope(
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): boolean {
    // Must belong to the organization
    if (!this.belongsToOrganization(organizationId)) {
      return false;
    }

    // If clinic ID is specified, check clinic scope
    if (clinicId !== undefined) {
      // Entity must either belong to the clinic or be organization-scoped
      return this._clinicId === undefined || this.belongsToClinic(clinicId);
    }

    // Organization-level access granted
    return true;
  }

  /**
   * Validates UUID format
   *
   * @param id - The ID to validate
   * @throws {Error} If ID is invalid
   * @private
   */
  private validateId(id: UUID): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Entity ID must be a non-empty string');
    }

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }
  }

  /**
   * Validates organization ID
   *
   * @param organizationId - The organization ID to validate
   * @throws {Error} If organization ID is invalid
   * @private
   */
  private validateOrganizationId(organizationId: OrganizationId): void {
    if (!organizationId || typeof organizationId !== 'string') {
      throw new Error('Organization ID must be a non-empty string');
    }
  }

  /**
   * Validates clinic ID
   *
   * @param clinicId - The clinic ID to validate
   * @throws {Error} If clinic ID is invalid
   * @private
   */
  private validateClinicId(clinicId: ClinicId): void {
    if (!clinicId || typeof clinicId !== 'string') {
      throw new Error('Clinic ID must be a non-empty string');
    }
  }
}
