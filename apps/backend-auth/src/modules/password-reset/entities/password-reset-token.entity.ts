/**
 * Password Reset Token Entity
 *
 * Stores secure password reset tokens for user password recovery.
 *
 * Security Features:
 * - Tokens are hashed using SHA-256 before storage (prevents token theft from DB)
 * - One-time use only (deleted immediately after successful reset)
 * - 1-hour expiration (short-lived tokens reduce attack surface)
 * - Multi-tenant isolation (organizationId on every token)
 *
 * Flow:
 * 1. User requests password reset → generates random token → hashes and stores
 * 2. Email sent with plain token → user clicks link
 * 3. User submits new password with token → verify hash → update password → delete token
 *
 * Edge Cases:
 * - Multiple reset requests → only latest token is valid (previous invalidated)
 * - Expired tokens automatically filtered out in queries
 * - Used tokens immediately deleted (no reuse possible)
 * - User deletion → cascade deletes all reset tokens
 *
 * @module modules/password-reset/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * Password Reset Token entity
 *
 * Stores hashed reset tokens with expiration and multi-tenant scoping.
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on tokenHash for fast lookup
 * - Index on userId for user-based queries
 * - Index on organizationId for tenant isolation
 * - Index on expiresAt for cleanup queries
 */
@Entity('password_reset_tokens')
@Index(['tokenHash'], { unique: true })
@Index(['userId'])
@Index(['organizationId'])
@Index(['expiresAt'])
export class PasswordResetToken {
  /**
   * Unique token identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Organization to which this token belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * User for whom this reset token was created
   */
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  /**
   * User entity relationship
   * Cascade on delete: if user is deleted, all reset tokens are removed
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /**
   * SHA-256 hash of the reset token
   * SECURITY: Never store plain tokens
   *
   * Plain token format: 32 bytes of crypto.randomBytes → 64 hex chars
   * Hash: SHA-256(token) → 64 hex chars
   *
   * Why hash?
   * - If database is compromised, attackers cannot use tokens
   * - Same principle as password hashing
   *
   * @example
   * Plain token (sent in email): "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
   * Stored hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
   */
  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash!: string;

  /**
   * Timestamp when token expires
   * Default: 1 hour from creation
   *
   * Expired tokens:
   * - Cannot be used for password reset
   * - Should be periodically cleaned up via cron job
   */
  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  /**
   * Whether this token has been used
   * Set to true when password is successfully reset
   * Used for audit trail before deletion
   */
  @Column({ type: 'boolean', default: false })
  used!: boolean;

  /**
   * Timestamp when token was used (if applicable)
   * NULL if token has not been used yet
   */
  @Column({ type: 'timestamp', name: 'used_at', nullable: true })
  usedAt?: Date;

  /**
   * IP address from which the reset was requested
   * For security logging and fraud detection
   */
  @Column({ type: 'inet', name: 'request_ip', nullable: true })
  requestIp?: string;

  /**
   * User agent from reset request
   * For security logging
   */
  @Column({ type: 'text', name: 'request_user_agent', nullable: true })
  requestUserAgent?: string;

  /**
   * Timestamp when token was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Check if token is expired
   *
   * @returns true if token has passed its expiration time
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is valid for use
   *
   * Valid if:
   * - Not expired
   * - Not already used
   *
   * @returns true if token can be used for password reset
   */
  isValid(): boolean {
    return !this.isExpired() && !this.used;
  }
}
