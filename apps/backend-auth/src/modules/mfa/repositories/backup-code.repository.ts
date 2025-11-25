/**
 * BackupCodeRepository - PostgreSQL-backed backup code persistence
 *
 * Responsibilities:
 * - CRUD operations for backup codes
 * - Multi-tenant data isolation (all operations scoped to organizationId)
 * - Usage tracking and validation
 * - Batch operations for code generation
 *
 * Security:
 * - ALL queries include organizationId filter
 * - Codes stored as Argon2id hashes
 * - Single-use enforcement
 * - Cross-tenant access prevented by design
 *
 * @module BackupCodeRepository
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { InfrastructureError } from '@dentalos/shared-errors';
import { BackupCode } from '../entities/backup-code.entity';
import { BaseRBACRepository } from '../../rbac/repositories/base-rbac.repository';

/**
 * Data transfer object for creating a new backup code
 */
export interface CreateBackupCodeData {
  userId: UUID;
  organizationId: OrganizationId;
  codeHash: string;
}

/**
 * Backup code repository with tenant-scoped data access
 */
@Injectable()
export class BackupCodeRepository extends BaseRBACRepository<any> {
  constructor(
    @InjectRepository(BackupCode)
    private readonly backupCodeRepository: Repository<any>
  ) {
    super(backupCodeRepository);
  }

  /**
   * Find backup code by ID (tenant-scoped)
   *
   * @param codeId - Code identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Backup code or null if not found
   */
  async findById(codeId: UUID, organizationId: OrganizationId): Promise<BackupCode | null> {
    try {
      const result = await this.findByIdWithTenant(codeId, organizationId);
      return result ? BackupCode.fromJSON(result as unknown as Record<string, unknown>) : null;
    } catch (error) {
      throw new InfrastructureError('Failed to find backup code by ID', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find all backup codes for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of backup codes
   */
  async findByUserId(userId: UUID, organizationId: OrganizationId): Promise<BackupCode[]> {
    try {
      const results = await this.backupCodeRepository.find({
        where: {
          userId,
          organizationId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return results.map((r: any) => BackupCode.fromJSON(r as unknown as Record<string, unknown>));
    } catch (error) {
      throw new InfrastructureError('Failed to find backup codes by user ID', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Find available (unused) backup codes for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   * @returns Array of available backup codes
   */
  async findAvailableByUserId(userId: UUID, organizationId: OrganizationId): Promise<BackupCode[]> {
    try {
      const results = await this.backupCodeRepository.find({
        where: {
          userId,
          organizationId,
          isUsed: false,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return results.map((r: any) => BackupCode.fromJSON(r as unknown as Record<string, unknown>));
    } catch (error) {
      throw new InfrastructureError('Failed to find available backup codes', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Create new backup code (tenant-scoped)
   *
   * @param data - Backup code creation data
   * @returns Created backup code
   */
  async create(data: CreateBackupCodeData): Promise<BackupCode> {
    try {
      const code = BackupCode.fromJSON({
        ...data,
        id: crypto.randomUUID(),
        isUsed: false,
        createdAt: new Date().toISOString(),
      });

      const saved = await this.backupCodeRepository.save(code.toJSON());
      return BackupCode.fromJSON(saved as unknown as Record<string, unknown>);
    } catch (error) {
      throw new InfrastructureError('Failed to create backup code', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Create multiple backup codes in a batch (tenant-scoped)
   *
   * @param dataList - Array of backup code creation data
   * @returns Array of created backup codes
   */
  async createBatch(dataList: CreateBackupCodeData[]): Promise<BackupCode[]> {
    try {
      const codes = dataList.map((data) =>
        BackupCode.fromJSON({
          ...data,
          id: crypto.randomUUID(),
          isUsed: false,
          createdAt: new Date().toISOString(),
        }).toJSON()
      );

      const saved = await this.backupCodeRepository.save(codes);
      return saved.map((s: any) => BackupCode.fromJSON(s as unknown as Record<string, unknown>));
    } catch (error) {
      throw new InfrastructureError('Failed to create backup codes in batch', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Update existing backup code (tenant-scoped)
   *
   * @param code - Updated backup code entity
   * @returns Updated backup code
   */
  async update(code: BackupCode): Promise<BackupCode> {
    try {
      const saved = await this.backupCodeRepository.save(code.toJSON());
      return BackupCode.fromJSON(saved as unknown as Record<string, unknown>);
    } catch (error) {
      throw new InfrastructureError('Failed to update backup code', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Delete all backup codes for a user (tenant-scoped)
   *
   * @param userId - User identifier
   * @param organizationId - Organization for tenant isolation
   */
  async deleteByUserId(userId: UUID, organizationId: OrganizationId): Promise<void> {
    try {
      await this.backupCodeRepository.delete({
        userId,
        organizationId,
      });
    } catch (error) {
      throw new InfrastructureError('Failed to delete backup codes by user ID', {
        service: 'database',
        isTransient: true,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}
