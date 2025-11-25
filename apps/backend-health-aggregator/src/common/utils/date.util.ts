/**
 * Date Utility Functions
 *
 * Provides common date manipulation and formatting functions.
 */

/**
 * Checks if a date is valid
 *
 * @param date - Date to validate
 * @returns true if date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Formats a date to ISO 8601 string
 *
 * @param date - Date to format
 * @returns ISO 8601 formatted string
 */
export function toISOString(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValidDate(d)) {
    throw new Error('Invalid date provided');
  }
  return d.toISOString();
}

/**
 * Gets current timestamp in milliseconds
 *
 * @returns Current timestamp
 */
export function now(): number {
  return Date.now();
}

/**
 * Adds days to a date
 *
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Checks if date is in the past
 *
 * @param date - Date to check
 * @returns true if date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Checks if date is in the future
 *
 * @param date - Date to check
 * @returns true if date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}
