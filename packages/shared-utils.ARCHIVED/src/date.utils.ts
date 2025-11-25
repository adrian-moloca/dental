/**
 * Date utility functions for formatting, parsing, and calculations
 * All functions are pure and handle edge cases gracefully
 */

import {
  format,
  parseISO,
  isValid,
  addDays,
  addMonths,
  differenceInDays,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
} from 'date-fns';

/**
 * Formats a date to a standard display format
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatString: string = 'yyyy-MM-dd',
): string | null {
  if (!date) return null;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(dateObj) ? format(dateObj, formatString) : null;
  } catch {
    return null;
  }
}

/**
 * Formats a date for display in a human-readable format
 */
export function formatDateDisplay(
  date: Date | string | number | null | undefined,
): string | null {
  return formatDate(date, 'MMM dd, yyyy');
}

/**
 * Formats a date with time for display
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
): string | null {
  return formatDate(date, 'MMM dd, yyyy h:mm a');
}

/**
 * Parses a date string to a Date object
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString || typeof dateString !== 'string') return null;
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Adds days to a date
 */
export function addDaysToDate(
  date: Date | string | number | null | undefined,
  days: number,
): Date | null {
  if (!date || typeof days !== 'number' || !Number.isFinite(days)) return null;
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(dateObj) ? addDays(dateObj, Math.floor(days)) : null;
}

/**
 * Adds months to a date
 */
export function addMonthsToDate(
  date: Date | string | number | null | undefined,
  months: number,
): Date | null {
  if (!date || typeof months !== 'number' || !Number.isFinite(months)) return null;
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(dateObj) ? addMonths(dateObj, Math.floor(months)) : null;
}

/**
 * Calculates the difference in days between two dates
 */
export function daysBetween(
  startDate: Date | string | number | null | undefined,
  endDate: Date | string | number | null | undefined,
): number | null {
  if (!startDate || !endDate) return null;
  const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
  const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);
  return isValid(start) && isValid(end) ? differenceInDays(end, start) : null;
}

/**
 * Checks if a date is in the past
 */
export function isPast(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(dateObj) ? isBefore(dateObj, new Date()) : false;
}

/**
 * Checks if a date is in the future
 */
export function isFuture(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(dateObj) ? isAfter(dateObj, new Date()) : false;
}

/**
 * Gets the start of day for a given date
 */
export function getStartOfDay(
  date: Date | string | number | null | undefined,
): Date | null {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(dateObj) ? startOfDay(dateObj) : null;
}

/**
 * Gets the end of day for a given date
 */
export function getEndOfDay(
  date: Date | string | number | null | undefined,
): Date | null {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(dateObj) ? endOfDay(dateObj) : null;
}
