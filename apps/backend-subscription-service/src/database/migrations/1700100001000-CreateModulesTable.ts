/**
 * Migration: Create Modules Table
 *
 * Creates the modules table for managing subscription features/modules.
 *
 * Table structure:
 * - Primary key: id (UUID)
 * - Unique index on code (global module identifier)
 * - Indexes for performance: type, is_active
 *
 * Business rules:
 * - Module code is globally unique (not tenant-scoped)
 * - Modules define available features for subscriptions
 * - Module type categorizes modules (CORE, FEATURE, ADDON, etc.)
 * - JSONB columns for configuration and metadata (flexibility)
 *
 * Edge cases handled:
 * - Global modules (not tenant-specific)
 * - ENUM type for module type field
 * - is_active flag for enabling/disabling modules
 * - JSONB for flexible configuration schema
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration to create modules table
 */
export class CreateModulesTable1700100001000 implements MigrationInterface {
  /**
   * Run migration: create modules table and indexes
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create modules table
    await queryRunner.createTable(
      new Table({
        name: 'modules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['CORE', 'FEATURE', 'ADDON', 'INTEGRATION'],
            default: "'FEATURE'",
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'configuration',
            type: 'jsonb',
            default: "'{}'",
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create unique index on code
    // Module code is globally unique across all tenants
    await queryRunner.createIndex(
      'modules',
      new TableIndex({
        name: 'idx_modules_code_unique',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Create index on type for filtering modules by category
    // Used for: SELECT * FROM modules WHERE type = 'FEATURE'
    await queryRunner.createIndex(
      'modules',
      new TableIndex({
        name: 'idx_modules_type',
        columnNames: ['type'],
      }),
    );

    // Create index on is_active for filtering active modules
    // Used for: SELECT * FROM modules WHERE is_active = true
    await queryRunner.createIndex(
      'modules',
      new TableIndex({
        name: 'idx_modules_is_active',
        columnNames: ['is_active'],
      }),
    );
  }

  /**
   * Reverse migration: drop modules table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indexes are automatically dropped with table)
    await queryRunner.dropTable('modules');
  }
}
