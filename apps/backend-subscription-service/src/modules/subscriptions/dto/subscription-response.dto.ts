/**
 * Subscription Response DTOs
 *
 * Data transfer objects for subscription API responses.
 * Includes serialization and transformation logic.
 *
 * Response types:
 * - SubscriptionModuleResponseDto: Module details in subscription
 * - SubscriptionResponseDto: Full subscription details
 * - SubscriptionListResponseDto: Minimal subscription for list views
 *
 * Security:
 * - Never expose Stripe API keys or secrets
 * - Redact sensitive payment information
 * - Include only necessary fields for client
 *
 * @module modules/subscriptions/dto
 */

import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { SubscriptionStatus, BillingCycle } from '../entities/subscription.entity';

/**
 * Subscription module response DTO
 * Represents a module included in a subscription
 */
export class SubscriptionModuleResponseDto {
  /** Unique subscription-module relationship ID */
  id!: UUID;

  /** Module ID */
  moduleId!: UUID;

  /** Module code (e.g., 'SCHEDULING', 'PATIENT360') */
  moduleCode?: string;

  /** Module name (e.g., 'Scheduling & Appointments') */
  moduleName?: string;

  /** Module activation status */
  isActive!: boolean;

  /** Module price per billing cycle */
  price?: number;

  /** Billing cycle this price applies to */
  billingCycle!: string;

  /** Currency code */
  currency!: string;

  /** When module was activated */
  activatedAt!: Date;

  /** When module was deactivated (null if active) */
  deactivatedAt?: Date;

  /** Whether this is a core module (cannot be removed) */
  isCore!: boolean;

  /** Days since activation */
  daysSinceActivation?: number;

  /**
   * Create DTO from entity
   * @param entity - SubscriptionModule entity
   * @param moduleMetadata - Optional module metadata (code, name) from module catalog
   */
  static fromEntity(
    entity: any,
    moduleMetadata?: { code?: string; name?: string },
  ): SubscriptionModuleResponseDto {
    const dto = new SubscriptionModuleResponseDto();
    dto.id = entity.id;
    dto.moduleId = entity.moduleId;
    dto.moduleCode = moduleMetadata?.code;
    dto.moduleName = moduleMetadata?.name;
    dto.isActive = entity.isActive;
    dto.price = entity.price ? Number(entity.price) : undefined;
    dto.billingCycle = entity.billingCycle;
    dto.currency = entity.currency;
    dto.activatedAt = entity.activatedAt;
    dto.deactivatedAt = entity.deactivatedAt;
    dto.isCore = entity.isCore;
    dto.daysSinceActivation = entity.daysSinceActivation;

    return dto;
  }
}

/**
 * Full subscription response DTO
 * Used for single subscription GET requests
 */
export class SubscriptionResponseDto {
  /** Unique subscription ID */
  id!: UUID;

  /** Organization ID */
  organizationId!: OrganizationId;

  /** Cabinet (practice) ID */
  cabinetId!: UUID;

  /** Current subscription status */
  status!: SubscriptionStatus;

  /** Billing cycle */
  billingCycle!: BillingCycle;

  /** Total price per billing cycle */
  totalPrice!: number;

  /** Currency code */
  currency!: string;

  // Trial fields
  /** Trial start date */
  trialStartsAt?: Date;

  /** Trial end date */
  trialEndsAt?: Date;

  /** Is currently in trial */
  isTrial?: boolean;

  /** Is trial expired */
  isTrialExpired?: boolean;

  // Active subscription fields
  /** When subscription became active */
  activeAt?: Date;

  /** Current billing period start */
  currentPeriodStart?: Date;

  /** Current billing period end */
  currentPeriodEnd?: Date;

  /** Next renewal date */
  renewsAt?: Date;

  /** Is period ended */
  isPeriodEnded?: boolean;

  // Cancellation fields
  /** When subscription was cancelled */
  cancelledAt?: Date;

  /** Cancellation reason */
  cancellationReason?: string;

  /** Cancel at period end flag */
  cancelAtPeriodEnd!: boolean;

  // Payment fields (limited for security)
  /** Has Stripe customer */
  hasStripeCustomer?: boolean;

  /** Has active Stripe subscription */
  hasStripeSubscription?: boolean;

  /** Last payment date */
  lastPaymentAt?: Date;

  /** Next payment due date */
  nextPaymentAt?: Date;

  // Grace period fields
  /** In grace period flag */
  inGracePeriod!: boolean;

  /** Grace period end date */
  gracePeriodEndsAt?: Date;

  // Modules
  /** Active modules count */
  activeModuleCount?: number;

  /** Total modules count */
  totalModuleCount?: number;

  /** Module details */
  modules?: SubscriptionModuleResponseDto[];

  // Audit fields
  /** Created timestamp */
  createdAt!: Date;

  /** Last updated timestamp */
  updatedAt!: Date;

  /**
   * Create DTO from entity
   * Redacts sensitive payment information
   */
  static fromEntity(entity: any): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();

    // Basic fields
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.cabinetId = entity.cabinetId;
    dto.status = entity.status;
    dto.billingCycle = entity.billingCycle;
    dto.totalPrice = Number(entity.totalPrice);
    dto.currency = entity.currency;

    // Trial fields
    dto.trialStartsAt = entity.trialStartsAt;
    dto.trialEndsAt = entity.trialEndsAt;
    dto.isTrial = entity.isTrial;
    dto.isTrialExpired = entity.isTrialExpired;

    // Active subscription fields
    dto.activeAt = entity.activeAt;
    dto.currentPeriodStart = entity.currentPeriodStart;
    dto.currentPeriodEnd = entity.currentPeriodEnd;
    dto.renewsAt = entity.renewsAt;
    dto.isPeriodEnded = entity.isPeriodEnded;

    // Cancellation fields
    dto.cancelledAt = entity.cancelledAt;
    dto.cancellationReason = entity.cancellationReason;
    dto.cancelAtPeriodEnd = entity.cancelAtPeriodEnd;

    // Payment fields (redacted for security)
    dto.hasStripeCustomer = !!entity.stripeCustomerId;
    dto.hasStripeSubscription = !!entity.stripeSubscriptionId;
    dto.lastPaymentAt = entity.lastPaymentAt;
    dto.nextPaymentAt = entity.nextPaymentAt;

    // Grace period fields
    dto.inGracePeriod = entity.inGracePeriod;
    dto.gracePeriodEndsAt = entity.gracePeriodEndsAt;

    // Modules
    dto.activeModuleCount = entity.activeModuleCount;
    dto.totalModuleCount = entity.modules?.length || 0;
    if (entity.modules) {
      dto.modules = entity.modules.map((m: any) => SubscriptionModuleResponseDto.fromEntity(m));
    }

    // Audit fields
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;

    return dto;
  }
}

/**
 * Minimal subscription response for list views
 * Includes only essential fields for performance
 */
export class SubscriptionListResponseDto {
  /** Unique subscription ID */
  id!: UUID;

  /** Cabinet ID */
  cabinetId!: UUID;

  /** Current status */
  status!: SubscriptionStatus;

  /** Billing cycle */
  billingCycle!: BillingCycle;

  /** Total price */
  totalPrice!: number;

  /** Currency */
  currency!: string;

  /** Active modules count */
  activeModuleCount?: number;

  /** Trial end date (if in trial) */
  trialEndsAt?: Date;

  /** Next renewal date (if active) */
  renewsAt?: Date;

  /** In grace period */
  inGracePeriod!: boolean;

  /** Created timestamp */
  createdAt!: Date;

  /**
   * Create DTO from entity
   */
  static fromEntity(entity: any): SubscriptionListResponseDto {
    const dto = new SubscriptionListResponseDto();
    dto.id = entity.id;
    dto.cabinetId = entity.cabinetId;
    dto.status = entity.status;
    dto.billingCycle = entity.billingCycle;
    dto.totalPrice = Number(entity.totalPrice);
    dto.currency = entity.currency;
    dto.activeModuleCount = entity.activeModuleCount;
    dto.trialEndsAt = entity.trialEndsAt;
    dto.renewsAt = entity.renewsAt;
    dto.inGracePeriod = entity.inGracePeriod;
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
