/**
 * Shared i18n Package
 *
 * Internationalization utilities for Dental OS with Romanian localization.
 *
 * @example
 * ```ts
 * import { t, setLocale, formatCurrency, formatDate } from '@dentalos/shared-i18n';
 *
 * setLocale('ro');
 * console.log(t('common.actions.save')); // "Salvează"
 * console.log(formatCurrency(199.99)); // "199,99 RON"
 * console.log(formatDate(new Date())); // "26.11.2025"
 * ```
 *
 * @module @dentalos/shared-i18n
 */

// Core i18n utilities
export {
  t,
  setLocale,
  getLocale,
  getTranslations,
  getTranslationsForLocale,
  createScopedTranslator,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  DEFAULT_LOCALE,
  AVAILABLE_LOCALES,
  type LocaleCode,
} from './i18n';

// Romanian translations
export { ro, roCommon, roDental, roBilling } from './locales/ro';
export type { RoTranslations, RoCommonTranslations, RoDentalTranslations, RoBillingTranslations } from './locales/ro';

// English translations (fallback)
export { en, enCommon } from './locales/en';
export type { EnTranslations } from './locales/en';
