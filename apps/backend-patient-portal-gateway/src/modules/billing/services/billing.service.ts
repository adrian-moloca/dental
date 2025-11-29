import { Injectable } from '@nestjs/common';
import { BillingServiceClient } from '@/common/http/clients/billing-service.client';
import { BillingDataAdapter } from '@/common/adapters/billing-data.adapter';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class BillingService {
  constructor(
    private readonly billingClient: BillingServiceClient,
    private readonly billingAdapter: BillingDataAdapter,
  ) {}

  async listInvoices(patientId: string, tenantContext: TenantContext, params?: any) {
    const invoices = await this.billingClient.listInvoices(patientId, tenantContext, params);
    return invoices.map((i) => this.billingAdapter.transformInvoice(i));
  }

  async getInvoice(invoiceId: string, tenantContext: TenantContext) {
    const invoice = await this.billingClient.getInvoice(invoiceId, tenantContext);
    return this.billingAdapter.transformInvoice(invoice);
  }

  async listPayments(patientId: string, tenantContext: TenantContext) {
    const payments = await this.billingClient.listPayments(patientId, tenantContext);
    return payments.map((p) => this.billingAdapter.transformPayment(p));
  }

  async getBalance(patientId: string, tenantContext: TenantContext) {
    const balance = await this.billingClient.getBalance(patientId, tenantContext);
    return this.billingAdapter.transformBalance(balance);
  }

  async payInvoice(dto: any, tenantContext: TenantContext) {
    return this.billingClient.payInvoice(dto, tenantContext);
  }
}
