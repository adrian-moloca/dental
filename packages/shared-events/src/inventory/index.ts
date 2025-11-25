/**
 * Inventory Events Module
 *
 * Re-exports all inventory-related domain events for stock management,
 * procurement, and material traceability.
 *
 * @module shared-events/inventory
 */

// Event type constants
export {
  STOCK_DEDUCTED_EVENT,
  STOCK_RESTOCKED_EVENT,
  STOCK_LOW_EVENT,
  STOCK_EXPIRED_EVENT,
  PURCHASE_ORDER_CREATED_EVENT,
  GOODS_RECEIPT_CREATED_EVENT,
} from './inventory.events';

// Event version constants
export {
  STOCK_DEDUCTED_VERSION,
  STOCK_RESTOCKED_VERSION,
  STOCK_LOW_VERSION,
  STOCK_EXPIRED_VERSION,
  PURCHASE_ORDER_CREATED_VERSION,
  GOODS_RECEIPT_CREATED_VERSION,
} from './inventory.events';

// Enumerations and shared types
export type {
  StockDeductionReason,
  StockRestockReason,
  ExpiredStockAction,
  PurchaseOrderUrgency,
  GoodsReceiptItem,
} from './inventory.events';

// Event payloads
export type {
  StockDeductedPayload,
  StockRestockedPayload,
  StockLowPayload,
  StockExpiredPayload,
  PurchaseOrderCreatedPayload,
  GoodsReceiptCreatedPayload,
} from './inventory.events';

// Event envelopes
export type {
  StockDeductedEvent,
  StockRestockedEvent,
  StockLowEvent,
  StockExpiredEvent,
  PurchaseOrderCreatedEvent,
  GoodsReceiptCreatedEvent,
} from './inventory.events';

// Type guards
export {
  isStockDeductedEvent,
  isStockRestockedEvent,
  isStockLowEvent,
  isStockExpiredEvent,
  isPurchaseOrderCreatedEvent,
  isGoodsReceiptCreatedEvent,
} from './inventory.events';

// Factory functions
export {
  createStockDeductedEvent,
  createStockRestockedEvent,
  createStockLowEvent,
  createStockExpiredEvent,
  createPurchaseOrderCreatedEvent,
  createGoodsReceiptCreatedEvent,
} from './inventory.events';
