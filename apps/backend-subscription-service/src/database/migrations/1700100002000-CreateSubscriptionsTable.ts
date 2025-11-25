/**
 * Migration: Create Subscriptions Table
 *
 * Creates the subscriptions table with multi-tenant isolation support and foreign key relationships.
 *
 * Table structure:
 * - Primary key: id (UUID)
 * - Tenant key: organization_id (required)
 * - Foreign key: cabinet_id references cabinets(id)
 * - Unique constraint on cabinet_id (one subscription per cabinet)
 * - Indexes for performance: (organization_id, status), status, cabinet_id
 *
 * Business rules:
 * - Each subscription belongs to exactly one organization
 * - Each subscription is associated with exactly one cabinet
 * - One-to-one relationship between subscription and cabinet
 * - Subscriptions have lifecycle status (TRIAL, ACTIVE, SUSPENDED, CANCELLED, EXPIRED)
 * - JSONB columns for billing_details and metadata (flexibility)
 *
 * Edge cases handled:
 * - Nullable start_date/end_date (perpetual subscriptions, trials)
 * - Nullable cancelled_at, suspended_at, resumed_at (state transitions)
 * - ENUM type for status field
 * - Foreign key with ON DELETE CASCADE for cabinet removal
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create subscriptions table
 */
export class CreateSubscriptionsTable1700100002000 implements MigrationInterface {
  /**
   * Run migration: create subscriptions table, indexes, and foreign keys
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
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
            name: 'cabinet_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'],
            default: "'TRIAL'",
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'trial_ends_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'suspended_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resumed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'billing_details',
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

    // Create unique index on cabinet_id
    // Ensures one-to-one relationship: one subscription per cabinet
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'idx_subscriptions_cabinet_id_unique',
        columnNames: ['cabinet_id'],
        isUnique: true,
      }),
    );

    // Create composite index for filtering by organization and status
    // Used for: SELECT * FROM subscriptions WHERE organization_id = ? AND status = 'ACTIVE'
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'idx_subscriptions_org_status',
        columnNames: ['organization_id', 'status'],
      }),
    );

    // Create index on status for global status queries
    // Used for: SELECT * FROM subscriptions WHERE status = 'EXPIRED'
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'idx_subscriptions_status',
        columnNames: ['status'],
      }),
    );

    // Create index on cabinet_id for reverse lookups
    // Used for: SELECT * FROM subscriptions WHERE cabinet_id = ?
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'idx_subscriptions_cabinet_id',
        columnNames: ['cabinet_id'],
      }),
    );

    // Create foreign key to cabinets table
    // Ensures referential integrity: subscription must reference valid cabinet
    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        columnNames: ['cabinet_id'],
        referencedTableName: 'cabinets',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  /**
   * Reverse migration: drop subscriptions table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indexes and foreign keys are automatically dropped with table)
    await queryRunner.dropTable('subscriptions');
  }
}
