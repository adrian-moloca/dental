/**
 * Password History Entity
 *
 * Tracks historical passwords for users to enforce password reuse policies.
 * Prevents users from reusing recent passwords when changing passwords.
 *
 * Security Features:
 * - Stores hashed passwords (never plain text)
 * - Multi-tenant isolation (organizationId on every record)
 * - Automatic cleanup of old history beyond configured limit
 * - Same Argon2id hashing as current passwords
 *
 * Flow:
 * 1. User changes password → store old password hash in history
 * 2. User attempts password change → validate against last N passwords
 * 3. If match found → reject with clear error message
 * 4. If no match → allow change and store new history entry
 * 5. Trim history to configured limit (default: 5 most recent)
 *
 * Edge Cases:
 * - Registration: Store initial password in history
 * - Password reset: Check history before allowing reset
 * - User deletion → cascade deletes all password history
 * - History limit changes → next password change trims to new limit
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
 * Password History entity
 *
 * Stores historical password hashes for password reuse prevention.
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Index on userId for user-based queries
 * - Index on organizationId for tenant isolation
 * - Index on createdAt for ordering (most recent first)
 */
@Entity('password_history')
@Index(['userId'])
@Index(['organizationId'])
@Index(['createdAt'])
export class PasswordHistory {
  /**
   * Unique password history record identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Organization to which this password history belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * User for whom this password was stored
   */
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  /**
   * User entity relationship
   * Cascade on delete: if user is deleted, all password history is removed
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /**
   * Argon2id hash of the historical password
   *
   * SECURITY: Never store plain text passwords
   * Uses same hashing algorithm as current user password
   *
   * Format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
   *
   * Why store hashed passwords?
   * - Database compromise doesn't reveal historical passwords
   * - Can still verify if new password matches any historical password
   * - Consistent with security best practices
   *
   * @example
   * "$argon2id$v=19$m=65536,t=3,p=4$7fH8K2mN9pQ3rS5tU7vW9x$Aa1Bb2Cc3Dd4Ee5Ff6Gg7Hh8Ii9Jj0Kk1Ll2Mm3Nn4"
   */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  /**
   * Timestamp when this password was set
   * Automatically set by TypeORM on creation
   *
   * Used for:
   * - Ordering password history (most recent first)
   * - Determining which passwords to keep when trimming history
   * - Audit trail for password changes
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Optional metadata: Password change reason
   * Can be used for compliance and audit purposes
   */
  @Column({
    type: 'enum',
    enum: ['registration', 'password_change', 'password_reset', 'admin_reset'],
    nullable: true,
  })
  changeReason?: 'registration' | 'password_change' | 'password_reset' | 'admin_reset';

  /**
   * Optional metadata: IP address from which password was changed
   * For security logging and fraud detection
   */
  @Column({ type: 'inet', name: 'change_ip', nullable: true })
  changeIp?: string;
}
