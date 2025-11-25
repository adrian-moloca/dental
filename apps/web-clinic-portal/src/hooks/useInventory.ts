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
export function useStock(params?: { locationId?: string; lowStock?: boolean }) {
  return useQuery({
    queryKey: inventoryKeys.stock(params),
    queryFn: () => inventoryClient.getStock(params),
    staleTime: 30_000,
  });
}

export function useDeductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity, reference }: { productId: string; quantity: number; reference?: string }) =>
      inventoryClient.deductStock(productId, quantity, reference),
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
    mutationFn: ({ productId, quantity, reference }: { productId: string; quantity: number; reference?: string }) =>
      inventoryClient.restockItem(productId, quantity, reference),
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

export function useUpdatePOStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inventoryClient.updatePOStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrders() });
      toast.success('Purchase order status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useReceiveGoods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: Array<{ productId: string; quantityReceived: number }> }) =>
      inventoryClient.receiveGoods(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Goods received successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to receive goods');
    },
  });
}
