/**
 * Error Utility Functions
 *
 * Provides common error handling and formatting functions.
 */

/**
 * Extracts error message from various error types
 *
 * @param error - Error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unknown error occurred';
}

/**
 * Checks if an error is an operational error (expected) vs programmer error
 *
 * @param error - Error object
 * @returns true if error is operational
 */
export function isOperationalError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isOperational' in error) {
    return Boolean(error.isOperational);
  }
  return false;
}

/**
 * Creates a safe error object for logging (removes circular references)
 *
 * @param error - Error object
 * @returns Safe error object
 */
export function toSafeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const safeError: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Add any additional enumerable properties
    for (const key of Object.keys(error)) {
      if (!(key in safeError)) {
        safeError[key] = (error as unknown as Record<string, unknown>)[key];
      }
    }

    return safeError;
  }

  return { error: String(error) };
}
