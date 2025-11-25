/**
 * License Validation Service
 *
 * Validates whether a cabinet has a valid license (active subscription)
 * to access specific modules and features.
 *
 * Used by other services to check feature access before allowing operations.
 *
 * Business rules:
 * - Cabinet must have active subscription (TRIAL or ACTIVE status)
 * - Module must be active in subscription
 * - Trial subscriptions have full access to all included modules
 * - Suspended subscriptions in grace period still have access
 * - Expired/Cancelled subscriptions have no access
 *
 * Edge cases:
 * - Cabinet without subscription → no access
 * - Subscription in grace period → access granted
 * - Module deactivated → no access
 * - Core modules → always accessible if subscription active
 * - Trial expired → check if activated or expired
 *
 * @module modules/subscriptions/services
 */

import { Injectable, Logger } from '@nestjs/common';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionStatus } from '../entities/subscription.entity';

/**
 * License validation result
 */
export interface LicenseValidationResult {
  /** Whether cabinet has valid license for module */
  hasAccess: boolean;
  /** Subscription status */
  subscriptionStatus?: SubscriptionStatus;
  /** Reason for denied access */
  reason?: string;
  /** Module activation status */
  moduleActive?: boolean;
  /** Is in trial period */
  isTrial?: boolean;
  /** Is in grace period */
  inGracePeriod?: boolean;
  /** Days until subscription expires (trial or grace period) */
  daysUntilExpiry?: number;
}

/**
 * Feature code enumeration
 * Maps to module codes
 */
export enum FeatureCode {
  SCHEDULING = 'SCHEDULING',
  PATIENT360 = 'PATIENT360',
  CLINICAL = 'CLINICAL',
  BILLING = 'BILLING',
  INVENTORY = 'INVENTORY',
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
}

/**
 * License validation service
 */
@Injectable()
export class LicenseValidationService {
  private readonly logger = new Logger(LicenseValidationService.name);

  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  /**
   * Check if cabinet has valid license for module
   *
   * Business logic:
   * - Fetches cabinet subscription
   * - Validates subscription status (TRIAL, ACTIVE, or SUSPENDED with grace period)
   * - Checks if module is active in subscription
   * - Returns detailed validation result
   *
   * Edge cases:
   * - No subscription → access denied
   * - Expired trial → access denied
   * - Cancelled subscription → access denied
   * - Grace period → access granted with warning
   * - Module not in subscription → access denied
   * - Deactivated module → access denied
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID
   * @param moduleCode - Module code to check
   * @returns License validation result
   */
  async validateLicense(
    cabinetId: UUID,
    organizationId: OrganizationId,
    moduleCode: string,
  ): Promise<LicenseValidationResult> {
    this.logger.debug(`Validating license for cabinet ${cabinetId}, module ${moduleCode}`);

    // Fetch subscription with modules
    const subscription = await this.subscriptionRepository.findByCabinetId(
      cabinetId,
      organizationId,
      true,
    );

    // No subscription
    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No active subscription found for cabinet',
      };
    }

    // Check subscription status
    const statusResult = this.checkSubscriptionStatus(subscription);

    if (!statusResult.hasAccess) {
      return statusResult;
    }

    // Check module access
    const moduleResult = this.checkModuleAccess(subscription, moduleCode);

    // Combine results
    return {
      ...statusResult,
      ...moduleResult,
      hasAccess: statusResult.hasAccess && moduleResult.hasAccess,
    };
  }

  /**
   * Check if cabinet has active subscription (any module)
   *
   * Business logic:
   * - Checks if subscription exists
   * - Validates subscription is in valid status
   * - Returns simple boolean result
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID
   * @returns True if cabinet has active subscription
   */
  async hasActiveSubscription(cabinetId: UUID, organizationId: OrganizationId): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findByCabinetId(
      cabinetId,
      organizationId,
      false,
    );

    if (!subscription) {
      return false;
    }

    return this.isSubscriptionActive(subscription.status, subscription.inGracePeriod);
  }

  /**
   * Batch validate licenses for multiple modules
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID
   * @param moduleCodes - Array of module codes
   * @returns Map of module code to validation result
   */
  async validateLicenseBatch(
    cabinetId: UUID,
    organizationId: OrganizationId,
    moduleCodes: string[],
  ): Promise<Map<string, LicenseValidationResult>> {
    const results = new Map<string, LicenseValidationResult>();

    // Fetch subscription once
    const subscription = await this.subscriptionRepository.findByCabinetId(
      cabinetId,
      organizationId,
      true,
    );

    // No subscription - all denied
    if (!subscription) {
      const noSubResult: LicenseValidationResult = {
        hasAccess: false,
        reason: 'No active subscription found for cabinet',
      };

      moduleCodes.forEach((code) => results.set(code, noSubResult));
      return results;
    }

    // Check subscription status once
    const statusResult = this.checkSubscriptionStatus(subscription);

    // Check each module
    for (const moduleCode of moduleCodes) {
      if (!statusResult.hasAccess) {
        results.set(moduleCode, statusResult);
      } else {
        const moduleResult = this.checkModuleAccess(subscription, moduleCode);
        results.set(moduleCode, {
          ...statusResult,
          ...moduleResult,
          hasAccess: statusResult.hasAccess && moduleResult.hasAccess,
        });
      }
    }

    return results;
  }

  /**
   * Get active modules for cabinet
   *
   * @param cabinetId - Cabinet ID
   * @param organizationId - Organization ID
   * @returns Array of active module codes
   */
  async getActiveModules(cabinetId: UUID, organizationId: OrganizationId): Promise<string[]> {
    const subscription = await this.subscriptionRepository.findByCabinetId(
      cabinetId,
      organizationId,
      true,
    );

    if (!subscription) {
      return [];
    }

    if (!this.isSubscriptionActive(subscription.status, subscription.inGracePeriod)) {
      return [];
    }

    // Return active module IDs
    // TODO: Map to module codes when module service integration complete
    return subscription.modules.filter((m) => m.isActive).map((m) => m.moduleId);
  }

  /**
   * Check subscription status validity
   */
  private checkSubscriptionStatus(subscription: any): LicenseValidationResult {
    const { status, inGracePeriod, trialEndsAt, gracePeriodEndsAt } = subscription;

    // TRIAL status
    if (status === SubscriptionStatus.TRIAL) {
      // Check if trial expired
      if (subscription.isTrialExpired) {
        return {
          hasAccess: false,
          subscriptionStatus: status,
          isTrial: true,
          reason: 'Trial period has expired',
        };
      }

      // Trial active
      const daysUntilExpiry = trialEndsAt
        ? Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        hasAccess: true,
        subscriptionStatus: status,
        isTrial: true,
        daysUntilExpiry,
      };
    }

    // ACTIVE status
    if (status === SubscriptionStatus.ACTIVE) {
      return {
        hasAccess: true,
        subscriptionStatus: status,
        isTrial: false,
      };
    }

    // SUSPENDED status
    if (status === SubscriptionStatus.SUSPENDED) {
      // Check grace period
      if (inGracePeriod && gracePeriodEndsAt && new Date() < gracePeriodEndsAt) {
        const daysUntilExpiry = Math.ceil(
          (gracePeriodEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          hasAccess: true,
          subscriptionStatus: status,
          inGracePeriod: true,
          daysUntilExpiry,
          reason: 'Subscription suspended but in grace period',
        };
      }

      return {
        hasAccess: false,
        subscriptionStatus: status,
        reason: 'Subscription suspended and grace period expired',
      };
    }

    // EXPIRED or CANCELLED
    return {
      hasAccess: false,
      subscriptionStatus: status,
      reason: `Subscription is ${status.toLowerCase()}`,
    };
  }

  /**
   * Check module access in subscription
   */
  private checkModuleAccess(
    subscription: any,
    moduleCode: string,
  ): Pick<LicenseValidationResult, 'hasAccess' | 'moduleActive' | 'reason'> {
    // TODO: Map moduleCode to moduleId when module service available
    // For now, assume moduleCode matches moduleId

    const subscriptionModule = subscription.modules.find((m: any) => m.moduleId === moduleCode);

    if (!subscriptionModule) {
      return {
        hasAccess: false,
        moduleActive: false,
        reason: 'Module not included in subscription',
      };
    }

    if (!subscriptionModule.isActive) {
      return {
        hasAccess: false,
        moduleActive: false,
        reason: 'Module is deactivated',
      };
    }

    return {
      hasAccess: true,
      moduleActive: true,
    };
  }

  /**
   * Check if subscription status allows access
   */
  private isSubscriptionActive(status: SubscriptionStatus, inGracePeriod: boolean): boolean {
    if (status === SubscriptionStatus.TRIAL || status === SubscriptionStatus.ACTIVE) {
      return true;
    }

    if (status === SubscriptionStatus.SUSPENDED && inGracePeriod) {
      return true;
    }

    return false;
  }
}
