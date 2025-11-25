/**
 * Add Modules DTO
 *
 * Data transfer object for adding modules to a subscription.
 * Includes Zod schema validation for runtime type safety.
 *
 * Validation rules:
 * - moduleIds: Array of valid UUIDs (1-50 modules)
 * - No duplicate module IDs
 * - Modules must exist and be available
 * - Dependencies automatically added
 *
 * Business rules:
 * - Price recalculated after adding modules
 * - Dependencies validated and auto-added if missing
 * - Cannot add core modules (already included)
 * - Cannot add modules already in subscription
 *
 * @module modules/subscriptions/dto
 */

import { z } from 'zod';

/**
 * Zod schema for adding modules to subscription
 */
export const addModulesSchema = z.object({
  /**
   * Array of module IDs to add
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
    .max(50, 'Cannot add more than 50 modules at once')
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
});

/**
 * TypeScript type inferred from Zod schema
 */
export type AddModulesDto = z.infer<typeof addModulesSchema>;

/**
 * Add modules request body
 * Used in controller validation
 */
export class AddModulesRequest implements AddModulesDto {
  moduleIds!: string[];
}
