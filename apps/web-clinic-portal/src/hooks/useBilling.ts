/**
 * Billing React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingClient } from '../api/billingClient';
import type { InvoiceDto, PaymentDto, RecordPaymentRequest, RecordPaymentResponse } from '../api/billingClient';
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

export function useRecordPaymentBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentRequest) => billingClient.recordPaymentBatch(data),
    onMutate: async (variables) => {
      // Optimistic update: reduce balance immediately
      if (variables.invoiceId) {
        await queryClient.cancelQueries({ queryKey: billingKeys.invoice(variables.invoiceId) });
        const previousInvoice = queryClient.getQueryData<{ data: InvoiceDto }>(
          billingKeys.invoice(variables.invoiceId)
        );

        if (previousInvoice?.data) {
          queryClient.setQueryData(billingKeys.invoice(variables.invoiceId), {
            ...previousInvoice,
            data: {
              ...previousInvoice.data,
              amountPaid: previousInvoice.data.amountPaid + variables.totalAmount,
              balance: Math.max(0, previousInvoice.data.balance - variables.totalAmount),
              status: previousInvoice.data.balance - variables.totalAmount <= 0 ? 'paid' : 'partially_paid',
            },
          });
        }

        return { previousInvoice };
      }

      if (variables.patientId) {
        await queryClient.cancelQueries({ queryKey: billingKeys.patientBalance(variables.patientId) });
        const previousBalance = queryClient.getQueryData<{ data: { currentBalance: number } }>(
          billingKeys.patientBalance(variables.patientId)
        );

        if (previousBalance?.data) {
          queryClient.setQueryData(billingKeys.patientBalance(variables.patientId), {
            ...previousBalance,
            data: {
              ...previousBalance.data,
              currentBalance: Math.max(0, previousBalance.data.currentBalance - variables.totalAmount),
            },
          });
        }

        return { previousBalance };
      }

      return {};
    },
    onSuccess: (response, variables) => {
      // Invalidate relevant queries
      if (variables.invoiceId) {
        queryClient.invalidateQueries({ queryKey: billingKeys.payments(variables.invoiceId) });
        queryClient.invalidateQueries({ queryKey: billingKeys.invoice(variables.invoiceId) });
      }
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: billingKeys.patientBalance(variables.patientId) });
      }
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success('Plata inregistrata cu succes');
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update
      if (variables.invoiceId && context?.previousInvoice) {
        queryClient.setQueryData(billingKeys.invoice(variables.invoiceId), context.previousInvoice);
      }
      if (variables.patientId && context?.previousBalance) {
        queryClient.setQueryData(billingKeys.patientBalance(variables.patientId), context.previousBalance);
      }
      toast.error(error?.response?.data?.message || 'Eroare la inregistrarea platii');
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
