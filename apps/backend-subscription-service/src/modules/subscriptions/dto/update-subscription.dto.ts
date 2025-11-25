/**
 * Update Subscription DTO
 *
 * Data transfer object for updating an existing subscription.
 * Includes Zod schema validation for runtime type safety.
 *
 * Updatable fields:
 * - billingCycle: Change from MONTHLY to YEARLY or vice versa
 * - cancelAtPeriodEnd: Schedule cancellation
 * - cancellationReason: Provide feedback on cancellation
 *
 * Non-updatable fields:
 * - status: Use dedicated service methods (activate, cancel, suspend)
 * - cabinetId: Cannot be changed after creation
 * - organizationId: Cannot be changed (tenant isolation)
 * - pricing: Auto-calculated based on modules
 *
 * @module modules/subscriptions/dto
 */

import { z } from 'zod';
import { BillingCycle } from '../entities/subscription.entity';

/**
 * Zod schema for updating a subscription
 *
 * All fields are optional (partial update)
 * At least one field must be provided
 */
export const updateSubscriptionSchema = z
  .object({
    /**
     * Change billing cycle
     * Triggers price recalculation
     * Applied at next renewal period
     */
    billingCycle: z
      .nativeEnum(BillingCycle, {
        errorMap: () => ({
          message: 'Billing cycle must be either MONTHLY or YEARLY',
        }),
      })
      .optional(),

    /**
     * Schedule cancellation at period end
     * - true: Cancel at currentPeriodEnd (user keeps access)
     * - false: Reactivate if scheduled for cancellation
     */
    cancelAtPeriodEnd: z.boolean().optional(),

    /**
     * Reason for cancellation
     * Required if cancelAtPeriodEnd=true
     * Used for churn analysis
     * @minLength 10
     * @maxLength 1000
     */
    cancellationReason: z
      .string()
      .min(10, 'Cancellation reason must be at least 10 characters')
      .max(1000, 'Cancellation reason must not exceed 1000 characters')
      .optional(),
  })
  .refine(
    (data) => {
      // If cancelling, reason is required
      if (data.cancelAtPeriodEnd === true && !data.cancellationReason) {
        return false;
      }
      return true;
    },
    {
      message: 'Cancellation reason is required when cancelling subscription',
      path: ['cancellationReason'],
    },
  )
  .refine(
    (data) => {
      // At least one field must be provided
      return data.billingCycle !== undefined || data.cancelAtPeriodEnd !== undefined;
    },
    {
      message: 'At least one field must be provided for update',
    },
  );

/**
 * TypeScript type inferred from Zod schema
 */
export type UpdateSubscriptionDto = z.infer<typeof updateSubscriptionSchema>;

/**
 * Update subscription request body
 * Used in controller validation
 */
export class UpdateSubscriptionRequest implements Partial<UpdateSubscriptionDto> {
  billingCycle?: BillingCycle;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
}
