/**
 * Validation Utilities
 *
 * Provides reusable validation functions for the Enterprise Service.
 *
 * Edge cases handled:
 * - Null/undefined values
 * - Empty strings and arrays
 * - Invalid data types
 * - Range validations
 * - Format validations
 * - Business rule validations
 *
 * @module ValidationUtil
 */

import { StringUtil } from './string.util';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation rule interface
 */
export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: unknown) => boolean;
  message: string;
}

/**
 * Validation Utility Class
 *
 * Provides static methods for validation operations
 */
export class ValidationUtil {
  /**
   * Validates that value is not null/undefined
   *
   * Edge cases:
   * - null returns false
   * - undefined returns false
   * - 0, false, empty string return true (they are defined values)
   *
   * @param value - Value to validate
   * @returns true if defined
   */
  static isDefined(value: unknown): boolean {
    return value !== null && value !== undefined;
  }

  /**
   * Validates that value is not null/undefined/empty
   *
   * Edge cases:
   * - null returns false
   * - undefined returns false
   * - Empty string returns false
   * - Empty array returns false
   * - Empty object returns false
   * - 0, false return true (they are defined values)
   *
   * @param value - Value to validate
   * @returns true if not empty
   */
  static isNotEmpty(value: unknown): boolean {
    if (!ValidationUtil.isDefined(value)) return false;

    if (typeof value === 'string') {
      return !StringUtil.isBlank(value);
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value !== null && typeof value === 'object') {
      return Object.keys(value).length > 0;
    }

    return true;
  }

  /**
   * Validates that value is a string
   *
   * Edge cases:
   * - null/undefined returns false
   * - Numbers return false
   * - Empty string returns true
   *
   * @param value - Value to validate
   * @returns true if string
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /**
   * Validates that value is a number
   *
   * Edge cases:
   * - null/undefined returns false
   * - NaN returns false
   * - Infinity returns false
   * - Number strings return false (use isNumeric for that)
   *
   * @param value - Value to validate
   * @returns true if number
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Validates that value is numeric (number or numeric string)
   *
   * Edge cases:
   * - null/undefined returns false
   * - Empty string returns false
   * - "123" returns true
   * - "123.45" returns true
   * - "-123" returns true
   *
   * @param value - Value to validate
   * @returns true if numeric
   */
  static isNumeric(value: unknown): boolean {
    if (ValidationUtil.isNumber(value)) return true;
    if (!ValidationUtil.isString(value)) return false;
    if (StringUtil.isBlank(value)) return false;

    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  /**
   * Validates that value is a boolean
   *
   * Edge cases:
   * - null/undefined returns false
   * - "true"/"false" strings return false (use isBoolean for conversion)
   *
   * @param value - Value to validate
   * @returns true if boolean
   */
  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  /**
   * Validates that value is an array
   *
   * Edge cases:
   * - null/undefined returns false
   * - Empty array returns true
   *
   * @param value - Value to validate
   * @returns true if array
   */
  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Validates that value is an object
   *
   * Edge cases:
   * - null returns false (typeof null === 'object' in JS)
   * - undefined returns false
   * - Arrays return false (use isArray for arrays)
   * - Empty object returns true
   *
   * @param value - Value to validate
   * @returns true if object
   */
  static isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Validates that value is a Date
   *
   * Edge cases:
   * - null/undefined returns false
   * - Invalid dates return false
   * - Date strings return false (use isValidDateString for that)
   *
   * @param value - Value to validate
   * @returns true if Date
   */
  static isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Validates that number is in range
   *
   * Edge cases:
   * - Inclusive of min and max
   * - null/undefined returns false
   * - Non-numbers return false
   *
   * @param value - Value to validate
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns true if in range
   */
  static isInRange(value: unknown, min: number, max: number): boolean {
    if (!ValidationUtil.isNumber(value)) return false;
    return value >= min && value <= max;
  }

  /**
   * Validates that number is positive
   *
   * Edge cases:
   * - 0 returns false
   * - Negative numbers return false
   * - null/undefined returns false
   *
   * @param value - Value to validate
   * @returns true if positive
   */
  static isPositive(value: unknown): boolean {
    return ValidationUtil.isNumber(value) && value > 0;
  }

  /**
   * Validates that number is non-negative
   *
   * Edge cases:
   * - 0 returns true
   * - Negative numbers return false
   * - null/undefined returns false
   *
   * @param value - Value to validate
   * @returns true if non-negative
   */
  static isNonNegative(value: unknown): boolean {
    return ValidationUtil.isNumber(value) && value >= 0;
  }

  /**
   * Validates that number is an integer
   *
   * Edge cases:
   * - null/undefined returns false
   * - Decimals return false
   * - Negative integers return true
   *
   * @param value - Value to validate
   * @returns true if integer
   */
  static isInteger(value: unknown): boolean {
    return ValidationUtil.isNumber(value) && Number.isInteger(value);
  }

  /**
   * Validates string length
   *
   * Edge cases:
   * - null/undefined returns false
   * - Empty string has length 0
   * - min defaults to 0
   * - max defaults to Infinity
   *
   * @param value - Value to validate
   * @param min - Minimum length (inclusive, default: 0)
   * @param max - Maximum length (inclusive, default: Infinity)
   * @returns true if length is valid
   */
  static hasValidLength(value: unknown, min = 0, max = Infinity): boolean {
    if (!ValidationUtil.isString(value)) return false;
    return value.length >= min && value.length <= max;
  }

  /**
   * Validates array length
   *
   * Edge cases:
   * - null/undefined returns false
   * - Empty array has length 0
   * - min defaults to 0
   * - max defaults to Infinity
   *
   * @param value - Value to validate
   * @param min - Minimum length (inclusive, default: 0)
   * @param max - Maximum length (inclusive, default: Infinity)
   * @returns true if length is valid
   */
  static hasValidArrayLength(value: unknown, min = 0, max = Infinity): boolean {
    if (!ValidationUtil.isArray(value)) return false;
    return value.length >= min && value.length <= max;
  }

  /**
   * Validates email format
   *
   * @param value - Value to validate
   * @returns true if valid email
   */
  static isEmail(value: unknown): boolean {
    if (!ValidationUtil.isString(value)) return false;
    return StringUtil.isValidEmail(value);
  }

  /**
   * Validates Romanian phone number
   *
   * @param value - Value to validate
   * @returns true if valid phone
   */
  static isPhone(value: unknown): boolean {
    if (!ValidationUtil.isString(value)) return false;
    return StringUtil.isValidPhone(value);
  }

  /**
   * Validates Romanian CUI (Tax ID)
   *
   * @param value - Value to validate
   * @returns true if valid CUI
   */
  static isCUI(value: unknown): boolean {
    if (!ValidationUtil.isString(value)) return false;
    return StringUtil.isValidCUI(value);
  }

  /**
   * Validates URL format
   *
   * Edge cases:
   * - null/undefined returns false
   * - Validates protocol (http/https)
   * - Validates domain format
   *
   * @param value - Value to validate
   * @returns true if valid URL
   */
  static isURL(value: unknown): boolean {
    if (!ValidationUtil.isString(value)) return false;

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validates UUID format
   *
   * Edge cases:
   * - null/undefined returns false
   * - Validates v4 UUID format
   *
   * @param value - Value to validate
   * @returns true if valid UUID
   */
  static isUUID(value: unknown): boolean {
    if (!ValidationUtil.isString(value)) return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Validates MongoDB ObjectId format
   *
   * Edge cases:
   * - null/undefined returns false
   * - Validates 24-character hex string
   *
   * @param value - Value to validate
   * @returns true if valid ObjectId
   */
  static isObjectId(value: unknown): boolean {
    if (!ValidationUtil.isString(value)) return false;

    const objectIdRegex = /^[0-9a-f]{24}$/i;
    return objectIdRegex.test(value);
  }

  /**
   * Validates that value matches regex pattern
   *
   * Edge cases:
   * - null/undefined returns false
   * - Non-strings return false
   *
   * @param value - Value to validate
   * @param pattern - Regex pattern
   * @returns true if matches pattern
   */
  static matchesPattern(value: unknown, pattern: RegExp): boolean {
    if (!ValidationUtil.isString(value)) return false;
    return pattern.test(value);
  }

  /**
   * Validates that value is in enum
   *
   * Edge cases:
   * - null/undefined returns false
   * - Case-sensitive comparison
   *
   * @param value - Value to validate
   * @param enumValues - Array of valid enum values
   * @returns true if in enum
   */
  static isInEnum<T>(value: unknown, enumValues: T[]): value is T {
    return enumValues.includes(value as T);
  }

  /**
   * Validates object against rules
   *
   * Edge cases:
   * - null/undefined object returns invalid with error
   * - Collects all validation errors
   * - Returns all errors, not just first one
   *
   * @param obj - Object to validate
   * @param rules - Validation rules
   * @returns Validation result with errors
   */
  static validateObject<T extends Record<string, unknown>>(
    obj: T | null | undefined,
    rules: ValidationRule<T>[],
  ): ValidationResult {
    const errors: string[] = [];

    if (!ValidationUtil.isDefined(obj) || !ValidationUtil.isObject(obj)) {
      return {
        isValid: false,
        errors: ['Object is required'],
      };
    }

    for (const rule of rules) {
      const value = obj[rule.field];
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Creates required field validator
   *
   * @param fieldName - Field name for error message
   * @returns Validation rule
   */
  static required<T>(fieldName: keyof T): ValidationRule<T> {
    return {
      field: fieldName,
      validate: ValidationUtil.isNotEmpty,
      message: `${String(fieldName)} is required`,
    };
  }

  /**
   * Creates email validator
   *
   * @param fieldName - Field name for error message
   * @returns Validation rule
   */
  static email<T>(fieldName: keyof T): ValidationRule<T> {
    return {
      field: fieldName,
      validate: ValidationUtil.isEmail,
      message: `${String(fieldName)} must be a valid email`,
    };
  }

  /**
   * Creates phone validator
   *
   * @param fieldName - Field name for error message
   * @returns Validation rule
   */
  static phone<T>(fieldName: keyof T): ValidationRule<T> {
    return {
      field: fieldName,
      validate: ValidationUtil.isPhone,
      message: `${String(fieldName)} must be a valid phone number`,
    };
  }

  /**
   * Creates min length validator
   *
   * @param fieldName - Field name for error message
   * @param min - Minimum length
   * @returns Validation rule
   */
  static minLength<T>(fieldName: keyof T, min: number): ValidationRule<T> {
    return {
      field: fieldName,
      validate: (value) => ValidationUtil.hasValidLength(value, min),
      message: `${String(fieldName)} must be at least ${min} characters`,
    };
  }

  /**
   * Creates max length validator
   *
   * @param fieldName - Field name for error message
   * @param max - Maximum length
   * @returns Validation rule
   */
  static maxLength<T>(fieldName: keyof T, max: number): ValidationRule<T> {
    return {
      field: fieldName,
      validate: (value) => ValidationUtil.hasValidLength(value, 0, max),
      message: `${String(fieldName)} must be at most ${max} characters`,
    };
  }

  /**
   * Creates range validator
   *
   * @param fieldName - Field name for error message
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Validation rule
   */
  static range<T>(fieldName: keyof T, min: number, max: number): ValidationRule<T> {
    return {
      field: fieldName,
      validate: (value) => ValidationUtil.isInRange(value, min, max),
      message: `${String(fieldName)} must be between ${min} and ${max}`,
    };
  }

  /**
   * Creates positive number validator
   *
   * @param fieldName - Field name for error message
   * @returns Validation rule
   */
  static positive<T>(fieldName: keyof T): ValidationRule<T> {
    return {
      field: fieldName,
      validate: ValidationUtil.isPositive,
      message: `${String(fieldName)} must be a positive number`,
    };
  }

  /**
   * Sanitizes and validates input
   *
   * Edge cases:
   * - Trims strings
   * - Converts numeric strings to numbers
   * - Validates after sanitization
   *
   * @param value - Value to sanitize and validate
   * @param type - Expected type
   * @returns Sanitized and validated value or null
   */
  static sanitizeAndValidate(
    value: unknown,
    type: 'string' | 'number' | 'boolean' | 'email' | 'phone',
  ): unknown {
    if (!ValidationUtil.isDefined(value)) return null;

    switch (type) {
      case 'string':
        if (!ValidationUtil.isString(value)) return null;
        return StringUtil.trim(value);

      case 'number':
        if (ValidationUtil.isNumber(value)) return value;
        if (ValidationUtil.isNumeric(value)) return Number(value);
        return null;

      case 'boolean':
        if (ValidationUtil.isBoolean(value)) return value;
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;

      case 'email':
        if (!ValidationUtil.isString(value)) return null;
        const email = StringUtil.trim(value).toLowerCase();
        return ValidationUtil.isEmail(email) ? email : null;

      case 'phone':
        if (!ValidationUtil.isString(value)) return null;
        const phone = StringUtil.trim(value);
        return ValidationUtil.isPhone(phone) ? phone : null;

      default:
        return null;
    }
  }
}
