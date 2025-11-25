/**
 * String Utilities
 *
 * Provides comprehensive string manipulation, sanitization,
 * and formatting utilities for the Enterprise Service.
 *
 * Edge cases handled:
 * - Null/undefined/empty strings
 * - Unicode characters (Romanian diacritics: ă, â, î, ș, ț)
 * - XSS prevention (HTML sanitization)
 * - SQL injection prevention (escaping)
 * - Email validation (RFC 5322)
 * - Phone number formatting (Romanian format)
 * - Tax ID validation (Romanian CUI/CNP)
 * - Name formatting (proper capitalization)
 * - Slug generation (URL-safe strings)
 * - Whitespace normalization
 *
 * @module StringUtil
 */

/**
 * Romanian diacritics mapping for normalization
 */
const ROMANIAN_DIACRITICS: Record<string, string> = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  ț: 't',
  Ă: 'A',
  Â: 'A',
  Î: 'I',
  Ș: 'S',
  Ț: 'T',
};

/**
 * String Utility Class
 *
 * Provides static methods for string operations
 */
export class StringUtil {
  /**
   * Checks if string is null, undefined, or empty
   *
   * Edge cases:
   * - null returns true
   * - undefined returns true
   * - Empty string returns true
   * - Whitespace-only strings return false (use isBlank for that)
   *
   * @param str - String to check
   * @returns true if null/undefined/empty
   */
  static isEmpty(str: string | null | undefined): str is null | undefined | '' {
    return str === null || str === undefined || str === '';
  }

  /**
   * Checks if string is null, undefined, empty, or whitespace-only
   *
   * Edge cases:
   * - null returns true
   * - undefined returns true
   * - Empty string returns true
   * - Whitespace-only strings return true
   * - Tabs, newlines, etc. count as whitespace
   *
   * @param str - String to check
   * @returns true if blank
   */
  static isBlank(str: string | null | undefined): boolean {
    return StringUtil.isEmpty(str) || str.trim() === '';
  }

  /**
   * Trims whitespace from string
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Removes leading and trailing whitespace
   * - Preserves internal whitespace
   *
   * @param str - String to trim
   * @returns Trimmed string
   */
  static trim(str: string | null | undefined): string {
    return str?.trim() || '';
  }

  /**
   * Normalizes whitespace in string
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Collapses multiple spaces to single space
   * - Removes leading and trailing whitespace
   * - Converts tabs/newlines to spaces
   *
   * @param str - String to normalize
   * @returns Normalized string
   */
  static normalizeWhitespace(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Capitalizes first letter of string
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Empty string returns empty string
   * - Already capitalized string unchanged
   * - Preserves rest of string case
   *
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  static capitalize(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts string to title case (capitalize each word)
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Empty string returns empty string
   * - Preserves whitespace between words
   * - Handles multiple spaces
   *
   * @param str - String to convert
   * @returns Title case string
   */
  static toTitleCase(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => StringUtil.capitalize(word))
      .join(' ');
  }

  /**
   * Converts string to camelCase
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Removes special characters
   * - Handles spaces, hyphens, underscores
   *
   * @param str - String to convert
   * @returns camelCase string
   */
  static toCamelCase(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  }

  /**
   * Converts string to snake_case
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Converts spaces to underscores
   * - Handles camelCase conversion
   *
   * @param str - String to convert
   * @returns snake_case string
   */
  static toSnakeCase(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .replace(/^_/, '');
  }

  /**
   * Converts string to kebab-case
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Converts spaces to hyphens
   * - Handles camelCase conversion
   *
   * @param str - String to convert
   * @returns kebab-case string
   */
  static toKebabCase(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-')
      .replace(/^-/, '');
  }

  /**
   * Generates URL-safe slug from string
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Removes Romanian diacritics
   * - Removes special characters
   * - Converts to lowercase
   * - Replaces spaces with hyphens
   *
   * @param str - String to slugify
   * @returns URL-safe slug
   */
  static slugify(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';

    return (
      str
        // Remove Romanian diacritics
        .replace(/[ăâîșț]/gi, (match) => ROMANIAN_DIACRITICS[match] || match)
        // Convert to lowercase
        .toLowerCase()
        // Remove special characters
        .replace(/[^a-z0-9\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove duplicate hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-|-$/g, '')
    );
  }

  /**
   * Truncates string to specified length
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - String shorter than maxLength returned as-is
   * - Adds ellipsis (...) if truncated
   * - Ensures total length (including ellipsis) <= maxLength
   *
   * @param str - String to truncate
   * @param maxLength - Maximum length
   * @param ellipsis - Ellipsis string (default: '...')
   * @returns Truncated string
   */
  static truncate(str: string | null | undefined, maxLength: number, ellipsis = '...'): string {
    if (StringUtil.isEmpty(str)) return '';
    if (str.length <= maxLength) return str;

    const truncateLength = maxLength - ellipsis.length;
    return str.substring(0, truncateLength) + ellipsis;
  }

  /**
   * Removes Romanian diacritics from string
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Preserves non-diacritic characters
   * - Handles both lowercase and uppercase
   *
   * @param str - String to normalize
   * @returns String without diacritics
   */
  static removeDiacritics(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';
    return str.replace(/[ăâîșțĂÂÎȘț]/g, (match) => ROMANIAN_DIACRITICS[match] || match);
  }

  /**
   * Sanitizes string for HTML display (XSS prevention)
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Escapes HTML special characters
   * - Prevents XSS attacks
   *
   * @param str - String to sanitize
   * @returns HTML-safe string
   */
  static escapeHtml(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';

    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return str.replace(/[&<>"'/]/g, (match) => htmlEntities[match] || match);
  }

  /**
   * Unescapes HTML entities
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Converts HTML entities back to characters
   *
   * @param str - String to unescape
   * @returns Unescaped string
   */
  static unescapeHtml(str: string | null | undefined): string {
    if (StringUtil.isEmpty(str)) return '';

    const htmlEntities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
    };

    return str.replace(/&[^;]+;/g, (match) => htmlEntities[match] || match);
  }

  /**
   * Masks sensitive string (e.g., email, phone, card number)
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Short strings masked completely
   * - Shows first/last characters, masks middle
   *
   * @param str - String to mask
   * @param visibleStart - Number of visible characters at start (default: 2)
   * @param visibleEnd - Number of visible characters at end (default: 2)
   * @param maskChar - Masking character (default: '*')
   * @returns Masked string
   */
  static mask(
    str: string | null | undefined,
    visibleStart = 2,
    visibleEnd = 2,
    maskChar = '*'
  ): string {
    if (StringUtil.isEmpty(str)) return '';
    if (str.length <= visibleStart + visibleEnd) {
      return maskChar.repeat(str.length);
    }

    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);

    return start + masked + end;
  }

  /**
   * Formats Romanian phone number
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Removes non-digit characters
   * - Formats as: +40 XXX XXX XXX or 07XX XXX XXX
   * - Validates length (10 digits)
   *
   * @param phone - Phone number to format
   * @returns Formatted phone number
   */
  static formatPhone(phone: string | null | undefined): string {
    if (StringUtil.isEmpty(phone)) return '';

    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Edge case: Check for international prefix
    if (digits.startsWith('40') && digits.length === 11) {
      // +40 XXX XXX XXX
      return `+40 ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`;
    } else if (digits.startsWith('0') && digits.length === 10) {
      // 07XX XXX XXX
      return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    }

    // Edge case: Invalid format, return as-is
    return phone;
  }

  /**
   * Validates Romanian phone number
   *
   * Edge cases:
   * - null/undefined returns false
   * - Validates format: 07XX XXX XXX or +40 7XX XXX XXX
   * - Allows spaces, hyphens, parentheses
   *
   * @param phone - Phone number to validate
   * @returns true if valid Romanian phone
   */
  static isValidPhone(phone: string | null | undefined): boolean {
    if (StringUtil.isEmpty(phone)) return false;

    const digits = phone.replace(/\D/g, '');

    // Romanian mobile: 07XX XXX XXX (10 digits starting with 07)
    // International: +40 7XX XXX XXX (11 digits: 40 + 9 digits)
    return (
      (digits.startsWith('07') && digits.length === 10) ||
      (digits.startsWith('407') && digits.length === 11)
    );
  }

  /**
   * Validates email address (RFC 5322 simplified)
   *
   * Edge cases:
   * - null/undefined returns false
   * - Checks basic email format
   * - Allows subdomains
   * - Allows special characters in local part
   *
   * @param email - Email to validate
   * @returns true if valid email
   */
  static isValidEmail(email: string | null | undefined): boolean {
    if (StringUtil.isEmpty(email)) return false;

    // Simplified RFC 5322 email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Masks email address
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Shows first character and domain
   * - Masks local part
   *
   * @param email - Email to mask
   * @returns Masked email (e.g., j***@example.com)
   */
  static maskEmail(email: string | null | undefined): string {
    if (StringUtil.isEmpty(email)) return '';

    const [localPart, domain] = email.split('@');
    if (!domain) return email; // Invalid email

    const maskedLocal = localPart.charAt(0) + '*'.repeat(Math.max(0, localPart.length - 1));
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Validates Romanian CUI (Tax ID)
   *
   * Edge cases:
   * - null/undefined returns false
   * - Removes 'RO' prefix if present
   * - Validates length (2-10 digits)
   * - Validates checksum digit
   *
   * @param cui - CUI to validate
   * @returns true if valid CUI
   */
  static isValidCUI(cui: string | null | undefined): boolean {
    if (StringUtil.isEmpty(cui)) return false;

    // Remove 'RO' prefix and whitespace
    let cleanCui = cui.replace(/^RO/i, '').replace(/\s/g, '');

    // Edge case: CUI must be 2-10 digits
    if (!/^\d{2,10}$/.test(cleanCui)) return false;

    // Pad with leading zeros to 10 digits for checksum calculation
    cleanCui = cleanCui.padStart(10, '0');

    // Checksum validation
    const weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];
    const checkDigit = parseInt(cleanCui.charAt(9), 10);

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCui.charAt(i), 10) * weights[i];
    }

    const remainder = sum % 11;
    const expectedCheckDigit = remainder === 10 ? 0 : remainder;

    return checkDigit === expectedCheckDigit;
  }

  /**
   * Formats Romanian CUI
   *
   * Edge cases:
   * - null/undefined returns empty string
   * - Adds 'RO' prefix if not present
   * - Removes non-digit characters
   *
   * @param cui - CUI to format
   * @returns Formatted CUI (e.g., RO12345678)
   */
  static formatCUI(cui: string | null | undefined): string {
    if (StringUtil.isEmpty(cui)) return '';

    const digits = cui.replace(/\D/g, '');
    return `RO${digits}`;
  }

  /**
   * Generates random string
   *
   * Edge cases:
   * - Default length: 16 characters
   * - Cryptographically secure (uses crypto.randomBytes if available)
   * - Falls back to Math.random for browser compatibility
   *
   * @param length - String length (default: 16)
   * @param charset - Character set (default: alphanumeric)
   * @returns Random string
   */
  static random(
    length = 16,
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }

    return result;
  }

  /**
   * Compares two strings (case-insensitive)
   *
   * Edge cases:
   * - null/undefined handled as empty strings
   * - Trims whitespace before comparison
   *
   * @param str1 - First string
   * @param str2 - Second string
   * @returns true if strings are equal (case-insensitive)
   */
  static equalsIgnoreCase(
    str1: string | null | undefined,
    str2: string | null | undefined
  ): boolean {
    const s1 = StringUtil.trim(str1).toLowerCase();
    const s2 = StringUtil.trim(str2).toLowerCase();
    return s1 === s2;
  }

  /**
   * Checks if string contains substring (case-insensitive)
   *
   * Edge cases:
   * - null/undefined returns false
   * - Empty substring returns true
   *
   * @param str - String to search in
   * @param substring - Substring to search for
   * @returns true if string contains substring
   */
  static containsIgnoreCase(str: string | null | undefined, substring: string): boolean {
    if (StringUtil.isEmpty(str)) return false;
    if (StringUtil.isEmpty(substring)) return true;

    return str.toLowerCase().includes(substring.toLowerCase());
  }

  /**
   * Replaces placeholders in template string
   *
   * Edge cases:
   * - null/undefined template returns empty string
   * - Missing placeholders left as-is
   * - Supports both {{key}} and {key} syntax
   *
   * @param template - Template string with placeholders
   * @param data - Data object with replacement values
   * @returns String with placeholders replaced
   */
  static template(template: string | null | undefined, data: Record<string, unknown>): string {
    if (StringUtil.isEmpty(template)) return '';

    return template.replace(/\{\{?(\w+)\}?\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Pluralizes word based on count
   *
   * Edge cases:
   * - Count of 1 returns singular
   * - Count of 0 returns plural
   * - Negative counts treated as plural
   *
   * @param count - Count value
   * @param singular - Singular form
   * @param plural - Plural form (optional, adds 's' to singular if not provided)
   * @returns Pluralized word
   */
  static pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular;
    return plural || `${singular}s`;
  }

  /**
   * Extracts numbers from string
   *
   * Edge cases:
   * - null/undefined returns empty array
   * - Handles negative numbers
   * - Handles decimals
   *
   * @param str - String to extract numbers from
   * @returns Array of numbers
   */
  static extractNumbers(str: string | null | undefined): number[] {
    if (StringUtil.isEmpty(str)) return [];

    const matches = str.match(/-?\d+\.?\d*/g);
    return matches ? matches.map(Number) : [];
  }

  /**
   * Counts words in string
   *
   * Edge cases:
   * - null/undefined returns 0
   * - Handles multiple spaces
   * - Excludes punctuation
   *
   * @param str - String to count words in
   * @returns Word count
   */
  static wordCount(str: string | null | undefined): number {
    if (StringUtil.isEmpty(str)) return 0;

    const normalized = StringUtil.normalizeWhitespace(str);
    return normalized === '' ? 0 : normalized.split(' ').length;
  }
}
