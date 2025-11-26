/**
 * Class Name Utility
 *
 * Merges class names with clsx and tailwind-merge for better Tailwind CSS compatibility
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Merges class names using clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
