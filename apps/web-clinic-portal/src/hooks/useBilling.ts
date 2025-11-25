/**
 * Billing React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingClient } from '../api/billingClient';
import type { InvoiceDto, PaymentDto } from '../api/billingClient';
import { toast } from 'react-hot-toast';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  invoices: (params?: any) => [...billingKeys.all, 'invoices', params] as const,
  invoice: (id: string) => [...billingKeys.all, 'invoice', id] as const,
  payments: (invoiceId: string) => [...billingKeys.all, 'payments', invoiceId] as const,
  patientBalance: (patientId: string) => [...billingKeys.all, 'patient-balance', patientId] as const,
};

// Invoices
export function useInvoices(params?: { patientId?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: billingKeys.invoices(params),
    queryFn: () => billingClient.getInvoices(params),
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: billingKeys.invoice(id),
    queryFn: () => billingClient.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<InvoiceDto>) => billingClient.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create invoice');
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceDto> }) =>
      billingClient.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update invoice');
    },
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingClient.issueInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success('Invoice issued successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to issue invoice');
    },
  });
}

// Payments
export function usePayments(invoiceId: string) {
  return useQuery({
    queryKey: billingKeys.payments(invoiceId),
    queryFn: () => billingClient.getPayments(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: Partial<PaymentDto> }) =>
      billingClient.recordPayment(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoice(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to record payment');
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, amount, reason }: { paymentId: string; amount: number; reason: string }) =>
      billingClient.refundPayment(paymentId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      toast.success('Payment refunded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to refund payment');
    },
  });
}

// Patient Balance
export function usePatientBalance(patientId: string) {
  return useQuery({
    queryKey: billingKeys.patientBalance(patientId),
    queryFn: () => billingClient.getPatientBalance(patientId),
    enabled: !!patientId,
    staleTime: 60_000,
  });
}

// Invoice PDF Download
export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await billingClient.getInvoicePdf(id);
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Invoice PDF downloaded');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to download PDF');
    },
  });
}
