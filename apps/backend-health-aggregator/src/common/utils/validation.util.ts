/**
 * Validation Utility Functions
 *
 * Provides common validation functions for various data types.
 */

/**
 * Checks if a value is a non-empty string
 *
 * @param value - Value to check
 * @returns true if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Checks if a value is a valid number
 *
 * @param value - Value to check
 * @returns true if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Checks if a value is a valid URL
 *
 * @param value - Value to check
 * @returns true if value is a valid URL
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a value is a valid email address
 *
 * @param value - Value to check
 * @returns true if value is a valid email
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Checks if a value is a valid UUID
 *
 * @param value - Value to check
 * @returns true if value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Checks if an object has all required keys
 *
 * @param obj - Object to check
 * @param keys - Required keys
 * @returns true if object has all required keys
 */
export function hasRequiredKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
): boolean {
  return keys.every((key) => key in obj && obj[key] !== undefined);
}
