/**
 * Romanian Market Validation Schemas
 *
 * This module provides validation utilities for Romanian-specific data:
 * - CNP (Cod Numeric Personal) - Romanian national ID
 * - Romanian addresses with județ (county) support
 * - Romanian phone numbers
 * - Romanian CUI/CIF (company tax ID)
 * - Romanian IBAN
 */

// CNP (Personal Identification Number)
export {
  CnpSchema,
  OptionalCnpSchema,
  validateCnp,
  validateCnpChecksum,
  calculateCnpControlDigit,
  extractBirthDateFromCnp,
  extractGenderFromCnp,
  extractCountyCodeFromCnp,
  getRomanianCountyName,
  parseCnp,
  maskCnp,
  type CnpData,
} from './cnp.schema';

// Romanian Addresses
export {
  RomanianAddressSchema,
  SimpleRomanianAddressSchema,
  ROMANIAN_COUNTIES,
  getRomanianCountyCodes,
  getRomanianCountyByCode,
  validateRomanianPostalCode,
  POSTAL_CODE_PREFIXES,
  formatRomanianAddress,
  formatRomanianAddressSingleLine,
  type RomanianAddress,
  type SimpleRomanianAddress,
  type RomanianCountyCode,
} from './address.schema';

// Romanian Phone Numbers
export {
  RomanianPhoneSchema,
  normalizeRomanianPhone,
} from './address.schema';

// Romanian Company Tax ID (CUI/CIF)
export {
  RomanianCuiSchema,
  validateRomanianCui,
} from './address.schema';

// Romanian IBAN
export {
  RomanianIbanSchema,
  validateRomanianIban,
  formatIban,
} from './address.schema';
