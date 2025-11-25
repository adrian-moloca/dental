/**
 * Number utility functions for formatting and calculations
 * All functions are pure and handle edge cases gracefully
 */

/**
 * Formats a number as currency
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US',
): string | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats a number as a percentage
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 0,
  locale: string = 'en-US',
): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0,
  locale: string = 'en-US',
): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

/**
 * Rounds a number to specified decimal places
 */
export function roundToDecimals(
  value: number | null | undefined,
  decimals: number = 2,
): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const multiplier = Math.pow(10, Math.max(0, Math.floor(decimals)));
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Clamps a number between min and max values
 */
export function clamp(
  value: number | null | undefined,
  min: number,
  max: number,
): number | null {
  if (
    typeof value !== 'number' || !Number.isFinite(value) ||
    typeof min !== 'number' || !Number.isFinite(min) ||
    typeof max !== 'number' || !Number.isFinite(max)
  ) return null;
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates percentage of a value
 */
export function calculatePercentage(
  value: number | null | undefined,
  percentage: number | null | undefined,
): number | null {
  if (
    typeof value !== 'number' || !Number.isFinite(value) ||
    typeof percentage !== 'number' || !Number.isFinite(percentage)
  ) return null;
  return value * percentage;
}

/**
 * Calculates the percentage that one number represents of another
 */
export function percentageOf(
  part: number | null | undefined,
  whole: number | null | undefined,
): number | null {
  if (
    typeof part !== 'number' || !Number.isFinite(part) ||
    typeof whole !== 'number' || !Number.isFinite(whole) || whole === 0
  ) return null;
  return part / whole;
}

/**
 * Sums an array of numbers
 */
export function sum(values: (number | null | undefined)[]): number {
  if (!Array.isArray(values)) return 0;
  return values.reduce((total: number, value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return total + value;
    }
    return total;
  }, 0);
}

/**
 * Calculates the average of an array of numbers
 */
export function average(values: (number | null | undefined)[]): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  const validValues = values.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  );
  return validValues.length === 0 ? null : sum(validValues) / validValues.length;
}

/**
 * Finds the minimum value in an array of numbers
 */
export function min(values: (number | null | undefined)[]): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  const validValues = values.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  );
  return validValues.length === 0 ? null : Math.min(...validValues);
}

/**
 * Finds the maximum value in an array of numbers
 */
export function max(values: (number | null | undefined)[]): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  const validValues = values.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  );
  return validValues.length === 0 ? null : Math.max(...validValues);
}

/**
 * Checks if a value is within a range (inclusive)
 */
export function isInRange(
  value: number | null | undefined,
  min: number,
  max: number,
): boolean {
  if (
    typeof value !== 'number' || !Number.isFinite(value) ||
    typeof min !== 'number' || !Number.isFinite(min) ||
    typeof max !== 'number' || !Number.isFinite(max)
  ) return false;
  return value >= min && value <= max;
}
