/**
 * Internationalization (i18n) Core Module
 *
 * Provides translation utilities and locale management for Dental OS.
 * Primary focus on Romanian localization with English fallback.
 */

import { ro, type RoTranslations } from './locales/ro';
import { en, type EnTranslations } from './locales/en';

/**
 * Supported locale codes
 */
export type LocaleCode = 'ro' | 'en';

/**
 * Default locale (Romanian)
 */
export const DEFAULT_LOCALE: LocaleCode = 'ro';

/**
 * Available locales with their display names
 */
export const AVAILABLE_LOCALES: Record<LocaleCode, { name: string; nativeName: string }> = {
  ro: { name: 'Romanian', nativeName: 'Română' },
  en: { name: 'English', nativeName: 'English' },
};

/**
 * Translation bundles by locale
 */
const translations: Record<LocaleCode, RoTranslations | EnTranslations> = {
  ro,
  en,
};

/**
 * Current active locale
 */
let currentLocale: LocaleCode = DEFAULT_LOCALE;

/**
 * Set the current locale
 */
export function setLocale(locale: LocaleCode): void {
  if (!AVAILABLE_LOCALES[locale]) {
    console.warn(`Locale "${locale}" is not available. Falling back to "${DEFAULT_LOCALE}".`);
    currentLocale = DEFAULT_LOCALE;
    return;
  }
  currentLocale = locale;
}

/**
 * Get the current locale
 */
export function getLocale(): LocaleCode {
  return currentLocale;
}

/**
 * Get all translations for the current locale
 */
export function getTranslations(): RoTranslations | EnTranslations {
  return translations[currentLocale] || translations[DEFAULT_LOCALE];
}

/**
 * Get translations for a specific locale
 */
export function getTranslationsForLocale(locale: LocaleCode): RoTranslations | EnTranslations {
  return translations[locale] || translations[DEFAULT_LOCALE];
}

/**
 * Helper type for nested object path
 */
type PathKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? PathKeys<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
        : never;
    }[keyof T]
  : Prefix;

/**
 * Get nested value from object by dot-notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Translate a key with optional interpolation
 *
 * @param key - Dot-notation path to the translation (e.g., "common.actions.save")
 * @param params - Optional parameters for interpolation (e.g., { count: 5 })
 * @returns Translated string or the key if not found
 *
 * @example
 * ```ts
 * t('common.actions.save') // "Salvează" (in Romanian)
 * t('common.validation.minLength', { count: 8 }) // "Minimum 8 caractere"
 * ```
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const bundle = getTranslations();
  let value = getNestedValue(bundle as Record<string, unknown>, key);

  // Fallback to English if not found
  if (value === undefined && currentLocale !== 'en') {
    value = getNestedValue(translations.en as Record<string, unknown>, key);
  }

  // Return key if still not found
  if (value === undefined || typeof value !== 'string') {
    console.warn(`Translation key not found: "${key}"`);
    return key;
  }

  // Interpolate parameters
  if (params) {
    return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
      return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }, value);
  }

  return value;
}

/**
 * Create a scoped translator function
 *
 * @param scope - Prefix scope for all translations
 * @returns Scoped translator function
 *
 * @example
 * ```ts
 * const t = createScopedTranslator('dental.patient');
 * t('title') // "Pacient"
 * t('newPatient') // "Pacient nou"
 * ```
 */
export function createScopedTranslator(scope: string): (key: string, params?: Record<string, string | number>) => string {
  return (key: string, params?: Record<string, string | number>) => {
    return t(`${scope}.${key}`, params);
  };
}

/**
 * Format a number according to Romanian conventions
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234.56) // "1.234,56" (Romanian format)
 * ```
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat(currentLocale === 'ro' ? 'ro-RO' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency according to Romanian conventions
 *
 * @param value - Amount to format
 * @param currency - Currency code (default: 'RON')
 * @returns Formatted currency string
 *
 * @example
 * ```ts
 * formatCurrency(1234.56) // "1.234,56 RON"
 * formatCurrency(99.99, 'EUR') // "99,99 €"
 * ```
 */
export function formatCurrency(value: number, currency = 'RON'): string {
  return new Intl.NumberFormat(currentLocale === 'ro' ? 'ro-RO' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date according to Romanian conventions
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date()) // "26.11.2025" (Romanian format)
 * formatDate(new Date(), { dateStyle: 'long' }) // "26 noiembrie 2025"
 * ```
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short' },
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(currentLocale === 'ro' ? 'ro-RO' : 'en-US', options).format(d);
}

/**
 * Format a date and time according to Romanian conventions
 *
 * @param date - Date to format
 * @returns Formatted date-time string
 *
 * @example
 * ```ts
 * formatDateTime(new Date()) // "26.11.2025, 14:30"
 * ```
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Format time according to Romanian conventions
 *
 * @param date - Date to extract time from
 * @returns Formatted time string
 *
 * @example
 * ```ts
 * formatTime(new Date()) // "14:30"
 * ```
 */
export function formatTime(date: Date | string | number): string {
  return formatDate(date, { timeStyle: 'short' });
}

/**
 * Get relative time description
 *
 * @param date - Date to compare
 * @returns Relative time string (e.g., "acum 2 zile")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(currentLocale === 'ro' ? 'ro' : 'en', {
    numeric: 'auto',
  });

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return rtf.format(-diffMinutes, 'minute');
    }
    return rtf.format(-diffHours, 'hour');
  }

  if (Math.abs(diffDays) < 30) {
    return rtf.format(-diffDays, 'day');
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(-diffMonths, 'month');
  }

  const diffYears = Math.floor(diffDays / 365);
  return rtf.format(-diffYears, 'year');
}
