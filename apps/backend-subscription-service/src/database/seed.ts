/**
 * Database Seeder CLI
 * Unified command to seed all database tables with initial data
 *
 * Usage:
 *   pnpm seed                    # Seed all tables
 *   pnpm seed:modules            # Seed modules only
 *   pnpm seed:cabinets           # Seed cabinets only
 *
 * Features:
 * - Idempotent (safe to run multiple times)
 * - Transaction-based for atomicity
 * - Structured logging with progress indicators
 * - Error handling for constraint violations
 * - Exit codes for CI/CD integration
 *
 * @module database/seed
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { ModuleSeeder } from '../modules/modules/seeders/module.seeder';
import { DefaultCabinetSeeder } from '../modules/cabinets/seeders/default-cabinet.seeder';
import type { AppConfig } from '../configuration';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * Seeder options from command line arguments
 */
interface SeederOptions {
  /** Seed modules only */
  modulesOnly?: boolean;
  /** Seed cabinets only */
  cabinetsOnly?: boolean;
  /** Verbose logging */
  verbose?: boolean;
  /** Update existing modules */
  updateExisting?: boolean;
  /** Organization IDs to seed cabinets for (comma-separated) */
  organizationIds?: string[];
}

/**
 * Parse command line arguments
 */
function parseArguments(): SeederOptions {
  const args = process.argv.slice(2);
  const options: SeederOptions = {
    modulesOnly: false,
    cabinetsOnly: false,
    verbose: false,
    updateExisting: true,
    organizationIds: [],
  };

  for (const arg of args) {
    if (arg === '--modules-only') {
      options.modulesOnly = true;
    } else if (arg === '--cabinets-only') {
      options.cabinetsOnly = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--no-update') {
      options.updateExisting = false;
    } else if (arg.startsWith('--orgs=')) {
      const orgIds = arg.replace('--orgs=', '').split(',');
      options.organizationIds = orgIds.filter((id) => id.trim());
    }
  }

  return options;
}

/**
 * Seed modules using ModuleSeeder
 */
async function seedModules(
  moduleSeeder: ModuleSeeder,
  verbose: boolean,
  updateExisting: boolean,
): Promise<void> {
  const logger = new Logger('SeedModules');

  logger.log('========================================');
  logger.log('  Seeding Modules');
  logger.log('========================================');

  const result = await moduleSeeder.seed({
    updateExisting,
    verbose,
  });

  logger.log('');
  logger.log('Module Seeding Results:');
  logger.log(`  Created: ${result.created}`);
  logger.log(`  Updated: ${result.updated}`);
  logger.log(`  Skipped: ${result.skipped}`);
  logger.log(`  Errors:  ${result.errors.length}`);
  logger.log('');

  if (result.errors.length > 0) {
    logger.error('Errors encountered during module seeding:');
    result.errors.forEach((err) => {
      logger.error(`  - ${err.code}: ${err.error}`);
    });
    throw new Error('Module seeding failed with errors');
  }

  // Validate modules
  logger.log('Validating seeded modules...');
  const validation = await moduleSeeder.validate();

  if (!validation.valid) {
    logger.error('Module validation failed:');
    if (validation.missing.length > 0) {
      logger.error(`  Missing modules: ${validation.missing.join(', ')}`);
    }
    if (validation.extra.length > 0) {
      logger.warn(`  Extra modules: ${validation.extra.join(', ')}`);
    }
    throw new Error('Module validation failed');
  }

  logger.log('Module seeding completed successfully!');
  logger.log('');
}

/**
 * Seed cabinets using DefaultCabinetSeeder
 */
async function seedCabinets(
  cabinetSeeder: DefaultCabinetSeeder,
  verbose: boolean,
  organizationIds?: string[],
): Promise<void> {
  const logger = new Logger('SeedCabinets');

  logger.log('========================================');
  logger.log('  Seeding Default Cabinets');
  logger.log('========================================');

  if (!organizationIds || organizationIds.length === 0) {
    logger.warn('No organization IDs provided.');
    logger.warn('To seed cabinets, provide organization IDs:');
    logger.warn('  pnpm seed --orgs=org1,org2,org3');
    logger.warn('');
    logger.warn('Skipping cabinet seeding...');
    logger.log('');
    return;
  }

  logger.log(`Seeding cabinets for ${organizationIds.length} organizations...`);
  logger.log('');

  const result = await cabinetSeeder.seedForOrganizations(organizationIds as OrganizationId[], {
    verbose,
  });

  logger.log('');
  logger.log('Cabinet Seeding Results:');
  logger.log(`  Created: ${result.created}`);
  logger.log(`  Skipped: ${result.skipped}`);
  logger.log(`  Errors:  ${result.errors.length}`);
  logger.log('');

  if (result.errors.length > 0) {
    logger.error('Errors encountered during cabinet seeding:');
    result.errors.forEach((err) => {
      logger.error(`  - ${err.organizationId}: ${err.error}`);
    });
    throw new Error('Cabinet seeding failed with errors');
  }

  // Repair and cleanup
  logger.log('Repairing missing default flags...');
  const repaired = await cabinetSeeder.repairMissingDefaults();
  logger.log(`  Repaired: ${repaired} organizations`);
  logger.log('');

  logger.log('Removing duplicate default flags...');
  const fixed = await cabinetSeeder.removeDuplicateDefaults();
  logger.log(`  Fixed: ${fixed} duplicate defaults`);
  logger.log('');

  logger.log('Cabinet seeding completed successfully!');
  logger.log('');
}

/**
 * Display seeding statistics
 */
async function displayStatistics(
  moduleSeeder: ModuleSeeder,
  cabinetSeeder: DefaultCabinetSeeder,
): Promise<void> {
  const logger = new Logger('SeedStats');

  logger.log('========================================');
  logger.log('  Database Statistics');
  logger.log('========================================');

  // Module stats
  const moduleStats = await moduleSeeder.getStats();
  logger.log('');
  logger.log('Modules:');
  logger.log(`  Total:           ${moduleStats.databaseTotal}`);
  logger.log(`  Core:            ${moduleStats.coreDatabase}`);
  logger.log(`  Premium:         ${moduleStats.premiumDatabase}`);
  logger.log(`  Synced:          ${moduleStats.synced ? 'Yes' : 'No'}`);

  // Cabinet stats
  const cabinetStats = await cabinetSeeder.getStats();
  logger.log('');
  logger.log('Cabinets:');
  logger.log(`  Total:           ${cabinetStats.totalCabinets}`);
  logger.log(`  Default:         ${cabinetStats.defaultCabinets}`);
  logger.log(`  Active:          ${cabinetStats.activeCabinets}`);
  logger.log(`  Organizations:   ${cabinetStats.organizationsWithCabinets}`);
  logger.log(`  Multi-cabinet:   ${cabinetStats.organizationsWithMultipleCabinets}`);

  logger.log('');
  logger.log('========================================');
  logger.log('');
}

/**
 * Main seeder function
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  const logger = new Logger('DatabaseSeeder');

  logger.log('');
  logger.log('========================================');
  logger.log('  DentalOS Database Seeder');
  logger.log('========================================');
  logger.log('');

  // Parse command line arguments
  const options = parseArguments();

  if (options.verbose) {
    logger.log('Running in verbose mode');
  }

  if (options.modulesOnly) {
    logger.log('Mode: Modules only');
  } else if (options.cabinetsOnly) {
    logger.log('Mode: Cabinets only');
  } else {
    logger.log('Mode: All tables');
  }

  logger.log('');

  // Bootstrap NestJS application
  logger.log('Bootstrapping application...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    // Get services
    const moduleSeeder = app.get(ModuleSeeder);
    const cabinetSeeder = app.get(DefaultCabinetSeeder);
    const configService = app.get(ConfigService<AppConfig, true>);

    // Log environment
    const nodeEnv = configService.get('nodeEnv', { infer: true });
    logger.log(`Environment: ${nodeEnv}`);
    logger.log('');

    // Seed modules
    if (!options.cabinetsOnly) {
      await seedModules(moduleSeeder, options.verbose || false, options.updateExisting || true);
    }

    // Seed cabinets
    if (!options.modulesOnly) {
      await seedCabinets(cabinetSeeder, options.verbose || false, options.organizationIds);
    }

    // Display statistics
    await displayStatistics(moduleSeeder, cabinetSeeder);

    // Success
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.log(`Seeding completed successfully in ${duration}s`);
    logger.log('');

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed with error:');
    logger.error(error instanceof Error ? error.message : String(error));

    if (error instanceof Error && error.stack) {
      logger.error(error.stack);
    }

    await app.close();
    process.exit(1);
  }
}

// Run seeder
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
