/**
 * ANAF E-Factura API Endpoints
 *
 * These constants define the endpoint patterns for ANAF's E-Factura system.
 * The system operates in two environments: test (api.anaf.ro/test) and production (api.anaf.ro/prod).
 *
 * Reference: https://www.anaf.ro/anaf/internet/ANAF/servicii_online/e-factura
 */

/**
 * ANAF E-Factura base URLs
 */
export const ANAF_BASE_URLS = {
  /** Test/Staging environment */
  TEST: 'https://api.anaf.ro/test/FCTEL/rest',
  /** Production environment */
  PRODUCTION: 'https://api.anaf.ro/prod/FCTEL/rest',
  /** OAuth2 authentication endpoint */
  OAUTH: 'https://logincert.anaf.ro/anaf-oauth2/v1',
} as const;

/**
 * ANAF OAuth2 endpoints
 */
export const ANAF_OAUTH_ENDPOINTS = {
  /** Authorization endpoint */
  AUTHORIZE: '/authorize',
  /** Token endpoint */
  TOKEN: '/token',
  /** Token revocation endpoint */
  REVOKE: '/revoke',
} as const;

/**
 * E-Factura API endpoint paths
 *
 * URL format for upload: {baseUrl}/upload?standard={standard}&cif={cif}
 * URL format for status: {baseUrl}/stareMesaj?id_incarcare={id}
 * URL format for download: {baseUrl}/descarcare?id={id}
 */
export const EFACTURA_ENDPOINTS = {
  /**
   * Upload invoice XML
   * Method: POST
   * Query params: standard (UBL), cif (seller CUI)
   * Body: XML content (application/xml)
   * Returns: { id_incarcare: string } or { eroare: string }
   */
  UPLOAD: '/upload',

  /**
   * Check submission status
   * Method: GET
   * Query params: id_incarcare (upload index)
   * Returns: { stare: string, id_descarcare?: string, erori?: array }
   */
  STATUS: '/stareMesaj',

  /**
   * Download signed invoice
   * Method: GET
   * Query params: id (download ID from status response)
   * Returns: ZIP file containing signed XML
   */
  DOWNLOAD: '/descarcare',

  /**
   * List messages (invoices) for a CIF
   * Method: GET
   * Query params: zile (days), cif (tax ID)
   * Returns: { mesaje: array, titlu: string }
   */
  LIST_MESSAGES: '/listaMesajeFactura',

  /**
   * Validate XML without submission
   * Method: POST
   * Query params: standard (UBL)
   * Body: XML content
   * Returns: { valid: boolean, erori?: array }
   */
  VALIDATE: '/validare',
} as const;

/**
 * E-Factura standard types
 */
export const EFACTURA_STANDARDS = {
  /** UBL 2.1 format (default for Romania) */
  UBL: 'UBL',
  /** CII format (Cross-Industry Invoice) */
  CII: 'CII',
  /** CIUS-RO: Core Invoice Usage Specification for Romania */
  CIUS_RO: 'CIUS-RO',
} as const;

/**
 * Build the upload URL
 */
export function buildUploadUrl(
  baseUrl: string,
  sellerCui: string,
  standard: string = 'UBL',
): string {
  return `${baseUrl}${EFACTURA_ENDPOINTS.UPLOAD}?standard=${standard}&cif=${sellerCui}`;
}

/**
 * Build the status check URL
 */
export function buildStatusUrl(baseUrl: string, uploadIndex: string): string {
  return `${baseUrl}${EFACTURA_ENDPOINTS.STATUS}?id_incarcare=${uploadIndex}`;
}

/**
 * Build the download URL
 */
export function buildDownloadUrl(baseUrl: string, downloadId: string): string {
  return `${baseUrl}${EFACTURA_ENDPOINTS.DOWNLOAD}?id=${downloadId}`;
}

/**
 * Build the list messages URL
 */
export function buildListMessagesUrl(baseUrl: string, cui: string, days: number = 60): string {
  return `${baseUrl}${EFACTURA_ENDPOINTS.LIST_MESSAGES}?zile=${days}&cif=${cui}`;
}

/**
 * Build the validation URL
 */
export function buildValidationUrl(baseUrl: string, standard: string = 'UBL'): string {
  return `${baseUrl}${EFACTURA_ENDPOINTS.VALIDATE}?standard=${standard}`;
}

/**
 * ANAF API response codes
 */
export const ANAF_RESPONSE_CODES = {
  /** Submission successful, processing in progress */
  PROCESSING: 'in curs de procesare',
  /** Validation and signing successful */
  OK: 'ok',
  /** Validation failed */
  NOK: 'nok',
} as const;

/**
 * Common ANAF error codes and their meanings
 */
export const ANAF_ERROR_CODES = {
  /** Invalid XML structure */
  INVALID_XML: 'XML_INVALID',
  /** Missing required field */
  MISSING_FIELD: 'CAMP_LIPSA',
  /** Invalid CUI */
  INVALID_CUI: 'CUI_INVALID',
  /** Authentication failed */
  AUTH_FAILED: 'AUTH_EROARE',
  /** Rate limit exceeded */
  RATE_LIMIT: 'LIMITA_DEPASITA',
  /** Server error */
  SERVER_ERROR: 'EROARE_SERVER',
  /** Invoice already exists */
  DUPLICATE: 'FACTURA_DUPLICAT',
} as const;

/**
 * HTTP headers required for ANAF API calls
 */
export const ANAF_HEADERS = {
  /** Content type for XML uploads */
  CONTENT_TYPE_XML: 'application/xml',
  /** Content type for JSON responses */
  CONTENT_TYPE_JSON: 'application/json',
  /** Accept header for ZIP downloads */
  ACCEPT_ZIP: 'application/zip',
} as const;

/**
 * Request timeout configurations (in milliseconds)
 */
export const ANAF_TIMEOUTS = {
  /** Upload timeout - may take longer for large invoices */
  UPLOAD: 30000,
  /** Status check timeout */
  STATUS: 10000,
  /** Download timeout */
  DOWNLOAD: 60000,
  /** Validation timeout */
  VALIDATE: 15000,
} as const;
