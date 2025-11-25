/**
 * Create Subscription DTO
 *
 * Data transfer object for creating a new subscription.
 * Includes Zod schema validation for runtime type safety.
 *
 * Validation rules:
 * - cabinetId: Required UUID
 * - billingCycle: Optional, defaults to MONTHLY
 * - autoStartTrial: Optional, defaults to true
 *
 * Business rules:
 * - organizationId injected from request context (not in DTO)
 * - Trial starts immediately if autoStartTrial=true
 * - Trial duration: 30 days
 * - Core modules auto-added on creation
 *
 * @module modules/subscriptions/dto
 */

import { z } from 'zod';
import { BillingCycle } from '../entities/subscription.entity';

/**
 * Zod schema for creating a subscription
 *
 * Validation:
 * - cabinetId: Valid UUID v4 format
 * - billingCycle: Must be MONTHLY or YEARLY
 * - autoStartTrial: Boolean flag for trial start
 */
export const createSubscriptionSchema = z.object({
  /**
   * Cabinet (dental practice) ID
   * Must exist and belong to same organization
   */
  cabinetId: z.string().uuid({
    message: 'Cabinet ID must be a valid UUID',
  }),

  /**
   * Billing cycle preference
   * Affects module pricing:
   * - MONTHLY: Higher per-month cost
   * - YEARLY: Annual payment with discount
   * Default: MONTHLY
   */
  billingCycle: z
    .nativeEnum(BillingCycle, {
      errorMap: () => ({
        message: 'Billing cycle must be either MONTHLY or YEARLY',
      }),
    })
    .default(BillingCycle.MONTHLY),

  /**
   * Auto-start trial flag
   * - true: Trial starts immediately (default)
   * - false: Subscription created in pending state
   * Default: true
   */
  autoStartTrial: z.boolean().default(true),

  /**
   * Currency code (ISO 4217)
   * Default: USD
   * @example "USD", "EUR", "GBP"
   */
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .default('USD'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;

/**
 * Create subscription request body
 * Used in controller validation
 */
export class CreateSubscriptionRequest implements CreateSubscriptionDto {
  cabinetId!: string;
  billingCycle!: BillingCycle;
  autoStartTrial!: boolean;
  currency!: string;
}
