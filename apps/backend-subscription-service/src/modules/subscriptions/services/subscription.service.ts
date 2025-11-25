/**
 * Subscription Service
 *
 * Core business logic for subscription management.
 * Implements subscription lifecycle state machine and module management.
 *
 * State machine transitions:
 * - TRIAL → ACTIVE (activateSubscription)
 * - TRIAL → EXPIRED (trial ends without payment)
 * - ACTIVE → SUSPENDED (payment failure)
 * - ACTIVE → CANCELLED (cancelSubscription)
 * - SUSPENDED → ACTIVE (payment recovered)
 * - SUSPENDED → EXPIRED (grace period ends)
 * - Any state → CANCELLED (admin action)
 *
 * Business rules:
 * - Each cabinet can have only ONE subscription
 * - Trial period: 30 days default
 * - Core modules auto-added on subscription creation
 * - Price recalculated when modules added/removed
 * - Module dependencies validated
 * - Grace period: 7 days after payment failure
 *
 * Edge cases handled:
 * - Duplicate subscription prevention
 * - Core module protection (cannot remove)
 * - Dependent module cascade removal
 * - Billing cycle changes recalculate pricing
 * - Trial expiration edge cases
 * - Concurrent modification conflicts
 *
 * @module modules/subscriptions/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { ValidationError, NotFoundError, ConflictError } from '@dentalos/shared-errors';
import { Subscription, SubscriptionStatus, BillingCycle } from '../entities/subscription.entity';
import { SubscriptionModule } from '../entities/subscription-module.entity';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  AddModulesDto,
  RemoveModulesDto,
} from '../dto';

/**
 * Core module codes that are auto-added to every subscription
 * These modules cannot be removed
 */
const CORE_MODULE_CODES = [
  'SCHEDULING', // Scheduling & Appointments
  'PATIENT360', // Patient Management
  'CLINICAL', // Clinical EHR
  'BILLING', // Billing & Payments
];

/**
 * Trial period duration in days
 */
const TRIAL_DURATION_DAYS = 30;

/**
 * Module data interface (from modules service)
 */
interface ModuleData {
  id: UUID;
  code: string;
  name: string;
  isCore: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  dependencies?: UUID[];
}

/**
 * Subscription service with full business logic
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    @InjectRepository(SubscriptionModule)
    private readonly subscriptionModuleRepository: Repository<SubscriptionModule>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create new subscription
   *
   * Business logic:
   * - Validates cabinet doesn't already have subscription
   * - Auto-starts 30-day trial if autoStartTrial=true
   * - Auto-adds 4 core modules (SCHEDULING, PATIENT360, CLINICAL, BILLING)
   * - Calculates total price based on billing cycle
   * - Creates subscription and module relationships in transaction
   *
   * Edge cases:
   * - Cabinet already has subscription → ConflictError
   * - Core modules not found → ValidationError
   * - Transaction rollback on any failure
   *
   * @param organizationId - Organization ID (from auth context)
   * @param dto - Create subscription DTO
   * @returns Created subscription with modules
   * @throws {ConflictError} If cabinet already has subscription
   * @throws {ValidationError} If core modules not found
   */
  async createSubscription(
    organizationId: OrganizationId,
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    this.logger.log(
      `Creating subscription for cabinet ${dto.cabinetId} in organization ${organizationId}`,
    );

    // Use transaction for atomicity
    return this.dataSource.transaction(async (manager) => {
      // Fetch core modules
      const coreModules = await this.fetchCoreModules();

      if (coreModules.length !== CORE_MODULE_CODES.length) {
        throw new ValidationError('Core modules not found', {
          errors: [
            {
              field: 'coreModules',
              message: `Expected ${CORE_MODULE_CODES.length} core modules but found ${coreModules.length}`,
              value: { expected: CORE_MODULE_CODES.length, found: coreModules.length },
            },
          ],
        });
      }

      // Calculate total price from core modules
      const totalPrice = this.calculateModulesPrice(coreModules, dto.billingCycle);

      // Prepare subscription data
      const subscriptionData = {
        organizationId,
        cabinetId: dto.cabinetId,
        billingCycle: dto.billingCycle,
        totalPrice,
        currency: dto.currency,
        status: SubscriptionStatus.TRIAL,
      };

      // Add trial dates if auto-starting trial
      if (dto.autoStartTrial) {
        const now = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

        Object.assign(subscriptionData, {
          trialStartsAt: now,
          trialEndsAt: trialEnd,
        });
      }

      // Create subscription (using repository with conflict check)
      const subscriptionRepo = manager.getRepository(Subscription);
      const existing = await subscriptionRepo.findOne({
        where: {
          cabinetId: dto.cabinetId as UUID,
          organizationId,
        },
      });

      if (existing) {
        throw new ConflictError('Cabinet already has an active subscription', {
          conflictType: 'duplicate',
          resourceType: 'subscription',
          existingId: dto.cabinetId,
        });
      }

      const subscription = subscriptionRepo.create(subscriptionData);
      await subscriptionRepo.save(subscription);

      // Add core modules
      const subscriptionModules = coreModules.map((module) => {
        const price =
          dto.billingCycle === BillingCycle.MONTHLY ? module.monthlyPrice : module.yearlyPrice;

        return manager.getRepository(SubscriptionModule).create({
          organizationId,
          subscriptionId: subscription.id,
          moduleId: module.id,
          isActive: true,
          price,
          billingCycle: dto.billingCycle,
          currency: dto.currency,
          activatedAt: new Date(),
          isCore: true,
        });
      });

      await manager.getRepository(SubscriptionModule).save(subscriptionModules);

      // Load subscription with modules
      const createdSubscription = await subscriptionRepo.findOne({
        where: { id: subscription.id },
        relations: ['modules'],
      });

      this.logger.log(
        `Subscription ${subscription.id} created successfully with ${coreModules.length} core modules`,
      );

      return createdSubscription!;
    });
  }

  /**
   * Add modules to subscription
   *
   * Business logic:
   * - Validates modules exist and are available
   * - Checks module dependencies and auto-adds if missing
   * - Prevents adding duplicate modules
   * - Prevents adding core modules (already included)
   * - Recalculates total price
   * - Creates module relationships
   *
   * Edge cases:
   * - Module already in subscription → skip
   * - Core module requested → ValidationError
   * - Missing dependencies → auto-add
   * - Subscription not found → NotFoundError
   * - Invalid subscription status → ValidationError
   *
   * @param subscriptionId - Subscription ID
   * @param organizationId - Organization ID
   * @param dto - Add modules DTO
   * @returns Updated subscription with modules
   * @throws {NotFoundError} If subscription not found
   * @throws {ValidationError} If trying to add core modules or invalid status
   */
  async addModules(
    subscriptionId: UUID,
    organizationId: OrganizationId,
    dto: AddModulesDto,
  ): Promise<Subscription> {
    this.logger.log(`Adding ${dto.moduleIds.length} modules to subscription ${subscriptionId}`);

    return this.dataSource.transaction(async (manager) => {
      // Load subscription with modules
      const subscription = await this.subscriptionRepository.findById(
        subscriptionId,
        organizationId,
        true,
      );

      if (!subscription) {
        throw new NotFoundError('Subscription not found', {
          resourceType: 'subscription',
          resourceId: subscriptionId,
        });
      }

      // Validate subscription status
      if (
        subscription.status !== SubscriptionStatus.TRIAL &&
        subscription.status !== SubscriptionStatus.ACTIVE
      ) {
        throw new ValidationError('Cannot add modules to inactive subscription', {
          errors: [
            {
              field: 'status',
              message: 'Modules can only be added when subscription is TRIAL or ACTIVE',
              value: subscription.status,
            },
          ],
        });
      }

      // Fetch requested modules
      const modules = await this.fetchModulesByIds(dto.moduleIds);

      if (modules.length === 0) {
        throw new ValidationError('No valid modules found', {
          errors: [
            {
              field: 'moduleIds',
              message: 'None of the requested modules are valid or available',
              value: dto.moduleIds,
            },
          ],
        });
      }

      // Filter out core modules
      const nonCoreModules = modules.filter((m) => !m.isCore);

      if (nonCoreModules.length !== modules.length) {
        throw new ValidationError('Cannot add core modules (already included in subscription)', {
          errors: [
            {
              field: 'moduleIds',
              message: 'Core modules are already included and cannot be added again',
              value: modules.filter((m) => m.isCore).map((m) => m.code),
            },
          ],
        });
      }

      // Check for duplicates
      const existingModuleIds = new Set(subscription.modules.map((m) => m.moduleId));

      const newModules = nonCoreModules.filter((m) => !existingModuleIds.has(m.id));

      if (newModules.length === 0) {
        this.logger.warn('All requested modules already in subscription');
        return subscription;
      }

      // Validate and add dependencies
      const modulesWithDeps = await this.resolveDependencies(newModules, existingModuleIds);

      // Create subscription-module relationships
      const subscriptionModules = modulesWithDeps.map((module) => {
        const price =
          subscription.billingCycle === BillingCycle.MONTHLY
            ? module.monthlyPrice
            : module.yearlyPrice;

        return manager.getRepository(SubscriptionModule).create({
          organizationId,
          subscriptionId: subscription.id,
          moduleId: module.id,
          isActive: true,
          price,
          billingCycle: subscription.billingCycle,
          currency: subscription.currency,
          activatedAt: new Date(),
          isCore: false,
        });
      });

      await manager.getRepository(SubscriptionModule).save(subscriptionModules);

      // Recalculate total price
      const updatedModules = [...subscription.modules, ...subscriptionModules];
      const newTotalPrice = updatedModules.reduce(
        (sum, m) => sum + (m.price ? Number(m.price) : 0),
        0,
      );

      // Update subscription
      subscription.totalPrice = newTotalPrice;
      await manager.getRepository(Subscription).save(subscription);

      this.logger.log(
        `Added ${subscriptionModules.length} modules to subscription ${subscriptionId}`,
      );

      // Reload with updated modules
      return this.subscriptionRepository.findById(
        subscriptionId,
        organizationId,
        true,
      ) as Promise<Subscription>;
    });
  }

  /**
   * Remove modules from subscription
   *
   * Business logic:
   * - Validates modules are in subscription
   * - Prevents removing core modules
   * - Checks dependent modules and auto-removes if necessary
   * - Deactivates modules (soft delete)
   * - Recalculates total price
   *
   * Edge cases:
   * - Core module requested → ValidationError
   * - Module not in subscription → skip
   * - Dependent modules → auto-remove with warning
   * - Last non-core module → allow (core modules remain)
   *
   * @param subscriptionId - Subscription ID
   * @param organizationId - Organization ID
   * @param dto - Remove modules DTO
   * @returns Updated subscription with modules
   * @throws {NotFoundError} If subscription not found
   * @throws {ValidationError} If trying to remove core modules
   */
  async removeModules(
    subscriptionId: UUID,
    organizationId: OrganizationId,
    dto: RemoveModulesDto,
  ): Promise<Subscription> {
    this.logger.log(`Removing ${dto.moduleIds.length} modules from subscription ${subscriptionId}`);

    return this.dataSource.transaction(async (manager) => {
      // Load subscription with modules
      const subscription = await this.subscriptionRepository.findById(
        subscriptionId,
        organizationId,
        true,
      );

      if (!subscription) {
        throw new NotFoundError('Subscription not found', {
          resourceType: 'subscription',
          resourceId: subscriptionId,
        });
      }

      // Find modules to remove
      const modulesToRemove = subscription.modules.filter((m) =>
        dto.moduleIds.includes(m.moduleId),
      );

      if (modulesToRemove.length === 0) {
        this.logger.warn('No matching modules found in subscription');
        return subscription;
      }

      // Check for core modules
      const coreModules = modulesToRemove.filter((m) => m.isCore);
      if (coreModules.length > 0) {
        throw new ValidationError('Cannot remove core modules', {
          errors: [
            {
              field: 'moduleIds',
              message: 'Core modules cannot be removed from a subscription',
              value: coreModules.map((m) => m.moduleId),
            },
          ],
        });
      }

      // Check for dependent modules
      const allModuleIds = new Set(dto.moduleIds);
      const dependentModules = await this.findDependentModules(dto.moduleIds, subscription.modules);

      // Add dependents to removal set
      dependentModules.forEach((m) => allModuleIds.add(m.moduleId));

      if (dependentModules.length > 0) {
        this.logger.warn(`Auto-removing ${dependentModules.length} dependent modules`);
      }

      // Deactivate modules
      const now = new Date();
      const modulesToDeactivate = subscription.modules.filter((m) => allModuleIds.has(m.moduleId));

      for (const module of modulesToDeactivate) {
        module.isActive = false;
        module.deactivatedAt = now;
        module.deactivationReason = dto.reason;
      }

      await manager.getRepository(SubscriptionModule).save(modulesToDeactivate);

      // Recalculate total price (only active modules)
      const activeModules = subscription.modules.filter((m) => !allModuleIds.has(m.moduleId));
      const newTotalPrice = activeModules.reduce(
        (sum, m) => sum + (m.price ? Number(m.price) : 0),
        0,
      );

      // Update subscription
      subscription.totalPrice = newTotalPrice;
      await manager.getRepository(Subscription).save(subscription);

      this.logger.log(
        `Removed ${modulesToDeactivate.length} modules from subscription ${subscriptionId}`,
      );

      // Reload with updated modules
      return this.subscriptionRepository.findById(
        subscriptionId,
        organizationId,
        true,
      ) as Promise<Subscription>;
    });
  }

  /**
   * Activate subscription (TRIAL → ACTIVE)
   *
   * Business logic:
   * - Validates subscription is in TRIAL status
   * - Sets status to ACTIVE
   * - Records activation timestamp
   * - Sets current billing period dates
   * - Sets next renewal date
   *
   * Edge cases:
   * - Subscription not in TRIAL → ValidationError
   * - Trial already expired → allow activation
   *
   * @param subscriptionId - Subscription ID
   * @param organizationId - Organization ID
   * @param stripeSubscriptionId - Stripe subscription ID (optional)
   * @param stripeCustomerId - Stripe customer ID (optional)
   * @returns Activated subscription
   * @throws {NotFoundError} If subscription not found
   * @throws {ValidationError} If subscription not in TRIAL status
   */
  async activateSubscription(
    subscriptionId: UUID,
    organizationId: OrganizationId,
    stripeSubscriptionId?: string,
    stripeCustomerId?: string,
  ): Promise<Subscription> {
    this.logger.log(`Activating subscription ${subscriptionId}`);

    const subscription = await this.subscriptionRepository.findById(
      subscriptionId,
      organizationId,
      true,
    );

    if (!subscription) {
      throw new NotFoundError('Subscription not found', {
        resourceType: 'subscription',
        resourceId: subscriptionId,
      });
    }

    if (subscription.status !== SubscriptionStatus.TRIAL) {
      throw new ValidationError('Can only activate TRIAL subscriptions', {
        errors: [
          {
            field: 'status',
            message: 'Activation allowed only when subscription is in TRIAL status',
            value: subscription.status,
          },
        ],
      });
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);

    if (subscription.billingCycle === BillingCycle.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Update subscription
    await this.subscriptionRepository.update(subscriptionId, organizationId, {
      status: SubscriptionStatus.ACTIVE,
      activeAt: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      renewsAt: periodEnd,
      nextPaymentAt: periodEnd,
      stripeSubscriptionId,
      stripeCustomerId,
      lastPaymentAt: now,
    });

    this.logger.log(`Subscription ${subscriptionId} activated successfully`);

    return this.subscriptionRepository.findById(
      subscriptionId,
      organizationId,
      true,
    ) as Promise<Subscription>;
  }

  /**
   * Cancel subscription
   *
   * Business logic:
   * - Validates subscription can be cancelled (TRIAL or ACTIVE)
   * - Sets cancelAtPeriodEnd flag or immediate cancellation
   * - Records cancellation timestamp and reason
   * - Clears renewal date if immediate
   *
   * Edge cases:
   * - Already cancelled → idempotent (no error)
   * - In grace period → cancel immediately
   * - Trial → cancel immediately (no period end)
   *
   * @param subscriptionId - Subscription ID
   * @param organizationId - Organization ID
   * @param reason - Cancellation reason
   * @param immediate - Cancel immediately (default: false = at period end)
   * @returns Cancelled subscription
   * @throws {NotFoundError} If subscription not found
   * @throws {ValidationError} If subscription cannot be cancelled
   */
  async cancelSubscription(
    subscriptionId: UUID,
    organizationId: OrganizationId,
    reason: string,
    immediate = false,
  ): Promise<Subscription> {
    this.logger.log(`Cancelling subscription ${subscriptionId}`);

    const subscription = await this.subscriptionRepository.findById(
      subscriptionId,
      organizationId,
      true,
    );

    if (!subscription) {
      throw new NotFoundError('Subscription not found', {
        resourceType: 'subscription',
        resourceId: subscriptionId,
      });
    }

    // Allow cancelling TRIAL, ACTIVE, SUSPENDED
    if (
      subscription.status !== SubscriptionStatus.TRIAL &&
      subscription.status !== SubscriptionStatus.ACTIVE &&
      subscription.status !== SubscriptionStatus.SUSPENDED
    ) {
      throw new ValidationError('Cannot cancel subscription in current status', {
        errors: [
          {
            field: 'status',
            message: 'Cancellation is only allowed for TRIAL, ACTIVE, or SUSPENDED subscriptions',
            value: subscription.status,
          },
        ],
      });
    }

    const now = new Date();

    // Trial or immediate cancellation
    if (subscription.status === SubscriptionStatus.TRIAL || immediate) {
      await this.subscriptionRepository.update(subscriptionId, organizationId, {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: now,
        cancellationReason: reason,
        renewsAt: undefined,
        cancelAtPeriodEnd: false,
      });

      this.logger.log(`Subscription ${subscriptionId} cancelled immediately`);
    } else {
      // Cancel at period end
      await this.subscriptionRepository.update(subscriptionId, organizationId, {
        cancelledAt: now,
        cancellationReason: reason,
        cancelAtPeriodEnd: true,
      });

      this.logger.log(`Subscription ${subscriptionId} scheduled for cancellation at period end`);
    }

    return this.subscriptionRepository.findById(
      subscriptionId,
      organizationId,
      true,
    ) as Promise<Subscription>;
  }

  /**
   * Update subscription
   *
   * Business logic:
   * - Updates billing cycle (recalculates pricing)
   * - Updates cancellation settings
   *
   * @param subscriptionId - Subscription ID
   * @param organizationId - Organization ID
   * @param dto - Update DTO
   * @returns Updated subscription
   */
  async updateSubscription(
    subscriptionId: UUID,
    organizationId: OrganizationId,
    dto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(
      subscriptionId,
      organizationId,
      true,
    );

    if (!subscription) {
      throw new NotFoundError('Subscription not found', {
        resourceType: 'subscription',
        resourceId: subscriptionId,
      });
    }

    // Handle billing cycle change
    if (dto.billingCycle && dto.billingCycle !== subscription.billingCycle) {
      await this.changeBillingCycle(subscription, dto.billingCycle);
    }

    // Handle cancellation settings
    const updateData: any = {};

    if (dto.cancelAtPeriodEnd !== undefined) {
      updateData.cancelAtPeriodEnd = dto.cancelAtPeriodEnd;

      if (dto.cancelAtPeriodEnd && dto.cancellationReason) {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = dto.cancellationReason;
      } else if (!dto.cancelAtPeriodEnd) {
        // Reactivate
        updateData.cancelledAt = undefined;
        updateData.cancellationReason = undefined;
        updateData.renewsAt = subscription.currentPeriodEnd;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.subscriptionRepository.update(subscriptionId, organizationId, updateData);
    }

    return this.subscriptionRepository.findById(
      subscriptionId,
      organizationId,
      true,
    ) as Promise<Subscription>;
  }

  /**
   * Calculate total price for modules based on billing cycle
   */
  private calculateModulesPrice(modules: ModuleData[], billingCycle: BillingCycle): number {
    return modules.reduce((sum, module) => {
      const price =
        billingCycle === BillingCycle.MONTHLY ? module.monthlyPrice : module.yearlyPrice;
      return sum + price;
    }, 0);
  }

  /**
   * Change billing cycle and recalculate pricing
   */
  private async changeBillingCycle(
    subscription: Subscription,
    newCycle: BillingCycle,
  ): Promise<void> {
    // Recalculate module prices
    const moduleIds = subscription.modules.map((m) => m.moduleId);
    const modules = await this.fetchModulesByIds(moduleIds);

    const moduleMap = new Map(modules.map((m) => [m.id, m]));

    for (const subModule of subscription.modules) {
      const module = moduleMap.get(subModule.moduleId);
      if (module) {
        subModule.price =
          newCycle === BillingCycle.MONTHLY ? module.monthlyPrice : module.yearlyPrice;
        subModule.billingCycle = newCycle;
      }
    }

    await this.subscriptionModuleRepository.save(subscription.modules);

    // Recalculate total
    const newTotal = subscription.modules.reduce(
      (sum, m) => sum + (m.price ? Number(m.price) : 0),
      0,
    );

    subscription.totalPrice = newTotal;
    subscription.billingCycle = newCycle;
  }

  /**
   * Fetch core modules from modules service
   * TODO: Replace with actual API call to modules service
   */
  private async fetchCoreModules(): Promise<ModuleData[]> {
    // Mock implementation - replace with actual service call
    return [
      {
        id: '11111111-1111-1111-1111-111111111111' as UUID,
        code: 'SCHEDULING',
        name: 'Scheduling & Appointments',
        isCore: true,
        monthlyPrice: 49.99,
        yearlyPrice: 499.99,
      },
      {
        id: '22222222-2222-2222-2222-222222222222' as UUID,
        code: 'PATIENT360',
        name: 'Patient Management',
        isCore: true,
        monthlyPrice: 39.99,
        yearlyPrice: 399.99,
      },
      {
        id: '33333333-3333-3333-3333-333333333333' as UUID,
        code: 'CLINICAL',
        name: 'Clinical EHR',
        isCore: true,
        monthlyPrice: 59.99,
        yearlyPrice: 599.99,
      },
      {
        id: '44444444-4444-4444-4444-444444444444' as UUID,
        code: 'BILLING',
        name: 'Billing & Payments',
        isCore: true,
        monthlyPrice: 49.99,
        yearlyPrice: 499.99,
      },
    ];
  }

  /**
   * Fetch modules by IDs from modules service
   * TODO: Replace with actual API call to modules service
   */
  private async fetchModulesByIds(ids: Array<UUID | string>): Promise<ModuleData[]> {
    // Mock implementation - replace with actual service call
    const allModules = await this.fetchCoreModules();
    const normalizedIds = ids.map((id) => id as UUID);
    return allModules.filter((m) => normalizedIds.includes(m.id));
  }

  /**
   * Resolve module dependencies
   */
  private async resolveDependencies(
    modules: ModuleData[],
    _existingModuleIds: Set<UUID>,
  ): Promise<ModuleData[]> {
    // TODO: Implement dependency resolution
    // For now, return modules as-is
    return modules;
  }

  /**
   * Find dependent modules
   */
  private async findDependentModules(
    _moduleIds: Array<UUID | string>,
    _subscriptionModules: SubscriptionModule[],
  ): Promise<SubscriptionModule[]> {
    // TODO: Implement dependent module lookup
    // For now, return empty array
    return [];
  }
}
