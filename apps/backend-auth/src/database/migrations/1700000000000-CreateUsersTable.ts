/**
 * Migration: Create Users Table
 *
 * Creates the users table with multi-tenant isolation support.
 *
 * Table structure:
 * - Primary key: id (UUID)
 * - Tenant keys: organizationId (required), clinicId (optional)
 * - Unique constraint: (email, organizationId) - email unique per organization
 * - Indexes for performance: organizationId, clinicId, status
 *
 * Security considerations:
 * - Password stored as hash only
 * - Email uniqueness scoped to organization
 * - Indexes support tenant-scoped queries
 *
 * Edge cases handled:
 * - Partial index on clinicId (only where NOT NULL)
 * - JSONB columns for roles and permissions (flexibility)
 * - Enum type for status field
 * - Nullable last_login_at (users who never logged in)
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration to create users table
 */
export class CreateUsersTable1700000000000 implements MigrationInterface {
  /**
   * Run migration: create users table and indexes
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'clinic_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'roles',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false,
          },
          {
            name: 'permissions',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['INVITED', 'ACTIVE', 'INACTIVE', 'BLOCKED'],
            default: "'ACTIVE'",
            isNullable: false,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
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
      true
    );

    // Create unique index on (email, organization_id)
    // This ensures email is unique per organization
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email_organization_unique',
        columnNames: ['email', 'organization_id'],
        isUnique: true,
      })
    );

    // Create index on organization_id for tenant-scoped queries
    // Used for: SELECT * FROM users WHERE organization_id = ?
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_organization_id',
        columnNames: ['organization_id'],
      })
    );

    // Create partial index on clinic_id for clinic-scoped queries
    // Partial index only includes rows where clinic_id IS NOT NULL
    await queryRunner.query(`
      CREATE INDEX idx_users_clinic_id
      ON users(clinic_id)
      WHERE clinic_id IS NOT NULL
    `);

    // Create index on status for filtering by user status
    // Used for: SELECT * FROM users WHERE organization_id = ? AND status = 'ACTIVE'
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_status',
        columnNames: ['status'],
      })
    );

    // Create composite index for common query pattern
    // Used for: SELECT * FROM users WHERE organization_id = ? AND status = 'ACTIVE'
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_org_status',
        columnNames: ['organization_id', 'status'],
      })
    );
  }

  /**
   * Reverse migration: drop users table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indexes are automatically dropped with table)
    await queryRunner.dropTable('users');
  }
}
