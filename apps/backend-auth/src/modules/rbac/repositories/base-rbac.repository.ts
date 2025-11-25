/**
 * Base RBAC Repository
 *
 * Abstract base class for all RBAC repositories providing common multi-tenant patterns.
 * Enforces tenant isolation, provides reusable query builders, and reduces code duplication.
 *
 * DESIGN PRINCIPLES:
 * - Tenant isolation ALWAYS enforced (organizationId filter)
 * - Clinic scoping support (optional clinicId filter)
 * - Reusable query patterns (findById, findAll, exists checks)
 * - Type-safe through TypeScript generics
 * - Consistent null-return pattern (no throwing for missing resources)
 *
 * SECURITY GUARANTEES:
 * - All queries include organizationId filter by default
 * - Cross-tenant data access prevented at repository layer
 * - Clinic scoping enforced when clinicId provided
 * - Unsafe methods (without tenant filters) explicitly marked
 *
 * @module modules/rbac/repositories
 */

import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import type { OrganizationId, ClinicId, UUID } from '@dentalos/shared-types';

/**
 * Base entity interface that all RBAC entities must implement
 */
export interface BaseRBACEntity {
  id: UUID;
  organizationId: OrganizationId;
  clinicId?: ClinicId | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Tenant scope for query filtering
 */
export interface TenantScope {
  organizationId: OrganizationId;
  clinicId?: ClinicId;
}

/**
 * Abstract base repository with common RBAC operations
 * All RBAC repositories should extend this class to inherit tenant isolation patterns
 */
export abstract class BaseRBACRepository<TEntity extends BaseRBACEntity> {
  /**
   * Constructor accepts TypeORM repository instance
   * @param repository - TypeORM repository for the entity
   */
  constructor(protected readonly repository: Repository<TEntity>) {}

  /**
   * Build multi-tenant WHERE clause
   * ALWAYS includes organizationId filter for tenant isolation
   *
   * @param organizationId - Organization ID (REQUIRED)
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns WHERE clause with tenant filters
   */
  protected buildTenantWhere(
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): FindOptionsWhere<TEntity> {
    const where: FindOptionsWhere<TEntity> = {
      organizationId,
    } as FindOptionsWhere<TEntity>;

    // Add clinic filter if provided
    if (clinicId !== undefined) {
      (where as any).clinicId = clinicId;
    }

    return where;
  }

  /**
   * Find entity by ID with tenant scoping
   * Returns null if not found or belongs to different organization
   *
   * @param id - Entity ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for additional scoping
   * @returns Entity or null if not found
   */
  protected async findByIdWithTenant(
    id: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<TEntity | null> {
    const where: FindOptionsWhere<TEntity> = {
      ...this.buildTenantWhere(organizationId, clinicId),
      id,
    } as FindOptionsWhere<TEntity>;

    return this.repository.findOne({ where });
  }

  /**
   * Find all entities with tenant scoping
   * Returns only entities belonging to the specified organization/clinic
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @param options - Additional TypeORM find options
   * @returns Array of entities (empty array if none found)
   */
  protected async findAllWithTenant(
    organizationId: OrganizationId,
    clinicId?: ClinicId,
    options?: Omit<FindManyOptions<TEntity>, 'where'>
  ): Promise<TEntity[]> {
    const where = this.buildTenantWhere(organizationId, clinicId);

    return this.repository.find({
      ...options,
      where,
    });
  }

  /**
   * Check if entity exists by ID with tenant scoping
   * Efficient existence check without loading full entity
   *
   * @param id - Entity ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns True if entity exists in scope, false otherwise
   */
  protected async existsWithTenant(
    id: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    const where: FindOptionsWhere<TEntity> = {
      ...this.buildTenantWhere(organizationId, clinicId),
      id,
    } as FindOptionsWhere<TEntity>;

    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * Count entities with tenant scoping
   * Returns count of entities in the specified scope
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @param additionalWhere - Additional WHERE conditions
   * @returns Count of entities matching criteria
   */
  protected async countWithTenant(
    organizationId: OrganizationId,
    clinicId?: ClinicId,
    additionalWhere?: Partial<FindOptionsWhere<TEntity>>
  ): Promise<number> {
    const where: FindOptionsWhere<TEntity> = {
      ...this.buildTenantWhere(organizationId, clinicId),
      ...additionalWhere,
    } as FindOptionsWhere<TEntity>;

    return this.repository.count({ where });
  }

  /**
   * Find entity by ID WITHOUT tenant filtering (UNSAFE)
   * Use only for system operations that need to bypass tenant isolation
   *
   * WARNING: This method bypasses tenant isolation. Use with extreme caution.
   * Only use for:
   * - System administrative operations
   * - Cross-tenant validation checks
   * - Audit log operations
   *
   * @param id - Entity ID (UUID)
   * @returns Entity or null if not found
   */
  protected async findByIdUnsafe(id: UUID): Promise<TEntity | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });
  }

  /**
   * Soft delete entity with tenant validation
   * Sets deletedAt timestamp and optionally sets isActive to false
   *
   * @param id - Entity ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns True if deleted, false if not found
   */
  protected async softDeleteWithTenant(
    id: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    const entity = await this.findByIdWithTenant(id, organizationId, clinicId);

    if (!entity) {
      return false;
    }

    // Set deletedAt timestamp
    entity.deletedAt = new Date();

    // Set isActive to false if entity has this field
    if ('isActive' in entity) {
      (entity as any).isActive = false;
    }

    await this.repository.save(entity);
    return true;
  }
}
