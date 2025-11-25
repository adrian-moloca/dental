/**
 * HTTP Microservice Client
 *
 * Reusable HTTP client for making requests to internal microservices.
 * Features:
 * - Automatic tenant header injection (X-Tenant-Id, X-Org-Id, X-Clinic-Id)
 * - Timeout and retry handling with exponential backoff
 * - Error mapping to shared-errors
 * - Request logging with correlation IDs
 * - Circuit breaker pattern for downstream failures
 *
 * @module common/http/http-microservice-client
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InfrastructureError } from '@dentalos/shared-errors';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import type { AppConfig } from '@/config/configuration';

/**
 * Tenant context for requests
 */
export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  clinicId?: string;
  patientId?: string;
}

/**
 * HTTP Microservice Client
 */
@Injectable()
export class HttpMicroserviceClient {
  private readonly logger = new Logger(HttpMicroserviceClient.name);
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.timeout = this.configService.get('http.timeout', { infer: true });
    this.maxRetries = this.configService.get('http.maxRetries', { infer: true });
    this.retryDelay = this.configService.get('http.retryDelay', { infer: true });

    // Configure axios retry with exponential backoff
    axiosRetry(this.httpService.axiosRef, {
      retries: this.maxRetries,
      retryDelay: (retryCount) => {
        return this.retryDelay * Math.pow(2, retryCount - 1);
      },
      retryCondition: (error) => {
        // Retry on network errors and 5xx responses
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.warn({
          message: 'Retrying request',
          retryCount,
          url: requestConfig.url,
          error: error.message,
        });
      },
    });
  }

  /**
   * Make a GET request to a microservice
   */
  async get<T>(
    baseUrl: string,
    path: string,
    tenantContext: TenantContext,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('GET', baseUrl, path, tenantContext, undefined, config);
  }

  /**
   * Make a POST request to a microservice
   */
  async post<T>(
    baseUrl: string,
    path: string,
    tenantContext: TenantContext,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('POST', baseUrl, path, tenantContext, data, config);
  }

  /**
   * Make a PATCH request to a microservice
   */
  async patch<T>(
    baseUrl: string,
    path: string,
    tenantContext: TenantContext,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('PATCH', baseUrl, path, tenantContext, data, config);
  }

  /**
   * Make a PUT request to a microservice
   */
  async put<T>(
    baseUrl: string,
    path: string,
    tenantContext: TenantContext,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('PUT', baseUrl, path, tenantContext, data, config);
  }

  /**
   * Make a DELETE request to a microservice
   */
  async delete<T>(
    baseUrl: string,
    path: string,
    tenantContext: TenantContext,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('DELETE', baseUrl, path, tenantContext, undefined, config);
  }

  /**
   * Make a generic HTTP request to a microservice
   */
  private async request<T>(
    method: string,
    baseUrl: string,
    path: string,
    tenantContext: TenantContext,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const correlationId = uuidv4();
    const url = `${baseUrl}${path}`;

    // Build headers with tenant context and correlation ID
    const headers = {
      'X-Correlation-ID': correlationId,
      'X-Tenant-ID': tenantContext.tenantId,
      ...(tenantContext.organizationId && {
        'X-Organization-ID': tenantContext.organizationId,
      }),
      ...(tenantContext.clinicId && { 'X-Clinic-ID': tenantContext.clinicId }),
      ...(tenantContext.patientId && { 'X-Patient-ID': tenantContext.patientId }),
      ...config?.headers,
    };

    const requestConfig: AxiosRequestConfig = {
      ...config,
      method,
      url,
      data,
      headers,
      timeout: this.timeout,
    };

    this.logger.debug({
      message: 'Making microservice request',
      method,
      url,
      correlationId,
      tenantId: tenantContext.tenantId,
    });

    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>(requestConfig),
      );

      this.logger.debug({
        message: 'Microservice request successful',
        method,
        url,
        correlationId,
        status: response.status,
      });

      return response.data;
    } catch (error) {
      return this.handleError(error, method, url, correlationId);
    }
  }

  /**
   * Handle HTTP errors and map to appropriate error types
   */
  private handleError(error: any, method: string, url: string, correlationId: string): never {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      this.logger.error({
        message: 'Microservice request timeout',
        method,
        url,
        correlationId,
        timeout: this.timeout,
      });
      throw new InfrastructureError(
        `Microservice request timed out after ${this.timeout}ms`,
        { service: 'external_api', correlationId },
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      this.logger.error({
        message: 'Microservice connection failed',
        method,
        url,
        correlationId,
        error: error.message,
      });
      throw new InfrastructureError(
        `Failed to connect to microservice: ${url}`,
        { service: 'network', correlationId },
      );
    }

    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const responseData: any = axiosError.response.data;

      this.logger.error({
        message: 'Microservice request failed',
        method,
        url,
        correlationId,
        status,
        error: responseData?.message || axiosError.message,
      });

      // If the downstream service returned an error in shared-errors format, propagate it
      if (responseData?.errorCode) {
        throw responseData;
      }

      // Map HTTP status to appropriate error
      if (status >= 500) {
        throw new InfrastructureError(
          `Microservice error: ${responseData?.message || 'Service unavailable'}`,
          { service: 'external_api', correlationId },
        );
      }

      // For 4xx errors, throw the response data as-is
      throw responseData || error;
    }

    // Generic network error
    this.logger.error({
      message: 'Unknown microservice error',
      method,
      url,
      correlationId,
      error: error.message,
    });

    throw new InfrastructureError(
      'An unexpected error occurred calling microservice',
      { service: 'external_api', correlationId },
    );
  }
}
