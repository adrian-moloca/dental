/**
 * Subscription Repository
 *
 * Data access layer for Subscription entity with strict multi-tenant isolation.
 * All queries MUST include organizationId filter to prevent cross-tenant data leakage.
 *
 * Security requirements:
 * - NEVER query subscriptions without organizationId filter
 * - Check for duplicate subscriptions per cabinet
 * - Return null instead of throwing for missing subscriptions (let service layer decide)
 * - Validate tenant isolation on all mutations
 *
 * Edge cases handled:
 * - One subscription per cabinet (unique constraint)
 * - Status-based queries (active, trial, expired)
 * - Module relationship loading
 * - Grace period lookups
 * - Trial expiration queries
 *
 * @module modules/subscriptions/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';
import { Subscription, SubscriptionStatus, BillingCycle } from '../entities/subscription.entity';

/**
 * Data transfer object for creating a new subscription
 */
export interface CreateSubscriptionData {
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** Cabinet ID (must be unique) */
  cabinetId: UUID;
  /** Billing cycle (MONTHLY or YEARLY) */
  billingCycle: BillingCycle;
  /** Total price per billing cycle */
  totalPrice: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Initial status (default: TRIAL) */
  status?: SubscriptionStatus;
  /** Trial start date */
  trialStartsAt?: Date;
  /** Trial end date */
  trialEndsAt?: Date;
}

/**
 * Data transfer object for updating subscription
 */
export interface UpdateSubscriptionData {
  /** Billing cycle change */
  billingCycle?: BillingCycle;
  /** Total price update */
  totalPrice?: number;
  /** Status update */
  status?: SubscriptionStatus;
  /** Trial dates */
  trialStartsAt?: Date;
  trialEndsAt?: Date;
  /** Active dates */
  activeAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  renewsAt?: Date;
  /** Cancellation data */
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelAtPeriodEnd?: boolean;
  /** Payment data */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  lastPaymentIntentId?: string;
  lastPaymentAt?: Date;
  nextPaymentAt?: Date;
  /** Grace period */
  inGracePeriod?: boolean;
  gracePeriodEndsAt?: Date;
}

/**
 * Subscription repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - Cabinet uniqueness checked within organization scope
 * - No cross-tenant data access allowed
 * - Mutations validate tenant ownership before update/delete
 */
@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repository: Repository<Subscription>,
  ) {}

  /**
   * Find subscription by ID within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if subscription not found
   * - Validates subscription belongs to specified organization
   * - Prevents cross-tenant subscription access
   * - Optionally loads module relationships
   *
   * @param id - Subscription ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @param includeModules - Whether to load module relationships
   * @returns Subscription or null if not found
   */
  async findById(
    id: UUID,
    organizationId: OrganizationId,
    includeModules = false,
  ): Promise<Subscription | null> {
    const query = this.repository
      .createQueryBuilder('subscription')
      .where('subscription.id = :id', { id })
      .andWhere('subscription.organizationId = :organizationId', {
        organizationId,
      });

    if (includeModules) {
      query.leftJoinAndSelect('subscription.modules', 'modules');
    }

    return query.getOne();
  }

  /**
   * Find subscription by cabinet ID within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if subscription not found
   * - Each cabinet can have only one subscription
   * - Includes module relationships by default
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @param includeModules - Whether to load module relationships
   * @returns Subscription or null if not found
   */
  async findByCabinetId(
    cabinetId: UUID,
    organizationId: OrganizationId,
    includeModules = true,
  ): Promise<Subscription | null> {
    const query = this.repository
      .createQueryBuilder('subscription')
      .where('subscription.cabinetId = :cabinetId', { cabinetId })
      .andWhere('subscription.organizationId = :organizationId', {
        organizationId,
      });

    if (includeModules) {
      query.leftJoinAndSelect('subscription.modules', 'modules');
    }

    return query.getOne();
  }

  /**
   * Find all subscriptions in organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Returns empty array if no subscriptions found
   * - Ordered by creation date (newest first)
   * - Optionally filter by status
   * - Optionally load modules
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param status - Optional status filter
   * @param includeModules - Whether to load module relationships
   * @returns Array of subscriptions
   */
  async findAll(
    organizationId: OrganizationId,
    status?: SubscriptionStatus,
    includeModules = false,
  ): Promise<Subscription[]> {
    const query = this.repository
      .createQueryBuilder('subscription')
      .where('subscription.organizationId = :organizationId', {
        organizationId,
      });

    if (status) {
      query.andWhere('subscription.status = :status', { status });
    }

    if (includeModules) {
      query.leftJoinAndSelect('subscription.modules', 'modules');
    }

    query.orderBy('subscription.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Create new subscription with tenant isolation
   *
   * CRITICAL: Validates cabinet uniqueness within organization
   *
   * Edge cases:
   * - Throws ConflictError if cabinet already has subscription
   * - Allows same cabinet in different organizations
   * - Sets default status to TRIAL if not specified
   * - Initializes empty modules array
   *
   * @param data - Subscription creation data
   * @returns Created subscription entity
   * @throws {ConflictError} If cabinet already has subscription
   */
  async create(data: CreateSubscriptionData): Promise<Subscription> {
    // Check for duplicate subscription for cabinet
    const existing = await this.findByCabinetId(data.cabinetId, data.organizationId, false);

    if (existing) {
      throw new ConflictError('Cabinet already has an active subscription', {
        conflictType: 'duplicate',
        resourceType: 'subscription',
        existingId: existing.id,
      });
    }

    // Create subscription entity
    const subscription = this.repository.create({
      organizationId: data.organizationId,
      cabinetId: data.cabinetId,
      billingCycle: data.billingCycle,
      totalPrice: data.totalPrice,
      currency: data.currency,
      status: data.status || SubscriptionStatus.TRIAL,
      trialStartsAt: data.trialStartsAt,
      trialEndsAt: data.trialEndsAt,
      cancelAtPeriodEnd: false,
      inGracePeriod: false,
    });

    // Save to database
    return this.repository.save(subscription);
  }

  /**
   * Update subscription
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Validates subscription belongs to organization before update
   * - Partial update (only provided fields updated)
   * - Returns updated subscription with modules
   *
   * @param id - Subscription ID
   * @param organizationId - Organization ID for tenant scoping
   * @param data - Update data
   * @returns Updated subscription
   * @throws {NotFoundError} If subscription not found in organization
   */
  async update(
    id: UUID,
    organizationId: OrganizationId,
    data: UpdateSubscriptionData,
  ): Promise<Subscription> {
    // Find subscription
    const subscription = await this.findById(id, organizationId, true);

    if (!subscription) {
      throw new NotFoundError('Subscription not found in organization', {
        resourceType: 'subscription',
        resourceId: id,
      });
    }

    // Update fields
    Object.assign(subscription, data);

    // Save changes
    return this.repository.save(subscription);
  }

  /**
   * Update subscription status
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Validates subscription belongs to organization
   * - Status transition validation done in service layer
   * - Updates related timestamps based on status
   *
   * @param id - Subscription ID
   * @param organizationId - Organization ID for tenant scoping
   * @param status - New status
   * @param additionalData - Optional additional fields to update
   * @throws {NotFoundError} If subscription not found in organization
   */
  async updateStatus(
    id: UUID,
    organizationId: OrganizationId,
    status: SubscriptionStatus,
    additionalData?: Partial<UpdateSubscriptionData>,
  ): Promise<void> {
    const result = await this.repository.update(
      { id, organizationId },
      {
        status,
        ...additionalData,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundError('Subscription not found in organization', {
        resourceType: 'subscription',
        resourceId: id,
      });
    }
  }

  /**
   * Find subscriptions with expired trials
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Only returns subscriptions in TRIAL status
   * - Only returns subscriptions with trialEndsAt in the past
   * - Used for batch trial expiration processing
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of subscriptions with expired trials
   */
  async findExpiredTrials(organizationId: OrganizationId): Promise<Subscription[]> {
    return this.repository
      .createQueryBuilder('subscription')
      .where('subscription.organizationId = :organizationId', {
        organizationId,
      })
      .andWhere('subscription.status = :status', {
        status: SubscriptionStatus.TRIAL,
      })
      .andWhere('subscription.trialEndsAt < :now', { now: new Date() })
      .getMany();
  }

  /**
   * Find subscriptions in grace period ending soon
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Only returns subscriptions in grace period
   * - Only returns subscriptions with grace period ending within specified days
   * - Used for grace period reminder notifications
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param daysThreshold - Number of days before grace period ends
   * @returns Array of subscriptions
   */
  async findGracePeriodEndingSoon(
    organizationId: OrganizationId,
    daysThreshold = 3,
  ): Promise<Subscription[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.repository
      .createQueryBuilder('subscription')
      .where('subscription.organizationId = :organizationId', {
        organizationId,
      })
      .andWhere('subscription.inGracePeriod = :inGracePeriod', {
        inGracePeriod: true,
      })
      .andWhere('subscription.gracePeriodEndsAt <= :thresholdDate', {
        thresholdDate,
      })
      .getMany();
  }

  /**
   * Find subscriptions by IDs within organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Returns only subscriptions belonging to organization
   * - Filters out IDs not belonging to organization
   * - Used for batch operations
   *
   * @param ids - Array of subscription IDs
   * @param organizationId - Organization ID for tenant scoping
   * @param includeModules - Whether to load module relationships
   * @returns Array of subscriptions
   */
  async findByIds(
    ids: UUID[],
    organizationId: OrganizationId,
    includeModules = false,
  ): Promise<Subscription[]> {
    if (ids.length === 0) return [];

    const query = this.repository
      .createQueryBuilder('subscription')
      .where('subscription.id IN (:...ids)', { ids })
      .andWhere('subscription.organizationId = :organizationId', {
        organizationId,
      });

    if (includeModules) {
      query.leftJoinAndSelect('subscription.modules', 'modules');
    }

    return query.getMany();
  }

  /**
   * Soft delete subscription
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Sets deletedAt timestamp (soft delete)
   * - Validates subscription belongs to organization
   * - Prefer status change to CANCELLED over deletion
   *
   * @param id - Subscription ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If subscription not found in organization
   */
  async softDelete(id: UUID, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.softDelete({
      id,
      organizationId,
    });

    if (result.affected === 0) {
      throw new NotFoundError('Subscription not found in organization', {
        resourceType: 'subscription',
        resourceId: id,
      });
    }
  }

  /**
   * Count subscriptions by status in organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param status - Optional status filter
   * @returns Count of subscriptions
   */
  async count(organizationId: OrganizationId, status?: SubscriptionStatus): Promise<number> {
    const query = this.repository
      .createQueryBuilder('subscription')
      .where('subscription.organizationId = :organizationId', {
        organizationId,
      });

    if (status) {
      query.andWhere('subscription.status = :status', { status });
    }

    return query.getCount();
  }
}
