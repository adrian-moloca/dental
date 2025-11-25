/**
 * Shared utility functions for the Dental OS monorepo
 * All utilities are pure functions with no side effects
 */

// Date utilities
export {
  formatDate,
  formatDateDisplay,
  formatDateTime,
  parseDate,
  addDaysToDate,
  addMonthsToDate,
  daysBetween,
  isPast,
  isFuture,
  getStartOfDay,
  getEndOfDay,
} from './date.utils';

// String utilities
export {
  slugify,
  truncate,
  capitalize,
  toTitleCase,
  sanitize,
  removeWhitespace,
  normalizeWhitespace,
  getInitials,
  maskString,
  isEmpty as isEmptyString,
  pad,
  toKebabCase,
  toCamelCase,
} from './string.utils';

// Number utilities
export {
  formatCurrency,
  formatPercentage,
  formatNumber,
  roundToDecimals,
  clamp,
  calculatePercentage,
  percentageOf,
  sum,
  average,
  min,
  max,
  isInRange,
} from './number.utils';

// Format utilities
export {
  formatPhoneUS,
  formatPhoneInternational,
  formatSSN,
  formatEIN,
  formatCreditCard,
  maskCreditCard,
  formatZipCode,
  formatAddress,
  formatNameLastFirst,
  formatNameFirstLast,
  formatFileSize,
} from './format.utils';

// Validation utilities
export {
  isValidEmail,
  isValidPhoneUS,
  isValidSSN,
  isValidEIN,
  isValidZipCode,
  isValidCreditCard,
  isValidUrl,
  isValidLength,
  isValidPassword,
  isValidISODate,
  isValidHexColor,
  isValidUUID,
} from './validation.utils';

// Array utilities
export {
  groupBy,
  unique,
  uniqueBy,
  chunk,
  flatten,
  compact,
  intersection,
  difference,
  partition,
  sortBy,
  take,
  drop,
  toMap,
  isEmpty as isEmptyArray,
} from './array.utils';
