/**
 * Migration: Create Cabinets Table
 *
 * Creates the cabinets table with multi-tenant isolation support.
 *
 * Table structure:
 * - Primary key: id (UUID)
 * - Tenant key: organization_id (required)
 * - Unique constraint: (organization_id, code) where code IS NOT NULL
 * - Indexes for performance: organization_id, (organization_id, status), (organization_id, is_default)
 *
 * Business rules:
 * - Each cabinet belongs to exactly one organization
 * - Cabinet code is unique within an organization (when provided)
 * - One cabinet per organization can be marked as default
 * - JSONB columns for metadata (flexibility)
 *
 * Edge cases handled:
 * - Nullable code (some cabinets may not have codes)
 * - Partial unique index on (organization_id, code) where code IS NOT NULL
 * - ENUM type for status field
 * - is_default flag for identifying primary cabinet
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration to create cabinets table
 */
export class CreateCabinetsTable1700100000000 implements MigrationInterface {
  /**
   * Run migration: create cabinets table and indexes
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create cabinets table
    await queryRunner.createTable(
      new Table({
        name: 'cabinets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: true,
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
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            default: "'ACTIVE'",
            isNullable: false,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
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

    // Create partial unique index on (organization_id, code) where code IS NOT NULL
    // This ensures cabinet code is unique per organization when provided
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_cabinets_org_code_unique
      ON cabinets(organization_id, code)
      WHERE code IS NOT NULL
    `);

    // Create index on organization_id for tenant-scoped queries
    // Used for: SELECT * FROM cabinets WHERE organization_id = ?
    await queryRunner.createIndex(
      'cabinets',
      new TableIndex({
        name: 'idx_cabinets_organization_id',
        columnNames: ['organization_id'],
      }),
    );

    // Create composite index for filtering by organization and status
    // Used for: SELECT * FROM cabinets WHERE organization_id = ? AND status = 'ACTIVE'
    await queryRunner.createIndex(
      'cabinets',
      new TableIndex({
        name: 'idx_cabinets_org_status',
        columnNames: ['organization_id', 'status'],
      }),
    );

    // Create composite index for finding default cabinet per organization
    // Used for: SELECT * FROM cabinets WHERE organization_id = ? AND is_default = true
    await queryRunner.createIndex(
      'cabinets',
      new TableIndex({
        name: 'idx_cabinets_org_is_default',
        columnNames: ['organization_id', 'is_default'],
      }),
    );
  }

  /**
   * Reverse migration: drop cabinets table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indexes are automatically dropped with table)
    await queryRunner.dropTable('cabinets');
  }
}
