/**
 * Formatting utilities for phone numbers, addresses, tax IDs, and other common formats
 * All functions are pure and handle edge cases gracefully
 */

/**
 * Formats a US phone number to (XXX) XXX-XXXX format
 */
export function formatPhoneUS(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return null;
}

/**
 * Formats a phone number to international format
 */
export function formatPhoneInternational(
  phone: string | null | undefined,
  countryCode: string = '+1',
): string | null {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? `${countryCode} ${digits}` : null;
}

/**
 * Formats a US Social Security Number to XXX-XX-XXXX format
 */
export function formatSSN(ssn: string | null | undefined): string | null {
  if (!ssn || typeof ssn !== 'string') return null;
  const digits = ssn.replace(/\D/g, '');
  return digits.length === 9 ? `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}` : null;
}

/**
 * Formats a US Tax ID (EIN) to XX-XXXXXXX format
 */
export function formatEIN(ein: string | null | undefined): string | null {
  if (!ein || typeof ein !== 'string') return null;
  const digits = ein.replace(/\D/g, '');
  return digits.length === 9 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : null;
}

/**
 * Formats a credit card number with spaces every 4 digits
 */
export function formatCreditCard(cardNumber: string | null | undefined): string | null {
  if (!cardNumber || typeof cardNumber !== 'string') return null;
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return null;
  return digits.match(/.{1,4}/g)?.join(' ') || null;
}

/**
 * Masks a credit card number, showing only last 4 digits
 */
export function maskCreditCard(cardNumber: string | null | undefined): string | null {
  if (!cardNumber || typeof cardNumber !== 'string') return null;
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return null;
  const lastFour = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 4) + lastFour;
  return masked.match(/.{1,4}/g)?.join(' ') || null;
}

/**
 * Formats a US ZIP code (XXXXX or XXXXX-XXXX)
 */
export function formatZipCode(zip: string | null | undefined): string | null {
  if (!zip || typeof zip !== 'string') return null;
  const digits = zip.replace(/\D/g, '');
  if (digits.length === 5) return digits;
  if (digits.length === 9) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return null;
}

/**
 * Formats a full address into a single line
 */
export function formatAddress(address: {
  street?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): string {
  if (!address || typeof address !== 'object') return '';
  const parts: string[] = [];
  if (address.street) parts.push(address.street.trim());
  if (address.street2) parts.push(address.street2.trim());

  const cityStateParts: string[] = [];
  if (address.city) cityStateParts.push(address.city.trim());
  if (address.state) cityStateParts.push(address.state.trim());
  if (cityStateParts.length > 0) parts.push(cityStateParts.join(', '));

  if (address.zip) parts.push(address.zip.trim());
  return parts.join(', ');
}

/**
 * Formats a name in "Last, First Middle" format
 */
export function formatNameLastFirst(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  middleName?: string | null,
): string {
  const parts: string[] = [];
  if (lastName) parts.push(lastName.trim());

  const firstMiddle: string[] = [];
  if (firstName) firstMiddle.push(firstName.trim());
  if (middleName) firstMiddle.push(middleName.trim());
  if (firstMiddle.length > 0) parts.push(firstMiddle.join(' '));

  return parts.join(', ');
}

/**
 * Formats a name in "First Middle Last" format
 */
export function formatNameFirstLast(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  middleName?: string | null,
): string {
  const parts: string[] = [];
  if (firstName) parts.push(firstName.trim());
  if (middleName) parts.push(middleName.trim());
  if (lastName) parts.push(lastName.trim());
  return parts.join(' ');
}

/**
 * Formats file size in human-readable format (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return null;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
