/**
 * String Utility Functions
 *
 * Provides common string manipulation and validation functions.
 */

/**
 * Checks if a string is empty or contains only whitespace
 *
 * @param str - String to check
 * @returns true if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Truncates a string to a maximum length
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append if truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (isEmpty(str)) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts a string to kebab-case
 *
 * @param str - String to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase
 *
 * @param str - String to convert
 * @returns camelCase string
 */
export function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Sanitizes a string for safe display (removes HTML tags)
 *
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}
