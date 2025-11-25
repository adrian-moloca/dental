/**
 * Zod error formatting utilities
 * @module shared-validation/utils/error-formatter
 */

import { ZodError, ZodIssue } from 'zod';

// ============================================================================
// Types
// ============================================================================

/**
 * Field-level error information
 */
export interface FieldError {
  /** Field path (e.g., "profile.email") */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Formatted error response
 */
export interface FormattedError {
  /** Overall error message */
  message: string;
  /** Field-specific errors */
  fields: FieldError[];
  /** Total error count */
  count: number;
  /** Timestamp when error was formatted */
  timestamp: string;
}

// ============================================================================
// Error Formatting Functions
// ============================================================================

/**
 * Format a Zod error into a structured error response
 *
 * @param error - ZodError to format
 * @param defaultMessage - Default message if no specific message available
 * @returns Formatted error object
 *
 * @example
 * ```typescript
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     const formatted = formatZodError(error);
 *     return res.status(400).json(formatted);
 *   }
 * }
 * ```
 */
export function formatZodError(error: ZodError, defaultMessage = 'Validation failed'): FormattedError {
  const fields = error.issues.map(issueToFieldError);

  return {
    message: fields.length > 0 ? `Validation failed: ${fields.length} error(s)` : defaultMessage,
    fields,
    count: fields.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert a Zod issue to a field error
 *
 * @param issue - ZodIssue to convert
 * @returns FieldError object
 */
function issueToFieldError(issue: ZodIssue): FieldError {
  const field = issue.path.join('.');

  return {
    field: field || 'root',
    message: issue.message,
    code: issue.code,
    context: {
      ...issue,
      path: issue.path,
    },
  };
}

/**
 * Get field-level errors as a map
 * Useful for form validation feedback
 *
 * @param error - ZodError to process
 * @returns Record mapping field paths to error messages
 *
 * @example
 * ```typescript
 * const fieldErrors = getFieldErrors(error);
 * // { "email": ["Invalid email"], "password": ["Too short"] }
 * ```
 */
export function getFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'root';

    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }

    fieldErrors[field].push(issue.message);
  }

  return fieldErrors;
}

/**
 * Get a single error message from the first error
 * Useful when you only want to display one error at a time
 *
 * @param error - ZodError to process
 * @param defaultMessage - Default message if no errors found
 * @returns First error message
 *
 * @example
 * ```typescript
 * const errorMessage = getSingleErrorMessage(error);
 * // "Email is invalid"
 * ```
 */
export function getSingleErrorMessage(error: ZodError, defaultMessage = 'Validation error'): string {
  if (error.issues.length === 0) {
    return defaultMessage;
  }

  const firstIssue = error.issues[0];
  const field = firstIssue.path.join('.');

  return field ? `${field}: ${firstIssue.message}` : firstIssue.message;
}

/**
 * Get all error messages as a flat array
 *
 * @param error - ZodError to process
 * @returns Array of error messages
 *
 * @example
 * ```typescript
 * const messages = getAllErrorMessages(error);
 * // ["Email is invalid", "Password is too short"]
 * ```
 */
export function getAllErrorMessages(error: ZodError): string[] {
  return error.issues.map((issue): string => {
    const field = issue.path.join('.');
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}

/**
 * Check if error contains a specific field error
 *
 * @param error - ZodError to check
 * @param fieldPath - Field path to check (e.g., "profile.email")
 * @returns True if error exists for the field
 *
 * @example
 * ```typescript
 * if (hasFieldError(error, 'email')) {
 *   // Handle email error
 * }
 * ```
 */
export function hasFieldError(error: ZodError, fieldPath: string): boolean {
  return error.issues.some((issue): boolean => issue.path.join('.') === fieldPath);
}

/**
 * Get errors for a specific field
 *
 * @param error - ZodError to process
 * @param fieldPath - Field path to get errors for
 * @returns Array of error messages for the field
 *
 * @example
 * ```typescript
 * const emailErrors = getFieldErrorMessages(error, 'email');
 * // ["Email is invalid", "Email is required"]
 * ```
 */
export function getFieldErrorMessages(error: ZodError, fieldPath: string): string[] {
  return error.issues
    .filter((issue): boolean => issue.path.join('.') === fieldPath)
    .map((issue): string => issue.message);
}

/**
 * Format error for API response
 * Returns a standardized error response object
 *
 * @param error - ZodError to format
 * @param statusCode - HTTP status code (default 400)
 * @returns API error response object
 *
 * @example
 * ```typescript
 * return res.status(400).json(formatApiError(error));
 * ```
 */
export function formatApiError(error: ZodError, statusCode = 400): {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details: FormattedError;
  };
} {
  const formatted = formatZodError(error);

  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: formatted.message,
      statusCode,
      details: formatted,
    },
  };
}

/**
 * Create a user-friendly error message from Zod error
 * Combines multiple errors into a readable sentence
 *
 * @param error - ZodError to process
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * const message = createUserFriendlyMessage(error);
 * // "Please fix the following: email is invalid, password is too short"
 * ```
 */
export function createUserFriendlyMessage(error: ZodError): string {
  const messages = getAllErrorMessages(error);

  if (messages.length === 0) {
    return 'Validation error occurred';
  }

  if (messages.length === 1) {
    return messages[0];
  }

  return `Please fix the following: ${messages.join(', ')}`;
}
