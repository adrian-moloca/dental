import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import axiosRetry, { exponentialDelay } from 'axios-retry';

import { EFacturaConfigType } from '../config/e-factura.config';
import {
  ANAF_HEADERS,
  ANAF_TIMEOUTS,
  buildUploadUrl,
  buildStatusUrl,
  buildDownloadUrl,
  buildValidationUrl,
  EFACTURA_STANDARDS,
} from '../constants/anaf-endpoints.constant';
import {
  normalizeUploadResponse,
  normalizeStatusResponse,
  AnafUploadResponseInput,
  AnafStatusResponseInput,
} from '../dto/anaf-response.dto';
import { AnafOAuthService } from './anaf-oauth.service';

/**
 * Upload response from ANAF API
 */
export interface AnafUploadResult {
  success: boolean;
  uploadIndex?: string;
  errorMessage?: string;
  rawResponse: unknown;
  requestDurationMs: number;
}

/**
 * Status check response
 */
export interface AnafStatusResult {
  success: boolean;
  status: 'processing' | 'ok' | 'error';
  downloadId?: string;
  errors: Array<{ code: string; message: string; field?: string }>;
  warnings: Array<{ code: string; message: string }>;
  rawResponse: unknown;
  requestDurationMs: number;
}

/**
 * Download result
 */
export interface AnafDownloadResult {
  success: boolean;
  data?: Buffer;
  contentType?: string;
  errorMessage?: string;
  requestDurationMs: number;
}

/**
 * Validation result
 */
export interface AnafValidationResult {
  valid: boolean;
  errors: Array<{ code: string; message: string; field?: string }>;
  warnings: Array<{ code: string; message: string }>;
  rawResponse: unknown;
  requestDurationMs: number;
}

/**
 * ANAF API Service
 *
 * Handles all HTTP communication with ANAF E-Factura REST API.
 * Implements retry logic, timeout handling, and proper error mapping.
 *
 * Key responsibilities:
 * - Upload invoice XML to ANAF
 * - Check submission status
 * - Download signed invoices
 * - Validate XML before submission
 * - Handle authentication via OAuth tokens
 * - Implement retry logic for transient failures
 *
 * ANAF API endpoints:
 * - POST /upload?standard=UBL&cif={cui} - Upload invoice
 * - GET /stareMesaj?id_incarcare={id} - Check status
 * - GET /descarcare?id={id} - Download signed invoice
 * - POST /validare?standard=UBL - Validate XML
 */
@Injectable()
export class AnafApiService implements OnModuleInit {
  private readonly logger = new Logger(AnafApiService.name);
  private httpClient!: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: AnafOAuthService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.initializeHttpClient();
    this.logger.log('ANAF API Service initialized');
  }

  /**
   * Get E-Factura configuration
   */
  private getConfig(): EFacturaConfigType {
    return this.configService.get<EFacturaConfigType>('efactura')!;
  }

  /**
   * Initialize axios HTTP client with retry logic
   */
  private initializeHttpClient(): void {
    const config = this.getConfig();

    this.httpClient = axios.create({
      timeout: config.anaf.requestTimeoutMs,
      headers: {
        'Content-Type': ANAF_HEADERS.CONTENT_TYPE_XML,
        Accept: ANAF_HEADERS.CONTENT_TYPE_JSON,
      },
    });

    // Configure retry logic
    axiosRetry(this.httpClient, {
      retries: 3,
      retryDelay: exponentialDelay,
      retryCondition: (error: AxiosError) => {
        // Retry on network errors and 5xx responses
        if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
          return true;
        }
        // Also retry on 429 (rate limit) and 503 (service unavailable)
        const status = error.response?.status;
        return status === 429 || status === 503;
      },
      onRetry: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => {
        this.logger.warn(
          `Retrying ANAF request (attempt ${retryCount}): ${requestConfig.url} - ${error.message}`,
        );
      },
    });

    // Request interceptor for logging
    this.httpClient.interceptors.request.use(
      (requestConfig) => {
        this.logger.debug(`ANAF API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
        return requestConfig;
      },
      (error) => {
        this.logger.error(`ANAF API Request Error: ${error.message}`);
        return Promise.reject(error);
      },
    );

    // Response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`ANAF API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `ANAF API Error Response: ${error.response.status} ${error.config?.url} - ${JSON.stringify(error.response.data)}`,
          );
        } else if (error.request) {
          this.logger.error(`ANAF API No Response: ${error.config?.url} - ${error.message}`);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Upload invoice XML to ANAF
   *
   * Submits the invoice XML to ANAF E-Factura system.
   * On success, returns an upload index (id_incarcare) for tracking.
   *
   * @param xml - UBL 2.1 compliant XML string
   * @param cui - Seller's CUI (company tax ID)
   * @param idempotencyKey - Optional key to prevent duplicate submissions
   * @returns Upload result with upload index or error
   */
  async uploadInvoice(
    xml: string,
    cui: string,
    idempotencyKey?: string,
  ): Promise<AnafUploadResult> {
    const startTime = Date.now();
    const config = this.getConfig();
    const normalizedCui = cui.replace(/^RO/i, '');

    this.logger.log(`Uploading invoice XML for CUI: ${normalizedCui}`);

    try {
      // Get OAuth token
      const token = await this.oauthService.getAccessToken(cui);

      const url = buildUploadUrl(config.anaf.baseUrl, normalizedCui, EFACTURA_STANDARDS.UBL);

      const headers: Record<string, string> = {
        'Content-Type': ANAF_HEADERS.CONTENT_TYPE_XML,
        Accept: ANAF_HEADERS.CONTENT_TYPE_JSON,
        Authorization: `Bearer ${token}`,
      };

      if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
      }

      const response: AxiosResponse<AnafUploadResponseInput> = await this.httpClient.post(
        url,
        xml,
        {
          headers,
          timeout: ANAF_TIMEOUTS.UPLOAD,
        },
      );

      const normalized = normalizeUploadResponse(response.data);

      return {
        success: normalized.success,
        uploadIndex: normalized.uploadIndex,
        errorMessage: normalized.errors[0]?.message,
        rawResponse: response.data,
        requestDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      this.logger.error(`Failed to upload invoice for CUI ${normalizedCui}: ${errorMessage}`);

      return {
        success: false,
        errorMessage,
        rawResponse: error instanceof AxiosError ? error.response?.data : null,
        requestDurationMs: duration,
      };
    }
  }

  /**
   * Check submission status
   *
   * Queries ANAF API to get the current processing status of a submission.
   * Possible statuses: 'in curs de procesare' (processing), 'ok' (success), 'nok' (error)
   *
   * @param uploadIndex - The upload index (id_incarcare) from upload response
   * @param cui - Seller's CUI for authentication
   * @returns Status result with download ID if successful
   */
  async checkStatus(uploadIndex: string, cui: string): Promise<AnafStatusResult> {
    const startTime = Date.now();
    const config = this.getConfig();

    this.logger.log(`Checking status for upload index: ${uploadIndex}`);

    try {
      const token = await this.oauthService.getAccessToken(cui);

      const url = buildStatusUrl(config.anaf.baseUrl, uploadIndex);

      const response: AxiosResponse<AnafStatusResponseInput> = await this.httpClient.get(url, {
        headers: {
          Accept: ANAF_HEADERS.CONTENT_TYPE_JSON,
          Authorization: `Bearer ${token}`,
        },
        timeout: ANAF_TIMEOUTS.STATUS,
      });

      const normalized = normalizeStatusResponse(response.data);

      return {
        success: normalized.success,
        status: normalized.status,
        downloadId: normalized.downloadId,
        errors: normalized.errors,
        warnings: normalized.warnings,
        rawResponse: response.data,
        requestDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      this.logger.error(`Failed to check status for ${uploadIndex}: ${errorMessage}`);

      return {
        success: false,
        status: 'error',
        errors: [{ code: 'API_ERROR', message: errorMessage }],
        warnings: [],
        rawResponse: error instanceof AxiosError ? error.response?.data : null,
        requestDurationMs: duration,
      };
    }
  }

  /**
   * Download signed invoice
   *
   * Downloads the signed invoice from ANAF after successful validation.
   * The response is typically a ZIP file containing the signed XML.
   *
   * @param downloadId - The download ID (id_descarcare) from status response
   * @param cui - Seller's CUI for authentication
   * @returns Buffer containing the signed invoice (ZIP)
   */
  async downloadSignedInvoice(downloadId: string, cui: string): Promise<AnafDownloadResult> {
    const startTime = Date.now();
    const config = this.getConfig();

    this.logger.log(`Downloading signed invoice: ${downloadId}`);

    try {
      const token = await this.oauthService.getAccessToken(cui);

      const url = buildDownloadUrl(config.anaf.baseUrl, downloadId);

      const response = await this.httpClient.get(url, {
        headers: {
          Accept: ANAF_HEADERS.ACCEPT_ZIP,
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
        timeout: ANAF_TIMEOUTS.DOWNLOAD,
      });

      return {
        success: true,
        data: Buffer.from(response.data),
        contentType: response.headers['content-type'],
        requestDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      this.logger.error(`Failed to download signed invoice ${downloadId}: ${errorMessage}`);

      return {
        success: false,
        errorMessage,
        requestDurationMs: duration,
      };
    }
  }

  /**
   * Validate XML without submission
   *
   * Performs a validation-only request to ANAF.
   * Useful for pre-flight validation before actual submission.
   *
   * @param xml - UBL 2.1 XML string to validate
   * @param cui - CUI for authentication
   * @returns Validation result with errors/warnings
   */
  async validateXml(xml: string, cui: string): Promise<AnafValidationResult> {
    const startTime = Date.now();
    const config = this.getConfig();

    this.logger.log('Validating XML with ANAF');

    try {
      const token = await this.oauthService.getAccessToken(cui);

      const url = buildValidationUrl(config.anaf.baseUrl, EFACTURA_STANDARDS.UBL);

      const response = await this.httpClient.post(url, xml, {
        headers: {
          'Content-Type': ANAF_HEADERS.CONTENT_TYPE_XML,
          Accept: ANAF_HEADERS.CONTENT_TYPE_JSON,
          Authorization: `Bearer ${token}`,
        },
        timeout: ANAF_TIMEOUTS.VALIDATE,
      });

      // Parse validation response
      const data = response.data as {
        valid?: boolean;
        erori?: Array<{ cod: string; mesaj: string; camp?: string }>;
        avertismente?: Array<{ cod: string; mesaj: string }>;
      };

      const errors = (data.erori || []).map((e) => ({
        code: e.cod,
        message: e.mesaj,
        field: e.camp,
      }));

      const warnings = (data.avertismente || []).map((w) => ({
        code: w.cod,
        message: w.mesaj,
      }));

      return {
        valid: data.valid ?? errors.length === 0,
        errors,
        warnings,
        rawResponse: response.data,
        requestDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      this.logger.error(`XML validation failed: ${errorMessage}`);

      return {
        valid: false,
        errors: [{ code: 'VALIDATION_API_ERROR', message: errorMessage }],
        warnings: [],
        rawResponse: error instanceof AxiosError ? error.response?.data : null,
        requestDurationMs: duration,
      };
    }
  }

  /**
   * Check ANAF API connectivity
   *
   * Performs a simple health check to verify ANAF API is reachable.
   * Does not require authentication.
   *
   * @returns true if API is reachable
   */
  async checkConnectivity(): Promise<boolean> {
    const config = this.getConfig();

    try {
      // Simple HEAD request to base URL
      await this.httpClient.head(config.anaf.baseUrl, {
        timeout: 5000,
      });
      return true;
    } catch (error) {
      this.logger.warn(`ANAF API connectivity check failed: ${this.extractErrorMessage(error)}`);
      return false;
    }
  }

  /**
   * Get current environment info
   */
  getEnvironmentInfo(): { baseUrl: string; isTest: boolean } {
    const config = this.getConfig();
    return {
      baseUrl: config.anaf.baseUrl,
      isTest: config.anaf.isTestEnvironment,
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Extract error message from various error types
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      // Check for ANAF-specific error format
      const data = error.response?.data;
      if (data) {
        if (typeof data === 'string') {
          return data;
        }
        if (typeof data === 'object') {
          const anafData = data as { eroare?: string; message?: string; error?: string };
          if (anafData.eroare) return anafData.eroare;
          if (anafData.message) return anafData.message;
          if (anafData.error) return anafData.error;
        }
      }

      // HTTP status-based messages
      const status = error.response?.status;
      if (status === 401) return 'Authentication failed - OAuth token may be expired';
      if (status === 403) return 'Access forbidden - Check CUI permissions';
      if (status === 404) return 'Resource not found';
      if (status === 429) return 'Rate limit exceeded - Too many requests';
      if (status === 500) return 'ANAF server error';
      if (status === 503) return 'ANAF service unavailable';

      // Network errors
      if (error.code === 'ECONNABORTED') return 'Request timeout';
      if (error.code === 'ECONNREFUSED') return 'Connection refused';
      if (error.code === 'ENOTFOUND') return 'DNS lookup failed';

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
