/**
 * MfaFactorRepository - PostgreSQL-backed MFA factor persistence
 *
 * Responsibilities:
 * - CRUD operations for MFA factors
 * - Multi-tenant data isolation (all operations scoped to organizationId)
 * - Factor type and status filtering
 * - Primary factor management
 *
 * Security:
 * - ALL queries include organizationId filter
 * - Secrets stored as Argon2id hashes
 * - Phone numbers and emails encrypted
 * - Cross-tenant access prevented by design
 *
 * @module MfaFactorRepository
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { InfrastructureError } from '@dentalos/shared-errors';
import { MfaFactor, MfaFactorType } from '../entities/mfa-factor.entity';
import { BaseRBACRepository } from '../../rbac/repositories/base-rbac.repository';

/**
 * Data transfer object for creating a new MFA factor
 */
export interface CreateMfaFactorData {
  userId: UUID;
  organizationId: OrganizationId;
  factorType: MfaFactorType;
  secret: string;
  isEnabled: boolean;
  isPrimary: boolean;
  phoneNumber?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

/**
 * MFA factor repository with tenant-scoped data access
 */
@Injectable()
export class MfaFactorRepository extends BaseRBACRepository<any> {
  constructor(
    @InjectRepository(MfaFactor)
    private readonly mfaFactorRepository: Repository<any>
  ) {
    super(mfaFactorRepository);
  }

  /**
   * Find MFA factor by ID (tenant-scoped)
   *
   * @param factorId - Factor identifier
   * @param organizationId - Organization for tenant isolation
   * @returns MFA factor or null if not found
   */
  async findById(factorId: UUID, organizationId: OrganizationId): Promise<MfaFactor | null> {
    try {
      const result = await this.findByIdWithTenant(factorId, organizationId);
      return result ? MfaFactor.fromJSON(result as unknown as Record<string, unknown>) : null;
    } catch (error) {
      throw new InfrastructureError('Failed to find MFA factor by ID', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find all MFA factors for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of MFA factors
   */
  async findByUserId(userId: UUID, organizationId: OrganizationId): Promise<MfaFactor[]> {
    try {
      const results = await this.mfaFactorRepository.find({
        where: {
          userId,
          organizationId,
        },
        order: {
          isPrimary: 'DESC',
          createdAt: 'ASC',
        },
      });

      return results.map((r: any) => MfaFactor.fromJSON(r as unknown as Record<string, unknown>));
    } catch (error) {
      throw new InfrastructureError('Failed to find MFA factors by user ID', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find enabled MFA factors for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of enabled MFA factors
   */
  async findEnabledByUserId(userId: UUID, organizationId: OrganizationId): Promise<MfaFactor[]> {
    try {
      const results = await this.mfaFactorRepository.find({
        where: {
          userId,
          organizationId,
          isEnabled: true,
        },
        order: {
          isPrimary: 'DESC',
          createdAt: 'ASC',
        },
      });

      return results.map((r: any) => MfaFactor.fromJSON(r as unknown as Record<string, unknown>));
    } catch (error) {
      throw new InfrastructureError('Failed to find enabled MFA factors', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find primary MFA factor for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Primary MFA factor or null if not found
   */
  async findPrimaryByUserId(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<MfaFactor | null> {
    try {
      const result = await this.mfaFactorRepository.findOne({
        where: {
          userId,
          organizationId,
          isPrimary: true,
          isEnabled: true,
        },
      });

      return result ? MfaFactor.fromJSON(result as unknown as Record<string, unknown>) : null;
    } catch (error) {
      throw new InfrastructureError('Failed to find primary MFA factor', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Create new MFA factor (tenant-scoped)
   *
   * @param data - MFA factor creation data
   * @returns Created MFA factor
   */
  async create(data: CreateMfaFactorData): Promise<MfaFactor> {
    try {
      const factor = MfaFactor.fromJSON({
        ...data,
        id: crypto.randomUUID(),
        metadata: data.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const saved = await this.mfaFactorRepository.save(factor.toJSON());
      return MfaFactor.fromJSON(saved as unknown as Record<string, unknown>);
    } catch (error) {
      throw new InfrastructureError('Failed to create MFA factor', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Update existing MFA factor (tenant-scoped)
   *
   * @param factor - Updated MFA factor entity
   * @returns Updated MFA factor
   */
  async update(factor: MfaFactor): Promise<MfaFactor> {
    try {
      const saved = await this.mfaFactorRepository.save(factor.toJSON());
      return MfaFactor.fromJSON(saved as unknown as Record<string, unknown>);
    } catch (error) {
      throw new InfrastructureError('Failed to update MFA factor', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Delete MFA factor (tenant-scoped)
   *
   * @param factorId - Factor identifier
   * @param organizationId - Organization for tenant isolation
   */
  async delete(factorId: UUID, organizationId: OrganizationId): Promise<void> {
    try {
      await this.mfaFactorRepository.delete({
        id: factorId,
        organizationId,
      });
    } catch (error) {
      throw new InfrastructureError('Failed to delete MFA factor', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}
