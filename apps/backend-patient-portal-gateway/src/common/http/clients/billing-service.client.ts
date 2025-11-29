/**
 * Billing Service Client
 *
 * Client for making requests to the backend-billing-service microservice.
 *
 * @module common/http/clients/billing-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface Invoice {
  invoiceId: string;
  patientId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  items: Array<{
    itemId: string;
    procedureCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface Payment {
  paymentId: string;
  patientId: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
}

export interface PatientBalance {
  patientId: string;
  currentBalance: number;
  overdueBalance: number;
  creditBalance: number;
  lastPaymentDate?: string;
}

export interface PayInvoiceDto {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentToken?: string;
}

@Injectable()
export class BillingServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.billingServiceUrl', {
      infer: true,
    });
  }

  /**
   * List invoices for patient
   */
  async listInvoices(
    patientId: string,
    tenantContext: TenantContext,
    params?: { status?: string },
  ): Promise<Invoice[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const path = `/api/patients/${patientId}/invoices${query ? `?${query}` : ''}`;

    return this.httpClient.get<Invoice[]>(this.baseUrl, path, tenantContext);
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string, tenantContext: TenantContext): Promise<Invoice> {
    return this.httpClient.get<Invoice>(this.baseUrl, `/api/invoices/${invoiceId}`, tenantContext);
  }

  /**
   * List payments for patient
   */
  async listPayments(patientId: string, tenantContext: TenantContext): Promise<Payment[]> {
    return this.httpClient.get<Payment[]>(
      this.baseUrl,
      `/api/patients/${patientId}/payments`,
      tenantContext,
    );
  }

  /**
   * Get patient balance
   */
  async getBalance(patientId: string, tenantContext: TenantContext): Promise<PatientBalance> {
    return this.httpClient.get<PatientBalance>(
      this.baseUrl,
      `/api/patients/${patientId}/balance`,
      tenantContext,
    );
  }

  /**
   * Pay invoice
   */
  async payInvoice(dto: PayInvoiceDto, tenantContext: TenantContext): Promise<Payment> {
    return this.httpClient.post<Payment>(
      this.baseUrl,
      `/api/invoices/${dto.invoiceId}/pay`,
      tenantContext,
      dto,
    );
  }
}
