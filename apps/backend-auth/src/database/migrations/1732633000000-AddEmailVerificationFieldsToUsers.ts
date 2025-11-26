/**
 * Migration: Add Email Verification Fields to Users Table
 *
 * Adds email verification token and expiration fields to users table.
 *
 * Fields added:
 * - email_verification_token: SHA-256 hash of verification token (nullable)
 * - email_verification_token_expires_at: Token expiration timestamp (nullable)
 *
 * Security considerations:
 * - Token stored as SHA-256 hash, not plain text
 * - Token expires after 24 hours (set at application level)
 * - Index on token hash for fast lookup
 *
 * Edge cases handled:
 * - Nullable fields (NULL when email already verified or no token generated)
 * - Existing users will have NULL values (backward compatible)
 * - Index for token lookup performance
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to add email verification fields to users table
 */
export class AddEmailVerificationFieldsToUsers1732633000000 implements MigrationInterface {
  /**
   * Run migration: add email verification fields and index
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add email_verification_token column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'email_verification_token',
        type: 'varchar',
        length: '64',
        isNullable: true,
        comment: 'SHA-256 hash of email verification token',
      })
    );

    // Add email_verification_token_expires_at column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'email_verification_token_expires_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'Email verification token expiration timestamp',
      })
    );

    // Create index on email_verification_token for fast token lookup
    // Partial index only for non-null values (active tokens)
    await queryRunner.query(`
      CREATE INDEX idx_users_email_verification_token
      ON users(email_verification_token)
      WHERE email_verification_token IS NOT NULL
    `);

    // Create index on expiration for cleanup queries
    await queryRunner.query(`
      CREATE INDEX idx_users_email_verification_expires
      ON users(email_verification_token_expires_at)
      WHERE email_verification_token_expires_at IS NOT NULL
    `);
  }

  /**
   * Reverse migration: remove email verification fields
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('users', 'idx_users_email_verification_expires');
    await queryRunner.dropIndex('users', 'idx_users_email_verification_token');

    // Drop columns
    await queryRunner.dropColumn('users', 'email_verification_token_expires_at');
    await queryRunner.dropColumn('users', 'email_verification_token');
  }
}
