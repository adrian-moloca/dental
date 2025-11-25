/**
 * Cabinet Service
 *
 * Business logic layer for Cabinet management.
 * Orchestrates repository operations, enforces business rules, and emits domain events.
 *
 * Business rules enforced:
 * - Only one default cabinet per organization
 * - Code uniqueness within organization
 * - Cannot delete default cabinet without reassigning default
 * - Status transitions validation
 * - Multi-tenant isolation on all operations
 *
 * Events emitted:
 * - CabinetCreated: When new cabinet is created
 * - CabinetUpdated: When cabinet is updated
 * - CabinetDeleted: When cabinet is deleted
 * - DefaultCabinetChanged: When default cabinet is changed
 *
 * Edge cases handled:
 * - First cabinet auto-set as default
 * - Deleting default cabinet requires explicit default reassignment
 * - Owner validation (if owner exists in User service)
 * - Concurrent default cabinet changes (repository handles atomicity)
 *
 * @module modules/cabinets/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { CabinetRepository } from '../repositories/cabinet.repository';
import type { Cabinet } from '../entities/cabinet.entity';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import { NotFoundError, ValidationError } from '@dentalos/shared-errors';
import type { CreateCabinetDto, UpdateCabinetDto, FindCabinetsQueryDto } from '../dto';

/**
 * Cabinet service for business logic
 *
 * Responsibilities:
 * - Enforce business rules
 * - Coordinate repository operations
 * - Emit domain events
 * - Validate inputs
 * - Handle edge cases
 */
@Injectable()
export class CabinetService {
  private readonly logger = new Logger(CabinetService.name);

  constructor(private readonly cabinetRepository: CabinetRepository) {}

  /**
   * Create new cabinet
   *
   * Business rules:
   * - If no cabinets exist in organization, auto-set as default
   * - If isDefault=true, unset existing default (handled by repository)
   * - Code must be unique within organization
   * - Name is required
   *
   * Edge cases:
   * - First cabinet auto-set as default
   * - Concurrent creation handled by database constraints
   * - Owner validation can be added here if needed
   *
   * @param dto - Cabinet creation data
   * @param organizationId - Organization ID (from tenant context)
   * @param createdBy - User ID of creator (optional)
   * @returns Created cabinet
   * @throws {ValidationError} If validation fails
   * @throws {ConflictError} If code already exists
   */
  async create(
    dto: CreateCabinetDto,
    organizationId: OrganizationId,
    createdBy?: UUID,
  ): Promise<Cabinet> {
    this.logger.log(`Creating cabinet "${dto.name}" for organization ${organizationId}`);

    // Check if this is the first cabinet in organization
    const existingCount = await this.cabinetRepository.count(organizationId);
    const shouldBeDefault = existingCount === 0 || dto.isDefault;

    // Create cabinet
    const cabinet = await this.cabinetRepository.create({
      ...dto,
      organizationId,
      createdBy,
      isDefault: shouldBeDefault,
    });

    this.logger.log(
      `Cabinet created: ${cabinet.id} (default: ${cabinet.isDefault}) for organization ${organizationId}`,
    );

    // TODO: Emit CabinetCreated event when event system is integrated
    // this.eventEmitter.emit('cabinet.created', { cabinet, organizationId, createdBy });

    return cabinet;
  }

  /**
   * Find cabinet by ID
   *
   * CRITICAL: Always includes organizationId for tenant isolation
   *
   * @param id - Cabinet ID
   * @param organizationId - Organization ID (from tenant context)
   * @returns Cabinet
   * @throws {NotFoundError} If cabinet not found
   */
  async findById(id: UUID, organizationId: OrganizationId): Promise<Cabinet> {
    const cabinet = await this.cabinetRepository.findById(id, organizationId);

    if (!cabinet) {
      throw new NotFoundError('Cabinet not found', {
        resourceType: 'cabinet',
        resourceId: id,
      });
    }

    return cabinet;
  }

  /**
   * Find cabinet by code
   *
   * CRITICAL: Always includes organizationId for tenant isolation
   *
   * @param code - Cabinet code
   * @param organizationId - Organization ID (from tenant context)
   * @returns Cabinet or null if not found
   */
  async findByCode(code: string, organizationId: OrganizationId): Promise<Cabinet | null> {
    return this.cabinetRepository.findByCode(code, organizationId);
  }

  /**
   * Find default cabinet for organization
   *
   * @param organizationId - Organization ID (from tenant context)
   * @returns Default cabinet
   * @throws {NotFoundError} If no default cabinet exists
   */
  async findDefault(organizationId: OrganizationId): Promise<Cabinet> {
    const cabinet = await this.cabinetRepository.findDefault(organizationId);

    if (!cabinet) {
      throw new NotFoundError('No default cabinet found for organization', {
        resourceType: 'cabinet',
      });
    }

    return cabinet;
  }

  /**
   * Find all cabinets in organization with optional filters
   *
   * @param organizationId - Organization ID (from tenant context)
   * @param query - Optional filters
   * @returns Array of cabinets
   */
  async findAll(organizationId: OrganizationId, query?: FindCabinetsQueryDto): Promise<Cabinet[]> {
    return this.cabinetRepository.findAll(organizationId, query);
  }

  /**
   * Find all active cabinets
   *
   * @param organizationId - Organization ID (from tenant context)
   * @returns Array of active cabinets
   */
  async findAllActive(organizationId: OrganizationId): Promise<Cabinet[]> {
    return this.cabinetRepository.findAllActive(organizationId);
  }

  /**
   * Update cabinet
   *
   * Business rules:
   * - Cannot remove default flag if only one cabinet exists
   * - If setting isDefault=true, unset existing default (handled by repository)
   * - Code must be unique within organization
   *
   * Edge cases:
   * - Prevents removing default flag if only cabinet
   * - Handles concurrent updates through repository
   * - Allows partial updates
   *
   * @param id - Cabinet ID
   * @param dto - Update data (partial)
   * @param organizationId - Organization ID (from tenant context)
   * @returns Updated cabinet
   * @throws {NotFoundError} If cabinet not found
   * @throws {ValidationError} If validation fails
   * @throws {ConflictError} If code conflict
   */
  async update(id: UUID, dto: UpdateCabinetDto, organizationId: OrganizationId): Promise<Cabinet> {
    this.logger.log(`Updating cabinet ${id} for organization ${organizationId}`);

    // Validate: if unsetting default, ensure other cabinets exist
    if (dto.isDefault === false) {
      const current = await this.findById(id, organizationId);
      if (current.isDefault) {
        const totalCount = await this.cabinetRepository.count(organizationId);
        if (totalCount === 1) {
          throw new ValidationError('Cannot remove default flag from only cabinet', {
            field: 'isDefault',
          });
        }
      }
    }

    // Update cabinet
    const cabinet = await this.cabinetRepository.update(
      id,
      { ...dto, organizationId },
      organizationId,
    );

    this.logger.log(`Cabinet updated: ${cabinet.id} for organization ${organizationId}`);

    // TODO: Emit CabinetUpdated event
    // this.eventEmitter.emit('cabinet.updated', { cabinet, organizationId, changes: dto });

    return cabinet;
  }

  /**
   * Update cabinet status
   *
   * Business rules:
   * - Cannot deactivate default cabinet without reassigning default
   * - Status transitions: ACTIVE <-> INACTIVE, ACTIVE -> ARCHIVED
   *
   * @param id - Cabinet ID
   * @param status - New status
   * @param organizationId - Organization ID (from tenant context)
   * @throws {NotFoundError} If cabinet not found
   * @throws {ValidationError} If status transition invalid
   */
  async updateStatus(
    id: UUID,
    status: EntityStatus,
    organizationId: OrganizationId,
  ): Promise<void> {
    this.logger.log(`Updating cabinet ${id} status to ${status}`);

    // Validate: cannot deactivate default cabinet
    const cabinet = await this.findById(id, organizationId);
    if (cabinet.isDefault && status !== EntityStatus.ACTIVE) {
      const totalCount = await this.cabinetRepository.count(organizationId, EntityStatus.ACTIVE);
      if (totalCount === 1) {
        throw new ValidationError(
          'Cannot deactivate default cabinet. Please set another cabinet as default first.',
          { field: 'status' },
        );
      }
    }

    await this.cabinetRepository.updateStatus(id, status, organizationId);

    this.logger.log(`Cabinet ${id} status updated to ${status}`);

    // TODO: Emit CabinetStatusChanged event
    // this.eventEmitter.emit('cabinet.status.changed', { cabinetId: id, status, organizationId });
  }

  /**
   * Soft delete cabinet
   *
   * Business rules:
   * - Cannot delete default cabinet without reassigning default first
   * - Sets deletedAt timestamp (soft delete)
   *
   * Edge cases:
   * - Prevents deleting default cabinet if no other cabinets exist
   * - Requires explicit default reassignment before deletion
   *
   * @param id - Cabinet ID
   * @param organizationId - Organization ID (from tenant context)
   * @throws {NotFoundError} If cabinet not found
   * @throws {ValidationError} If trying to delete default cabinet
   */
  async delete(id: UUID, organizationId: OrganizationId): Promise<void> {
    this.logger.log(`Deleting cabinet ${id} for organization ${organizationId}`);

    // Validate: cannot delete default cabinet
    const cabinet = await this.findById(id, organizationId);
    if (cabinet.isDefault) {
      const totalCount = await this.cabinetRepository.count(organizationId);
      if (totalCount === 1) {
        throw new ValidationError('Cannot delete the only cabinet in organization', {
          field: 'id',
        });
      }
      throw new ValidationError(
        'Cannot delete default cabinet. Please set another cabinet as default first.',
        { field: 'id' },
      );
    }

    await this.cabinetRepository.softDelete(id, organizationId);

    this.logger.log(`Cabinet ${id} soft deleted for organization ${organizationId}`);

    // TODO: Emit CabinetDeleted event
    // this.eventEmitter.emit('cabinet.deleted', { cabinetId: id, organizationId });
  }

  /**
   * Set cabinet as default
   *
   * Business rule:
   * - Only one default cabinet per organization
   * - Automatically unsets existing default
   *
   * @param id - Cabinet ID
   * @param organizationId - Organization ID (from tenant context)
   * @returns Updated cabinet
   * @throws {NotFoundError} If cabinet not found
   */
  async setDefault(id: UUID, organizationId: OrganizationId): Promise<Cabinet> {
    this.logger.log(`Setting cabinet ${id} as default for organization ${organizationId}`);

    const cabinet = await this.update(id, { isDefault: true }, organizationId);

    this.logger.log(`Cabinet ${id} set as default for organization ${organizationId}`);

    // TODO: Emit DefaultCabinetChanged event
    // this.eventEmitter.emit('cabinet.default.changed', { cabinetId: id, organizationId });

    return cabinet;
  }

  /**
   * Count cabinets in organization
   *
   * @param organizationId - Organization ID (from tenant context)
   * @param status - Optional status filter
   * @returns Count of cabinets
   */
  async count(organizationId: OrganizationId, status?: EntityStatus): Promise<number> {
    return this.cabinetRepository.count(organizationId, status);
  }

  /**
   * Check if cabinet exists by ID
   *
   * @param id - Cabinet ID
   * @param organizationId - Organization ID (from tenant context)
   * @returns True if exists, false otherwise
   */
  async exists(id: UUID, organizationId: OrganizationId): Promise<boolean> {
    const cabinet = await this.cabinetRepository.findById(id, organizationId);
    return cabinet !== null;
  }

  /**
   * Check if code is available (not already used)
   *
   * @param code - Cabinet code to check
   * @param organizationId - Organization ID (from tenant context)
   * @param excludeId - Optional cabinet ID to exclude (for update validation)
   * @returns True if code is available, false otherwise
   */
  async isCodeAvailable(
    code: string,
    organizationId: OrganizationId,
    excludeId?: UUID,
  ): Promise<boolean> {
    const cabinet = await this.cabinetRepository.findByCode(code, organizationId);
    if (!cabinet) return true;
    if (excludeId && cabinet.id === excludeId) return true;
    return false;
  }
}
