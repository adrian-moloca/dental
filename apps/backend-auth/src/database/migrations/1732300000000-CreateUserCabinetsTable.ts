/**
 * Migration: Create User Cabinets Table
 *
 * Creates the user_cabinets table to manage user-to-cabinet associations.
 * This table links users in the auth service to cabinets in the subscription service.
 *
 * Table structure:
 * - Primary key: id (UUID)
 * - Foreign key: user_id → users(id) with CASCADE delete
 * - Reference: cabinet_id (UUID) - references cabinets in subscription service (NO FK, cross-service)
 * - Unique constraint: (user_id, cabinet_id) WHERE deleted_at IS NULL - prevents duplicate assignments
 * - Soft delete support: deleted_at timestamp
 *
 * Business rules enforced:
 * - User can be assigned to multiple cabinets
 * - Cabinet can have multiple users
 * - Each user-cabinet pair is unique (when not soft-deleted)
 * - One cabinet can be marked as primary per user
 * - Deleting a user cascades to their cabinet assignments
 *
 * Indexes for performance:
 * - user_id: Fast lookup of all cabinets for a user
 * - cabinet_id: Fast lookup of all users for a cabinet
 * - (organization_id, user_id): Tenant-scoped user queries
 * - (user_id, is_primary): Fast primary cabinet lookup
 * - Partial unique index on (user_id, cabinet_id) WHERE deleted_at IS NULL
 *
 * Edge cases handled:
 * - Soft delete support (deleted_at column)
 * - Partial unique constraint (only for non-deleted records)
 * - Primary cabinet tracking per user
 * - Active/inactive state per assignment
 * - Cross-service reference (cabinet_id has NO foreign key)
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create user_cabinets table
 */
export class CreateUserCabinetsTable1732300000000 implements MigrationInterface {
  /**
   * Run migration: create user_cabinets table, indexes, and foreign keys
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create user_cabinets table
    await queryRunner.createTable(
      new Table({
        name: 'user_cabinets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'cabinet_id',
            type: 'uuid',
            isNullable: false,
            comment:
              'References cabinets table in subscription service (cross-service reference, no FK)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create partial unique index on (user_id, cabinet_id) WHERE deleted_at IS NULL
    // This ensures a user can only be assigned to the same cabinet once (excluding soft-deleted records)
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_user_cabinets_user_cabinet_unique
      ON user_cabinets(user_id, cabinet_id)
      WHERE deleted_at IS NULL
    `);

    // Create index on user_id for fast lookup of all cabinets for a user
    // Used for: SELECT * FROM user_cabinets WHERE user_id = ?
    await queryRunner.createIndex(
      'user_cabinets',
      new TableIndex({
        name: 'idx_user_cabinets_user_id',
        columnNames: ['user_id'],
      })
    );

    // Create index on cabinet_id for fast lookup of all users assigned to a cabinet
    // Used for: SELECT * FROM user_cabinets WHERE cabinet_id = ?
    await queryRunner.createIndex(
      'user_cabinets',
      new TableIndex({
        name: 'idx_user_cabinets_cabinet_id',
        columnNames: ['cabinet_id'],
      })
    );

    // Create composite index on (organization_id, user_id) for tenant-scoped queries
    // Used for: SELECT * FROM user_cabinets WHERE organization_id = ? AND user_id = ?
    await queryRunner.createIndex(
      'user_cabinets',
      new TableIndex({
        name: 'idx_user_cabinets_org_user',
        columnNames: ['organization_id', 'user_id'],
      })
    );

    // Create partial index on (user_id, is_primary) WHERE is_primary = true
    // Fast lookup for finding the primary cabinet for a user
    // Partial index only includes rows where is_primary IS TRUE
    await queryRunner.query(`
      CREATE INDEX idx_user_cabinets_user_primary
      ON user_cabinets(user_id, is_primary)
      WHERE is_primary = true
    `);

    // Create foreign key to users table with CASCADE delete
    // When a user is deleted, all their cabinet assignments are deleted
    await queryRunner.createForeignKey(
      'user_cabinets',
      new TableForeignKey({
        name: 'fk_user_cabinets_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // NOTE: No foreign key for cabinet_id - it references cabinets table in backend-subscription-service
    // Cross-service references are managed at the application layer, not the database layer
  }

  /**
   * Reverse migration: drop user_cabinets table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indexes and foreign keys are automatically dropped with table)
    await queryRunner.dropTable('user_cabinets');
  }
}
