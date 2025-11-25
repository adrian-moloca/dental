/**
 * Module Seeder
 * Seeds the module catalog from the predefined MODULE_CATALOG constant
 *
 * This seeder should be run:
 * - On initial system setup
 * - When new modules are added to the catalog
 * - When module definitions are updated
 *
 * Usage:
 * - Can be called manually via CLI/script
 * - Can be run automatically on application startup (optional)
 *
 * @module backend-subscription-service/modules/seeders
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRepository } from '../repositories/module.repository';
import { MODULE_CATALOG } from '../constants/module-catalog.constant';
import { Module, ModuleType } from '../entities/module.entity';

/**
 * Seeder configuration
 */
export interface SeederConfig {
  /** Whether to run seeder automatically on module init */
  autoRun?: boolean;
  /** Whether to update existing modules */
  updateExisting?: boolean;
  /** Whether to log verbose output */
  verbose?: boolean;
}

/**
 * Seeder result
 */
export interface SeederResult {
  /** Number of modules created */
  created: number;
  /** Number of modules updated */
  updated: number;
  /** Number of modules skipped */
  skipped: number;
  /** Total modules in catalog */
  total: number;
  /** Errors encountered */
  errors: Array<{ code: string; error: string }>;
}

/**
 * Module Seeder Service
 */
@Injectable()
export class ModuleSeeder implements OnModuleInit {
  private readonly logger = new Logger(ModuleSeeder.name);
  private hasRun = false;

  constructor(
    private readonly moduleRepository: ModuleRepository,
    private readonly config: SeederConfig = {},
  ) {}

  /**
   * Lifecycle hook - called when the module initializes
   */
  async onModuleInit() {
    if (this.config.autoRun && !this.hasRun) {
      this.logger.log('Auto-running module seeder on application startup');
      try {
        await this.seed(this.config);
      } catch (error: any) {
        this.logger.error('Failed to auto-run module seeder', error.stack);
      }
    }
  }

  /**
   * Seed all modules from catalog
   *
   * @param options - Seeder options
   * @returns Seeder result with statistics
   */
  async seed(options: SeederConfig = {}): Promise<SeederResult> {
    const { updateExisting = true, verbose = false } = options;

    this.logger.log('Starting module seeding...');
    this.logger.log(`Total modules in catalog: ${MODULE_CATALOG.length}`);

    const result: SeederResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      total: MODULE_CATALOG.length,
      errors: [],
    };

    for (const moduleDefinition of MODULE_CATALOG) {
      try {
        await this.seedModule(moduleDefinition, updateExisting, verbose, result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to seed module ${moduleDefinition.code}: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );
        result.errors.push({
          code: moduleDefinition.code,
          error: errorMessage,
        });
      }
    }

    this.hasRun = true;

    this.logger.log('Module seeding completed');
    this.logger.log(
      `Results: Created=${result.created}, Updated=${result.updated}, Skipped=${result.skipped}, Errors=${result.errors.length}`,
    );

    if (result.errors.length > 0) {
      this.logger.warn(`Seeding completed with ${result.errors.length} errors`);
      result.errors.forEach((err) => {
        this.logger.warn(`  - ${err.code}: ${err.error}`);
      });
    }

    return result;
  }

  /**
   * Seed a single module
   */
  private async seedModule(
    moduleDefinition: any,
    updateExisting: boolean,
    verbose: boolean,
    result: SeederResult,
  ): Promise<void> {
    const { code } = moduleDefinition;

    // Check if module already exists
    const existingModule = await this.moduleRepository.findByCode(code);

    if (existingModule) {
      if (updateExisting) {
        // Update existing module
        await this.moduleRepository.updateByCode(code, {
          name: moduleDefinition.name,
          description: moduleDefinition.description,
          type: moduleDefinition.type,
          features: moduleDefinition.features,
          permissions: moduleDefinition.permissions,
          pricing: moduleDefinition.pricing,
          dependencies: moduleDefinition.dependencies,
          displayOrder: moduleDefinition.displayOrder,
          category: moduleDefinition.category,
          icon: moduleDefinition.icon,
          marketingDescription: moduleDefinition.marketingDescription,
        });

        result.updated++;

        if (verbose) {
          this.logger.log(`Updated module: ${code}`);
        }
      } else {
        result.skipped++;

        if (verbose) {
          this.logger.log(`Skipped existing module: ${code}`);
        }
      }
    } else {
      // Create new module
      const moduleData: Partial<Module> = {
        code: moduleDefinition.code,
        name: moduleDefinition.name,
        description: moduleDefinition.description,
        type: moduleDefinition.type,
        features: moduleDefinition.features,
        permissions: moduleDefinition.permissions,
        pricing: moduleDefinition.pricing,
        dependencies: moduleDefinition.dependencies,
        isActive: true,
        isDeprecated: false,
        displayOrder: moduleDefinition.displayOrder,
        category: moduleDefinition.category,
        icon: moduleDefinition.icon,
        marketingDescription: moduleDefinition.marketingDescription,
        metadata: new Map(),
      };

      await this.moduleRepository.create(moduleData);

      result.created++;

      if (verbose) {
        this.logger.log(`Created module: ${code}`);
      }
    }
  }

  /**
   * Seed a specific module by code
   *
   * @param code - Module code to seed
   * @param updateExisting - Whether to update if exists
   */
  async seedOne(code: string, updateExisting = true): Promise<void> {
    const moduleDefinition = MODULE_CATALOG.find((m) => m.code === code);

    if (!moduleDefinition) {
      throw new Error(`Module with code ${code} not found in catalog`);
    }

    this.logger.log(`Seeding module: ${code}`);

    const result: SeederResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      total: 1,
      errors: [],
    };

    await this.seedModule(moduleDefinition, updateExisting, true, result);

    this.logger.log(`Seeding completed for ${code}`);
  }

  /**
   * Delete all modules and re-seed
   * USE WITH CAUTION - This will delete all existing modules
   */
  async reseed(options: SeederConfig = {}): Promise<SeederResult> {
    this.logger.warn('Reseeding - deleting all existing modules');

    const deleteResult = await this.moduleRepository.deleteAll();
    this.logger.warn(`Deleted ${deleteResult.deletedCount} modules`);

    // Reset hasRun flag
    this.hasRun = false;

    // Seed with updateExisting=false since we just deleted everything
    return this.seed({ ...options, updateExisting: false });
  }

  /**
   * Validate that all modules in catalog are seeded
   */
  async validate(): Promise<{
    valid: boolean;
    missing: string[];
    extra: string[];
  }> {
    this.logger.log('Validating seeded modules against catalog');

    const catalogCodes = new Set(MODULE_CATALOG.map((m) => m.code));
    const seededModules = await this.moduleRepository.findAll({
      includeInactive: true,
    });
    const seededCodes = new Set(seededModules.map((m) => m.code));

    const missing = Array.from(catalogCodes).filter((code) => !seededCodes.has(code));
    const extra = Array.from(seededCodes).filter((code) => !catalogCodes.has(code));

    const valid = missing.length === 0 && extra.length === 0;

    if (valid) {
      this.logger.log('Validation passed - all modules are correctly seeded');
    } else {
      if (missing.length > 0) {
        this.logger.warn(`Missing modules: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        this.logger.warn(`Extra modules in database: ${extra.join(', ')}`);
      }
    }

    return { valid, missing, extra };
  }

  /**
   * Get seeding statistics
   */
  async getStats(): Promise<{
    catalogTotal: number;
    databaseTotal: number;
    coreCatalog: number;
    coreDatabase: number;
    premiumCatalog: number;
    premiumDatabase: number;
    synced: boolean;
  }> {
    const catalogTotal = MODULE_CATALOG.length;
    const catalogCore = MODULE_CATALOG.filter((m) => m.type === 'CORE').length;
    const catalogPremium = MODULE_CATALOG.filter((m) => m.type === 'PREMIUM').length;

    const [databaseTotal, coreDatabase, premiumDatabase] = await Promise.all([
      this.moduleRepository.count(),
      this.moduleRepository.count({ type: ModuleType.CORE }),
      this.moduleRepository.count({ type: ModuleType.PREMIUM }),
    ]);

    const synced = catalogTotal === databaseTotal;

    return {
      catalogTotal,
      databaseTotal,
      coreCatalog: catalogCore,
      coreDatabase,
      premiumCatalog: catalogPremium,
      premiumDatabase,
      synced,
    };
  }
}
