/**
 * Inventory React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryClient } from '../api/inventoryClient';
import type { ProductDto, PurchaseOrderDto } from '../api/inventoryClient';
import { toast } from 'react-hot-toast';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  products: (params?: any) => [...inventoryKeys.all, 'products', params] as const,
  product: (id: string) => [...inventoryKeys.all, 'product', id] as const,
  stock: (params?: any) => [...inventoryKeys.all, 'stock', params] as const,
  purchaseOrders: (params?: any) => [...inventoryKeys.all, 'purchase-orders', params] as const,
};

// Products
export function useProducts(params?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: inventoryKeys.products(params),
    queryFn: () => inventoryClient.getProducts(params),
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: inventoryKeys.product(id),
    queryFn: () => inventoryClient.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProductDto>) => inventoryClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductDto> }) =>
      inventoryClient.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    },
  });
}

// Stock Management
export function useStockByLocation(
  locationId: string,
  params?: { productId?: string; lowStock?: boolean; expiringSoon?: boolean }
) {
  return useQuery({
    queryKey: inventoryKeys.stock({ locationId, ...params }),
    queryFn: () => inventoryClient.getStockByLocation(locationId, params),
    staleTime: 30_000,
    enabled: !!locationId,
  });
}

export function useExpiringItems(days: number = 30) {
  return useQuery({
    queryKey: [...inventoryKeys.all, 'expiring', days] as const,
    queryFn: () => inventoryClient.getExpiringItems(days),
    staleTime: 60_000,
  });
}

export function useDeductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      items: Array<{ productId: string; quantity: number; locationId?: string }>;
      reference?: string;
      referenceType?: string;
      referenceId?: string;
    }) => inventoryClient.deductStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Stock deducted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to deduct stock');
    },
  });
}

export function useRestockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      quantity: number;
      locationId: string;
      lotNumber?: string;
      expirationDate?: string;
      unitCost?: number;
      reason?: string;
    }) => inventoryClient.restockItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Item restocked successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to restock item');
    },
  });
}

// Purchase Orders
export function usePurchaseOrders(params?: { status?: string }) {
  return useQuery({
    queryKey: inventoryKeys.purchaseOrders(params),
    queryFn: () => inventoryClient.getPurchaseOrders(params),
    staleTime: 30_000,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PurchaseOrderDto>) => inventoryClient.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrders() });
      toast.success('Purchase order created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create purchase order');
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryClient.approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrders() });
      toast.success('Purchase order approved');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve purchase order');
    },
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      purchaseOrderId?: string;
      supplierId: string;
      lines: Array<{
        productId: string;
        receivedQuantity: number;
        unitCost: number;
        lotNumber: string;
        locationId: string;
        expirationDate?: Date;
        notes?: string;
      }>;
      deliveryNote?: string;
      notes?: string;
    }) => inventoryClient.createGoodsReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Goods received successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to receive goods');
    },
  });
}
