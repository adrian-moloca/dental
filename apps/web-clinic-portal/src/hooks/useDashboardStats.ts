/**
 * Dashboard Statistics React Query Hooks
 *
 * Aggregates data from multiple services for the dashboard overview
 */

import { useQuery } from '@tanstack/react-query';
import { patientsClient } from '../api/patientsClient';
import { schedulingClient } from '../api/schedulingClient';
import { billingClient } from '../api/billingClient';
import { inventoryClient } from '../api/inventoryClient';

/**
 * Get total patients count
 */
export const useTotalPatientsCount = () => {
  return useQuery({
    queryKey: ['dashboard', 'patients', 'count'],
    queryFn: async () => {
      const response = await patientsClient.search({ page: 1, limit: 1 });
      return response.data?.total || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

/**
 * Get today's appointments count and breakdown
 */
export const useTodaysAppointments = () => {
  return useQuery({
    queryKey: ['dashboard', 'appointments', 'today'],
    queryFn: async () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const response = await schedulingClient.list({
        startDate: startOfDay as any,
        endDate: endOfDay as any,
      });

      const appointments = response.data || [];
      const total = appointments.length;
      const pending = appointments.filter(
        (apt) => apt.status === 'pending' || apt.status === 'confirmed'
      ).length;
      const completed = appointments.filter((apt) => apt.status === 'completed').length;
      const cancelled = appointments.filter((apt) => apt.status === 'cancelled').length;
      const inProgress = appointments.filter((apt) => apt.status === 'in_progress').length;

      return {
        total,
        pending,
        completed,
        cancelled,
        inProgress,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

/**
 * Get outstanding balance across all patients
 */
export const useOutstandingBalance = () => {
  return useQuery({
    queryKey: ['dashboard', 'billing', 'outstanding'],
    queryFn: async () => {
      const response = await billingClient.getInvoices({
        status: 'issued',
        limit: 1000, // Get all outstanding invoices
      });

      const invoices = response.data?.data || [];
      const totalOutstanding = invoices.reduce((sum, invoice) => {
        return sum + (invoice.balance || 0);
      }, 0);

      const overdueInvoices = invoices.filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate < new Date();
      });
      const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.balance, 0);

      return {
        total: totalOutstanding,
        overdue: overdueAmount,
        invoiceCount: invoices.length,
        overdueCount: overdueInvoices.length,
        currency: invoices[0]?.currency || 'USD',
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

/**
 * Get low stock items count
 */
export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['dashboard', 'inventory', 'low-stock'],
    queryFn: async () => {
      const response = await inventoryClient.getProducts({
        status: 'active',
      });

      const products = response.data?.data || [];
      const lowStockItems = products.filter((product) => {
        return product.stock.available <= product.stock.reorderLevel;
      });

      const criticalItems = lowStockItems.filter((product) => {
        return product.stock.available === 0;
      });

      return {
        count: lowStockItems.length,
        criticalCount: criticalItems.length,
        items: lowStockItems.slice(0, 5), // Top 5 for quick view
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

/**
 * Aggregate all dashboard stats in a single hook
 * Useful for loading all stats at once
 */
export const useDashboardStats = () => {
  const patientsCount = useTotalPatientsCount();
  const appointments = useTodaysAppointments();
  const balance = useOutstandingBalance();
  const inventory = useLowStockItems();

  return {
    patients: patientsCount,
    appointments,
    balance,
    inventory,
    isLoading:
      patientsCount.isLoading ||
      appointments.isLoading ||
      balance.isLoading ||
      inventory.isLoading,
    isError:
      patientsCount.isError ||
      appointments.isError ||
      balance.isError ||
      inventory.isError,
  };
};
