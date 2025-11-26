import { z } from 'zod';

/**
 * Romanian Address Validation
 *
 * Romanian addresses follow this structure:
 * - Județul (County) - 41 counties + București
 * - Localitatea (City/Town/Village)
 * - Strada (Street)
 * - Număr (Number)
 * - Bloc/Scară/Etaj/Apartament (for apartments)
 * - Cod Poștal (Postal Code) - 6 digits
 */

/**
 * Romanian counties (Județe) with codes
 */
export const ROMANIAN_COUNTIES = {
  AB: 'Alba',
  AR: 'Arad',
  AG: 'Argeș',
  BC: 'Bacău',
  BH: 'Bihor',
  BN: 'Bistrița-Năsăud',
  BT: 'Botoșani',
  BV: 'Brașov',
  BR: 'Brăila',
  BZ: 'Buzău',
  CS: 'Caraș-Severin',
  CL: 'Călărași',
  CJ: 'Cluj',
  CT: 'Constanța',
  CV: 'Covasna',
  DB: 'Dâmbovița',
  DJ: 'Dolj',
  GL: 'Galați',
  GR: 'Giurgiu',
  GJ: 'Gorj',
  HR: 'Harghita',
  HD: 'Hunedoara',
  IL: 'Ialomița',
  IS: 'Iași',
  IF: 'Ilfov',
  MM: 'Maramureș',
  MH: 'Mehedinți',
  MS: 'Mureș',
  NT: 'Neamț',
  OT: 'Olt',
  PH: 'Prahova',
  SM: 'Satu Mare',
  SJ: 'Sălaj',
  SB: 'Sibiu',
  SV: 'Suceava',
  TR: 'Teleorman',
  TM: 'Timiș',
  TL: 'Tulcea',
  VS: 'Vaslui',
  VL: 'Vâlcea',
  VN: 'Vrancea',
  B: 'București',
} as const;

export type RomanianCountyCode = keyof typeof ROMANIAN_COUNTIES;

/**
 * Get all county codes as array
 */
export function getRomanianCountyCodes(): RomanianCountyCode[] {
  return Object.keys(ROMANIAN_COUNTIES) as RomanianCountyCode[];
}

/**
 * Get county name by code
 */
export function getRomanianCountyByCode(code: string): string | null {
  return ROMANIAN_COUNTIES[code as RomanianCountyCode] || null;
}

/**
 * Validate Romanian postal code (6 digits, specific ranges per county)
 */
export function validateRomanianPostalCode(postalCode: string): boolean {
  // Must be 6 digits
  if (!/^\d{6}$/.test(postalCode)) {
    return false;
  }

  const firstDigit = parseInt(postalCode[0], 10);

  // Valid Romanian postal codes start with 0-9
  // Range: 010000-999999 (theoretical)
  // In practice, ranges vary by county but all 6-digit codes are considered valid format
  return firstDigit >= 0 && firstDigit <= 9;
}

/**
 * Postal code ranges by county (first 2 digits)
 * This is approximate - actual ranges can overlap
 */
export const POSTAL_CODE_PREFIXES: Record<string, string[]> = {
  B: ['01', '02', '03', '04', '05', '06'], // București
  AB: ['51'],
  AR: ['31'],
  AG: ['11'],
  BC: ['60'],
  BH: ['41'],
  BN: ['42'],
  BT: ['71'],
  BV: ['50'],
  BR: ['81'],
  BZ: ['12'],
  CS: ['32'],
  CL: ['91'],
  CJ: ['40'],
  CT: ['90'],
  CV: ['52'],
  DB: ['13'],
  DJ: ['20'],
  GL: ['80'],
  GR: ['08'],
  GJ: ['21'],
  HR: ['53'],
  HD: ['33'],
  IL: ['92'],
  IS: ['70'],
  IF: ['07'],
  MM: ['43'],
  MH: ['22'],
  MS: ['54'],
  NT: ['61'],
  OT: ['23'],
  PH: ['10'],
  SM: ['44'],
  SJ: ['45'],
  SB: ['55'],
  SV: ['72'],
  TR: ['14'],
  TM: ['30'],
  TL: ['82'],
  VS: ['73'],
  VL: ['24'],
  VN: ['62'],
};

/**
 * Romanian address schema
 */
export const RomanianAddressSchema = z.object({
  /**
   * County code (e.g., "CJ" for Cluj)
   */
  countyCode: z.enum(getRomanianCountyCodes() as [string, ...string[]]),

  /**
   * County name (auto-populated from code)
   */
  countyName: z.string().optional(),

  /**
   * City/Town/Village name
   */
  locality: z.string().min(1).max(100),

  /**
   * Street name
   */
  street: z.string().min(1).max(200),

  /**
   * Street number
   */
  number: z.string().min(1).max(20),

  /**
   * Building/Block (for apartments)
   */
  building: z.string().max(20).optional(),

  /**
   * Staircase (Scară)
   */
  staircase: z.string().max(10).optional(),

  /**
   * Floor (Etaj)
   */
  floor: z.string().max(10).optional(),

  /**
   * Apartment number
   */
  apartment: z.string().max(20).optional(),

  /**
   * Postal code (6 digits)
   */
  postalCode: z.string().refine(validateRomanianPostalCode, {
    message: 'Postal code must be 6 digits',
  }),

  /**
   * Additional details (intercom code, delivery instructions)
   */
  additionalInfo: z.string().max(500).optional(),
});

export type RomanianAddress = z.infer<typeof RomanianAddressSchema>;

/**
 * Simplified Romanian address schema (for forms)
 */
export const SimpleRomanianAddressSchema = z.object({
  countyCode: z.enum(getRomanianCountyCodes() as [string, ...string[]]),
  locality: z.string().min(1).max(100),
  street: z.string().min(1).max(200),
  number: z.string().min(1).max(20),
  postalCode: z.string().refine(validateRomanianPostalCode, {
    message: 'Postal code must be 6 digits',
  }),
});

export type SimpleRomanianAddress = z.infer<typeof SimpleRomanianAddressSchema>;

/**
 * Format Romanian address for display
 */
export function formatRomanianAddress(address: RomanianAddress): string {
  const parts: string[] = [];

  // Street line
  let streetLine = `Str. ${address.street} Nr. ${address.number}`;
  if (address.building) streetLine += `, Bl. ${address.building}`;
  if (address.staircase) streetLine += `, Sc. ${address.staircase}`;
  if (address.floor) streetLine += `, Et. ${address.floor}`;
  if (address.apartment) streetLine += `, Ap. ${address.apartment}`;
  parts.push(streetLine);

  // Locality and county
  const countyName = address.countyName || getRomanianCountyByCode(address.countyCode);
  parts.push(`${address.locality}, ${countyName}`);

  // Postal code
  parts.push(address.postalCode);

  // Country
  parts.push('România');

  return parts.join('\n');
}

/**
 * Format Romanian address as single line
 */
export function formatRomanianAddressSingleLine(address: RomanianAddress): string {
  const countyName = address.countyName || getRomanianCountyByCode(address.countyCode);

  let result = `Str. ${address.street} Nr. ${address.number}`;
  if (address.building) result += `, Bl. ${address.building}`;
  if (address.apartment) result += `, Ap. ${address.apartment}`;
  result += `, ${address.locality}, ${countyName}, ${address.postalCode}`;

  return result;
}

/**
 * Romanian phone number validation
 * Formats: +40XXXXXXXXX, 0XXXXXXXXX
 */
export const RomanianPhoneSchema = z.string().refine(
  (val) => {
    // Remove spaces, dashes, dots
    const clean = val.replace(/[\s\-\.]/g, '');

    // Romanian mobile: +40 7XX XXX XXX or 07XX XXX XXX
    // Romanian landline: +40 2X XXX XXXX or 02X XXX XXXX (varies by region)
    const mobilePattern = /^(\+40|0040|0)?7[0-9]{8}$/;
    const landlinePattern = /^(\+40|0040|0)?[2-3][0-9]{8}$/;

    return mobilePattern.test(clean) || landlinePattern.test(clean);
  },
  { message: 'Invalid Romanian phone number' },
);

/**
 * Normalize Romanian phone number to international format
 */
export function normalizeRomanianPhone(phone: string): string {
  const clean = phone.replace(/[\s\-\.]/g, '');

  if (clean.startsWith('+40')) {
    return clean;
  }

  if (clean.startsWith('0040')) {
    return '+40' + clean.substring(4);
  }

  if (clean.startsWith('0')) {
    return '+40' + clean.substring(1);
  }

  return '+40' + clean;
}

/**
 * Romanian CUI/CIF validation (Company Tax ID)
 * Format: RO followed by 2-10 digits, or just 2-10 digits
 */
export function validateRomanianCui(cui: string): boolean {
  // Remove RO prefix if present
  const cleanCui = cui.toUpperCase().replace(/^RO/, '').trim();

  // Must be 2-10 digits
  if (!/^\d{2,10}$/.test(cleanCui)) {
    return false;
  }

  // Checksum validation
  const weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];
  const digits = cleanCui.padStart(10, '0').split('').map(Number);

  // Last digit is control
  const controlDigit = digits.pop()!;

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  const remainder = (sum * 10) % 11;
  const expectedControl = remainder === 10 ? 0 : remainder;

  return controlDigit === expectedControl;
}

export const RomanianCuiSchema = z.string().refine(validateRomanianCui, {
  message: 'Invalid Romanian CUI/CIF',
});

/**
 * Romanian IBAN validation
 * Format: RO + 2 check digits + 4 letter bank code + 16 alphanumeric account number
 */
export function validateRomanianIban(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();

  // Romanian IBAN is exactly 24 characters
  if (cleanIban.length !== 24) {
    return false;
  }

  // Must start with RO
  if (!cleanIban.startsWith('RO')) {
    return false;
  }

  // Format: RO + 2 digits + 4 letters + 16 alphanumeric
  if (!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(cleanIban)) {
    return false;
  }

  // IBAN checksum validation (mod 97)
  // Move first 4 chars to end and convert letters to numbers
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);

  let numericIban = '';
  for (const char of rearranged) {
    if (/[A-Z]/.test(char)) {
      // A=10, B=11, ..., Z=35
      numericIban += (char.charCodeAt(0) - 55).toString();
    } else {
      numericIban += char;
    }
  }

  // Calculate mod 97 using string arithmetic (number too large for JS)
  let remainder = 0;
  for (const digit of numericIban) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }

  return remainder === 1;
}

export const RomanianIbanSchema = z.string().refine(validateRomanianIban, {
  message: 'Invalid Romanian IBAN',
});

/**
 * Format IBAN for display (groups of 4)
 */
export function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}
