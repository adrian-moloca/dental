/**
 * ANAF E-Factura Configuration Interfaces
 *
 * These interfaces define the configuration structure for ANAF API integration.
 * E-Factura is the Romanian electronic invoicing system mandated for B2B transactions.
 */

/**
 * ANAF OAuth2 token response
 */
export interface AnafOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * ANAF API configuration
 */
export interface AnafApiConfig {
  /** Base URL for ANAF API (test or production) */
  baseUrl: string;
  /** OAuth2 base URL for authentication */
  oauthBaseUrl: string;
  /** Whether this is a test/staging environment */
  isTestEnvironment: boolean;
  /** Request timeout in milliseconds */
  requestTimeoutMs: number;
}

/**
 * Submission configuration
 */
export interface SubmissionConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelayMs: number;
  /** Interval for checking submission status in milliseconds */
  statusCheckIntervalMs: number;
  /** Deadline for e-factura submission in hours (5 days = 120 hours for Romania) */
  deadlineHours: number;
  /** Batch size for processing pending submissions */
  batchSize: number;
}

/**
 * Romanian VAT rates configuration
 */
export interface VatRatesConfig {
  /** Standard VAT rate: 19% */
  standard: number;
  /** Reduced VAT rate: 9% (food, medical, etc.) */
  reduced: number;
  /** Super-reduced VAT rate: 5% (books, hotels, etc.) */
  superReduced: number;
  /** Exempt from VAT: 0% */
  exempt: number;
}

/**
 * Full E-Factura configuration
 */
export interface EFacturaConfig {
  anaf: AnafApiConfig;
  submission: SubmissionConfig;
  vatRates: VatRatesConfig;
}

/**
 * ANAF upload response structure
 */
export interface AnafUploadResponse {
  /** Index assigned by ANAF for tracking the upload */
  id_incarcare?: string;
  /** Error message if upload failed */
  eroare?: string;
  /** Response title */
  titlu?: string;
  /** Execution ID */
  executie?: string;
}

/**
 * ANAF status check response
 */
export interface AnafStatusResponse {
  /** Current processing state */
  stare: 'in curs de procesare' | 'ok' | 'nok';
  /** Download ID for retrieving signed invoice */
  id_descarcare?: string;
  /** Error list if validation failed */
  erori?: AnafValidationError[];
  /** Warnings list */
  avertismente?: AnafValidationWarning[];
}

/**
 * ANAF validation error structure
 */
export interface AnafValidationError {
  /** Error code from ANAF */
  cod: string;
  /** Human-readable error message */
  mesaj: string;
  /** Field or path related to the error */
  camp?: string;
}

/**
 * ANAF validation warning structure
 */
export interface AnafValidationWarning {
  /** Warning code from ANAF */
  cod: string;
  /** Human-readable warning message */
  mesaj: string;
}

/**
 * OAuth2 client credentials for ANAF authentication
 */
export interface AnafOAuthCredentials {
  /** OAuth2 client ID */
  clientId: string;
  /** OAuth2 client secret */
  clientSecret: string;
  /** OAuth2 redirect URI */
  redirectUri: string;
}

/**
 * Seller (supplier) information for e-factura
 */
export interface EFacturaSellerInfo {
  /** CUI (Cod Unic de Identificare) - Romanian tax ID */
  cui: string;
  /** Company legal name */
  legalName: string;
  /** Trade/commercial name */
  tradeName?: string;
  /** Registration number (Registrul Comertului) */
  regCom?: string;
  /** Bank account (IBAN) */
  iban?: string;
  /** Bank name */
  bankName?: string;
  /** Address */
  address: EFacturaAddress;
  /** Contact information */
  contact?: EFacturaContact;
}

/**
 * Buyer (customer) information for e-factura
 */
export interface EFacturaBuyerInfo {
  /** CUI for Romanian companies or VAT ID for EU companies */
  cui?: string;
  /** Company legal name or individual name */
  legalName: string;
  /** Registration number */
  regCom?: string;
  /** Address */
  address: EFacturaAddress;
  /** Contact information */
  contact?: EFacturaContact;
  /** Whether this is a B2B transaction (requires e-factura) */
  isB2B: boolean;
}

/**
 * Address structure for e-factura
 */
export interface EFacturaAddress {
  /** Street name and number */
  streetName: string;
  /** Additional address line */
  additionalStreetName?: string;
  /** City/locality */
  city: string;
  /** County/region */
  county?: string;
  /** Postal code */
  postalCode?: string;
  /** Country code (ISO 3166-1 alpha-2, e.g., 'RO') */
  countryCode: string;
}

/**
 * Contact information
 */
export interface EFacturaContact {
  /** Contact name */
  name?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
}

/**
 * Tenant context for E-Factura operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}
