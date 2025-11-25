import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * SelectFields Decorator
 * Extracts field selection from query parameters for partial responses
 * Usage: @SelectFields() fields: string[]
 *
 * Example: GET /organizations?fields=name,status,subscriptionTier
 */

export const SelectFields = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string[] | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const fields = request.query.fields;

    if (!fields) {
      return undefined;
    }

    // Support both comma-separated and array formats
    if (Array.isArray(fields)) {
      return fields;
    }

    if (typeof fields === 'string') {
      return fields
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
    }

    return undefined;
  },
);

/**
 * Apply field selection to query
 */
export function applyFieldSelection(
  fields: string[] | undefined,
  defaultFields?: string[],
): string | undefined {
  if (!fields || fields.length === 0) {
    return defaultFields ? defaultFields.join(' ') : undefined;
  }

  // Validate fields (prevent injection)
  const validFields = fields.filter((f) => /^[a-zA-Z0-9_.]+$/.test(f));

  return validFields.join(' ');
}
