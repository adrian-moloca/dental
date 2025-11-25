/**
 * Subscription Entity
 *
 * Represents a subscription for a dental cabinet (practice).
 * Manages subscription lifecycle with states: TRIAL → ACTIVE → EXPIRED/CANCELLED/SUSPENDED
 *
 * Multi-tenant isolation:
 * - All queries MUST filter by organizationId
 * - Each cabinet can have only ONE active subscription
 * - Subscription is unique per cabinetId
 *
 * Edge cases handled:
 * - Trial period management (30 days default)
 * - Billing cycle changes (MONTHLY → YEARLY)
 * - Grace period for payment failures
 * - Cancellation at period end vs immediate
 * - Stripe payment integration tracking
 * - Auto-renewal management
 * - Module price calculation based on billing cycle
 *
 * State machine transitions:
 * - TRIAL → ACTIVE (payment successful)
 * - TRIAL → EXPIRED (trial ends without payment)
 * - ACTIVE → SUSPENDED (payment failure, grace period active)
 * - ACTIVE → CANCELLED (user cancellation)
 * - SUSPENDED → ACTIVE (payment recovered)
 * - SUSPENDED → EXPIRED (grace period ends)
 * - Any state → CANCELLED (admin action)
 *
 * @module modules/subscriptions/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { SubscriptionModule } from './subscription-module.entity';

/**
 * Subscription status enumeration
 *
 * State definitions:
 * - TRIAL: Free trial period (30 days default)
 * - ACTIVE: Paid subscription with valid payment
 * - EXPIRED: Subscription ended (trial or paid period)
 * - SUSPENDED: Payment failed but in grace period
 * - CANCELLED: User or admin cancelled subscription
 */
export enum SubscriptionStatus {
  /** Free trial period active */
  TRIAL = 'TRIAL',
  /** Paid subscription active with valid payment */
  ACTIVE = 'ACTIVE',
  /** Subscription period ended without renewal */
  EXPIRED = 'EXPIRED',
  /** Payment failed, grace period active */
  SUSPENDED = 'SUSPENDED',
  /** User or admin cancelled subscription */
  CANCELLED = 'CANCELLED',
}

/**
 * Billing cycle enumeration
 *
 * Affects pricing:
 * - MONTHLY: Pay each month, higher per-month cost
 * - YEARLY: Pay annually, discounted per-month cost
 */
export enum BillingCycle {
  /** Monthly billing cycle */
  MONTHLY = 'MONTHLY',
  /** Annual billing cycle (discounted) */
  YEARLY = 'YEARLY',
}

/**
 * Subscription entity with multi-tenant isolation
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on cabinetId (one subscription per cabinet)
 * - Composite index on (organizationId, status) for tenant queries
 * - Index on stripeSubscriptionId for webhook lookups
 */
@Entity('subscriptions')
@Index(['cabinetId'], { unique: true })
@Index(['organizationId', 'status'])
@Index(['stripeSubscriptionId'])
export class Subscription {
  /**
   * Unique subscription identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Organization to which this subscription belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Cabinet (dental practice) this subscription is for
   * UNIQUE: Each cabinet can have only one subscription
   */
  @Column({ type: 'uuid', name: 'cabinet_id', unique: true })
  cabinetId!: UUID;

  /**
   * Current subscription status
   * Default: TRIAL (new subscriptions start in trial)
   */
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status!: SubscriptionStatus;

  /**
   * Billing cycle (monthly or yearly)
   * Affects module pricing and renewal period
   * Default: MONTHLY
   */
  @Column({
    type: 'enum',
    enum: BillingCycle,
    name: 'billing_cycle',
    default: BillingCycle.MONTHLY,
  })
  billingCycle!: BillingCycle;

  /**
   * Total subscription price per billing cycle
   * Calculated as sum of all active module prices
   * Precision: 10 digits, 2 decimal places (e.g., 9999999.99)
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice!: number;

  /**
   * Currency code (ISO 4217)
   * Default: USD
   * @example "USD", "EUR", "GBP"
   */
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency!: string;

  // ============================================================================
  // Trial Period Fields
  // ============================================================================

  /**
   * Trial period start date
   * Set when subscription is created in TRIAL status
   * NULL for subscriptions that never had trial
   */
  @Column({ type: 'timestamp', name: 'trial_starts_at', nullable: true })
  trialStartsAt?: Date;

  /**
   * Trial period end date
   * Typically 30 days from trialStartsAt
   * NULL for subscriptions that never had trial
   */
  @Column({ type: 'timestamp', name: 'trial_ends_at', nullable: true })
  trialEndsAt?: Date;

  // ============================================================================
  // Active Subscription Fields
  // ============================================================================

  /**
   * When subscription became active (paid)
   * NULL for TRIAL or never-activated subscriptions
   */
  @Column({ type: 'timestamp', name: 'active_at', nullable: true })
  activeAt?: Date;

  /**
   * Current billing period start date
   * Updated on each renewal
   */
  @Column({ type: 'timestamp', name: 'current_period_start', nullable: true })
  currentPeriodStart?: Date;

  /**
   * Current billing period end date
   * Payment due before this date
   */
  @Column({ type: 'timestamp', name: 'current_period_end', nullable: true })
  currentPeriodEnd?: Date;

  /**
   * Next renewal date
   * Typically same as currentPeriodEnd
   * NULL if cancelAtPeriodEnd is true
   */
  @Column({ type: 'timestamp', name: 'renews_at', nullable: true })
  renewsAt?: Date;

  // ============================================================================
  // Cancellation Fields
  // ============================================================================

  /**
   * When subscription was cancelled
   * NULL if never cancelled
   */
  @Column({ type: 'timestamp', name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  /**
   * User-provided cancellation reason
   * Used for churn analysis and feedback
   */
  @Column({ type: 'text', name: 'cancellation_reason', nullable: true })
  cancellationReason?: string;

  /**
   * Cancel at period end flag
   * - true: Cancel at currentPeriodEnd (user keeps access until then)
   * - false: Immediate cancellation (or not cancelled)
   * Default: false
   */
  @Column({ type: 'boolean', name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd!: boolean;

  // ============================================================================
  // Payment Integration Fields (Stripe)
  // ============================================================================

  /**
   * Stripe customer ID
   * Format: "cus_xxxxx"
   * NULL if payment never attempted
   */
  @Column({ type: 'varchar', length: 255, name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  /**
   * Stripe subscription ID
   * Format: "sub_xxxxx"
   * NULL for trial or one-time payments
   * Used for webhook event matching
   */
  @Column({ type: 'varchar', length: 255, name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId?: string;

  /**
   * Last Stripe payment intent ID
   * Format: "pi_xxxxx"
   * Used for payment tracking and refunds
   */
  @Column({ type: 'varchar', length: 255, name: 'last_payment_intent_id', nullable: true })
  lastPaymentIntentId?: string;

  /**
   * Last successful payment date
   * NULL if no payment made yet
   */
  @Column({ type: 'timestamp', name: 'last_payment_at', nullable: true })
  lastPaymentAt?: Date;

  /**
   * Next payment due date
   * NULL if cancelled or trial
   */
  @Column({ type: 'timestamp', name: 'next_payment_at', nullable: true })
  nextPaymentAt?: Date;

  // ============================================================================
  // Grace Period Fields
  // ============================================================================

  /**
   * Grace period active flag
   * true: Payment failed but access still granted (SUSPENDED status)
   * false: Normal operation or grace period ended
   * Default: false
   */
  @Column({ type: 'boolean', name: 'in_grace_period', default: false })
  inGracePeriod!: boolean;

  /**
   * Grace period end date
   * Typically 7-14 days after payment failure
   * After this date: SUSPENDED → EXPIRED
   * NULL if not in grace period
   */
  @Column({ type: 'timestamp', name: 'grace_period_ends_at', nullable: true })
  gracePeriodEndsAt?: Date;

  // ============================================================================
  // Audit Fields
  // ============================================================================

  /**
   * Timestamp when subscription was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when subscription was last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Soft delete timestamp
   * NULL if not deleted
   * Subscriptions rarely deleted (status change preferred)
   */
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt?: Date;

  // ============================================================================
  // Relationships
  // ============================================================================

  /**
   * Modules included in this subscription
   * Cascade: true - when subscription deleted, modules also deleted
   * Each module has activation status and pricing
   */
  @OneToMany(() => SubscriptionModule, (sm) => sm.subscription, { cascade: true })
  modules!: SubscriptionModule[];

  // ============================================================================
  // Business Logic Methods
  // ============================================================================

  /**
   * Check if subscription is in trial period
   */
  get isTrial(): boolean {
    return this.status === SubscriptionStatus.TRIAL;
  }

  /**
   * Check if subscription is active (paid)
   */
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  /**
   * Check if subscription can be activated
   * Only TRIAL subscriptions can transition to ACTIVE
   */
  get canActivate(): boolean {
    return this.status === SubscriptionStatus.TRIAL;
  }

  /**
   * Check if subscription can be cancelled
   * Only TRIAL and ACTIVE subscriptions can be cancelled
   */
  get canCancel(): boolean {
    return this.status === SubscriptionStatus.TRIAL || this.status === SubscriptionStatus.ACTIVE;
  }

  /**
   * Check if trial has expired
   * Returns false if no trial period set
   */
  get isTrialExpired(): boolean {
    if (!this.trialEndsAt) return false;
    return new Date() > this.trialEndsAt;
  }

  /**
   * Check if current period has ended
   * Returns false if no period end set
   */
  get isPeriodEnded(): boolean {
    if (!this.currentPeriodEnd) return false;
    return new Date() > this.currentPeriodEnd;
  }

  /**
   * Get active module count
   */
  get activeModuleCount(): number {
    return this.modules?.filter((m) => m.isActive).length || 0;
  }
}
