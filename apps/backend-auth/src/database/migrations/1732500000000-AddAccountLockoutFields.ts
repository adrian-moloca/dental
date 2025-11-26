/**
 * Migration: Add Account Lockout Fields
 *
 * Adds brute-force protection fields to the users table:
 * - failed_login_attempts: Counter for consecutive failed logins
 * - lockout_until: Timestamp when account lock expires
 * - last_failed_login_at: Timestamp of most recent failed attempt
 *
 * Security rationale:
 * - Prevents credential stuffing and brute-force attacks
 * - Implements progressive lockout (5 attempts = 15 minute lockout)
 * - Tracks attack timing for security monitoring
 *
 * Performance considerations:
 * - No indexes added (lockout checks happen after user lookup)
 * - Default values ensure existing users start unlocked
 *
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to add account lockout protection fields
 */
export class AddAccountLockoutFields1732500000000 implements MigrationInterface {
  /**
   * Run migration: add lockout columns to users table
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add failed_login_attempts column
    // Tracks consecutive failed login attempts
    // Reset to 0 on successful login
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'failed_login_attempts',
        type: 'integer',
        default: 0,
        isNullable: false,
      })
    );

    // Add lockout_until column
    // NULL = account not locked
    // Timestamp = account locked until this time
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'lockout_until',
        type: 'timestamp',
        isNullable: true,
        default: null,
      })
    );

    // Add last_failed_login_at column
    // NULL = no failed attempts recorded
    // Timestamp = when last failed attempt occurred
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'last_failed_login_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      })
    );
  }

  /**
   * Reverse migration: remove lockout columns
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'last_failed_login_at');
    await queryRunner.dropColumn('users', 'lockout_until');
    await queryRunner.dropColumn('users', 'failed_login_attempts');
  }
}
