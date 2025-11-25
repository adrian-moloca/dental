/**
 * In-Memory Repository
 * Generic repository pattern implementation for testing with tenant isolation
 *
 * @module shared-testing/mocks/in-memory
 *
 * @security
 * This repository enforces multi-tenant isolation to ensure tests
 * accurately reflect production behavior. All query operations require
 * a tenant context to prevent accidental cross-tenant data access.
 */

import type { OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Tenant context for scoping repository operations
 * Required for all query operations to enforce tenant isolation
 */
export interface TenantContext {
  /** Organization ID (required) */
  organizationId: OrganizationId;
  /** Clinic ID (optional, for clinic-scoped operations) */
  clinicId?: ClinicId;
}

/**
 * Base interface for tenant-scoped entities
 * All entities stored in InMemoryRepository must extend this
 */
export interface TenantScopedEntity {
  /** Unique entity identifier */
  id: string;
  /** Organization to which this entity belongs */
  organizationId: OrganizationId;
  /** Optional clinic scope */
  clinicId?: ClinicId;
}

/**
 * Generic repository interface with tenant isolation
 */
export interface Repository<T extends TenantScopedEntity> {
  save(entity: T): Promise<T>;
  findById(id: string, tenantContext: TenantContext): Promise<T | null>;
  findAll(tenantContext: TenantContext): Promise<T[]>;
  delete(id: string, tenantContext: TenantContext): Promise<boolean>;
}

/**
 * In-memory repository for testing with enforced tenant isolation
 *
 * @remarks
 * This repository enforces multi-tenant isolation at the data layer:
 * - save() validates that entities have required tenant fields
 * - All query operations require TenantContext
 * - Cross-tenant access is blocked (returns null/empty results)
 * - Tests that work with this repository will fail if tenant isolation is violated
 *
 * @example
 * ```typescript
 * const repo = new InMemoryRepository<Patient>();
 * const tenantContext = { organizationId: 'org-001', clinicId: 'clinic-001' };
 *
 * // Save with tenant context
 * await repo.save({
 *   id: 'patient-1',
 *   organizationId: 'org-001',
 *   clinicId: 'clinic-001',
 *   name: 'Test Patient',
 * });
 *
 * // Query with tenant context
 * const patients = await repo.findAll(tenantContext);
 * ```
 */
export class InMemoryRepository<T extends TenantScopedEntity> implements Repository<T> {
  private store: Map<string, T> = new Map();

  /**
   * Save an entity with tenant validation
   *
   * @param entity - Entity to save
   * @returns Saved entity
   * @throws Error if entity lacks required tenant fields
   *
   * @security
   * Validates that entity has organizationId to ensure all stored
   * entities can be properly isolated.
   */
  public async save(entity: T): Promise<T> {
    if (!entity.organizationId) {
      throw new Error(
        'Entity must have organizationId for tenant isolation. ' +
          'All entities in a multi-tenant system must be scoped to an organization.',
      );
    }

    this.store.set(entity.id, entity);
    return entity;
  }

  /**
   * Find an entity by ID with tenant validation
   *
   * @param id - Entity ID to find
   * @param tenantContext - Tenant context for access validation
   * @returns Entity if found and tenant matches, null otherwise
   *
   * @security
   * Enforces tenant isolation by validating that the entity belongs
   * to the requesting tenant. Cross-tenant access returns null.
   */
  public async findById(id: string, tenantContext: TenantContext): Promise<T | null> {
    const entity = this.store.get(id);
    if (!entity) {
      return null;
    }

    // Validate organization ownership
    if (entity.organizationId !== tenantContext.organizationId) {
      return null; // Cross-tenant access blocked
    }

    // Validate clinic scope if specified
    if (tenantContext.clinicId && entity.clinicId !== tenantContext.clinicId) {
      return null; // Wrong clinic within same organization
    }

    return entity;
  }

  /**
   * Find all entities for a specific tenant
   *
   * @param tenantContext - Tenant context to scope the query
   * @returns All entities belonging to the tenant
   *
   * @security
   * CRITICAL: Requires tenant context to enforce isolation.
   * Only returns entities matching the tenant context.
   */
  public async findAll(tenantContext: TenantContext): Promise<T[]> {
    return Array.from(this.store.values()).filter((entity) => {
      // Organization must match
      if (entity.organizationId !== tenantContext.organizationId) {
        return false;
      }

      // If clinic scope specified, clinic must match
      if (tenantContext.clinicId && entity.clinicId !== tenantContext.clinicId) {
        return false;
      }

      return true;
    });
  }

  /**
   * Find entities matching a predicate within tenant scope
   *
   * @param predicate - Filter function
   * @param tenantContext - Tenant context to scope the query
   * @returns Matching entities within tenant scope
   *
   * @security
   * First applies tenant filtering, then user predicate.
   * This ensures predicate only operates on tenant's data.
   */
  public async find(
    predicate: (entity: T) => boolean,
    tenantContext: TenantContext,
  ): Promise<T[]> {
    const tenantEntities = await this.findAll(tenantContext);
    return tenantEntities.filter(predicate);
  }

  /**
   * Find the first entity matching a predicate within tenant scope
   *
   * @param predicate - Filter function
   * @param tenantContext - Tenant context to scope the query
   * @returns First matching entity or null
   */
  public async findOne(
    predicate: (entity: T) => boolean,
    tenantContext: TenantContext,
  ): Promise<T | null> {
    const tenantEntities = await this.findAll(tenantContext);
    for (const entity of tenantEntities) {
      if (predicate(entity)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Update an entity with tenant validation
   *
   * @param id - Entity ID to update
   * @param updates - Partial entity updates
   * @param tenantContext - Tenant context for access validation
   * @returns Updated entity or null if not found/access denied
   *
   * @security
   * Validates tenant ownership before allowing update.
   * Prevents organizationId and clinicId from being changed.
   */
  public async update(
    id: string,
    updates: Partial<T>,
    tenantContext: TenantContext,
  ): Promise<T | null> {
    const existing = await this.findById(id, tenantContext);
    if (!existing) {
      return null; // Not found or access denied
    }

    // Prevent tenant field mutation
    const safeUpdates = { ...updates };
    delete (safeUpdates as any).organizationId;
    delete (safeUpdates as any).clinicId;

    const updated = { ...existing, ...safeUpdates };
    this.store.set(id, updated);
    return updated;
  }

  /**
   * Delete an entity by ID with tenant validation
   *
   * @param id - Entity ID to delete
   * @param tenantContext - Tenant context for access validation
   * @returns true if deleted, false if not found/access denied
   *
   * @security
   * Validates tenant ownership before allowing deletion.
   */
  public async delete(id: string, tenantContext: TenantContext): Promise<boolean> {
    const entity = await this.findById(id, tenantContext);
    if (!entity) {
      return false; // Not found or access denied
    }

    return this.store.delete(id);
  }

  /**
   * Check if an entity exists within tenant scope
   *
   * @param id - Entity ID to check
   * @param tenantContext - Tenant context for access validation
   * @returns true if exists and accessible, false otherwise
   */
  public async exists(id: string, tenantContext: TenantContext): Promise<boolean> {
    const entity = await this.findById(id, tenantContext);
    return entity !== null;
  }

  /**
   * Count entities within tenant scope
   *
   * @param tenantContext - Tenant context to scope the count
   * @returns Number of entities in tenant scope
   */
  public async count(tenantContext: TenantContext): Promise<number> {
    const entities = await this.findAll(tenantContext);
    return entities.length;
  }

  /**
   * Clear all entities (testing utility)
   *
   * @remarks
   * Use sparingly. Prefer per-tenant cleanup in production-like tests.
   */
  public async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Get all IDs within tenant scope (testing utility)
   *
   * @param tenantContext - Tenant context to scope the query
   * @returns Array of entity IDs in tenant scope
   */
  public async getAllIds(tenantContext: TenantContext): Promise<string[]> {
    const entities = await this.findAll(tenantContext);
    return entities.map((e) => e.id);
  }

  /**
   * Get total entity count across all tenants (testing utility)
   *
   * @remarks
   * Only for testing infrastructure. Not tenant-scoped.
   */
  public getTotalCount(): number {
    return this.store.size;
  }
}
