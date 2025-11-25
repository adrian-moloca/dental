/**
 * Billing Data Adapter
 *
 * Transforms internal billing DTOs to patient-friendly formats.
 * Formats amounts, status labels, and due dates.
 *
 * @module common/adapters/billing-data-adapter
 */

import { Injectable } from '@nestjs/common';

export interface PatientFriendlyInvoice {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  subtotal: string;
  tax: string;
  total: string;
  balance: string;
  isPastDue: boolean;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
}

export interface PatientFriendlyPayment {
  paymentId: string;
  date: string;
  amount: string;
  method: string;
  methodLabel: string;
  status: string;
  statusLabel: string;
  transactionId?: string;
}

export interface PatientFriendlyBalance {
  currentBalance: string;
  currentBalanceNumeric: number;
  overdueBalance: string;
  creditBalance: string;
  lastPaymentDate?: string;
  hasOverdueBalance: boolean;
}

@Injectable()
export class BillingDataAdapter {
  /**
   * Transform invoice to patient-friendly format
   */
  transformInvoice(invoice: any): PatientFriendlyInvoice {
    const dueDate = new Date(invoice.dueDate);
    const isPastDue = dueDate < new Date() && invoice.balance > 0;

    return {
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      date: this.formatDate(invoice.invoiceDate),
      dueDate: this.formatDate(invoice.dueDate),
      status: invoice.status,
      statusLabel: this.getStatusLabel(invoice.status),
      statusColor: this.getStatusColor(invoice.status, isPastDue),
      subtotal: this.formatCurrency(invoice.subtotal),
      tax: this.formatCurrency(invoice.tax),
      total: this.formatCurrency(invoice.total),
      balance: this.formatCurrency(invoice.balance),
      isPastDue,
      items: invoice.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.formatCurrency(item.unitPrice),
        total: this.formatCurrency(item.total),
      })),
    };
  }

  /**
   * Transform payment to patient-friendly format
   */
  transformPayment(payment: any): PatientFriendlyPayment {
    return {
      paymentId: payment.paymentId,
      date: this.formatDate(payment.paymentDate),
      amount: this.formatCurrency(payment.amount),
      method: payment.method,
      methodLabel: this.getPaymentMethodLabel(payment.method),
      status: payment.status,
      statusLabel: this.getStatusLabel(payment.status),
      transactionId: payment.transactionId,
    };
  }

  /**
   * Transform balance to patient-friendly format
   */
  transformBalance(balance: any): PatientFriendlyBalance {
    return {
      currentBalance: this.formatCurrency(balance.currentBalance),
      currentBalanceNumeric: balance.currentBalance,
      overdueBalance: this.formatCurrency(balance.overdueBalance),
      creditBalance: this.formatCurrency(balance.creditBalance),
      lastPaymentDate: balance.lastPaymentDate
        ? this.formatDate(balance.lastPaymentDate)
        : undefined,
      hasOverdueBalance: balance.overdueBalance > 0,
    };
  }

  /**
   * Format currency amount
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Format date to readable format
   */
  private formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get human-readable status label
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending: 'Pending',
      paid: 'Paid',
      partially_paid: 'Partially Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
    };
    return labels[status] || status;
  }

  /**
   * Get status color for UI
   */
  private getStatusColor(status: string, isPastDue: boolean): string {
    if (isPastDue) return 'error';

    const colors: Record<string, string> = {
      paid: 'success',
      completed: 'success',
      pending: 'warning',
      partially_paid: 'warning',
      processing: 'info',
      overdue: 'error',
      cancelled: 'default',
      refunded: 'default',
      failed: 'error',
    };
    return colors[status] || 'default';
  }

  /**
   * Get human-readable payment method label
   */
  private getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      cash: 'Cash',
      check: 'Check',
      bank_transfer: 'Bank Transfer',
      insurance: 'Insurance',
      other: 'Other',
    };
    return labels[method] || method;
  }
}
