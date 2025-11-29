import { registerAs } from '@nestjs/config';

/**
 * E-Factura Configuration
 *
 * This configuration module provides all settings required for ANAF E-Factura integration.
 * E-Factura is Romania's mandatory electronic invoicing system for B2B transactions.
 *
 * Environment Variables:
 * - EFACTURA_ENVIRONMENT: 'test' | 'production' (default: 'test')
 * - EFACTURA_REQUEST_TIMEOUT_MS: Request timeout in milliseconds (default: 30000)
 * - EFACTURA_MAX_RETRIES: Maximum retry attempts (default: 3)
 * - EFACTURA_RETRY_DELAY_MS: Delay between retries in milliseconds (default: 60000)
 * - EFACTURA_STATUS_CHECK_INTERVAL_MS: Status polling interval (default: 30000)
 * - EFACTURA_DEADLINE_HOURS: Submission deadline in hours (default: 120 = 5 days)
 * - EFACTURA_BATCH_SIZE: Batch processing size (default: 10)
 */
export default registerAs('efactura', () => {
  const environment = process.env.EFACTURA_ENVIRONMENT || 'test';
  const isProduction = environment === 'production';

  return {
    /**
     * ANAF API Configuration
     */
    anaf: {
      /** Base URL for ANAF E-Factura API */
      baseUrl: isProduction
        ? 'https://api.anaf.ro/prod/FCTEL/rest'
        : 'https://api.anaf.ro/test/FCTEL/rest',

      /** OAuth2 base URL for authentication */
      oauthBaseUrl: 'https://logincert.anaf.ro/anaf-oauth2/v1',

      /** Whether this is a test/staging environment */
      isTestEnvironment: !isProduction,

      /** Request timeout in milliseconds */
      requestTimeoutMs: parseInt(process.env.EFACTURA_REQUEST_TIMEOUT_MS || '30000', 10),
    },

    /**
     * Submission Configuration
     */
    submission: {
      /** Maximum number of retry attempts for failed submissions */
      maxRetries: parseInt(process.env.EFACTURA_MAX_RETRIES || '3', 10),

      /**
       * Base delay between retry attempts in milliseconds
       * Default: 1 minute (60000ms)
       */
      retryDelayMs: parseInt(process.env.EFACTURA_RETRY_DELAY_MS || '60000', 10),

      /**
       * Maximum delay between retry attempts in milliseconds (for exponential backoff cap)
       * Default: 1 hour (3600000ms)
       */
      maxRetryDelayMs: parseInt(process.env.EFACTURA_MAX_RETRY_DELAY_MS || '3600000', 10),

      /**
       * Interval for checking submission status in milliseconds
       * Default: 30 seconds (30000ms)
       * ANAF typically processes invoices within a few minutes
       */
      statusCheckIntervalMs: parseInt(process.env.EFACTURA_STATUS_CHECK_INTERVAL_MS || '30000', 10),

      /**
       * Deadline for e-factura submission in hours
       * Romanian law requires B2B invoices to be submitted within 5 working days
       * Default: 120 hours (5 days)
       */
      deadlineHours: parseInt(process.env.EFACTURA_DEADLINE_HOURS || '120', 10),

      /**
       * Batch size for processing pending submissions
       * Used when running bulk operations or scheduled jobs
       */
      batchSize: parseInt(process.env.EFACTURA_BATCH_SIZE || '10', 10),
    },

    /**
     * Romanian VAT Rates
     * These rates are defined by Romanian fiscal legislation
     */
    vatRates: {
      /**
       * Standard VAT rate: 19%
       * Applies to most goods and services
       */
      standard: 0.19,

      /**
       * Reduced VAT rate: 9%
       * Applies to: food, non-alcoholic beverages, medical supplies,
       * hotel accommodations, restaurant services, etc.
       * Note: Dental services may qualify for reduced rate in some cases
       */
      reduced: 0.09,

      /**
       * Super-reduced VAT rate: 5%
       * Applies to: books, newspapers, social housing, cultural events,
       * certain medical equipment
       */
      superReduced: 0.05,

      /**
       * Exempt from VAT: 0%
       * Applies to: healthcare services (general), exports outside EU,
       * certain financial services
       * Note: Many dental healthcare services are VAT exempt in Romania
       */
      exempt: 0,
    },

    /**
     * XML Generation Settings
     */
    xml: {
      /**
       * CIUS-RO Customization ID
       * Required identifier for Romanian e-invoices
       */
      customizationId: 'urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1',

      /**
       * UBL Profile ID for B2B invoices
       */
      profileId: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',

      /**
       * UBL Version used
       */
      ublVersion: '2.1',

      /**
       * Pretty print XML output (for debugging)
       */
      prettyPrint: !isProduction,
    },

    /**
     * Feature Flags
     */
    features: {
      /**
       * Enable automatic submission on invoice issuance
       * When true, invoices will be submitted to ANAF when issued
       */
      autoSubmit: process.env.EFACTURA_AUTO_SUBMIT === 'true',

      /**
       * Enable validation before submission
       * Performs local XML validation before sending to ANAF
       */
      validateBeforeSubmit: process.env.EFACTURA_VALIDATE_BEFORE_SUBMIT !== 'false',

      /**
       * Enable PDF generation with e-factura
       * Generates a human-readable PDF alongside the XML
       */
      generatePdf: process.env.EFACTURA_GENERATE_PDF === 'true',

      /**
       * Store signed XML after successful validation
       * Downloads and stores the ANAF-signed invoice XML
       */
      storeSignedXml: process.env.EFACTURA_STORE_SIGNED_XML !== 'false',
    },

    /**
     * Logging and Monitoring
     */
    logging: {
      /**
       * Log full XML content (caution: may contain sensitive data)
       * Should be false in production
       */
      logXmlContent: !isProduction && process.env.EFACTURA_LOG_XML === 'true',

      /**
       * Log ANAF API responses
       */
      logApiResponses: process.env.EFACTURA_LOG_API_RESPONSES !== 'false',
    },
  };
});

/**
 * Type definition for the configuration object
 */
export interface EFacturaConfigType {
  anaf: {
    baseUrl: string;
    oauthBaseUrl: string;
    isTestEnvironment: boolean;
    requestTimeoutMs: number;
  };
  submission: {
    maxRetries: number;
    retryDelayMs: number;
    maxRetryDelayMs: number;
    statusCheckIntervalMs: number;
    deadlineHours: number;
    batchSize: number;
  };
  vatRates: {
    standard: number;
    reduced: number;
    superReduced: number;
    exempt: number;
  };
  xml: {
    customizationId: string;
    profileId: string;
    ublVersion: string;
    prettyPrint: boolean;
  };
  features: {
    autoSubmit: boolean;
    validateBeforeSubmit: boolean;
    generatePdf: boolean;
    storeSignedXml: boolean;
  };
  logging: {
    logXmlContent: boolean;
    logApiResponses: boolean;
  };
}
