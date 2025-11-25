/**
 * Billing API Client - Invoices, Payments, Insurance
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.BILLING_API_URL);

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  status: 'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  currency: string;
  items: InvoiceItemDto[];
}

export interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  procedureCode?: string;
}

export interface PaymentDto {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'ach' | 'check' | 'split';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  recordedAt: string;
  notes?: string;
}

export interface PatientBalanceDto {
  patientId: string;
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  overdueDays: number;
  lastPaymentDate?: string;
}

export const billingClient = {
  // Invoices
  createInvoice: (data: Partial<InvoiceDto>) =>
    client.post<InvoiceDto>('/invoices', data),

  getInvoices: (params?: { patientId?: string; status?: string; page?: number; limit?: number }) =>
    client.get<{ data: InvoiceDto[]; total: number }>('/invoices', { params }),

  getInvoice: (id: string) =>
    client.get<InvoiceDto>(`/invoices/${id}`),

  updateInvoice: (id: string, data: Partial<InvoiceDto>) =>
    client.patch<InvoiceDto>(`/invoices/${id}`, data),

  issueInvoice: (id: string) =>
    client.post<InvoiceDto>(`/invoices/${id}/issue`),

  // Payments
  recordPayment: (invoiceId: string, data: Partial<PaymentDto>) =>
    client.post<PaymentDto>(`/invoices/${invoiceId}/payments`, data),

  getPayments: (invoiceId: string) =>
    client.get<PaymentDto[]>(`/invoices/${invoiceId}/payments`),

  refundPayment: (paymentId: string, amount: number, reason: string) =>
    client.post(`/payments/${paymentId}/refund`, { amount, reason }),

  // Patient Balance
  getPatientBalance: (patientId: string) =>
    client.get<PatientBalanceDto>(`/patient-balances/${patientId}`),

  // PDF Generation
  getInvoicePdf: (id: string) =>
    client.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};
