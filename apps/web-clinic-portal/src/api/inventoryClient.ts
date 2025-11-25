/**
 * Inventory API Client - Products, Stock, Purchase Orders
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.INVENTORY_API_URL);

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  unitPrice: number;
  currency: string;
  stock: {
    current: number;
    reserved: number;
    available: number;
    reorderLevel: number;
  };
  status: 'active' | 'inactive' | 'discontinued';
}

export interface PurchaseOrderDto {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'pending' | 'ordered' | 'partial_received' | 'received';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  total: number;
  orderDate: string;
  expectedDeliveryDate: string;
}

export interface StockMovementDto {
  id: string;
  productId: string;
  type: 'receipt' | 'consumption' | 'adjustment' | 'transfer';
  quantity: number;
  reference?: string;
  notes?: string;
  performedAt: string;
}

export const inventoryClient = {
  // Products
  createProduct: (data: Partial<ProductDto>) =>
    client.post<ProductDto>('/products', data),

  getProducts: (params?: { category?: string; status?: string; search?: string }) =>
    client.get<{ data: ProductDto[]; total: number }>('/products', { params }),

  getProduct: (id: string) =>
    client.get<ProductDto>(`/products/${id}`),

  updateProduct: (id: string, data: Partial<ProductDto>) =>
    client.patch<ProductDto>(`/products/${id}`, data),

  // Stock
  getStock: (params?: { locationId?: string; lowStock?: boolean }) =>
    client.get('/stock', { params }),

  deductStock: (productId: string, quantity: number, reference?: string) =>
    client.post('/stock/deduct', { productId, quantity, reference }),

  restockItem: (productId: string, quantity: number, reference?: string) =>
    client.post('/stock/restock', { productId, quantity, reference }),

  // Purchase Orders
  createPurchaseOrder: (data: Partial<PurchaseOrderDto>) =>
    client.post<PurchaseOrderDto>('/purchase-orders', data),

  getPurchaseOrders: (params?: { status?: string }) =>
    client.get<{ data: PurchaseOrderDto[]; total: number }>('/purchase-orders', { params }),

  updatePOStatus: (id: string, status: string) =>
    client.patch(`/purchase-orders/${id}/status`, { status }),

  receiveGoods: (id: string, items: Array<{ productId: string; quantityReceived: number }>) =>
    client.post(`/purchase-orders/${id}/receive`, { items }),
};
