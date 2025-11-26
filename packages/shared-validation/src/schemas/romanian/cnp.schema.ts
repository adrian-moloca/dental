import { z } from 'zod';

/**
 * Romanian CNP (Cod Numeric Personal) Validation
 *
 * CNP is the unique 13-digit personal identification number for Romanian citizens.
 *
 * Format: SAALLZZJJNNNC
 * - S (1 digit): Sex and century of birth
 *   1/2 = Male/Female born 1900-1999
 *   3/4 = Male/Female born 1800-1899
 *   5/6 = Male/Female born 2000-2099
 *   7/8 = Male/Female resident (not citizen)
 *   9 = Foreign citizen
 * - AA (2 digits): Last two digits of birth year
 * - LL (2 digits): Birth month (01-12)
 * - ZZ (2 digits): Birth day (01-31)
 * - JJ (2 digits): County code (01-52 + 51, 52 for Bucharest sectors)
 * - NNN (3 digits): Unique number for people born in same county on same day
 * - C (1 digit): Control digit (checksum)
 *
 * Control digit calculation:
 * Multiply each of the first 12 digits by constants: 2,7,9,1,4,6,3,5,8,2,7,9
 * Sum the products, divide by 11
 * If remainder is 10, control digit is 1, otherwise it's the remainder
 */

const CNP_CONTROL_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

/**
 * Romanian county codes (Județe)
 * 01-40 = Counties, 41-46 = Bucharest sectors, 51-52 = Bucharest
 */
const VALID_COUNTY_CODES = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
  '41', '42', '43', '44', '45', '46', // Bucharest sectors
  '51', '52', // Bucharest (legacy codes)
];

/**
 * Calculate CNP control digit
 */
export function calculateCnpControlDigit(cnp12: string): number {
  if (cnp12.length !== 12) {
    throw new Error('CNP must have exactly 12 digits for control calculation');
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp12[i], 10) * CNP_CONTROL_WEIGHTS[i];
  }

  const remainder = sum % 11;
  return remainder === 10 ? 1 : remainder;
}

/**
 * Validate CNP checksum
 */
export function validateCnpChecksum(cnp: string): boolean {
  if (cnp.length !== 13) return false;

  const expectedControl = calculateCnpControlDigit(cnp.substring(0, 12));
  const actualControl = parseInt(cnp[12], 10);

  return expectedControl === actualControl;
}

/**
 * Extract birth date from CNP
 * Returns null if invalid
 */
export function extractBirthDateFromCnp(cnp: string): Date | null {
  if (cnp.length !== 13) return null;

  const sexCentury = parseInt(cnp[0], 10);
  const yearPart = cnp.substring(1, 3);
  const month = parseInt(cnp.substring(3, 5), 10);
  const day = parseInt(cnp.substring(5, 7), 10);

  // Determine century based on sex digit
  let century: number;
  switch (sexCentury) {
    case 1:
    case 2:
      century = 1900;
      break;
    case 3:
    case 4:
      century = 1800;
      break;
    case 5:
    case 6:
      century = 2000;
      break;
    case 7:
    case 8:
    case 9:
      // Residents and foreigners - assume 1900s for now
      century = 1900;
      break;
    default:
      return null;
  }

  const year = century + parseInt(yearPart, 10);

  // Validate month and day
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Create date and validate it's real (handles Feb 30, etc.)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Extract gender from CNP
 */
export function extractGenderFromCnp(cnp: string): 'male' | 'female' | null {
  if (cnp.length !== 13) return null;

  const sexDigit = parseInt(cnp[0], 10);

  if ([1, 3, 5, 7].includes(sexDigit)) return 'male';
  if ([2, 4, 6, 8].includes(sexDigit)) return 'female';
  if (sexDigit === 9) return null; // Foreign citizen, gender not encoded

  return null;
}

/**
 * Extract county code from CNP
 */
export function extractCountyCodeFromCnp(cnp: string): string | null {
  if (cnp.length !== 13) return null;

  const countyCode = cnp.substring(7, 9);

  if (!VALID_COUNTY_CODES.includes(countyCode)) return null;

  return countyCode;
}

/**
 * Get Romanian county name from code
 */
export function getRomanianCountyName(code: string): string | null {
  const COUNTY_NAMES: Record<string, string> = {
    '01': 'Alba',
    '02': 'Arad',
    '03': 'Argeș',
    '04': 'Bacău',
    '05': 'Bihor',
    '06': 'Bistrița-Năsăud',
    '07': 'Botoșani',
    '08': 'Brașov',
    '09': 'Brăila',
    '10': 'Buzău',
    '11': 'Caraș-Severin',
    '12': 'Cluj',
    '13': 'Constanța',
    '14': 'Covasna',
    '15': 'Dâmbovița',
    '16': 'Dolj',
    '17': 'Galați',
    '18': 'Gorj',
    '19': 'Harghita',
    '20': 'Hunedoara',
    '21': 'Ialomița',
    '22': 'Iași',
    '23': 'Ilfov',
    '24': 'Maramureș',
    '25': 'Mehedinți',
    '26': 'Mureș',
    '27': 'Neamț',
    '28': 'Olt',
    '29': 'Prahova',
    '30': 'Satu Mare',
    '31': 'Sălaj',
    '32': 'Sibiu',
    '33': 'Suceava',
    '34': 'Teleorman',
    '35': 'Timiș',
    '36': 'Tulcea',
    '37': 'Vaslui',
    '38': 'Vâlcea',
    '39': 'Vrancea',
    '40': 'București',
    '41': 'București Sector 1',
    '42': 'București Sector 2',
    '43': 'București Sector 3',
    '44': 'București Sector 4',
    '45': 'București Sector 5',
    '46': 'București Sector 6',
    '51': 'București (legacy)',
    '52': 'București (legacy)',
  };

  return COUNTY_NAMES[code] || null;
}

/**
 * Full CNP validation
 */
export function validateCnp(cnp: string): {
  valid: boolean;
  error?: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  countyCode?: string;
  countyName?: string;
} {
  // Remove any spaces or dashes
  const cleanCnp = cnp.replace(/[\s-]/g, '');

  // Check length
  if (cleanCnp.length !== 13) {
    return { valid: false, error: 'CNP must be exactly 13 digits' };
  }

  // Check all digits
  if (!/^\d{13}$/.test(cleanCnp)) {
    return { valid: false, error: 'CNP must contain only digits' };
  }

  // Check sex digit (first digit)
  const sexDigit = parseInt(cleanCnp[0], 10);
  if (sexDigit < 1 || sexDigit > 9) {
    return { valid: false, error: 'Invalid sex/century digit' };
  }

  // Check county code
  const countyCode = cleanCnp.substring(7, 9);
  if (!VALID_COUNTY_CODES.includes(countyCode)) {
    return { valid: false, error: 'Invalid county code' };
  }

  // Extract and validate birth date
  const birthDate = extractBirthDateFromCnp(cleanCnp);
  if (!birthDate) {
    return { valid: false, error: 'Invalid birth date' };
  }

  // Birth date should not be in the future
  if (birthDate > new Date()) {
    return { valid: false, error: 'Birth date cannot be in the future' };
  }

  // Validate checksum
  if (!validateCnpChecksum(cleanCnp)) {
    return { valid: false, error: 'Invalid control digit (checksum)' };
  }

  return {
    valid: true,
    birthDate,
    gender: extractGenderFromCnp(cleanCnp) || undefined,
    countyCode,
    countyName: getRomanianCountyName(countyCode) || undefined,
  };
}

/**
 * Zod schema for CNP validation
 */
export const CnpSchema = z.string().refine(
  (val) => validateCnp(val).valid,
  (val) => ({ message: validateCnp(val).error || 'Invalid CNP' }),
);

/**
 * Zod schema for optional CNP (allows empty string or undefined)
 */
export const OptionalCnpSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || validateCnp(val).valid,
    (val) => ({ message: val ? validateCnp(val).error || 'Invalid CNP' : '' }),
  );

/**
 * CNP data extracted from valid CNP
 */
export interface CnpData {
  cnp: string;
  birthDate: Date;
  gender: 'male' | 'female' | null;
  countyCode: string;
  countyName: string | null;
}

/**
 * Parse CNP and extract all data
 * Throws if invalid
 */
export function parseCnp(cnp: string): CnpData {
  const result = validateCnp(cnp);

  if (!result.valid) {
    throw new Error(result.error || 'Invalid CNP');
  }

  return {
    cnp: cnp.replace(/[\s-]/g, ''),
    birthDate: result.birthDate!,
    gender: result.gender || null,
    countyCode: result.countyCode!,
    countyName: result.countyName || null,
  };
}

/**
 * Mask CNP for display (show only first 6 digits)
 * Example: 1900101123456 -> 190010*******
 */
export function maskCnp(cnp: string): string {
  const clean = cnp.replace(/[\s-]/g, '');
  if (clean.length !== 13) return '***************';
  return clean.substring(0, 6) + '*******';
}
