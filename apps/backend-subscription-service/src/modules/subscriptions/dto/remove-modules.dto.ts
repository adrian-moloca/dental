/**
 * Remove Modules DTO
 *
 * Data transfer object for removing modules from a subscription.
 * Includes Zod schema validation for runtime type safety.
 *
 * Validation rules:
 * - moduleIds: Array of valid UUIDs (1-50 modules)
 * - No duplicate module IDs
 * - Modules must be in subscription
 * - Cannot remove core modules
 * - Dependents automatically removed
 *
 * Business rules:
 * - Price recalculated after removing modules
 * - Dependent modules validated and auto-removed
 * - Core modules cannot be removed
 * - Modules must be currently active
 *
 * @module modules/subscriptions/dto
 */

import { z } from 'zod';

/**
 * Zod schema for removing modules from subscription
 */
export const removeModulesSchema = z.object({
  /**
   * Array of module IDs to remove
   * Must be valid UUIDs
   * Minimum: 1 module
   * Maximum: 50 modules (batch limit)
   * No duplicates allowed
   */
  moduleIds: z
    .array(
      z.string().uuid({
        message: 'Each module ID must be a valid UUID',
      }),
    )
    .min(1, 'At least one module ID is required')
    .max(50, 'Cannot remove more than 50 modules at once')
    .refine(
      (ids) => {
        // Check for duplicates
        const uniqueIds = new Set(ids);
        return uniqueIds.size === ids.length;
      },
      {
        message: 'Duplicate module IDs are not allowed',
      },
    ),

  /**
   * Reason for removing modules
   * Optional feedback for analytics
   * @minLength 10
   * @maxLength 500
   */
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .optional(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type RemoveModulesDto = z.infer<typeof removeModulesSchema>;

/**
 * Remove modules request body
 * Used in controller validation
 */
export class RemoveModulesRequest implements RemoveModulesDto {
  moduleIds!: string[];
  reason?: string;
}
