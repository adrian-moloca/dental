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
  getStockByLocation: (
    locationId: string,
    params?: { productId?: string; lowStock?: boolean; expiringSoon?: boolean }
  ) => client.get(`/stock/locations/${locationId}`, { params }),

  getExpiringItems: (days: number = 30) =>
    client.get('/stock/expiring', { params: { days } }),

  deductStock: (data: {
    items: Array<{ productId: string; quantity: number; locationId?: string }>;
    reference?: string;
    referenceType?: string;
    referenceId?: string;
  }) => client.post('/stock/deduct', data),

  restockItem: (data: {
    productId: string;
    quantity: number;
    locationId: string;
    lotNumber?: string;
    expirationDate?: string;
    unitCost?: number;
    reason?: string;
  }) => client.post('/stock/restock', data),

  // Purchase Orders
  createPurchaseOrder: (data: Partial<PurchaseOrderDto>) =>
    client.post<PurchaseOrderDto>('/purchase-orders', data),

  getPurchaseOrders: (params?: { status?: string }) =>
    client.get<{ data: PurchaseOrderDto[]; total: number }>('/purchase-orders', { params }),

  getPurchaseOrder: (id: string) =>
    client.get<PurchaseOrderDto>(`/purchase-orders/${id}`),

  approvePurchaseOrder: (id: string) =>
    client.put(`/purchase-orders/${id}/approve`),

  // Goods Receipt (receiving PO items)
  createGoodsReceipt: (data: {
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
  }) => client.post('/goods-receipts', data),

  getGoodsReceipts: (params?: { purchaseOrderId?: string; supplierId?: string }) =>
    client.get('/goods-receipts', { params }),
};
