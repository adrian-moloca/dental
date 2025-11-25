/**
 * Default Cabinet Seeder
 * Seeds default "Main Office" cabinet for organizations that don't have one
 *
 * This seeder should be run:
 * - On initial system setup
 * - When a new organization is created without a default cabinet
 * - To repair missing default cabinets
 *
 * Business rules:
 * - Creates "Main Office" cabinet if organization has no cabinets
 * - Sets isDefault = true for the created cabinet
 * - Status = ACTIVE
 * - Default settings (timezone: UTC, language: en, currency: USD)
 *
 * Idempotency:
 * - Safe to run multiple times
 * - Skips organizations that already have cabinets
 * - No duplicate cabinets created
 *
 * @module backend-subscription-service/modules/cabinets/seeders
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cabinet, CabinetSettings } from '../entities/cabinet.entity';
import { EntityStatus } from '@dentalos/shared-types';
import type { OrganizationId, UUID } from '@dentalos/shared-types';

/**
 * Seeder configuration
 */
export interface CabinetSeederConfig {
  /** Whether to run seeder automatically on module init */
  autoRun?: boolean;
  /** Whether to create cabinet for all organizations without one */
  createForAll?: boolean;
  /** Whether to log verbose output */
  verbose?: boolean;
  /** Custom default cabinet name */
  defaultCabinetName?: string;
  /** Custom default settings */
  defaultSettings?: Partial<CabinetSettings>;
}

/**
 * Seeder result
 */
export interface CabinetSeederResult {
  /** Number of cabinets created */
  created: number;
  /** Number of organizations skipped (already have cabinets) */
  skipped: number;
  /** Total organizations processed */
  total: number;
  /** Errors encountered */
  errors: Array<{ organizationId: string; error: string }>;
}

/**
 * Result for single organization seeding
 */
export interface SeedOrganizationResult {
  organizationId: OrganizationId;
  created: boolean;
  cabinetId?: UUID;
  reason?: string;
}

/**
 * Default Cabinet Seeder Service
 *
 * Creates default cabinets for organizations that don't have any.
 * Ensures every organization has at least one cabinet for operations.
 */
@Injectable()
export class DefaultCabinetSeeder {
  private readonly logger = new Logger(DefaultCabinetSeeder.name);

  // Default cabinet settings
  private readonly DEFAULT_SETTINGS: CabinetSettings = {
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { closed: true, start: '', end: '' },
      sunday: { closed: true, start: '', end: '' },
    },
  };

  constructor(
    @InjectRepository(Cabinet)
    private readonly cabinetRepository: Repository<Cabinet>,
  ) {}

  /**
   * Seed default cabinets for all organizations without cabinets
   *
   * @param options - Seeder configuration
   * @returns Seeder result with statistics
   */
  async seedAll(_options: CabinetSeederConfig = {}): Promise<CabinetSeederResult> {
    this.logger.log('Starting default cabinet seeding for all organizations...');

    const result: CabinetSeederResult = {
      created: 0,
      skipped: 0,
      total: 0,
      errors: [],
    };

    // Get all unique organization IDs from cabinets table
    // Organizations without cabinets will not appear in this list
    const existingOrganizations = await this.cabinetRepository
      .createQueryBuilder('cabinet')
      .select('DISTINCT cabinet.organizationId', 'organizationId')
      .getRawMany();

    const existingOrgIds = new Set(existingOrganizations.map((row: any) => row.organizationId));

    this.logger.log(`Found ${existingOrgIds.size} organizations with existing cabinets`);

    // NOTE: In a real implementation, you would fetch all organization IDs
    // from an organizations table or service. Since we don't have that context,
    // this seeder is designed to be called with specific organizationIds.
    // The seedAll method here is a placeholder for future enhancement.

    this.logger.log(
      'Seed completed. To seed specific organizations, use seedForOrganization(organizationId)',
    );

    return result;
  }

  /**
   * Seed default cabinet for a specific organization
   *
   * @param organizationId - Organization ID to seed cabinet for
   * @param options - Seeder configuration
   * @returns Seed result for the organization
   */
  async seedForOrganization(
    organizationId: OrganizationId,
    options: CabinetSeederConfig = {},
  ): Promise<SeedOrganizationResult> {
    const { verbose = false, defaultCabinetName = 'Main Office' } = options;

    if (verbose) {
      this.logger.log(`Seeding default cabinet for organization: ${organizationId}`);
    }

    // Check if organization already has cabinets
    const existingCount = await this.cabinetRepository.count({
      where: { organizationId },
    });

    if (existingCount > 0) {
      if (verbose) {
        this.logger.log(
          `Organization ${organizationId} already has ${existingCount} cabinet(s), skipping`,
        );
      }
      return {
        organizationId,
        created: false,
        reason: `Organization already has ${existingCount} cabinet(s)`,
      };
    }

    // Create default cabinet
    try {
      const cabinet = await this.createDefaultCabinet(
        organizationId,
        defaultCabinetName,
        undefined,
      );

      if (verbose) {
        this.logger.log(
          `Created default cabinet for organization ${organizationId}: ${cabinet.id}`,
        );
      }

      return {
        organizationId,
        created: true,
        cabinetId: cabinet.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create default cabinet for organization ${organizationId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  /**
   * Seed default cabinets for multiple organizations
   *
   * @param organizationIds - Array of organization IDs to seed
   * @param options - Seeder configuration
   * @returns Seeder result with statistics
   */
  async seedForOrganizations(
    organizationIds: OrganizationId[],
    options: CabinetSeederConfig = {},
  ): Promise<CabinetSeederResult> {
    const { verbose = false } = options;

    this.logger.log(`Seeding default cabinets for ${organizationIds.length} organizations...`);

    const result: CabinetSeederResult = {
      created: 0,
      skipped: 0,
      total: organizationIds.length,
      errors: [],
    };

    for (const organizationId of organizationIds) {
      try {
        const orgResult = await this.seedForOrganization(organizationId, options);

        if (orgResult.created) {
          result.created++;
        } else {
          result.skipped++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push({
          organizationId,
          error: errorMessage,
        });

        if (verbose) {
          this.logger.error(`Error seeding organization ${organizationId}: ${errorMessage}`);
        }
      }
    }

    this.logger.log('Default cabinet seeding completed');
    this.logger.log(
      `Results: Created=${result.created}, Skipped=${result.skipped}, Errors=${result.errors.length}`,
    );

    if (result.errors.length > 0) {
      this.logger.warn(`Seeding completed with ${result.errors.length} errors`);
      result.errors.forEach((err) => {
        this.logger.warn(`  - ${err.organizationId}: ${err.error}`);
      });
    }

    return result;
  }

  /**
   * Create default cabinet for organization
   *
   * @param organizationId - Organization ID
   * @param name - Cabinet name
   * @param customSettings - Optional custom settings to merge with defaults
   * @returns Created cabinet entity
   */
  private async createDefaultCabinet(
    organizationId: OrganizationId,
    name: string,
    customSettings?: Partial<CabinetSettings>,
  ): Promise<Cabinet> {
    // Merge custom settings with defaults
    const settings: CabinetSettings = {
      ...this.DEFAULT_SETTINGS,
      ...customSettings,
    };

    // Create cabinet entity
    const cabinet = this.cabinetRepository.create({
      organizationId,
      name,
      isDefault: true,
      status: EntityStatus.ACTIVE,
      settings,
    });

    // Save to database
    const saved = await this.cabinetRepository.save(cabinet);

    this.logger.log(`Default cabinet created: ${saved.id} for org ${organizationId}`);

    return saved;
  }

  /**
   * Validate cabinet seeding for organizations
   * Returns organizations that don't have cabinets
   *
   * @param organizationIds - Optional list of organization IDs to check
   * @returns Object with validation results
   */
  async validate(organizationIds?: OrganizationId[]): Promise<{
    valid: boolean;
    organizationsWithoutCabinets: OrganizationId[];
    organizationsWithCabinets: OrganizationId[];
  }> {
    this.logger.log('Validating cabinet seeding...');

    if (!organizationIds || organizationIds.length === 0) {
      this.logger.warn('No organization IDs provided for validation. Skipping validation.');
      return {
        valid: true,
        organizationsWithoutCabinets: [],
        organizationsWithCabinets: [],
      };
    }

    const organizationsWithCabinets: OrganizationId[] = [];
    const organizationsWithoutCabinets: OrganizationId[] = [];

    for (const organizationId of organizationIds) {
      const count = await this.cabinetRepository.count({
        where: { organizationId },
      });

      if (count > 0) {
        organizationsWithCabinets.push(organizationId);
      } else {
        organizationsWithoutCabinets.push(organizationId);
      }
    }

    const valid = organizationsWithoutCabinets.length === 0;

    if (valid) {
      this.logger.log(
        `Validation passed - all ${organizationIds.length} organizations have cabinets`,
      );
    } else {
      this.logger.warn(
        `Validation failed - ${organizationsWithoutCabinets.length} organizations without cabinets`,
      );
      this.logger.warn(
        `Organizations without cabinets: ${organizationsWithoutCabinets.join(', ')}`,
      );
    }

    return {
      valid,
      organizationsWithoutCabinets,
      organizationsWithCabinets,
    };
  }

  /**
   * Get seeding statistics
   *
   * @returns Statistics about cabinet seeding
   */
  async getStats(): Promise<{
    totalCabinets: number;
    defaultCabinets: number;
    activeCabinets: number;
    organizationsWithCabinets: number;
    organizationsWithMultipleCabinets: number;
  }> {
    const totalCabinets = await this.cabinetRepository.count();
    const defaultCabinets = await this.cabinetRepository.count({
      where: { isDefault: true },
    });
    const activeCabinets = await this.cabinetRepository.count({
      where: { status: EntityStatus.ACTIVE },
    });

    // Count unique organizations
    const organizationsResult = await this.cabinetRepository
      .createQueryBuilder('cabinet')
      .select('cabinet.organizationId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('cabinet.organizationId')
      .getRawMany();

    const organizationsWithCabinets = organizationsResult.length;
    const organizationsWithMultipleCabinets = organizationsResult.filter(
      (row: any) => parseInt(row.count) > 1,
    ).length;

    return {
      totalCabinets,
      defaultCabinets,
      activeCabinets,
      organizationsWithCabinets,
      organizationsWithMultipleCabinets,
    };
  }

  /**
   * Repair missing default cabinets
   * Finds organizations with cabinets but no default, and sets one as default
   *
   * @returns Number of organizations repaired
   */
  async repairMissingDefaults(): Promise<number> {
    this.logger.log('Repairing missing default cabinet flags...');

    // Find organizations with cabinets but no default
    const orgsWithoutDefault = await this.cabinetRepository
      .createQueryBuilder('cabinet')
      .select('cabinet.organizationId')
      .where('cabinet.deletedAt IS NULL')
      .groupBy('cabinet.organizationId')
      .having('SUM(CASE WHEN cabinet.isDefault = true THEN 1 ELSE 0 END) = 0')
      .getRawMany();

    let repaired = 0;

    for (const row of orgsWithoutDefault) {
      const organizationId = row.organizationId;

      // Find the oldest cabinet for this organization
      const oldestCabinet = await this.cabinetRepository.findOne({
        where: { organizationId },
        order: { createdAt: 'ASC' },
      });

      if (oldestCabinet) {
        // Set as default
        oldestCabinet.isDefault = true;
        await this.cabinetRepository.save(oldestCabinet);

        this.logger.log(
          `Set cabinet ${oldestCabinet.id} as default for organization ${organizationId}`,
        );
        repaired++;
      }
    }

    this.logger.log(`Repaired ${repaired} organizations`);

    return repaired;
  }

  /**
   * Remove duplicate default cabinets
   * Ensures only one cabinet per organization is marked as default
   *
   * @returns Number of duplicate defaults removed
   */
  async removeDuplicateDefaults(): Promise<number> {
    this.logger.log('Removing duplicate default cabinet flags...');

    // Find organizations with multiple default cabinets
    const orgsWithMultipleDefaults = await this.cabinetRepository
      .createQueryBuilder('cabinet')
      .select('cabinet.organizationId')
      .where('cabinet.deletedAt IS NULL')
      .andWhere('cabinet.isDefault = true')
      .groupBy('cabinet.organizationId')
      .having('COUNT(*) > 1')
      .getRawMany();

    let fixed = 0;

    for (const row of orgsWithMultipleDefaults) {
      const organizationId = row.organizationId;

      // Get all default cabinets for this organization
      const defaultCabinets = await this.cabinetRepository.find({
        where: { organizationId, isDefault: true },
        order: { createdAt: 'ASC' },
      });

      // Keep the first (oldest) as default, unset the rest
      for (let i = 1; i < defaultCabinets.length; i++) {
        defaultCabinets[i].isDefault = false;
        await this.cabinetRepository.save(defaultCabinets[i]);
        this.logger.log(
          `Removed default flag from cabinet ${defaultCabinets[i].id} for organization ${organizationId}`,
        );
        fixed++;
      }
    }

    this.logger.log(`Fixed ${fixed} duplicate default cabinets`);

    return fixed;
  }
}
