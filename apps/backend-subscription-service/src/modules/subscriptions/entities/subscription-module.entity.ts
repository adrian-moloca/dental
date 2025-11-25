/**
 * SubscriptionModule Entity
 *
 * Join table between Subscription and Module entities.
 * Tracks which modules are included in a subscription and their activation status.
 *
 * Multi-tenant isolation:
 * - Inherits organizationId from parent subscription
 * - All queries MUST filter by organizationId
 *
 * Edge cases handled:
 * - Module activation/deactivation during subscription lifetime
 * - Price snapshot at time of activation (module prices can change)
 * - Billing cycle affects module pricing
 * - Core modules cannot be deactivated
 * - Dependent modules must be deactivated before dependencies
 *
 * Business rules:
 * - Each subscription can have multiple modules
 * - Each module can be in multiple subscriptions
 * - Module activation is timestamped for audit trail
 * - Deactivation doesn't delete record (soft deactivation)
 * - Price is snapshot at activation time
 *
 * @module modules/subscriptions/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { Subscription } from './subscription.entity';

/**
 * SubscriptionModule join entity
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique composite index on (subscriptionId, moduleId) - prevent duplicates
 * - Index on subscriptionId for subscription queries
 * - Index on moduleId for module queries
 * - Index on (organizationId, isActive) for active module lookups
 */
@Entity('subscription_modules')
@Index(['subscriptionId', 'moduleId'], { unique: true })
@Index(['subscriptionId'])
@Index(['moduleId'])
@Index(['organizationId', 'isActive'])
export class SubscriptionModule {
  /**
   * Unique subscription-module relationship identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Organization to which this relationship belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   * Inherited from parent subscription for denormalization
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Subscription that includes this module
   * Foreign key to subscriptions table
   */
  @Column({ type: 'uuid', name: 'subscription_id' })
  subscriptionId!: UUID;

  /**
   * Module included in subscription
   * Foreign key to modules table
   * NOTE: This references the modules service/table
   */
  @Column({ type: 'uuid', name: 'module_id' })
  moduleId!: UUID;

  /**
   * Module activation status
   * - true: Module is active and accessible
   * - false: Module is deactivated (but not deleted)
   * Default: true (modules added are active by default)
   */
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  /**
   * Price of this module at activation time
   * Snapshot prevents price changes affecting existing subscriptions
   * Value depends on billing cycle (monthly vs yearly)
   * Precision: 10 digits, 2 decimal places (e.g., 9999.99)
   * NULL for core modules included for free
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price?: number;

  /**
   * Billing cycle this price applies to
   * Must match parent subscription's billing cycle at activation
   * Stored for historical record if subscription changes billing cycle
   */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'billing_cycle',
  })
  billingCycle!: string;

  /**
   * Currency code (ISO 4217)
   * Should match parent subscription currency
   * @example "USD", "EUR", "GBP"
   */
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency!: string;

  /**
   * When module was activated (added to subscription)
   * Set when isActive becomes true
   */
  @Column({ type: 'timestamp', name: 'activated_at' })
  activatedAt!: Date;

  /**
   * When module was deactivated (removed from subscription)
   * NULL if currently active
   * Set when isActive becomes false
   */
  @Column({ type: 'timestamp', name: 'deactivated_at', nullable: true })
  deactivatedAt?: Date;

  /**
   * User who deactivated the module
   * NULL if currently active
   * Used for audit trail
   */
  @Column({ type: 'uuid', name: 'deactivated_by', nullable: true })
  deactivatedBy?: UUID;

  /**
   * Reason for deactivation
   * Optional user-provided explanation
   * Used for analytics and feedback
   */
  @Column({ type: 'text', name: 'deactivation_reason', nullable: true })
  deactivationReason?: string;

  /**
   * Whether this is a core module
   * Core modules cannot be deactivated
   * Denormalized from Module entity for performance
   * Default: false
   */
  @Column({ type: 'boolean', name: 'is_core', default: false })
  isCore!: boolean;

  /**
   * Timestamp when relationship was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when relationship was last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // ============================================================================
  // Relationships
  // ============================================================================

  /**
   * Parent subscription
   * Many subscription-module relationships belong to one subscription
   */
  @ManyToOne(() => Subscription, (subscription) => subscription.modules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: Subscription;

  /**
   * Related module
   * NOTE: Module entity lives in modules service
   * This is a foreign key reference only
   * Actual module data fetched via API if needed
   */
  // Uncomment when Module entity is available:
  // @ManyToOne(() => Module, (module) => module.subscriptions)
  // @JoinColumn({ name: 'module_id' })
  // module!: Module;

  // ============================================================================
  // Business Logic Methods
  // ============================================================================

  /**
   * Check if module can be deactivated
   * Core modules cannot be deactivated
   */
  get canDeactivate(): boolean {
    return !this.isCore && this.isActive;
  }

  /**
   * Check if module can be activated
   * Deactivated modules can be reactivated
   */
  get canActivate(): boolean {
    return !this.isActive;
  }

  /**
   * Calculate days since activation
   * Returns 0 if not activated
   */
  get daysSinceActivation(): number {
    if (!this.activatedAt) return 0;
    const now = new Date();
    const diff = now.getTime() - this.activatedAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate days since deactivation
   * Returns 0 if still active
   */
  get daysSinceDeactivation(): number {
    if (!this.deactivatedAt) return 0;
    const now = new Date();
    const diff = now.getTime() - this.deactivatedAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
