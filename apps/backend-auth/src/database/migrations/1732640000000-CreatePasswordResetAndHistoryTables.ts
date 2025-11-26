/**
 * Migration: Create Password Reset and History Tables
 *
 * Creates two tables for password management:
 * 1. password_reset_tokens: Stores secure password reset tokens
 * 2. password_history: Stores historical password hashes for reuse prevention
 *
 * Security features:
 * - Token hashes stored (never plain tokens)
 * - Password history for preventing password reuse
 * - Multi-tenant isolation via organization_id
 * - Cascade deletion on user deletion
 * - Indexes for efficient queries
 *
 * Password Reset Flow:
 * - User requests reset → generate token → hash and store
 * - User submits token → validate → update password → delete token
 * - Tokens expire after 1 hour
 * - One-time use (deleted after successful reset)
 *
 * Password History Flow:
 * - User changes password → store old hash in history
 * - Validate new password against last N passwords
 * - Trim history to configured limit (default: 5)
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create password reset tokens and password history tables
 */
export class CreatePasswordResetAndHistoryTables1732640000000 implements MigrationInterface {
  /**
   * Run migration: create password_reset_tokens and password_history tables
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create password_reset_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_tokens',
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
            comment: 'Organization for multi-tenant isolation',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User requesting password reset',
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '64',
            isNullable: false,
            isUnique: true,
            comment: 'SHA-256 hash of reset token (never store plain tokens)',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
            comment: 'Token expiration time (default: 1 hour from creation)',
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether token has been used for password reset',
          },
          {
            name: 'used_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Timestamp when token was used (audit trail)',
          },
          {
            name: 'request_ip',
            type: 'inet',
            isNullable: true,
            comment: 'IP address from reset request (security logging)',
          },
          {
            name: 'request_user_agent',
            type: 'text',
            isNullable: true,
            comment: 'User agent from reset request (security logging)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes for password_reset_tokens
    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({
        name: 'idx_password_reset_tokens_token_hash',
        columnNames: ['token_hash'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({
        name: 'idx_password_reset_tokens_user_id',
        columnNames: ['user_id'],
      })
    );

    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({
        name: 'idx_password_reset_tokens_organization_id',
        columnNames: ['organization_id'],
      })
    );

    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({
        name: 'idx_password_reset_tokens_expires_at',
        columnNames: ['expires_at'],
      })
    );

    // Create foreign key for password_reset_tokens -> users
    await queryRunner.createForeignKey(
      'password_reset_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'fk_password_reset_tokens_user',
      })
    );

    // Create password_history table
    await queryRunner.createTable(
      new Table({
        name: 'password_history',
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
            comment: 'Organization for multi-tenant isolation',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User whose password was changed',
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Argon2id hash of historical password',
          },
          {
            name: 'change_reason',
            type: 'enum',
            enum: ['registration', 'password_change', 'password_reset', 'admin_reset'],
            isNullable: true,
            comment: 'Reason for password change (audit trail)',
          },
          {
            name: 'change_ip',
            type: 'inet',
            isNullable: true,
            comment: 'IP address from password change (security logging)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'When this password was set',
          },
        ],
      }),
      true
    );

    // Create indexes for password_history
    await queryRunner.createIndex(
      'password_history',
      new TableIndex({
        name: 'idx_password_history_user_id',
        columnNames: ['user_id'],
      })
    );

    await queryRunner.createIndex(
      'password_history',
      new TableIndex({
        name: 'idx_password_history_organization_id',
        columnNames: ['organization_id'],
      })
    );

    await queryRunner.createIndex(
      'password_history',
      new TableIndex({
        name: 'idx_password_history_created_at',
        columnNames: ['created_at'],
      })
    );

    // Create foreign key for password_history -> users
    await queryRunner.createForeignKey(
      'password_history',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'fk_password_history_user',
      })
    );
  }

  /**
   * Reverse migration: drop password_reset_tokens and password_history tables
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop password_history table (foreign keys dropped automatically)
    await queryRunner.dropTable('password_history');

    // Drop password_reset_tokens table (foreign keys dropped automatically)
    await queryRunner.dropTable('password_reset_tokens');
  }
}
