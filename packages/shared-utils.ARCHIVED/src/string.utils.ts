/**
 * String utility functions for manipulation and transformation
 * All functions are pure and handle edge cases gracefully
 */

/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncates a string to a specified length with ellipsis
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number = 50,
  ellipsis: string = '...',
): string {
  if (!text || typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  const truncatedLength = Math.max(0, maxLength - ellipsis.length);
  return text.slice(0, truncatedLength) + ellipsis;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Converts a string to title case
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Sanitizes a string by removing HTML tags and special characters
 */
export function sanitize(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
}

/**
 * Removes all whitespace from a string
 */
export function removeWhitespace(text: string | null | undefined): string {
  return text && typeof text === 'string' ? text.replace(/\s+/g, '') : '';
}

/**
 * Normalizes whitespace in a string (multiple spaces to single space, trim)
 */
export function normalizeWhitespace(text: string | null | undefined): string {
  return text && typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Extracts initials from a name
 */
export function getInitials(
  name: string | null | undefined,
  maxInitials: number = 2,
): string {
  if (!name || typeof name !== 'string') return '';
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, Math.max(1, maxInitials))
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Masks a string except for specified number of characters at start and end
 */
export function maskString(
  text: string | null | undefined,
  visibleStart: number = 4,
  visibleEnd: number = 4,
  maskChar: string = '*',
): string {
  if (!text || typeof text !== 'string') return '';
  const length = text.length;
  if (length <= visibleStart + visibleEnd) return maskChar.repeat(length);
  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd);
  const masked = maskChar.repeat(length - visibleStart - visibleEnd);
  return start + masked + end;
}

/**
 * Checks if a string is empty or contains only whitespace
 */
export function isEmpty(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Pads a string to a specified length
 */
export function pad(
  text: string | null | undefined,
  length: number,
  padChar: string = ' ',
  padLeft: boolean = false,
): string {
  if (!text || typeof text !== 'string') return padChar.repeat(Math.max(0, length));
  if (text.length >= length) return text;
  const padding = padChar.repeat(length - text.length);
  return padLeft ? padding + text : text + padding;
}

/**
 * Converts a camelCase or PascalCase string to kebab-case
 */
export function toKebabCase(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a kebab-case or snake_case string to camelCase
 */
export function toCamelCase(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}
