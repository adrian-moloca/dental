/**
 * Validation utility functions for common data types
 * All functions are pure and handle edge cases gracefully
 */

/**
 * Validates an email address using RFC 5322 compliant regex
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a US phone number (10 or 11 digits)
 */
export function isValidPhoneUS(phone: string | null | undefined): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
}

/**
 * Validates a US Social Security Number
 */
export function isValidSSN(ssn: string | null | undefined): boolean {
  if (!ssn || typeof ssn !== 'string') return false;
  const digits = ssn.replace(/\D/g, '');
  if (digits.length !== 9) return false;

  const invalidPatterns = ['000000000', '111111111', '222222222', '333333333',
    '444444444', '555555555', '666666666', '777777777', '888888888', '999999999'];
  if (invalidPatterns.includes(digits)) return false;

  const area = parseInt(digits.slice(0, 3), 10);
  if (area === 0 || area === 666 || area >= 900) return false;

  const group = parseInt(digits.slice(3, 5), 10);
  if (group === 0) return false;

  const serial = parseInt(digits.slice(5), 10);
  return serial !== 0;
}

/**
 * Validates a US Tax ID (EIN)
 */
export function isValidEIN(ein: string | null | undefined): boolean {
  if (!ein || typeof ein !== 'string') return false;
  const digits = ein.replace(/\D/g, '');
  if (digits.length !== 9) return false;
  const prefix = parseInt(digits.slice(0, 2), 10);
  return prefix > 0 && prefix <= 99;
}

/**
 * Validates a US ZIP code (5 or 9 digits)
 */
export function isValidZipCode(zip: string | null | undefined): boolean {
  if (!zip || typeof zip !== 'string') return false;
  const digits = zip.replace(/\D/g, '');
  return digits.length === 5 || digits.length === 9;
}

/**
 * Validates a credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string | null | undefined): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates a string meets length requirements
 */
export function isValidLength(
  value: string | null | undefined,
  minLength: number = 1,
  maxLength: number = Infinity,
): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validates a password meets complexity requirements
 */
export function isValidPassword(
  password: string | null | undefined,
  minLength: number = 8,
  requireUppercase: boolean = true,
  requireLowercase: boolean = true,
  requireNumber: boolean = true,
  requireSpecial: boolean = true,
): boolean {
  if (!password || typeof password !== 'string' || password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumber && !/\d/.test(password)) return false;
  if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
}

/**
 * Validates a date string is in ISO 8601 format
 */
export function isValidISODate(dateString: string | null | undefined): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoDateRegex.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates a hex color code (#RGB or #RRGGBB)
 */
export function isValidHexColor(color: string | null | undefined): boolean {
  if (!color || typeof color !== 'string') return false;
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

/**
 * Validates a UUID (v1-v5)
 */
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
