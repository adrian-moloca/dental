/**
 * Grace period validation helpers
 * @module shared-auth/license/grace-period
 */

import { SubscriptionStatus } from '../jwt/jwt-payload.types';
import {
  GRACE_PERIOD_DAYS,
  READ_METHODS,
  WRITE_METHODS,
} from './license.constants';

/**
 * Subscription data required for grace period checks
 * Represents a subset of the full subscription entity
 */
export interface GracePeriodSubscription {
  /** Current subscription status */
  readonly status: SubscriptionStatus;
  /** Whether subscription is in grace period */
  readonly inGracePeriod?: boolean;
  /** When grace period ends (null if not in grace period) */
  readonly gracePeriodEndsAt?: Date | null;
}

/**
 * Check if a subscription is currently in grace period
 *
 * @param subscription - Subscription data
 * @returns true if in grace period, false otherwise
 *
 * @remarks
 * Grace period is when payment has failed but access is still granted
 * with restrictions (read-only mode). This typically lasts 7 days.
 *
 * @example
 * ```typescript
 * const subscription = {
 *   status: SubscriptionStatus.SUSPENDED,
 *   inGracePeriod: true,
 *   gracePeriodEndsAt: new Date('2025-12-01'),
 * };
 * isInGracePeriod(subscription); // true (if current date < 2025-12-01)
 * ```
 */
export function isInGracePeriod(subscription: GracePeriodSubscription): boolean {
  // Must be suspended and explicitly marked as in grace period
  if (
    subscription.status !== SubscriptionStatus.SUSPENDED ||
    !subscription.inGracePeriod
  ) {
    return false;
  }

  // Must have a valid grace period end date
  if (!subscription.gracePeriodEndsAt) {
    return false;
  }

  // Check if grace period has expired
  const now = new Date();
  const graceEnd = new Date(subscription.gracePeriodEndsAt);

  return now <= graceEnd;
}

/**
 * Get remaining days in grace period
 *
 * @param subscription - Subscription data
 * @returns Number of days remaining (0 if not in grace period or expired)
 *
 * @example
 * ```typescript
 * const daysLeft = getGracePeriodDaysRemaining(subscription);
 * if (daysLeft > 0 && daysLeft <= 3) {
 *   console.log(`Warning: Only ${daysLeft} days left in grace period`);
 * }
 * ```
 */
export function getGracePeriodDaysRemaining(
  subscription: GracePeriodSubscription,
): number {
  if (!isInGracePeriod(subscription)) {
    return 0;
  }

  const now = new Date();
  const graceEnd = new Date(subscription.gracePeriodEndsAt!);

  // Calculate difference in milliseconds and convert to days
  const diffMs = graceEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Check if grace period is expiring soon (within 3 days)
 *
 * @param subscription - Subscription data
 * @returns true if grace period expires in 3 days or less
 *
 * @example
 * ```typescript
 * if (isGracePeriodExpiringSoon(subscription)) {
 *   // Show urgent payment reminder
 * }
 * ```
 */
export function isGracePeriodExpiringSoon(
  subscription: GracePeriodSubscription,
): boolean {
  const daysRemaining = getGracePeriodDaysRemaining(subscription);
  return daysRemaining > 0 && daysRemaining <= 3;
}

/**
 * Check if an HTTP method is a read operation
 *
 * @param method - HTTP method string (e.g., 'GET', 'POST')
 * @returns true if method is read-only, false otherwise
 *
 * @remarks
 * Read operations are: GET, HEAD, OPTIONS
 * These are allowed during grace period.
 *
 * @example
 * ```typescript
 * isReadOperation('GET'); // true
 * isReadOperation('POST'); // false
 * ```
 */
export function isReadOperation(method: string): boolean {
  const upperMethod = method.toUpperCase();
  return READ_METHODS.includes(upperMethod as any);
}

/**
 * Check if an HTTP method is a write operation
 *
 * @param method - HTTP method string (e.g., 'GET', 'POST')
 * @returns true if method is write operation, false otherwise
 *
 * @remarks
 * Write operations are: POST, PUT, PATCH, DELETE
 * These are blocked during grace period.
 *
 * @example
 * ```typescript
 * isWriteOperation('POST'); // true
 * isWriteOperation('GET'); // false
 * ```
 */
export function isWriteOperation(method: string): boolean {
  const upperMethod = method.toUpperCase();
  return WRITE_METHODS.includes(upperMethod as any);
}

/**
 * Check if an operation can be performed based on subscription status
 *
 * @param subscription - Subscription data
 * @param httpMethod - HTTP method of the operation
 * @returns true if operation is allowed, false otherwise
 *
 * @remarks
 * During grace period:
 * - Read operations (GET, HEAD, OPTIONS) are allowed
 * - Write operations (POST, PUT, PATCH, DELETE) are blocked
 *
 * Outside grace period:
 * - All operations allowed if subscription is active/trial
 * - All operations blocked if subscription is expired/cancelled
 *
 * @example
 * ```typescript
 * // In grace period
 * canPerformOperation(subscription, 'GET'); // true
 * canPerformOperation(subscription, 'POST'); // false
 *
 * // Active subscription
 * canPerformOperation(activeSubscription, 'POST'); // true
 * ```
 */
export function canPerformOperation(
  subscription: GracePeriodSubscription,
  httpMethod: string,
): boolean {
  // If in grace period, only allow read operations
  if (isInGracePeriod(subscription)) {
    return isReadOperation(httpMethod);
  }

  // For non-grace-period status, check subscription status
  return (
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.TRIAL
  );
}

/**
 * Check if write operations are allowed
 *
 * @param subscription - Subscription data
 * @param httpMethod - HTTP method to check
 * @returns true if write operation is allowed, false otherwise
 *
 * @remarks
 * This is a convenience function that combines subscription status
 * and grace period checks for write operations.
 *
 * @example
 * ```typescript
 * if (!canPerformWriteOperation(subscription, 'POST')) {
 *   throw new ForbiddenException(
 *     'Write operations are not allowed during grace period'
 *   );
 * }
 * ```
 */
export function canPerformWriteOperation(
  subscription: GracePeriodSubscription,
  httpMethod: string,
): boolean {
  if (!isWriteOperation(httpMethod)) {
    return true; // Not a write operation, so no restriction
  }

  // Block write operations during grace period
  if (isInGracePeriod(subscription)) {
    return false;
  }

  // Allow if subscription is active or trial
  return (
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.TRIAL
  );
}

/**
 * Calculate grace period end date from a given start date
 *
 * @param startDate - Date when grace period starts (typically payment failure date)
 * @param gracePeriodDays - Number of days in grace period (default: 7)
 * @returns Date when grace period ends
 *
 * @example
 * ```typescript
 * const paymentFailedAt = new Date('2025-11-22');
 * const graceEndsAt = calculateGracePeriodEnd(paymentFailedAt);
 * // Returns: Date('2025-11-29')
 * ```
 */
export function calculateGracePeriodEnd(
  startDate: Date,
  gracePeriodDays: number = GRACE_PERIOD_DAYS,
): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + gracePeriodDays);
  return endDate;
}

/**
 * Get grace period status message for UI display
 *
 * @param subscription - Subscription data
 * @returns Human-readable status message
 *
 * @example
 * ```typescript
 * const message = getGracePeriodStatusMessage(subscription);
 * // Returns: "Your account is in grace period. 5 days remaining."
 * ```
 */
export function getGracePeriodStatusMessage(
  subscription: GracePeriodSubscription,
): string {
  if (!isInGracePeriod(subscription)) {
    return '';
  }

  const daysRemaining = getGracePeriodDaysRemaining(subscription);

  if (daysRemaining === 0) {
    return 'Your grace period has ended. Please update your payment method.';
  }

  if (daysRemaining === 1) {
    return 'Your account is in grace period. 1 day remaining. Write operations are disabled.';
  }

  return `Your account is in grace period. ${daysRemaining} days remaining. Write operations are disabled.`;
}

/**
 * Check if subscription allows full access (no grace period restrictions)
 *
 * @param subscription - Subscription data
 * @returns true if full access allowed, false otherwise
 *
 * @example
 * ```typescript
 * if (hasFullAccess(subscription)) {
 *   // Allow all operations
 * } else {
 *   // Check grace period restrictions
 * }
 * ```
 */
export function hasFullAccess(subscription: GracePeriodSubscription): boolean {
  return (
    (subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIAL) &&
    !isInGracePeriod(subscription)
  );
}
