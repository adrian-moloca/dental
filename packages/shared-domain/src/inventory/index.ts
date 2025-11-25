/**
 * Inventory Domain Module
 *
 * Exports all inventory, procurement, and stock automation types.
 *
 * @module shared-domain/inventory
 */

// ============================================================================
// Branded Types
// ============================================================================
export type {
  ProductId,
  ProductVariantId,
  SupplierId,
  PurchaseOrderId,
  GoodsReceiptId,
  StockItemId,
  LotId,
  StockLocationId,
  StockMovementId,
  SterilizationCycleId,
  BOMId,
  Currency,
} from './inventory.types';

// ============================================================================
// Product Catalog
// ============================================================================
export {
  ProductCategory,
  UnitOfMeasure,
  ProductStatus,
} from './inventory.types';

export type {
  ProductVariant,
  Product,
} from './inventory.types';

// ============================================================================
// Stock Management
// ============================================================================
export {
  StockStatus,
  MovementType,
} from './inventory.types';

export type {
  StockLocation,
  StockMovement,
  StockItem,
} from './inventory.types';

// ============================================================================
// Lot & Expiration Tracking
// ============================================================================
export {
  LotStatus,
} from './inventory.types';

export type {
  Lot,
  ExpirationWarning,
  FEFORule,
} from './inventory.types';

// ============================================================================
// Procurement
// ============================================================================
export {
  PurchaseOrderStatus,
  SupplierStatus,
} from './inventory.types';

export type {
  PurchaseOrderItem,
  PurchaseOrder,
  GoodsReceiptItem,
  GoodsReceipt,
  Supplier,
} from './inventory.types';

// ============================================================================
// Procedure Materials & Costing
// ============================================================================
export type {
  MaterialUsage,
  ProcedureBillOfMaterials,
  CostAllocation,
} from './inventory.types';

// ============================================================================
// Sterilization Integration (Feature 12)
// ============================================================================
export type {
  SterilizationCycleReference,
  SterilizableProduct,
  InstrumentCycleTracking,
} from './inventory.types';
