/**
 * Validation Utilities
 *
 * Romanian-specific validation functions for patient data
 */

/**
 * Romanian CNP (Cod Numeric Personal) validation
 * Format: SAALLZZJJNNNC
 * S = Sex (1-9)
 * AA = Year of birth (last 2 digits)
 * LL = Month of birth (01-12)
 * ZZ = Day of birth (01-31)
 * JJ = County code (01-52)
 * NNN = Unique number
 * C = Control digit
 */
export function validateCNP(cnp: string): { valid: boolean; error?: string } {
  // Remove spaces and validate format
  const cleanCNP = cnp.replace(/\s/g, '');

  if (!/^\d{13}$/.test(cleanCNP)) {
    return { valid: false, error: 'CNP trebuie sa contina exact 13 cifre' };
  }

  // Extract components
  const sex = parseInt(cleanCNP[0]);
  // Note: year is extracted but not validated separately (validated via control digit)
  const _year = parseInt(cleanCNP.substring(1, 3));
  const month = parseInt(cleanCNP.substring(3, 5));
  const day = parseInt(cleanCNP.substring(5, 7));
  const county = parseInt(cleanCNP.substring(7, 9));

  // Validate sex digit (1-9)
  if (sex < 1 || sex > 9) {
    return { valid: false, error: 'Prima cifra a CNP-ului este invalida' };
  }

  // Validate month (01-12)
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Luna din CNP este invalida' };
  }

  // Validate day (01-31)
  if (day < 1 || day > 31) {
    return { valid: false, error: 'Ziua din CNP este invalida' };
  }

  // Validate county code (01-52, 99 for abroad)
  if ((county < 1 || county > 52) && county !== 99) {
    return { valid: false, error: 'Codul judetului din CNP este invalid' };
  }

  // Validate checksum
  const controlWeights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNP[i]) * controlWeights[i];
  }

  let controlDigit = sum % 11;
  if (controlDigit === 10) {
    controlDigit = 1;
  }

  const providedControlDigit = parseInt(cleanCNP[12]);

  if (controlDigit !== providedControlDigit) {
    return { valid: false, error: 'Cifra de control a CNP-ului este incorecta' };
  }

  return { valid: true };
}

/**
 * Extract date of birth from CNP
 */
export function extractDateFromCNP(cnp: string): Date | null {
  const cleanCNP = cnp.replace(/\s/g, '');

  if (!/^\d{13}$/.test(cleanCNP)) {
    return null;
  }

  const sex = parseInt(cleanCNP[0]);
  const yearSuffix = parseInt(cleanCNP.substring(1, 3));
  const month = parseInt(cleanCNP.substring(3, 5));
  const day = parseInt(cleanCNP.substring(5, 7));

  // Determine century based on sex digit
  let year: number;
  if (sex === 1 || sex === 2) {
    year = 1900 + yearSuffix; // Born 1900-1999
  } else if (sex === 3 || sex === 4) {
    year = 1800 + yearSuffix; // Born 1800-1899
  } else if (sex === 5 || sex === 6) {
    year = 2000 + yearSuffix; // Born 2000-2099
  } else if (sex === 7 || sex === 8) {
    // Resident born 1900-1999
    year = 1900 + yearSuffix;
    if (year > new Date().getFullYear()) {
      year = 2000 + yearSuffix;
    }
  } else {
    return null;
  }

  try {
    return new Date(year, month - 1, day);
  } catch {
    return null;
  }
}

/**
 * Extract gender from CNP
 */
export function extractGenderFromCNP(cnp: string): 'male' | 'female' | null {
  const cleanCNP = cnp.replace(/\s/g, '');

  if (!/^\d{13}$/.test(cleanCNP)) {
    return null;
  }

  const sex = parseInt(cleanCNP[0]);

  // Odd = male, Even = female
  if ([1, 3, 5, 7].includes(sex)) {
    return 'male';
  } else if ([2, 4, 6, 8].includes(sex)) {
    return 'female';
  }

  return null;
}

/**
 * Validate Romanian phone number
 * Accepts: +40xxxxxxxxx, 07xxxxxxxx, 02xxxxxxxx, 03xxxxxxxx
 */
export function validateRomanianPhone(phone: string): { valid: boolean; error?: string } {
  const cleanPhone = phone.replace(/[\s\-().]/g, '');

  // International format
  if (/^\+40\d{9}$/.test(cleanPhone)) {
    return { valid: true };
  }

  // National format - mobile
  if (/^07\d{8}$/.test(cleanPhone)) {
    return { valid: true };
  }

  // National format - landline (Bucharest, other cities)
  if (/^0[2-3]\d{7,8}$/.test(cleanPhone)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Formatul telefonului este invalid. Foloseste: +40xxxxxxxxx sau 07xxxxxxxx',
  };
}

/**
 * Format Romanian phone number for display
 */
export function formatRomanianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-().]/g, '');

  // International format
  if (cleanPhone.startsWith('+40')) {
    const number = cleanPhone.substring(3);
    return `+40 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }

  // Mobile format
  if (cleanPhone.startsWith('07')) {
    return `${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
  }

  // Landline format
  if (cleanPhone.startsWith('0')) {
    return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
  }

  return phone;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formatul email-ului este invalid' };
  }

  return { valid: true };
}

/**
 * Romanian Counties (Judete)
 */
export const ROMANIAN_COUNTIES = [
  'Alba',
  'Arad',
  'Argeș',
  'Bacău',
  'Bihor',
  'Bistrița-Năsăud',
  'Botoșani',
  'Brăila',
  'Brașov',
  'București',
  'Buzău',
  'Călărași',
  'Caraș-Severin',
  'Cluj',
  'Constanța',
  'Covasna',
  'Dâmbovița',
  'Dolj',
  'Galați',
  'Giurgiu',
  'Gorj',
  'Harghita',
  'Hunedoara',
  'Ialomița',
  'Iași',
  'Ilfov',
  'Maramureș',
  'Mehedinți',
  'Mureș',
  'Neamț',
  'Olt',
  'Prahova',
  'Sălaj',
  'Satu Mare',
  'Sibiu',
  'Suceava',
  'Teleorman',
  'Timiș',
  'Tulcea',
  'Vâlcea',
  'Vaslui',
  'Vrancea',
];

/**
 * Emergency Contact Relationships
 */
export const EMERGENCY_CONTACT_RELATIONSHIPS = [
  { value: 'sot', label: 'Soț' },
  { value: 'sotie', label: 'Soție' },
  { value: 'parinte', label: 'Părinte' },
  { value: 'copil', label: 'Copil' },
  { value: 'frate', label: 'Frate' },
  { value: 'sora', label: 'Soră' },
  { value: 'prieten', label: 'Prieten' },
  { value: 'altul', label: 'Altul' },
];

/**
 * Preferred Contact Methods
 */
export const CONTACT_METHODS = [
  { value: 'phone', label: 'Telefon' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

/**
 * Allergy Severity Levels
 */
export const ALLERGY_SEVERITY_LEVELS = [
  { value: 'mild', label: 'Ușoară' },
  { value: 'moderate', label: 'Moderată' },
  { value: 'severe', label: 'Severă' },
  { value: 'life_threatening', label: 'Potențial Fatală' },
];

/**
 * Common Patient Flags
 */
export const PATIENT_FLAGS = [
  { value: 'anxious', label: 'Anxios', color: 'warning' },
  { value: 'special_needs', label: 'Nevoi Speciale', color: 'info' },
  { value: 'wheelchair', label: 'Scaun cu Rotile', color: 'info' },
  { value: 'hearing_impaired', label: 'Deficiență Auditivă', color: 'info' },
  { value: 'vision_impaired', label: 'Deficiență Vizuală', color: 'info' },
  { value: 'language_barrier', label: 'Barieră Lingvistică', color: 'warning' },
  { value: 'high_risk', label: 'Risc Înalt', color: 'danger' },
  { value: 'vip', label: 'VIP', color: 'primary' },
];
