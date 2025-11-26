/**
 * UBL (Universal Business Language) Code Lists
 *
 * These constants define the standard code values used in UBL 2.1 invoices
 * as required by the Romanian CIUS-RO (Core Invoice Usage Specification for Romania).
 *
 * Reference: https://docs.peppol.eu/poacc/billing/3.0/codelist/
 */

/**
 * Tax Category Codes (UNCL5305)
 * Used in TaxCategory/ID element
 */
export const TAX_CATEGORY_CODES = {
  /** Standard rate - 19% in Romania */
  STANDARD: 'S',
  /** Zero rated goods */
  ZERO_RATED: 'Z',
  /** Exempt from tax */
  EXEMPT: 'E',
  /** Reverse charge - VAT paid by buyer */
  REVERSE_CHARGE: 'AE',
  /** Intra-Community supply */
  INTRA_COMMUNITY: 'K',
  /** Export outside EU */
  EXPORT: 'G',
  /** Out of scope of VAT */
  OUT_OF_SCOPE: 'O',
  /** Canary Islands general indirect tax */
  IGIC: 'L',
  /** Tax for production, services and importation in Ceuta and Melilla */
  IPSI: 'M',
  /** Services outside scope of tax */
  SERVICES_OUTSIDE: 'B',
} as const;

export type TaxCategoryCode = (typeof TAX_CATEGORY_CODES)[keyof typeof TAX_CATEGORY_CODES];

/**
 * Tax Exemption Reason Codes (VATEX)
 * Used when TaxCategory is E (Exempt) or other non-standard categories
 */
export const TAX_EXEMPTION_REASONS = {
  /** Exempt - Article 44 of Directive 2006/112/EC */
  EXEMPT_GENERAL: 'VATEX-EU-O',
  /** Exempt - Healthcare services */
  EXEMPT_HEALTHCARE: 'VATEX-EU-J',
  /** Exempt - Cultural services */
  EXEMPT_CULTURAL: 'VATEX-EU-F',
  /** Exempt - Educational services */
  EXEMPT_EDUCATION: 'VATEX-EU-I',
  /** Reverse charge */
  REVERSE_CHARGE: 'VATEX-EU-AE',
  /** Intra-Community supply */
  INTRA_COMMUNITY: 'VATEX-EU-IC',
  /** Export of goods */
  EXPORT: 'VATEX-EU-G',
} as const;

/**
 * Payment Means Codes (UNCL4461)
 * Used in PaymentMeans/PaymentMeansCode element
 */
export const PAYMENT_MEANS_CODES = {
  /** In cash */
  CASH: '10',
  /** By cheque */
  CHEQUE: '20',
  /** Credit transfer */
  CREDIT_TRANSFER: '30',
  /** Debit transfer */
  DEBIT_TRANSFER: '31',
  /** Payment to bank account */
  BANK_ACCOUNT: '42',
  /** Bank card */
  CARD: '48',
  /** Direct debit */
  DIRECT_DEBIT: '49',
  /** Standing agreement */
  STANDING_AGREEMENT: '57',
  /** SEPA credit transfer */
  SEPA_CREDIT_TRANSFER: '58',
  /** SEPA direct debit */
  SEPA_DIRECT_DEBIT: '59',
  /** Clearing between parties */
  CLEARING: '97',
  /** Not defined (other) */
  NOT_DEFINED: '1',
} as const;

export type PaymentMeansCode = (typeof PAYMENT_MEANS_CODES)[keyof typeof PAYMENT_MEANS_CODES];

/**
 * Document Type Codes (UNCL1001)
 * Used in InvoiceTypeCode element
 */
export const DOCUMENT_TYPE_CODES = {
  /** Commercial invoice */
  COMMERCIAL_INVOICE: '380',
  /** Credit note */
  CREDIT_NOTE: '381',
  /** Debit note */
  DEBIT_NOTE: '383',
  /** Corrected invoice */
  CORRECTED_INVOICE: '384',
  /** Prepayment invoice */
  PREPAYMENT_INVOICE: '386',
  /** Self-billed invoice */
  SELF_BILLED_INVOICE: '389',
  /** Final invoice */
  FINAL_INVOICE: '393',
  /** Cancellation invoice */
  CANCELLATION_INVOICE: '457',
} as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPE_CODES)[keyof typeof DOCUMENT_TYPE_CODES];

/**
 * Unit of Measure Codes (UN/ECE Recommendation 20)
 * Used in InvoiceLine/InvoicedQuantity@unitCode
 */
export const UNIT_OF_MEASURE_CODES = {
  /** Each/piece */
  PIECE: 'C62',
  /** Kilogram */
  KILOGRAM: 'KGM',
  /** Gram */
  GRAM: 'GRM',
  /** Litre */
  LITRE: 'LTR',
  /** Millilitre */
  MILLILITRE: 'MLT',
  /** Metre */
  METRE: 'MTR',
  /** Square metre */
  SQUARE_METRE: 'MTK',
  /** Cubic metre */
  CUBIC_METRE: 'MTQ',
  /** Hour */
  HOUR: 'HUR',
  /** Day */
  DAY: 'DAY',
  /** Week */
  WEEK: 'WEE',
  /** Month */
  MONTH: 'MON',
  /** Year */
  YEAR: 'ANN',
  /** Set */
  SET: 'SET',
  /** Pack */
  PACK: 'PA',
  /** Box */
  BOX: 'BX',
  /** Treatment/procedure */
  TREATMENT: 'E48',
  /** Service unit */
  SERVICE_UNIT: 'E49',
} as const;

export type UnitOfMeasureCode = (typeof UNIT_OF_MEASURE_CODES)[keyof typeof UNIT_OF_MEASURE_CODES];

/**
 * Currency Codes (ISO 4217)
 */
export const CURRENCY_CODES = {
  /** Romanian Leu */
  RON: 'RON',
  /** Euro */
  EUR: 'EUR',
  /** US Dollar */
  USD: 'USD',
  /** British Pound */
  GBP: 'GBP',
} as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES];

/**
 * Country Codes (ISO 3166-1 alpha-2)
 * Commonly used in Romanian dental practice context
 */
export const COUNTRY_CODES = {
  /** Romania */
  ROMANIA: 'RO',
  /** Germany */
  GERMANY: 'DE',
  /** France */
  FRANCE: 'FR',
  /** Italy */
  ITALY: 'IT',
  /** Spain */
  SPAIN: 'ES',
  /** United Kingdom */
  UK: 'GB',
  /** Hungary */
  HUNGARY: 'HU',
  /** Bulgaria */
  BULGARIA: 'BG',
  /** Moldova */
  MOLDOVA: 'MD',
  /** Austria */
  AUSTRIA: 'AT',
} as const;

export type CountryCode = (typeof COUNTRY_CODES)[keyof typeof COUNTRY_CODES];

/**
 * Romanian VAT Rates (as percentages)
 */
export const ROMANIAN_VAT_RATES = {
  /** Standard rate */
  STANDARD: 0.19,
  /** Reduced rate (food, medical supplies, etc.) */
  REDUCED: 0.09,
  /** Super-reduced rate (books, hotels, etc.) */
  SUPER_REDUCED: 0.05,
  /** Zero rate / Exempt */
  ZERO: 0,
} as const;

/**
 * Map VAT rate to tax category code
 */
export function getTaxCategoryForRate(rate: number): TaxCategoryCode {
  if (rate === 0) {
    return TAX_CATEGORY_CODES.EXEMPT;
  }
  if (rate === ROMANIAN_VAT_RATES.STANDARD) {
    return TAX_CATEGORY_CODES.STANDARD;
  }
  if (rate === ROMANIAN_VAT_RATES.REDUCED || rate === ROMANIAN_VAT_RATES.SUPER_REDUCED) {
    return TAX_CATEGORY_CODES.STANDARD; // Reduced rates still use 'S' category
  }
  return TAX_CATEGORY_CODES.STANDARD;
}

/**
 * Map internal payment method to UBL payment means code
 */
export function getPaymentMeansCode(method: string): PaymentMeansCode {
  const mapping: Record<string, PaymentMeansCode> = {
    CASH: PAYMENT_MEANS_CODES.CASH,
    CARD: PAYMENT_MEANS_CODES.CARD,
    CREDIT_CARD: PAYMENT_MEANS_CODES.CARD,
    DEBIT_CARD: PAYMENT_MEANS_CODES.CARD,
    BANK_TRANSFER: PAYMENT_MEANS_CODES.CREDIT_TRANSFER,
    CHECK: PAYMENT_MEANS_CODES.CHEQUE,
    INSURANCE: PAYMENT_MEANS_CODES.CREDIT_TRANSFER,
    SPLIT: PAYMENT_MEANS_CODES.NOT_DEFINED,
  };
  return mapping[method] || PAYMENT_MEANS_CODES.NOT_DEFINED;
}

/**
 * CIUS-RO specific requirements
 */
export const CIUS_RO_REQUIREMENTS = {
  /** Minimum customization ID for Romanian invoices */
  CUSTOMIZATION_ID: 'urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1',
  /** Profile ID for B2B invoices */
  PROFILE_ID: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
  /** UBL version used */
  UBL_VERSION: '2.1',
  /** Tax scheme ID for VAT */
  TAX_SCHEME_ID: 'VAT',
} as const;

/**
 * Allowance/Charge Reason Codes
 */
export const ALLOWANCE_CHARGE_REASONS = {
  /** Discount */
  DISCOUNT: '95',
  /** Special agreement */
  SPECIAL_AGREEMENT: '100',
  /** Bonus for quantity purchased */
  QUANTITY_BONUS: '64',
  /** Early payment discount */
  EARLY_PAYMENT: '67',
  /** Loyalty discount */
  LOYALTY: '71',
  /** Handling charge */
  HANDLING: 'FC',
  /** Shipping charge */
  SHIPPING: 'DL',
  /** Insurance */
  INSURANCE: 'IN',
} as const;

/**
 * Romanian county codes (for address validation)
 */
export const ROMANIAN_COUNTY_CODES: Record<string, string> = {
  AB: 'Alba',
  AR: 'Arad',
  AG: 'Arges',
  BC: 'Bacau',
  BH: 'Bihor',
  BN: 'Bistrita-Nasaud',
  BT: 'Botosani',
  BV: 'Brasov',
  BR: 'Braila',
  B: 'Bucuresti',
  BZ: 'Buzau',
  CS: 'Caras-Severin',
  CL: 'Calarasi',
  CJ: 'Cluj',
  CT: 'Constanta',
  CV: 'Covasna',
  DB: 'Dambovita',
  DJ: 'Dolj',
  GL: 'Galati',
  GR: 'Giurgiu',
  GJ: 'Gorj',
  HR: 'Harghita',
  HD: 'Hunedoara',
  IL: 'Ialomita',
  IS: 'Iasi',
  IF: 'Ilfov',
  MM: 'Maramures',
  MH: 'Mehedinti',
  MS: 'Mures',
  NT: 'Neamt',
  OT: 'Olt',
  PH: 'Prahova',
  SM: 'Satu Mare',
  SJ: 'Salaj',
  SB: 'Sibiu',
  SV: 'Suceava',
  TR: 'Teleorman',
  TM: 'Timis',
  TL: 'Tulcea',
  VS: 'Vaslui',
  VL: 'Valcea',
  VN: 'Vrancea',
};
