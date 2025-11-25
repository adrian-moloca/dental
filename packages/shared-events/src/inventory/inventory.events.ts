/**
 * Inventory Events
 *
 * Domain events for inventory management, stock tracking, procurement, and
 * material traceability. These events power the automated inventory system
 * with FEFO/FIFO deduction, reorder triggers, and cost tracking.
 *
 * These events are consumed by:
 * - Inventory Management System (stock tracking, lot management, FEFO/FIFO)
 * - Procurement System (reorder automation, purchase order management)
 * - Billing System (cost tracking, COGS calculation, material charges)
 * - Clinical Module (procedure-based stock consumption)
 * - Analytics Platform (usage patterns, inventory turnover, cost analysis)
 * - Automation Engine (reorder triggers, expiration alerts)
 * - Compliance/Audit Systems (material traceability, lot tracking)
 *
 * @module shared-events/inventory
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

// ============================================================================
// EVENT TYPE CONSTANTS
// ============================================================================

/**
 * Stock deducted event type constant
 */
export const STOCK_DEDUCTED_EVENT = 'dental.inventory.stock.deducted' as const;

/**
 * Stock restocked event type constant
 */
export const STOCK_RESTOCKED_EVENT = 'dental.inventory.stock.restocked' as const;

/**
 * Stock low event type constant
 */
export const STOCK_LOW_EVENT = 'dental.inventory.stock.low' as const;

/**
 * Stock expired event type constant
 */
export const STOCK_EXPIRED_EVENT = 'dental.inventory.stock.expired' as const;

/**
 * Purchase order created event type constant
 */
export const PURCHASE_ORDER_CREATED_EVENT = 'dental.inventory.purchase-order.created' as const;

/**
 * Goods receipt created event type constant
 */
export const GOODS_RECEIPT_CREATED_EVENT = 'dental.inventory.goods-receipt.created' as const;

// ============================================================================
// EVENT VERSION CONSTANTS
// ============================================================================

export const STOCK_DEDUCTED_VERSION = 1;
export const STOCK_RESTOCKED_VERSION = 1;
export const STOCK_LOW_VERSION = 1;
export const STOCK_EXPIRED_VERSION = 1;
export const PURCHASE_ORDER_CREATED_VERSION = 1;
export const GOODS_RECEIPT_CREATED_VERSION = 1;

// ============================================================================
// ENUMERATIONS AND SHARED TYPES
// ============================================================================

/**
 * Stock deduction reason enumeration
 * Used for audit trails and analytics to understand stock consumption patterns
 */
export type StockDeductionReason =
  | 'PROCEDURE_CONSUMPTION' // Used during a dental procedure
  | 'ADJUSTMENT_NEGATIVE' // Manual adjustment (negative)
  | 'TRANSFER_OUT' // Transferred to another location
  | 'DISPOSAL' // Disposed (expired, damaged)
  | 'LOST' // Lost or missing
  | 'SAMPLE' // Used as sample
  | 'WASTAGE' // Wasted/damaged during use
  | 'RETURN_TO_SUPPLIER' // Returned to supplier
  | 'OTHER';

/**
 * Stock restock reason enumeration
 */
export type StockRestockReason =
  | 'PURCHASE_ORDER_RECEIVED' // Received from supplier
  | 'TRANSFER_IN' // Transferred from another location
  | 'ADJUSTMENT_POSITIVE' // Manual adjustment (positive)
  | 'RETURN_FROM_PROCEDURE' // Returned unused from procedure
  | 'FOUND' // Previously missing, now found
  | 'OTHER';

/**
 * Stock action enumeration for expired items
 */
export type ExpiredStockAction =
  | 'QUARANTINE' // Move to quarantine location
  | 'DISPOSE' // Dispose of the item
  | 'RETURN' // Return to supplier
  | 'EXTEND_EXPIRY' // Extend expiration date (with authorization)
  | 'USE_IMMEDIATELY'; // Approved for immediate use

/**
 * Purchase order urgency level
 */
export type PurchaseOrderUrgency =
  | 'ROUTINE' // Standard procurement
  | 'EXPEDITED' // Faster than normal
  | 'URGENT' // High priority
  | 'EMERGENCY'; // Critical, immediate need

/**
 * Item received in goods receipt
 * Used to track individual items in a shipment
 */
export interface GoodsReceiptItem {
  /** Product ID from catalog */
  productId: UUID;
  /** Product name for display */
  productName: string;
  /** SKU or product code */
  sku?: string;
  /** Quantity received */
  quantityReceived: number;
  /** Unit of measure */
  unitOfMeasure: string;
  /** Lot number assigned */
  lotNumber: string;
  /** Expiration date */
  expirationDate?: ISODateString;
  /** Unit cost */
  unitCost?: number;
  /** Line total cost */
  lineTotalCost?: number;
  /** Location where item was received */
  locationId?: UUID;
}

// ============================================================================
// 1. STOCK DEDUCTED EVENT
// ============================================================================

/**
 * Stock deducted event payload
 *
 * Published when inventory is consumed or deducted from stock.
 * Critical for:
 * - Real-time inventory tracking with FEFO/FIFO compliance
 * - Billing system integration (material cost allocation)
 * - Clinical procedure tracking (materials used)
 * - Analytics (usage patterns, cost per procedure)
 * - Audit trails (lot traceability)
 *
 * @example
 * ```typescript
 * const payload: StockDeductedPayload = {
 *   productId: '123e4567-e89b-12d3-a456-426614174000',
 *   productName: 'Composite Resin - A2 Shade',
 *   sku: 'COMP-A2-3M',
 *   quantity: 1.5,
 *   unitOfMeasure: 'g',
 *   lotNumber: 'LOT-2025-001',
 *   expirationDate: '2026-12-31',
 *   locationId: 'loc-123',
 *   procedureId: 'proc-456',
 *   providerId: 'provider-789',
 *   reason: 'PROCEDURE_CONSUMPTION',
 *   costValue: 12.50,
 *   timestamp: '2025-11-20T15:00:00Z',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   clinicId: 'clinic-789',
 * };
 * ```
 */
export interface StockDeductedPayload {
  /** Product identifier from catalog */
  productId: UUID;

  /** Product name for display and reporting */
  productName: string;

  /** SKU or product code */
  sku: string;

  /** Quantity deducted (must be positive) */
  quantity: number;

  /** Unit of measure (e.g., 'unit', 'g', 'ml', 'box') */
  unitOfMeasure: string;

  /** Lot/batch number for traceability */
  lotNumber: string;

  /** Expiration date of the lot */
  expirationDate?: ISODateString;

  /** Storage location ID where stock was deducted */
  locationId: UUID;

  /** Location name for display */
  locationName?: string;

  /** Procedure ID if consumed during a procedure */
  procedureId?: UUID;

  /** Procedure code (CDT) if applicable */
  procedureCode?: string;

  /** Procedure name for display */
  procedureName?: string;

  /** Patient ID if consumed for a patient */
  patientId?: UUID;

  /** Patient name for display and audit */
  patientName?: string;

  /** Provider who consumed/deducted the item */
  providerId: UUID;

  /** Provider name for display */
  providerName?: string;

  /** Reason for deduction */
  reason: StockDeductionReason;

  /** Additional notes or justification */
  notes?: string;

  /** Cost/value of the deducted stock (for COGS calculation) */
  costValue: number;

  /** Currency code (e.g., 'USD', 'EUR') */
  currency?: string;

  /** Timestamp when stock was deducted */
  timestamp: ISODateString;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where deduction occurred */
  clinicId: ClinicId;

  /** User who performed the deduction (may differ from provider) */
  deductedBy?: UUID;

  /** User name for audit */
  deductedByName?: string;

  /** Stock movement ID for linking to stock_moves table */
  stockMovementId?: UUID;

  /** Remaining quantity in this lot after deduction */
  remainingQuantity?: number;

  /** Whether this deduction triggered low stock alert */
  triggeredLowStockAlert?: boolean;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Stock deducted event envelope
 */
export type StockDeductedEvent = EventEnvelope<StockDeductedPayload>;

/**
 * Type guard to check if an event is a StockDeductedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a StockDeductedEvent
 */
export function isStockDeductedEvent(
  event: EventEnvelope<unknown>
): event is StockDeductedEvent {
  return event.type === STOCK_DEDUCTED_EVENT;
}

/**
 * Factory function to create a StockDeductedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createStockDeductedEvent(
  payload: StockDeductedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): StockDeductedEvent {
  // Validate critical required fields
  if (!payload.productId) {
    throw new Error('StockDeductedEvent: productId is required');
  }
  if (!payload.productName || payload.productName.trim().length === 0) {
    throw new Error('StockDeductedEvent: productName is required and cannot be empty');
  }
  if (!payload.sku || payload.sku.trim().length === 0) {
    throw new Error('StockDeductedEvent: sku is required and cannot be empty');
  }
  if (payload.quantity === undefined || payload.quantity === null) {
    throw new Error('StockDeductedEvent: quantity is required');
  }
  if (payload.quantity <= 0) {
    throw new Error('StockDeductedEvent: quantity must be positive');
  }
  if (!payload.unitOfMeasure || payload.unitOfMeasure.trim().length === 0) {
    throw new Error('StockDeductedEvent: unitOfMeasure is required and cannot be empty');
  }
  if (!payload.lotNumber || payload.lotNumber.trim().length === 0) {
    throw new Error('StockDeductedEvent: lotNumber is required and cannot be empty');
  }
  if (!payload.locationId) {
    throw new Error('StockDeductedEvent: locationId is required');
  }
  if (!payload.providerId) {
    throw new Error('StockDeductedEvent: providerId is required');
  }
  if (!payload.reason) {
    throw new Error('StockDeductedEvent: reason is required');
  }
  if (payload.costValue === undefined || payload.costValue === null) {
    throw new Error('StockDeductedEvent: costValue is required');
  }
  if (payload.costValue < 0) {
    throw new Error('StockDeductedEvent: costValue cannot be negative');
  }
  if (!payload.timestamp) {
    throw new Error('StockDeductedEvent: timestamp is required');
  }
  if (!payload.tenantId) {
    throw new Error('StockDeductedEvent: tenantId is required');
  }
  if (!payload.organizationId) {
    throw new Error('StockDeductedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('StockDeductedEvent: clinicId is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: STOCK_DEDUCTED_EVENT,
    version: STOCK_DEDUCTED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 2. STOCK RESTOCKED EVENT
// ============================================================================

/**
 * Stock restocked event payload
 *
 * Published when inventory is added to stock (goods receipt, transfer in,
 * positive adjustment). Critical for:
 * - Real-time inventory tracking
 * - Lot tracking and expiry management
 * - Purchase order fulfillment tracking
 * - Cost basis calculation (FIFO/weighted average)
 * - Analytics (procurement patterns, supplier performance)
 *
 * @example
 * ```typescript
 * const payload: StockRestockedPayload = {
 *   productId: '123e4567-e89b-12d3-a456-426614174000',
 *   productName: 'Composite Resin - A2 Shade',
 *   quantity: 50,
 *   unitOfMeasure: 'g',
 *   lotNumber: 'LOT-2025-002',
 *   expirationDate: '2027-01-31',
 *   locationId: 'loc-123',
 *   goodsReceiptId: 'grn-456',
 *   purchaseOrderId: 'po-789',
 *   receivedBy: 'user-101',
 *   costValue: 250.00,
 *   timestamp: '2025-11-20T10:00:00Z',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   clinicId: 'clinic-789',
 * };
 * ```
 */
export interface StockRestockedPayload {
  /** Product identifier from catalog */
  productId: UUID;

  /** Product name for display and reporting */
  productName: string;

  /** SKU or product code */
  sku?: string;

  /** Quantity added (must be positive) */
  quantity: number;

  /** Unit of measure (e.g., 'unit', 'g', 'ml', 'box') */
  unitOfMeasure: string;

  /** Lot/batch number assigned to this stock */
  lotNumber: string;

  /** Expiration date of the lot */
  expirationDate?: ISODateString;

  /** Storage location ID where stock was added */
  locationId: UUID;

  /** Location name for display */
  locationName?: string;

  /** Goods receipt ID if restocked from goods receipt */
  goodsReceiptId?: UUID;

  /** Goods receipt number for display */
  goodsReceiptNumber?: string;

  /** Purchase order ID if linked to PO */
  purchaseOrderId?: UUID;

  /** Purchase order number for display */
  purchaseOrderNumber?: string;

  /** Supplier ID if received from supplier */
  supplierId?: UUID;

  /** Supplier name for display */
  supplierName?: string;

  /** User who received/restocked the item */
  receivedBy: UUID;

  /** Receiver name for display and audit */
  receivedByName?: string;

  /** Reason for restocking */
  reason?: StockRestockReason;

  /** Additional notes */
  notes?: string;

  /** Total cost/value of the restocked items */
  costValue: number;

  /** Unit cost per item */
  unitCost?: number;

  /** Currency code (e.g., 'USD', 'EUR') */
  currency?: string;

  /** Timestamp when stock was restocked */
  timestamp: ISODateString;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where restock occurred */
  clinicId: ClinicId;

  /** Stock movement ID for linking to stock_moves table */
  stockMovementId?: UUID;

  /** New total quantity in this lot after restocking */
  newTotalQuantity?: number;

  /** Whether this restock resolved a low stock condition */
  resolvedLowStockAlert?: boolean;

  /** Quality control status */
  qualityControlStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';

  /** Quality control notes */
  qualityControlNotes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Stock restocked event envelope
 */
export type StockRestockedEvent = EventEnvelope<StockRestockedPayload>;

/**
 * Type guard to check if an event is a StockRestockedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a StockRestockedEvent
 */
export function isStockRestockedEvent(
  event: EventEnvelope<unknown>
): event is StockRestockedEvent {
  return event.type === STOCK_RESTOCKED_EVENT;
}

/**
 * Factory function to create a StockRestockedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createStockRestockedEvent(
  payload: StockRestockedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): StockRestockedEvent {
  // Validate critical required fields
  if (!payload.productId) {
    throw new Error('StockRestockedEvent: productId is required');
  }
  if (!payload.productName || payload.productName.trim().length === 0) {
    throw new Error('StockRestockedEvent: productName is required and cannot be empty');
  }
  if (payload.quantity === undefined || payload.quantity === null) {
    throw new Error('StockRestockedEvent: quantity is required');
  }
  if (payload.quantity <= 0) {
    throw new Error('StockRestockedEvent: quantity must be positive');
  }
  if (!payload.unitOfMeasure || payload.unitOfMeasure.trim().length === 0) {
    throw new Error('StockRestockedEvent: unitOfMeasure is required and cannot be empty');
  }
  if (!payload.lotNumber || payload.lotNumber.trim().length === 0) {
    throw new Error('StockRestockedEvent: lotNumber is required and cannot be empty');
  }
  if (!payload.locationId) {
    throw new Error('StockRestockedEvent: locationId is required');
  }
  if (!payload.receivedBy) {
    throw new Error('StockRestockedEvent: receivedBy is required');
  }
  if (payload.costValue === undefined || payload.costValue === null) {
    throw new Error('StockRestockedEvent: costValue is required');
  }
  if (payload.costValue < 0) {
    throw new Error('StockRestockedEvent: costValue cannot be negative');
  }
  if (!payload.timestamp) {
    throw new Error('StockRestockedEvent: timestamp is required');
  }
  if (!payload.tenantId) {
    throw new Error('StockRestockedEvent: tenantId is required');
  }
  if (!payload.organizationId) {
    throw new Error('StockRestockedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('StockRestockedEvent: clinicId is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: STOCK_RESTOCKED_EVENT,
    version: STOCK_RESTOCKED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 3. STOCK LOW EVENT
// ============================================================================

/**
 * Stock low event payload
 *
 * Published when inventory drops below reorder point threshold.
 * Critical for:
 * - Automated reorder triggers
 * - Procurement planning
 * - Stock-out prevention
 * - Analytics (consumption rate analysis)
 * - Notifications (alerts to procurement team)
 *
 * @example
 * ```typescript
 * const payload: StockLowPayload = {
 *   productId: '123e4567-e89b-12d3-a456-426614174000',
 *   productName: 'Composite Resin - A2 Shade',
 *   sku: 'COMP-A2-3M',
 *   currentQuantity: 15,
 *   reorderPoint: 20,
 *   reorderQuantity: 100,
 *   locationId: 'loc-123',
 *   supplierId: 'supplier-456',
 *   lastOrderDate: '2025-10-15',
 *   autoReorderEnabled: true,
 *   timestamp: '2025-11-20T15:05:00Z',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   clinicId: 'clinic-789',
 * };
 * ```
 */
export interface StockLowPayload {
  /** Product identifier from catalog */
  productId: UUID;

  /** Product name for display */
  productName: string;

  /** SKU or product code */
  sku: string;

  /** Current quantity on hand */
  currentQuantity: number;

  /** Unit of measure */
  unitOfMeasure?: string;

  /** Reorder point threshold that was crossed */
  reorderPoint: number;

  /** Suggested reorder quantity */
  reorderQuantity: number;

  /** Storage location ID */
  locationId: UUID;

  /** Location name for display */
  locationName?: string;

  /** Preferred supplier ID */
  supplierId?: UUID;

  /** Supplier name for display */
  supplierName?: string;

  /** Date of last order for this product */
  lastOrderDate?: ISODateString;

  /** Average consumption rate (units per day) */
  averageConsumptionRate?: number;

  /** Estimated days until stock-out */
  estimatedDaysUntilStockout?: number;

  /** Whether automatic reorder is enabled */
  autoReorderEnabled: boolean;

  /** Purchase order ID if auto-reorder was triggered */
  triggeredPurchaseOrderId?: UUID;

  /** Timestamp when low stock condition was detected */
  timestamp: ISODateString;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Severity level for prioritization */
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  /** Whether product is critical/essential */
  isCriticalProduct?: boolean;

  /** Product category for filtering */
  productCategory?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Stock low event envelope
 */
export type StockLowEvent = EventEnvelope<StockLowPayload>;

/**
 * Type guard to check if an event is a StockLowEvent
 *
 * @param event - The event to check
 * @returns True if the event is a StockLowEvent
 */
export function isStockLowEvent(
  event: EventEnvelope<unknown>
): event is StockLowEvent {
  return event.type === STOCK_LOW_EVENT;
}

/**
 * Factory function to create a StockLowEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createStockLowEvent(
  payload: StockLowPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): StockLowEvent {
  // Validate critical required fields
  if (!payload.productId) {
    throw new Error('StockLowEvent: productId is required');
  }
  if (!payload.productName || payload.productName.trim().length === 0) {
    throw new Error('StockLowEvent: productName is required and cannot be empty');
  }
  if (!payload.sku || payload.sku.trim().length === 0) {
    throw new Error('StockLowEvent: sku is required and cannot be empty');
  }
  if (payload.currentQuantity === undefined || payload.currentQuantity === null) {
    throw new Error('StockLowEvent: currentQuantity is required');
  }
  if (payload.currentQuantity < 0) {
    throw new Error('StockLowEvent: currentQuantity cannot be negative');
  }
  if (payload.reorderPoint === undefined || payload.reorderPoint === null) {
    throw new Error('StockLowEvent: reorderPoint is required');
  }
  if (payload.reorderQuantity === undefined || payload.reorderQuantity === null) {
    throw new Error('StockLowEvent: reorderQuantity is required');
  }
  if (payload.reorderQuantity <= 0) {
    throw new Error('StockLowEvent: reorderQuantity must be positive');
  }
  if (!payload.locationId) {
    throw new Error('StockLowEvent: locationId is required');
  }
  if (payload.autoReorderEnabled === undefined || payload.autoReorderEnabled === null) {
    throw new Error('StockLowEvent: autoReorderEnabled is required');
  }
  if (!payload.timestamp) {
    throw new Error('StockLowEvent: timestamp is required');
  }
  if (!payload.tenantId) {
    throw new Error('StockLowEvent: tenantId is required');
  }
  if (!payload.organizationId) {
    throw new Error('StockLowEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('StockLowEvent: clinicId is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: STOCK_LOW_EVENT,
    version: STOCK_LOW_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 4. STOCK EXPIRED EVENT
// ============================================================================

/**
 * Stock expired event payload
 *
 * Published when inventory lot reaches or passes expiration date.
 * Critical for:
 * - Compliance (FDA, medical device regulations)
 * - Quality control (expired stock quarantine)
 * - Cost tracking (expired inventory write-off)
 * - Analytics (waste analysis, expiry management)
 * - Notifications (alerts to inventory managers)
 *
 * @example
 * ```typescript
 * const payload: StockExpiredPayload = {
 *   productId: '123e4567-e89b-12d3-a456-426614174000',
 *   productName: 'Anesthetic Cartridges - Lidocaine 2%',
 *   lotNumber: 'LOT-2024-999',
 *   quantity: 25,
 *   expirationDate: '2025-11-20',
 *   locationId: 'loc-123',
 *   action: 'QUARANTINE',
 *   disposedBy: 'user-456',
 *   timestamp: '2025-11-21T08:00:00Z',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   clinicId: 'clinic-789',
 * };
 * ```
 */
export interface StockExpiredPayload {
  /** Product identifier from catalog */
  productId: UUID;

  /** Product name for display */
  productName: string;

  /** SKU or product code */
  sku?: string;

  /** Lot/batch number of expired stock */
  lotNumber: string;

  /** Quantity of expired stock */
  quantity: number;

  /** Unit of measure */
  unitOfMeasure?: string;

  /** Expiration date that was reached */
  expirationDate: ISODateString;

  /** Storage location ID */
  locationId: UUID;

  /** Location name for display */
  locationName?: string;

  /** Action taken for expired stock */
  action: ExpiredStockAction;

  /** User who performed the disposal/action */
  disposedBy?: UUID;

  /** User name for audit */
  disposedByName?: string;

  /** Cost/value of expired stock (for write-off) */
  costValue?: number;

  /** Currency code */
  currency?: string;

  /** Notes on disposal or action taken */
  notes?: string;

  /** Timestamp when expiry was detected/processed */
  timestamp: ISODateString;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Quarantine location ID if action is QUARANTINE */
  quarantineLocationId?: UUID;

  /** Supplier ID if action is RETURN */
  supplierId?: UUID;

  /** Supplier name */
  supplierName?: string;

  /** Days past expiration (0 = expired today, positive = days past) */
  daysPastExpiration?: number;

  /** Whether this was an automated detection */
  isAutomatedDetection?: boolean;

  /** Product category for analytics */
  productCategory?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Stock expired event envelope
 */
export type StockExpiredEvent = EventEnvelope<StockExpiredPayload>;

/**
 * Type guard to check if an event is a StockExpiredEvent
 *
 * @param event - The event to check
 * @returns True if the event is a StockExpiredEvent
 */
export function isStockExpiredEvent(
  event: EventEnvelope<unknown>
): event is StockExpiredEvent {
  return event.type === STOCK_EXPIRED_EVENT;
}

/**
 * Factory function to create a StockExpiredEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createStockExpiredEvent(
  payload: StockExpiredPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): StockExpiredEvent {
  // Validate critical required fields
  if (!payload.productId) {
    throw new Error('StockExpiredEvent: productId is required');
  }
  if (!payload.productName || payload.productName.trim().length === 0) {
    throw new Error('StockExpiredEvent: productName is required and cannot be empty');
  }
  if (!payload.lotNumber || payload.lotNumber.trim().length === 0) {
    throw new Error('StockExpiredEvent: lotNumber is required and cannot be empty');
  }
  if (payload.quantity === undefined || payload.quantity === null) {
    throw new Error('StockExpiredEvent: quantity is required');
  }
  if (payload.quantity <= 0) {
    throw new Error('StockExpiredEvent: quantity must be positive');
  }
  if (!payload.expirationDate) {
    throw new Error('StockExpiredEvent: expirationDate is required');
  }
  if (!payload.locationId) {
    throw new Error('StockExpiredEvent: locationId is required');
  }
  if (!payload.action) {
    throw new Error('StockExpiredEvent: action is required');
  }
  if (!payload.timestamp) {
    throw new Error('StockExpiredEvent: timestamp is required');
  }
  if (!payload.tenantId) {
    throw new Error('StockExpiredEvent: tenantId is required');
  }
  if (!payload.organizationId) {
    throw new Error('StockExpiredEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('StockExpiredEvent: clinicId is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: STOCK_EXPIRED_EVENT,
    version: STOCK_EXPIRED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 5. PURCHASE ORDER CREATED EVENT
// ============================================================================

/**
 * Purchase order created event payload
 *
 * Published when a new purchase order is created for procurement.
 * Critical for:
 * - Procurement workflow tracking
 * - Supplier management
 * - Budget tracking and financial planning
 * - Expected delivery planning
 * - Analytics (procurement patterns, supplier performance)
 *
 * @example
 * ```typescript
 * const payload: PurchaseOrderCreatedPayload = {
 *   purchaseOrderId: '123e4567-e89b-12d3-a456-426614174000',
 *   orderNumber: 'PO-2025-001',
 *   supplierId: 'supplier-456',
 *   supplierName: 'Dental Supplies Inc.',
 *   itemCount: 5,
 *   totalAmount: 1250.00,
 *   expectedDeliveryDate: '2025-12-01',
 *   createdBy: 'user-789',
 *   urgency: 'ROUTINE',
 *   timestamp: '2025-11-20T09:00:00Z',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   clinicId: 'clinic-789',
 * };
 * ```
 */
export interface PurchaseOrderCreatedPayload {
  /** Purchase order identifier */
  purchaseOrderId: UUID;

  /** Human-readable order number */
  orderNumber: string;

  /** Supplier identifier */
  supplierId: UUID;

  /** Supplier name for display */
  supplierName: string;

  /** Supplier contact information */
  supplierContact?: {
    email?: string;
    phone?: string;
    contactPerson?: string;
  };

  /** Number of line items in the order */
  itemCount: number;

  /** Total order amount */
  totalAmount: number;

  /** Currency code */
  currency?: string;

  /** Expected delivery date */
  expectedDeliveryDate?: ISODateString;

  /** User who created the purchase order */
  createdBy: UUID;

  /** Creator name for display */
  createdByName?: string;

  /** Urgency level of the order */
  urgency: PurchaseOrderUrgency;

  /** Delivery location ID */
  deliveryLocationId?: UUID;

  /** Delivery location name */
  deliveryLocationName?: string;

  /** Purchase order status */
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

  /** Approval workflow ID if approval is required */
  approvalWorkflowId?: UUID;

  /** Whether order requires approval */
  requiresApproval?: boolean;

  /** Department or cost center */
  department?: string;

  /** Reference to stock low event if auto-generated */
  triggeredByStockLowEventId?: UUID;

  /** Notes or special instructions */
  notes?: string;

  /** Timestamp when purchase order was created */
  timestamp: ISODateString;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Shipping method */
  shippingMethod?: 'STANDARD' | 'EXPEDITED' | 'OVERNIGHT' | 'PICKUP';

  /** Estimated shipping cost */
  shippingCost?: number;

  /** Tax amount */
  taxAmount?: number;

  /** Payment terms */
  paymentTerms?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Purchase order created event envelope
 */
export type PurchaseOrderCreatedEvent = EventEnvelope<PurchaseOrderCreatedPayload>;

/**
 * Type guard to check if an event is a PurchaseOrderCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a PurchaseOrderCreatedEvent
 */
export function isPurchaseOrderCreatedEvent(
  event: EventEnvelope<unknown>
): event is PurchaseOrderCreatedEvent {
  return event.type === PURCHASE_ORDER_CREATED_EVENT;
}

/**
 * Factory function to create a PurchaseOrderCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createPurchaseOrderCreatedEvent(
  payload: PurchaseOrderCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): PurchaseOrderCreatedEvent {
  // Validate critical required fields
  if (!payload.purchaseOrderId) {
    throw new Error('PurchaseOrderCreatedEvent: purchaseOrderId is required');
  }
  if (!payload.orderNumber || payload.orderNumber.trim().length === 0) {
    throw new Error('PurchaseOrderCreatedEvent: orderNumber is required and cannot be empty');
  }
  if (!payload.supplierId) {
    throw new Error('PurchaseOrderCreatedEvent: supplierId is required');
  }
  if (!payload.supplierName || payload.supplierName.trim().length === 0) {
    throw new Error('PurchaseOrderCreatedEvent: supplierName is required and cannot be empty');
  }
  if (payload.itemCount === undefined || payload.itemCount === null) {
    throw new Error('PurchaseOrderCreatedEvent: itemCount is required');
  }
  if (payload.itemCount <= 0) {
    throw new Error('PurchaseOrderCreatedEvent: itemCount must be positive');
  }
  if (payload.totalAmount === undefined || payload.totalAmount === null) {
    throw new Error('PurchaseOrderCreatedEvent: totalAmount is required');
  }
  if (payload.totalAmount < 0) {
    throw new Error('PurchaseOrderCreatedEvent: totalAmount cannot be negative');
  }
  if (!payload.createdBy) {
    throw new Error('PurchaseOrderCreatedEvent: createdBy is required');
  }
  if (!payload.urgency) {
    throw new Error('PurchaseOrderCreatedEvent: urgency is required');
  }
  if (!payload.timestamp) {
    throw new Error('PurchaseOrderCreatedEvent: timestamp is required');
  }
  if (!payload.tenantId) {
    throw new Error('PurchaseOrderCreatedEvent: tenantId is required');
  }
  if (!payload.organizationId) {
    throw new Error('PurchaseOrderCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('PurchaseOrderCreatedEvent: clinicId is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PURCHASE_ORDER_CREATED_EVENT,
    version: PURCHASE_ORDER_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 6. GOODS RECEIPT CREATED EVENT
// ============================================================================

/**
 * Goods receipt created event payload
 *
 * Published when inventory is received and inspected (goods receipt note).
 * Critical for:
 * - Stock restocking (triggers StockRestockedEvent for each item)
 * - Purchase order fulfillment tracking
 * - Three-way matching (PO ↔ GRN ↔ Invoice)
 * - Quality control and inspection tracking
 * - Analytics (supplier delivery performance, lead times)
 *
 * @example
 * ```typescript
 * const payload: GoodsReceiptCreatedPayload = {
 *   goodsReceiptId: '123e4567-e89b-12d3-a456-426614174000',
 *   receiptNumber: 'GRN-2025-001',
 *   purchaseOrderId: 'po-456',
 *   supplierId: 'supplier-789',
 *   itemsReceived: [
 *     {
 *       productId: 'prod-1',
 *       productName: 'Composite Resin',
 *       sku: 'COMP-A2',
 *       quantityReceived: 50,
 *       unitOfMeasure: 'g',
 *       lotNumber: 'LOT-2025-003',
 *       expirationDate: '2027-06-30',
 *       unitCost: 5.00,
 *       lineTotalCost: 250.00,
 *       locationId: 'loc-123',
 *     },
 *   ],
 *   receivedBy: 'user-101',
 *   timestamp: '2025-11-20T14:00:00Z',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   clinicId: 'clinic-789',
 * };
 * ```
 */
export interface GoodsReceiptCreatedPayload {
  /** Goods receipt identifier */
  goodsReceiptId: UUID;

  /** Human-readable receipt number */
  receiptNumber: string;

  /** Associated purchase order ID */
  purchaseOrderId?: UUID;

  /** Purchase order number for display */
  purchaseOrderNumber?: string;

  /** Supplier identifier */
  supplierId: UUID;

  /** Supplier name for display */
  supplierName?: string;

  /** Array of items received in this shipment */
  itemsReceived: GoodsReceiptItem[];

  /** Total number of line items received */
  totalItemsCount?: number;

  /** User who received and inspected the goods */
  receivedBy: UUID;

  /** Receiver name for display and audit */
  receivedByName?: string;

  /** Delivery location ID */
  deliveryLocationId?: UUID;

  /** Delivery location name */
  deliveryLocationName?: string;

  /** Actual delivery date */
  deliveryDate?: ISODateString;

  /** Receipt notes or observations */
  notes?: string;

  /** Quality inspection status */
  qualityInspectionStatus?: 'PASSED' | 'FAILED' | 'PARTIAL' | 'NOT_REQUIRED';

  /** Quality inspection notes */
  qualityInspectionNotes?: string;

  /** Whether shipment was damaged */
  isDamaged?: boolean;

  /** Damage description if applicable */
  damageDescription?: string;

  /** Whether shipment was complete */
  isComplete?: boolean;

  /** Discrepancy notes if incomplete */
  discrepancyNotes?: string;

  /** Packing slip number */
  packingSlipNumber?: string;

  /** Carrier/shipping company */
  carrier?: string;

  /** Tracking number */
  trackingNumber?: string;

  /** Total receipt value */
  totalValue?: number;

  /** Currency code */
  currency?: string;

  /** Timestamp when goods receipt was created */
  timestamp: ISODateString;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Whether receipt has been matched to invoice */
  isMatchedToInvoice?: boolean;

  /** Matched invoice ID if applicable */
  invoiceId?: UUID;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Goods receipt created event envelope
 */
export type GoodsReceiptCreatedEvent = EventEnvelope<GoodsReceiptCreatedPayload>;

/**
 * Type guard to check if an event is a GoodsReceiptCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a GoodsReceiptCreatedEvent
 */
export function isGoodsReceiptCreatedEvent(
  event: EventEnvelope<unknown>
): event is GoodsReceiptCreatedEvent {
  return event.type === GOODS_RECEIPT_CREATED_EVENT;
}

/**
 * Factory function to create a GoodsReceiptCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createGoodsReceiptCreatedEvent(
  payload: GoodsReceiptCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): GoodsReceiptCreatedEvent {
  // Validate critical required fields
  if (!payload.goodsReceiptId) {
    throw new Error('GoodsReceiptCreatedEvent: goodsReceiptId is required');
  }
  if (!payload.receiptNumber || payload.receiptNumber.trim().length === 0) {
    throw new Error('GoodsReceiptCreatedEvent: receiptNumber is required and cannot be empty');
  }
  if (!payload.supplierId) {
    throw new Error('GoodsReceiptCreatedEvent: supplierId is required');
  }
  if (!Array.isArray(payload.itemsReceived)) {
    throw new Error('GoodsReceiptCreatedEvent: itemsReceived must be an array');
  }
  if (payload.itemsReceived.length === 0) {
    throw new Error('GoodsReceiptCreatedEvent: itemsReceived cannot be empty');
  }
  // Validate each item in itemsReceived
  payload.itemsReceived.forEach((item, index) => {
    if (!item.productId) {
      throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].productId is required`);
    }
    if (!item.productName || item.productName.trim().length === 0) {
      throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].productName is required`);
    }
    if (item.quantityReceived === undefined || item.quantityReceived === null) {
      throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].quantityReceived is required`);
    }
    if (item.quantityReceived <= 0) {
      throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].quantityReceived must be positive`);
    }
    if (!item.lotNumber || item.lotNumber.trim().length === 0) {
      throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].lotNumber is required`);
    }
  });
  if (!payload.receivedBy) {
    throw new Error('GoodsReceiptCreatedEvent: receivedBy is required');
  }
  if (!payload.timestamp) {
    throw new Error('GoodsReceiptCreatedEvent: timestamp is required');
  }
  if (!payload.tenantId) {
    throw new Error('GoodsReceiptCreatedEvent: tenantId is required');
  }
  if (!payload.organizationId) {
    throw new Error('GoodsReceiptCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('GoodsReceiptCreatedEvent: clinicId is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: GOODS_RECEIPT_CREATED_EVENT,
    version: GOODS_RECEIPT_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
