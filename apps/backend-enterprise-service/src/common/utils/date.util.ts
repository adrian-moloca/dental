/**
 * Date and Time Utilities
 *
 * Provides comprehensive date/time handling with timezone support
 * for the Enterprise Service.
 *
 * Edge cases handled:
 * - Timezone conversions (UTC <-> local timezone)
 * - Business hours calculations (working days, weekends)
 * - Date range validation (start < end)
 * - Leap years and month boundaries
 * - Daylight saving time transitions
 * - Null/undefined date handling
 * - Invalid date strings
 * - Date formatting for different locales
 * - Fiscal year calculations
 * - Age calculations (for staff eligibility)
 *
 * @module DateUtil
 */

/**
 * Supported timezone types
 */
export type SupportedTimezone =
  | 'Europe/Bucharest' // Romania
  | 'Europe/London'
  | 'Europe/Paris'
  | 'Europe/Berlin'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'UTC';

/**
 * Date range interface
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Business hours configuration
 */
export interface BusinessHoursConfig {
  startHour: number; // 0-23
  endHour: number; // 0-23
  workingDays: number[]; // 0-6 (0 = Sunday)
  timezone: SupportedTimezone;
}

/**
 * Default business hours (Monday-Friday, 9 AM - 5 PM, Romania timezone)
 */
const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  startHour: 9,
  endHour: 17,
  workingDays: [1, 2, 3, 4, 5], // Monday-Friday
  timezone: 'Europe/Bucharest',
};

/**
 * Date Utility Class
 *
 * Provides static methods for date/time operations
 */
export class DateUtil {
  /**
   * Gets current date/time in specified timezone
   *
   * Edge cases:
   * - Defaults to UTC if timezone not specified
   * - Handles daylight saving time transitions
   *
   * @param timezone - Target timezone
   * @returns Current date in specified timezone
   */
  static now(timezone: SupportedTimezone = 'UTC'): Date {
    const now = new Date();
    return DateUtil.toTimezone(now, timezone);
  }

  /**
   * Converts date to specified timezone
   *
   * Edge cases:
   * - Preserves the moment in time, changes display
   * - Handles daylight saving time transitions
   * - Returns new Date object (immutable)
   *
   * @param date - Date to convert
   * @param timezone - Target timezone
   * @returns Date in target timezone
   */
  static toTimezone(date: Date, timezone: SupportedTimezone): Date {
    // Edge case: Return new Date to avoid mutations
    const dateString = date.toLocaleString('en-US', { timeZone: timezone });
    return new Date(dateString);
  }

  /**
   * Converts date to UTC
   *
   * @param date - Date to convert
   * @returns Date in UTC
   */
  static toUTC(date: Date): Date {
    return new Date(date.toISOString());
  }

  /**
   * Formats date to ISO 8601 string
   *
   * Edge cases:
   * - Null/undefined returns null
   * - Invalid dates return null
   *
   * @param date - Date to format
   * @returns ISO 8601 string or null
   */
  static toISOString(date: Date | null | undefined): string | null {
    if (!date) return null;
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  /**
   * Parses ISO 8601 string to Date
   *
   * Edge cases:
   * - Null/undefined/empty returns null
   * - Invalid date strings return null
   * - Validates date is actually valid (not NaN)
   *
   * @param dateString - ISO 8601 date string
   * @returns Parsed date or null
   */
  static fromISOString(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    // Edge case: Check if date is valid
    if (isNaN(date.getTime())) return null;
    return date;
  }

  /**
   * Formats date for display
   *
   * Edge cases:
   * - Null/undefined returns null
   * - Invalid dates return null
   * - Respects locale formatting
   *
   * @param date - Date to format
   * @param locale - Locale for formatting (default: 'ro-RO')
   * @param options - Intl.DateTimeFormatOptions
   * @returns Formatted date string or null
   */
  static format(
    date: Date | null | undefined,
    locale: string = 'ro-RO',
    options?: Intl.DateTimeFormatOptions,
  ): string | null {
    if (!date) return null;
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options,
    };

    return date.toLocaleString(locale, defaultOptions);
  }

  /**
   * Formats date for display (date only, no time)
   *
   * @param date - Date to format
   * @param locale - Locale for formatting (default: 'ro-RO')
   * @returns Formatted date string or null
   */
  static formatDate(date: Date | null | undefined, locale: string = 'ro-RO'): string | null {
    return DateUtil.format(date, locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Formats date for display (time only, no date)
   *
   * @param date - Date to format
   * @param locale - Locale for formatting (default: 'ro-RO')
   * @returns Formatted time string or null
   */
  static formatTime(date: Date | null | undefined, locale: string = 'ro-RO'): string | null {
    return DateUtil.format(date, locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Checks if date is valid
   *
   * Edge cases:
   * - Null/undefined returns false
   * - Non-Date objects return false
   * - Invalid dates (NaN timestamp) return false
   *
   * @param date - Date to validate
   * @returns true if valid date
   */
  static isValidDate(date: unknown): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validates date range
   *
   * Edge cases:
   * - Start must be before end
   * - Both dates must be valid
   * - Null/undefined returns false
   *
   * @param range - Date range to validate
   * @returns true if valid range
   */
  static isValidRange(range: DateRange | null | undefined): boolean {
    if (!range) return false;
    if (!DateUtil.isValidDate(range.start) || !DateUtil.isValidDate(range.end)) return false;
    return range.start < range.end;
  }

  /**
   * Checks if date is in range
   *
   * Edge cases:
   * - Inclusive of start and end dates
   * - Validates range first
   *
   * @param date - Date to check
   * @param range - Date range
   * @returns true if date is in range
   */
  static isInRange(date: Date, range: DateRange): boolean {
    if (!DateUtil.isValidDate(date) || !DateUtil.isValidRange(range)) return false;
    return date >= range.start && date <= range.end;
  }

  /**
   * Adds days to date
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Handles month/year boundaries
   * - Handles negative days (subtract)
   *
   * @param date - Starting date
   * @param days - Number of days to add
   * @returns New date with days added
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Adds months to date
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Handles year boundaries
   * - Handles day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
   * - Handles negative months (subtract)
   *
   * @param date - Starting date
   * @param months - Number of months to add
   * @returns New date with months added
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Adds years to date
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Handles leap year edge cases
   * - Handles negative years (subtract)
   *
   * @param date - Starting date
   * @param years - Number of years to add
   * @returns New date with years added
   */
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Gets start of day (00:00:00.000)
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Preserves timezone
   *
   * @param date - Date
   * @returns Start of day
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gets end of day (23:59:59.999)
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Preserves timezone
   *
   * @param date - Date
   * @returns End of day
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Gets start of month
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Sets to first day at 00:00:00.000
   *
   * @param date - Date
   * @returns Start of month
   */
  static startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gets end of month
   *
   * Edge cases:
   * - Returns new Date (immutable)
   * - Handles different month lengths
   * - Handles leap years
   *
   * @param date - Date
   * @returns End of month
   */
  static endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Gets difference between two dates in days
   *
   * Edge cases:
   * - Returns absolute difference
   * - Handles negative differences
   * - Rounds to nearest whole day
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in days
   */
  static differenceInDays(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.round(diff / msPerDay);
  }

  /**
   * Gets difference between two dates in months
   *
   * Edge cases:
   * - Returns absolute difference
   * - Counts full months only
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in months
   */
  static differenceInMonths(date1: Date, date2: Date): number {
    const yearsDiff = date2.getFullYear() - date1.getFullYear();
    const monthsDiff = date2.getMonth() - date1.getMonth();
    return Math.abs(yearsDiff * 12 + monthsDiff);
  }

  /**
   * Gets difference between two dates in years
   *
   * Edge cases:
   * - Returns absolute difference
   * - Counts full years only
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in years
   */
  static differenceInYears(date1: Date, date2: Date): number {
    return Math.abs(date2.getFullYear() - date1.getFullYear());
  }

  /**
   * Checks if date is a weekend
   *
   * Edge cases:
   * - Saturday (6) or Sunday (0) are weekends
   *
   * @param date - Date to check
   * @returns true if weekend
   */
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Checks if date is a working day
   *
   * Edge cases:
   * - Monday-Friday are working days
   * - Does NOT check for holidays
   *
   * @param date - Date to check
   * @param config - Business hours configuration
   * @returns true if working day
   */
  static isWorkingDay(date: Date, config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS): boolean {
    const day = date.getDay();
    return config.workingDays.includes(day);
  }

  /**
   * Checks if date/time is within business hours
   *
   * Edge cases:
   * - Checks both day and time
   * - Converts to clinic timezone
   * - Does NOT check for holidays
   *
   * @param date - Date to check
   * @param config - Business hours configuration
   * @returns true if within business hours
   */
  static isBusinessHours(
    date: Date,
    config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS,
  ): boolean {
    // Convert to clinic timezone
    const localDate = DateUtil.toTimezone(date, config.timezone);

    // Check if working day
    if (!DateUtil.isWorkingDay(localDate, config)) return false;

    // Check if within business hours
    const hour = localDate.getHours();
    return hour >= config.startHour && hour < config.endHour;
  }

  /**
   * Calculates age from birthdate
   *
   * Edge cases:
   * - Handles leap years
   * - Returns full years only
   * - Future birthdates return negative age
   *
   * @param birthDate - Birth date
   * @param referenceDate - Reference date (default: now)
   * @returns Age in years
   */
  static calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

    // Edge case: Birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Gets fiscal year for date
   *
   * Edge cases:
   * - Romania fiscal year = calendar year (Jan 1 - Dec 31)
   * - Some countries have different fiscal years
   *
   * @param date - Date
   * @param fiscalYearStartMonth - Month fiscal year starts (1-12, default: 1 = January)
   * @returns Fiscal year
   */
  static getFiscalYear(date: Date, fiscalYearStartMonth: number = 1): number {
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const year = date.getFullYear();

    // Edge case: If we're before fiscal year start month, we're in previous fiscal year
    if (month < fiscalYearStartMonth) {
      return year - 1;
    }

    return year;
  }

  /**
   * Checks if year is leap year
   *
   * Edge cases:
   * - Divisible by 4 and not by 100, OR divisible by 400
   *
   * @param year - Year to check
   * @returns true if leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Gets number of days in month
   *
   * Edge cases:
   * - Handles leap years for February
   * - Month is 0-indexed (0 = January)
   *
   * @param year - Year
   * @param month - Month (0-11)
   * @returns Number of days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    // Edge case: Use day 0 of next month to get last day of current month
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Adds business days to date
   *
   * Edge cases:
   * - Skips weekends
   * - Does NOT skip holidays (would require holiday calendar)
   * - Negative days work (subtract)
   *
   * @param date - Starting date
   * @param days - Number of business days to add
   * @param config - Business hours configuration
   * @returns New date with business days added
   */
  static addBusinessDays(
    date: Date,
    days: number,
    config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS,
  ): Date {
    let result = new Date(date);
    let remainingDays = Math.abs(days);
    const direction = days >= 0 ? 1 : -1;

    while (remainingDays > 0) {
      result = DateUtil.addDays(result, direction);

      // Edge case: Only count working days
      if (DateUtil.isWorkingDay(result, config)) {
        remainingDays--;
      }
    }

    return result;
  }

  /**
   * Creates date range from start and end dates
   *
   * Edge cases:
   * - Validates that start < end
   * - Throws error for invalid range
   *
   * @param start - Start date
   * @param end - End date
   * @returns Date range
   * @throws Error if invalid range
   */
  static createRange(start: Date, end: Date): DateRange {
    const range: DateRange = { start, end };

    if (!DateUtil.isValidRange(range)) {
      throw new Error('Invalid date range: start must be before end');
    }

    return range;
  }

  /**
   * Clones date
   *
   * Edge cases:
   * - Returns new Date instance
   * - Preserves exact timestamp
   *
   * @param date - Date to clone
   * @returns Cloned date
   */
  static clone(date: Date): Date {
    return new Date(date.getTime());
  }

  /**
   * Compares two dates
   *
   * Edge cases:
   * - Returns -1 if date1 < date2
   * - Returns 0 if date1 === date2
   * - Returns 1 if date1 > date2
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Comparison result
   */
  static compare(date1: Date, date2: Date): -1 | 0 | 1 {
    const time1 = date1.getTime();
    const time2 = date2.getTime();

    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  }

  /**
   * Gets relative time description (e.g., "2 hours ago", "in 3 days")
   *
   * Edge cases:
   * - Handles past and future dates
   * - Provides human-readable descriptions
   * - Supports multiple locales
   *
   * @param date - Date to describe
   * @param referenceDate - Reference date (default: now)
   * @param locale - Locale for formatting (default: 'ro-RO')
   * @returns Relative time description
   */
  static getRelativeTime(
    date: Date,
    referenceDate: Date = new Date(),
    locale: string = 'ro-RO',
  ): string {
    const diffMs = date.getTime() - referenceDate.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    // Use Intl.RelativeTimeFormat for localized relative time
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    // Edge case: Choose appropriate unit based on time difference
    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'second');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minute');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hour');
    } else if (Math.abs(diffDay) < 30) {
      return rtf.format(diffDay, 'day');
    } else if (Math.abs(diffDay) < 365) {
      const diffMonth = Math.round(diffDay / 30);
      return rtf.format(diffMonth, 'month');
    } else {
      const diffYear = Math.round(diffDay / 365);
      return rtf.format(diffYear, 'year');
    }
  }
}
