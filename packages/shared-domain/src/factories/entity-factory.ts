/**
 * Entity Factory
 *
 * Provides utility functions for creating entities with proper defaults,
 * tenant context injection, and timestamp management.
 *
 * @module shared-domain/factories
 */

import type { UUID, ISODateString } from '@dentalos/shared-types';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';

// Use global crypto API available in Node.js 16+ and browsers
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Tenant context for entity creation
 */
export interface TenantContext {
  organizationId: OrganizationId;
  clinicId?: ClinicId;
}

/**
 * Entity creation options
 */
export interface EntityCreationOptions {
  /** Custom entity ID (auto-generated if not provided) */
  id?: UUID;
  /** Custom creation timestamp (defaults to now) */
  createdAt?: ISODateString;
  /** Custom update timestamp (defaults to now) */
  updatedAt?: ISODateString;
}

/**
 * Base entity fields that all entities should have
 */
export interface BaseEntityFields {
  id: UUID;
  organizationId: OrganizationId;
  clinicId: ClinicId | undefined;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Entity Factory
 *
 * Provides helper methods for creating entities with consistent defaults
 * and proper tenant context injection.
 */
export class EntityFactory {
  /**
   * Generates a new UUID v4
   *
   * @returns A new UUID
   */
  public static generateId(): UUID {
    return generateUUID() as UUID;
  }

  /**
   * Gets the current timestamp in ISO format
   *
   * @returns Current timestamp as ISODateString
   */
  public static getCurrentTimestamp(): ISODateString {
    return new Date().toISOString() as ISODateString;
  }

  /**
   * Creates base entity fields with defaults
   *
   * This method generates the common fields that all entities need:
   * - id (auto-generated UUID if not provided)
   * - organizationId (from tenant context)
   * - clinicId (from tenant context, optional)
   * - createdAt (current timestamp if not provided)
   * - updatedAt (current timestamp if not provided)
   *
   * @param tenantContext - Tenant context for multi-tenant isolation
   * @param options - Optional customization of entity fields
   * @returns Base entity fields ready for entity construction
   *
   * @example
   * ```typescript
   * const context = { organizationId: 'org-123', clinicId: 'clinic-456' };
   * const fields = EntityFactory.createBaseFields(context);
   * const patient = new Patient(
   *   fields.id,
   *   fields.organizationId,
   *   fields.clinicId,
   *   name,
   *   email,
   *   fields.createdAt,
   *   fields.updatedAt
   * );
   * ```
   */
  public static createBaseFields(
    tenantContext: TenantContext,
    options: EntityCreationOptions = {}
  ): BaseEntityFields {
    // Validate tenant context
    EntityFactory.validateTenantContext(tenantContext);

    // Generate or use provided ID
    const id = options.id || EntityFactory.generateId();

    // Use provided timestamps or default to current time
    const now = EntityFactory.getCurrentTimestamp();
    const createdAt = options.createdAt || now;
    const updatedAt = options.updatedAt || now;

    // Validate timestamp order
    if (new Date(updatedAt) < new Date(createdAt)) {
      throw new Error('updatedAt cannot be earlier than createdAt');
    }

    return {
      id,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      createdAt,
      updatedAt,
    };
  }

  /**
   * Creates base fields for a new entity (with current timestamps)
   *
   * This is a convenience method for creating new entities that always
   * use the current timestamp for both createdAt and updatedAt.
   *
   * @param tenantContext - Tenant context for multi-tenant isolation
   * @param id - Optional custom entity ID
   * @returns Base entity fields for a new entity
   *
   * @example
   * ```typescript
   * const context = { organizationId: 'org-123' };
   * const fields = EntityFactory.createNewEntity(context);
   * ```
   */
  public static createNewEntity(
    tenantContext: TenantContext,
    id?: UUID
  ): BaseEntityFields {
    const now = EntityFactory.getCurrentTimestamp();

    return EntityFactory.createBaseFields(tenantContext, {
      id,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Creates base fields for an existing entity (custom timestamps)
   *
   * This method is useful when reconstituting entities from storage
   * where you need to preserve the original timestamps.
   *
   * @param id - Entity ID
   * @param tenantContext - Tenant context for multi-tenant isolation
   * @param createdAt - Original creation timestamp
   * @param updatedAt - Last update timestamp
   * @returns Base entity fields for an existing entity
   *
   * @example
   * ```typescript
   * const fields = EntityFactory.createExistingEntity(
   *   'patient-123',
   *   { organizationId: 'org-123' },
   *   '2025-01-01T00:00:00Z',
   *   '2025-01-15T10:30:00Z'
   * );
   * ```
   */
  public static createExistingEntity(
    id: UUID,
    tenantContext: TenantContext,
    createdAt: ISODateString,
    updatedAt: ISODateString
  ): BaseEntityFields {
    return EntityFactory.createBaseFields(tenantContext, {
      id,
      createdAt,
      updatedAt,
    });
  }

  /**
   * Validates tenant context
   *
   * @param context - Tenant context to validate
   * @throws {Error} If tenant context is invalid
   * @private
   */
  private static validateTenantContext(context: TenantContext): void {
    if (!context) {
      throw new Error('Tenant context is required');
    }

    if (!context.organizationId) {
      throw new Error('Organization ID is required in tenant context');
    }

    if (typeof context.organizationId !== 'string') {
      throw new Error('Organization ID must be a string');
    }

    if (
      context.clinicId !== undefined &&
      typeof context.clinicId !== 'string'
    ) {
      throw new Error('Clinic ID must be a string if provided');
    }
  }

  /**
   * Validates UUID format
   *
   * @param id - UUID to validate
   * @param paramName - Parameter name for error messages
   * @throws {Error} If UUID is invalid
   */
  public static validateUUID(id: string, paramName: string = 'id'): void {
    if (!id || typeof id !== 'string') {
      throw new Error(`${paramName} must be a non-empty string`);
    }

    // UUID v4 format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new Error(`${paramName} must be a valid UUID v4: ${id}`);
    }
  }

  /**
   * Validates ISO date string format
   *
   * @param date - Date string to validate
   * @param paramName - Parameter name for error messages
   * @throws {Error} If date string is invalid
   */
  public static validateISODateString(
    date: string,
    paramName: string = 'date'
  ): void {
    if (!date || typeof date !== 'string') {
      throw new Error(`${paramName} must be a non-empty string`);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`${paramName} must be a valid ISO date string: ${date}`);
    }

    // Verify it's in ISO format by round-tripping
    if (parsedDate.toISOString() !== date) {
      throw new Error(
        `${paramName} must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ): ${date}`
      );
    }
  }
}
