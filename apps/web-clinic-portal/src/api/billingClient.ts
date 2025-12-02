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
  createdAt?: string;
  updatedAt?: string;
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
  patientId: string;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'ach' | 'check' | 'split' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate?: string;
  currency?: string;
  reference?: string;
  recordedAt?: string;
  notes?: string;
  transactionId?: string;
  confirmationNumber?: string;
  refundedAmount?: number;
  createdAt?: string;
}

export interface SplitPaymentDto {
  method: PaymentDto['paymentMethod'];
  amount: number;
  transactionId?: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  patientId: string;
  paymentDate: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentDto['paymentMethod'];
  transactionId?: string;
  confirmationNumber?: string;
  splitPayments?: SplitPaymentDto[];
  notes?: string;
}

export interface CreateRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RecordPaymentRequest {
  invoiceId?: string;
  patientId?: string;
  totalAmount: number;
  payments: Array<{
    amount: number;
    method: 'cash' | 'card' | 'check' | 'bank_transfer';
    reference?: string;
  }>;
  notes?: string;
}

export interface RecordPaymentResponse {
  id: string;
  invoiceId?: string;
  patientId?: string;
  totalAmount: number;
  payments: PaymentDto[];
  newBalance: number;
  recordedAt: string;
  recordedBy: string;
}

export interface PatientBalanceDto {
  patientId: string;
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  overdueAmount?: number;
  overdueDays?: number;
  lastPaymentDate?: string;
  currency?: string;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceDto['status'];
  reason?: string;
}

export interface SendInvoiceRequest {
  email: string;
}

export interface CancelInvoiceRequest {
  reason: string;
}

export interface InvoiceFromAppointmentRequest {
  appointmentId: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  procedures: Array<{
    procedureId: string;
    procedureCode: string;
    procedureName: string;
    tooth?: string;
    surfaces?: string[];
    quantity?: number;
    unitPrice: number;
    discountPercent?: number;
    providerId?: string;
    commissionRate?: number;
    taxExempt?: boolean;
    taxExemptionReason?: string;
  }>;
  treatmentPlanId?: string;
  customerName?: string;
  customerAddress?: string;
  customerTaxId?: string;
  customerEmail?: string;
  series?: string;
  paymentTerms?: string;
  dueDate?: string;
  notes?: string;
  autoIssue?: boolean;
  currency?: string;
}

export const billingClient = {
  // ============================================
  // Invoices
  // ============================================
  
  createInvoice: (data: Partial<InvoiceDto>) =>
    client.post<InvoiceDto>('/invoices', data),

  getInvoices: (params?: { patientId?: string; providerId?: string; status?: string; page?: number; limit?: number; fromDate?: string; toDate?: string }) =>
    client.get<{ data: InvoiceDto[]; total: number }>('/invoices', { params }),

  getInvoice: (id: string) =>
    client.get<InvoiceDto>(`/invoices/${id}`),

  updateInvoice: (id: string, data: Partial<InvoiceDto>) =>
    client.patch<InvoiceDto>(`/invoices/${id}`, data),

  updateInvoiceStatus: (id: string, data: UpdateInvoiceStatusRequest) =>
    client.patch<InvoiceDto>(`/invoices/${id}/status`, data),

  issueInvoice: (id: string) =>
    client.post<InvoiceDto>(`/invoices/${id}/issue`),

  sendInvoice: (id: string, data: SendInvoiceRequest) =>
    client.post<InvoiceDto>(`/invoices/${id}/send`, data),

  cancelInvoice: (id: string, data: CancelInvoiceRequest) =>
    client.delete<any>(`/invoices/${id}`, { data }),

  createFromAppointment: (appointmentId: string, data: Partial<InvoiceFromAppointmentRequest>) =>
    client.post<any>(`/invoices/from-appointment/${appointmentId}`, data),

  // ============================================
  // Invoice Items
  // ============================================

  getInvoiceItems: (invoiceId: string) =>
    client.get<InvoiceItemDto[]>(`/invoices/${invoiceId}/items`),

  addInvoiceItem: (invoiceId: string, data: Partial<InvoiceItemDto>) =>
    client.post<InvoiceItemDto>(`/invoices/${invoiceId}/items`, data),

  removeInvoiceItem: (invoiceId: string, itemId: string) =>
    client.delete(`/invoices/${invoiceId}/items/${itemId}`),

  // ============================================
  // Payments
  // ============================================

  recordPayment: (invoiceId: string, data: CreatePaymentRequest) =>
    client.post<PaymentDto>(`/invoices/${invoiceId}/payments`, data),

  recordPaymentBatch: (data: CreatePaymentRequest) =>
    client.post<PaymentDto>('/payments', data),

  getPaymentsByInvoice: (invoiceId: string) =>
    client.get<PaymentDto[]>(`/invoices/${invoiceId}/payments`),

  getPaymentById: (paymentId: string) =>
    client.get<PaymentDto>(`/payments/${paymentId}`),

  getPayments: (params?: { invoiceId?: string; patientId?: string }) =>
    client.get<PaymentDto[]>('/payments', { params }),

  refundPayment: (data: CreateRefundRequest) =>
    client.post<any>('/payments/refund', data),

  // ============================================
  // Patient Balance
  // ============================================

  getPatientBalance: (patientId: string) =>
    client.get<PatientBalanceDto>(`/patient-balances/${patientId}`),

  // ============================================
  // PDF Generation
  // ============================================

  getInvoicePdf: (id: string) =>
    client.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};
