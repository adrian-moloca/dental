/**
 * Migration: Create Subscription Modules Table
 *
 * Creates the subscription_modules join table for many-to-many relationship
 * between subscriptions and modules.
 *
 * Table structure:
 * - Primary key: id (UUID)
 * - Foreign keys: subscription_id, module_id
 * - Unique constraint: (subscription_id, module_id) - prevents duplicate assignments
 * - Indexes for performance: subscription_id, module_id
 *
 * Business rules:
 * - Many-to-many relationship: subscriptions can have multiple modules
 * - Each module can be assigned to multiple subscriptions
 * - Unique constraint prevents duplicate module assignments
 * - CASCADE delete: removing subscription/module removes associations
 * - JSONB columns for module-specific configuration and metadata
 *
 * Edge cases handled:
 * - Nullable enabled_at, disabled_at (module lifecycle within subscription)
 * - is_active flag for temporary module activation/deactivation
 * - JSONB for module-specific configuration overrides
 * - Foreign keys with ON DELETE CASCADE for data integrity
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create subscription_modules join table
 */
export class CreateSubscriptionModulesTable1700100003000 implements MigrationInterface {
  /**
   * Run migration: create subscription_modules table, indexes, and foreign keys
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create subscription_modules join table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_modules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'subscription_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'module_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'enabled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'disabled_at',
            type: 'timestamp',
            isNullable: true,
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

    // Create unique index on (subscription_id, module_id)
    // Prevents duplicate module assignments to the same subscription
    await queryRunner.createIndex(
      'subscription_modules',
      new TableIndex({
        name: 'idx_subscription_modules_sub_mod_unique',
        columnNames: ['subscription_id', 'module_id'],
        isUnique: true,
      }),
    );

    // Create index on subscription_id for finding all modules in a subscription
    // Used for: SELECT * FROM subscription_modules WHERE subscription_id = ?
    await queryRunner.createIndex(
      'subscription_modules',
      new TableIndex({
        name: 'idx_subscription_modules_subscription_id',
        columnNames: ['subscription_id'],
      }),
    );

    // Create index on module_id for finding all subscriptions using a module
    // Used for: SELECT * FROM subscription_modules WHERE module_id = ?
    await queryRunner.createIndex(
      'subscription_modules',
      new TableIndex({
        name: 'idx_subscription_modules_module_id',
        columnNames: ['module_id'],
      }),
    );

    // Create foreign key to subscriptions table
    // Ensures referential integrity and cascades deletion
    await queryRunner.createForeignKey(
      'subscription_modules',
      new TableForeignKey({
        columnNames: ['subscription_id'],
        referencedTableName: 'subscriptions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to modules table
    // Ensures referential integrity and cascades deletion
    await queryRunner.createForeignKey(
      'subscription_modules',
      new TableForeignKey({
        columnNames: ['module_id'],
        referencedTableName: 'modules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  /**
   * Reverse migration: drop subscription_modules table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indexes and foreign keys are automatically dropped with table)
    await queryRunner.dropTable('subscription_modules');
  }
}
