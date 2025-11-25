/**
 * Inventory Domain Types
 *
 * Complete domain types for Inventory Management, Procurement, and Stock Automation
 * in dental practice management system. Defines product catalog, stock management,
 * lot tracking with FEFO (First-Expire-First-Out), procurement workflows, procedure
 * materials consumption, and sterilization integration.
 *
 * @module shared-domain/inventory
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  Metadata,
  Nullable,
} from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
import type { ProviderId, ProcedureId } from '../clinical';

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

/**
 * Unique identifier for a product in the catalog
 */
export type ProductId = UUID & { readonly __brand: 'ProductId' };

/**
 * Unique identifier for a product variant (size, flavor, etc.)
 */
export type ProductVariantId = UUID & { readonly __brand: 'ProductVariantId' };

/**
 * Unique identifier for a supplier
 */
export type SupplierId = UUID & { readonly __brand: 'SupplierId' };

/**
 * Unique identifier for a purchase order
 */
export type PurchaseOrderId = UUID & { readonly __brand: 'PurchaseOrderId' };

/**
 * Unique identifier for a goods receipt
 */
export type GoodsReceiptId = UUID & { readonly __brand: 'GoodsReceiptId' };

/**
 * Unique identifier for a stock item instance
 */
export type StockItemId = UUID & { readonly __brand: 'StockItemId' };

/**
 * Unique identifier for a lot/batch
 */
export type LotId = UUID & { readonly __brand: 'LotId' };

/**
 * Unique identifier for a stock location
 */
export type StockLocationId = UUID & { readonly __brand: 'StockLocationId' };

/**
 * Unique identifier for a stock movement transaction
 */
export type StockMovementId = UUID & { readonly __brand: 'StockMovementId' };

/**
 * Unique identifier for a sterilization cycle (from Feature 12)
 */
export type SterilizationCycleId = UUID & { readonly __brand: 'SterilizationCycleId' };

/**
 * Unique identifier for a procedure bill of materials
 */
export type BOMId = UUID & { readonly __brand: 'BOMId' };

/**
 * Currency type (ISO 4217 currency code)
 */
export type Currency = string & { readonly __brand: 'Currency' };

// ============================================================================
// PRODUCT CATALOG TYPES
// ============================================================================

/**
 * Product category enumeration
 *
 * Categorizes dental inventory products by type and usage.
 *
 * Clinical workflow considerations:
 * - CONSUMABLE: Items used once and discarded (gloves, masks, gauze, cotton rolls)
 * - INSTRUMENT: Reusable dental instruments requiring sterilization (mirrors, scalers, forceps)
 * - MATERIAL: Clinical materials used in procedures (composites, amalgam, cements, impression materials)
 * - MEDICATION: Pharmaceuticals and anesthetics (requires tracking for controlled substances)
 * - EQUIPMENT: Durable equipment and capital assets (handpieces, curing lights, x-ray units)
 * - DISPOSABLE: Single-use items (needles, burs, prophy angles)
 *
 * Edge cases:
 * - Some INSTRUMENT items integrate with sterilization tracking (Feature 12)
 * - MEDICATION may require controlled substance tracking and DEA compliance
 * - EQUIPMENT items typically not consumed per procedure, tracked separately
 * - CONSUMABLE vs DISPOSABLE: Consumables are bulk items, disposables are individually tracked
 */
export enum ProductCategory {
  /** Consumable supplies used once (gloves, masks, gauze) */
  CONSUMABLE = 'consumable',
  /** Reusable instruments requiring sterilization */
  INSTRUMENT = 'instrument',
  /** Clinical materials (composites, cements, impression materials) */
  MATERIAL = 'material',
  /** Pharmaceuticals and anesthetics */
  MEDICATION = 'medication',
  /** Durable equipment and capital assets */
  EQUIPMENT = 'equipment',
  /** Single-use disposables (needles, burs, prophy angles) */
  DISPOSABLE = 'disposable',
}

/**
 * Unit of measure enumeration
 *
 * Standard units for inventory tracking and procurement.
 *
 * Dental practice workflow considerations:
 * - UNIT: Individual items (burs, needles, handpieces)
 * - BOX: Packaged boxes (glove boxes typically 100 or 200 count)
 * - PACK: Multi-packs (gauze packs, cotton roll packs)
 * - BOTTLE: Liquid containers (anesthetics, bonding agents)
 * - TUBE: Tubes of material (composite syringes, prophy paste)
 * - SYRINGE: Pre-filled syringes (composite, etchant, bonding)
 * - VIAL: Small vials (anesthetic carpules)
 * - KG/G: Weight measurements (impression materials, alginates)
 * - ML/L: Volume measurements (liquids, disinfectants)
 *
 * Edge cases:
 * - Conversion factors needed between units (1 BOX = 100 UNITS for gloves)
 * - Partial unit consumption tracked for procedure costing (0.5 TUBE of composite)
 * - Some items ordered by one unit, dispensed by another (order by BOX, use by UNIT)
 */
export enum UnitOfMeasure {
  /** Individual units/pieces */
  UNIT = 'unit',
  /** Box container */
  BOX = 'box',
  /** Pack of items */
  PACK = 'pack',
  /** Bottle container */
  BOTTLE = 'bottle',
  /** Tube container */
  TUBE = 'tube',
  /** Syringe */
  SYRINGE = 'syringe',
  /** Vial */
  VIAL = 'vial',
  /** Kilogram */
  KG = 'kg',
  /** Gram */
  G = 'g',
  /** Milliliter */
  ML = 'ml',
  /** Liter */
  L = 'l',
}

/**
 * Product status enumeration
 *
 * Lifecycle status of products in the catalog.
 *
 * Edge cases:
 * - ACTIVE: Currently available for ordering and use
 * - DISCONTINUED: No longer available from supplier, use remaining stock
 * - OUT_OF_STOCK: Temporarily out of stock, awaiting replenishment
 * - BACKORDERED: Ordered from supplier but awaiting delivery
 */
export enum ProductStatus {
  /** Active and available */
  ACTIVE = 'active',
  /** Discontinued by supplier */
  DISCONTINUED = 'discontinued',
  /** Out of stock */
  OUT_OF_STOCK = 'out_of_stock',
  /** Backordered from supplier */
  BACKORDERED = 'backordered',
}

/**
 * Product variant interface
 *
 * Represents variations of a product (size, color, flavor, etc.).
 *
 * Dental workflow examples:
 * - Composite shades: A1, A2, A3, B1, etc.
 * - Glove sizes: XS, S, M, L, XL
 * - Prophy paste flavors: Mint, Cherry, Bubblegum
 * - Bur sizes: 1/2, 1, 2, 4, 6, 8
 *
 * Edge cases:
 * - Each variant has own SKU for supplier ordering
 * - Variants may have different pricing
 * - Stock tracked separately per variant
 * - Variants can be discontinued independently
 */
export interface ProductVariant {
  /** Unique variant identifier */
  id: ProductVariantId;
  /** Variant name (size, shade, flavor, etc.) */
  name: string;
  /** SKU specific to this variant */
  sku: string;
  /** Variant-specific attributes (shade code, size code, etc.) */
  attributes: Record<string, string>;
  /** Variant-specific pricing (overrides product pricing if set) */
  price?: MoneyValue;
  /** Whether variant is available */
  isAvailable: boolean;
  /** Variant creation timestamp */
  createdAt: ISODateString;
  /** Variant last update timestamp */
  updatedAt: ISODateString;
}

/**
 * Product entity (aggregate root)
 *
 * Complete product definition in the catalog.
 *
 * Dental workflow considerations:
 * - Products are the master definition, stock items are instances
 * - Products link to suppliers for automated reordering
 * - Reorder points trigger purchase order creation
 * - INSTRUMENT products may integrate with sterilization tracking
 * - MEDICATION products may require controlled substance tracking
 *
 * Edge cases:
 * - Multi-supplier products: track preferred supplier and alternates
 * - Conversion factors for different UOMs (order by BOX, use by UNIT)
 * - Expiration tracking required for materials and medications
 * - Some products have shelf life even without lot expiration (opened materials)
 * - Sterilizable instruments tracked separately (cycleCount, sterilizationRequired)
 */
export interface Product {
  /** Unique product identifier */
  id: ProductId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional, null = organization-wide catalog) */
  clinicId?: ClinicId;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Product category */
  category: ProductCategory;
  /** Manufacturer name */
  manufacturer?: string;
  /** Manufacturer part number */
  manufacturerPartNumber?: string;
  /** SKU (Stock Keeping Unit) - internal code */
  sku: string;
  /** Primary barcode (UPC/EAN/custom) */
  barcode?: string;
  /** Unit of measure for inventory tracking */
  unitOfMeasure: UnitOfMeasure;
  /** Standard unit cost (average or last purchase cost) */
  unitCost: MoneyValue;
  /** Selling price (if applicable, for retail or markup calculations) */
  sellingPrice?: MoneyValue;
  /** Product status */
  status: ProductStatus;
  /** Preferred supplier */
  preferredSupplierId?: SupplierId;
  /** Alternate suppliers */
  alternateSupplierIds?: SupplierId[];
  /** Reorder point (minimum quantity before triggering reorder) */
  reorderPoint: number;
  /** Reorder quantity (standard order quantity) */
  reorderQuantity: number;
  /** Maximum stock level (for overstocking prevention) */
  maxStockLevel?: number;
  /** Product variants (sizes, shades, flavors, etc.) */
  variants?: ProductVariant[];
  /** Whether product requires lot/batch tracking */
  requiresLotTracking: boolean;
  /** Whether product has expiration dates */
  hasExpiration: boolean;
  /** Default shelf life in days (for products without lot expiration) */
  defaultShelfLifeDays?: number;
  /** Whether product requires sterilization (INSTRUMENT category) */
  requiresSterilization: boolean;
  /** Maximum sterilization cycles (for INSTRUMENT category, null = unlimited) */
  maxSterilizationCycles?: number;
  /** Product image URL */
  imageUrl?: string;
  /** Product documentation URLs (SDS, IFU, etc.) */
  documentUrls?: string[];
  /** FDA/regulatory information */
  regulatoryInfo?: {
    /** FDA classification (Class I, II, III) */
    fdaClass?: string;
    /** FDA 510(k) number */
    fda510k?: string;
    /** DEA schedule (for controlled substances) */
    deaSchedule?: string;
    /** Other regulatory notes */
    notes?: string;
  };
  /** Storage requirements */
  storageRequirements?: string;
  /** Clinical usage notes */
  usageNotes?: string;
  /** Tags for categorization and search */
  tags?: string[];
  /** Whether product is active in catalog */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created product */
  createdBy: UUID;
  /** User who last updated product */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// STOCK MANAGEMENT TYPES
// ============================================================================

/**
 * Stock status enumeration
 *
 * Status of individual stock items.
 *
 * Dental workflow considerations:
 * - AVAILABLE: Ready for use in procedures
 * - RESERVED: Allocated to specific procedure or kit
 * - EXPIRED: Past expiration date, cannot be used
 * - DAMAGED: Damaged and unusable, requires disposal
 * - RECALLED: Manufacturer recall, requires immediate removal
 * - IN_TRANSIT: Ordered but not yet received
 *
 * Edge cases:
 * - EXPIRED items must be removed from available inventory immediately
 * - RECALLED items trigger urgent notifications and tracking
 * - RESERVED items allocated but not yet consumed
 * - DAMAGED items require incident documentation
 */
export enum StockStatus {
  /** Available for use */
  AVAILABLE = 'available',
  /** Reserved for specific use */
  RESERVED = 'reserved',
  /** Expired, cannot be used */
  EXPIRED = 'expired',
  /** Damaged, unusable */
  DAMAGED = 'damaged',
  /** Manufacturer recall */
  RECALLED = 'recalled',
  /** In transit from supplier */
  IN_TRANSIT = 'in_transit',
}

/**
 * Stock location interface
 *
 * Physical or logical storage location for inventory.
 *
 * Dental workflow examples:
 * - Operatory 1, Operatory 2, etc. (chairside cabinets)
 * - Central supply room
 * - Sterilization center
 * - Lab area
 * - Medication refrigerator
 * - Off-site storage
 *
 * Edge cases:
 * - Locations can be hierarchical (Room > Cabinet > Shelf > Bin)
 * - Some locations require environmental controls (temperature, humidity)
 * - Mobile locations (portable instrument kits, hygiene cart)
 * - Virtual locations for in-transit or consignment stock
 */
export interface StockLocation {
  /** Unique location identifier */
  id: StockLocationId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** Location name */
  name: string;
  /** Location type (operatory, supply_room, sterilization, lab, etc.) */
  locationType: string;
  /** Parent location (for hierarchical locations) */
  parentLocationId?: StockLocationId;
  /** Full location path (e.g., "Central Supply > Cabinet 3 > Shelf 2") */
  locationPath?: string;
  /** Whether location is active */
  isActive: boolean;
  /** Environmental controls (temperature range, humidity, etc.) */
  environmentalControls?: {
    temperatureMin?: number;
    temperatureMax?: number;
    humidityMin?: number;
    humidityMax?: number;
    notes?: string;
  };
  /** Location notes */
  notes?: string;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
}

/**
 * Movement type enumeration
 *
 * Types of stock movements for audit trail.
 *
 * Dental workflow considerations:
 * - IN: Goods receipt from supplier
 * - OUT: Consumption in procedure or depletion
 * - TRANSFER: Movement between locations
 * - ADJUSTMENT: Inventory count correction
 * - DEDUCTION: Automated procedure consumption
 * - RETURN: Return to supplier or return from operatory
 * - WASTE: Disposal (contaminated, spilled, etc.)
 * - EXPIRED: Removal due to expiration
 *
 * Edge cases:
 * - DEDUCTION is automated from procedure completion
 * - ADJUSTMENT requires reason and approval
 * - WASTE requires disposal documentation
 * - EXPIRED triggers expiration tracking and compliance reporting
 * - RETURN to supplier requires credit memo tracking
 */
export enum MovementType {
  /** Stock received (goods receipt) */
  IN = 'in',
  /** Stock consumed/depleted */
  OUT = 'out',
  /** Transfer between locations */
  TRANSFER = 'transfer',
  /** Inventory adjustment (count correction) */
  ADJUSTMENT = 'adjustment',
  /** Automated procedure consumption */
  DEDUCTION = 'deduction',
  /** Return to supplier or from location */
  RETURN = 'return',
  /** Waste/disposal */
  WASTE = 'waste',
  /** Removal due to expiration */
  EXPIRED = 'expired',
}

/**
 * Stock movement interface
 *
 * Audit trail of all stock movements.
 *
 * Compliance considerations:
 * - Complete audit trail required for regulatory compliance
 * - Controlled substance movements require enhanced tracking
 * - Recalled item movements tracked for FDA reporting
 * - Waste disposal movements tracked for environmental compliance
 *
 * Edge cases:
 * - Movement links to source documents (GoodsReceipt, Procedure, PurchaseOrder)
 * - Negative quantities for OUT movements
 * - Zero-quantity movements for status changes (AVAILABLE to EXPIRED)
 * - Batch movements (multiple items in one transaction)
 */
export interface StockMovement {
  /** Unique movement identifier */
  id: StockMovementId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** Movement type */
  movementType: MovementType;
  /** Product being moved */
  productId: ProductId;
  /** Product variant (if applicable) */
  productVariantId?: ProductVariantId;
  /** Lot/batch (if applicable) */
  lotId?: LotId;
  /** Quantity moved (negative for OUT movements) */
  quantity: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Source location (null for IN movements) */
  fromLocationId?: StockLocationId;
  /** Destination location (null for OUT movements) */
  toLocationId?: StockLocationId;
  /** Movement timestamp */
  movedAt: ISODateString;
  /** User who performed movement */
  movedBy: UUID;
  /** Reason for movement */
  reason?: string;
  /** Reference to source document */
  referenceType?: 'goods_receipt' | 'purchase_order' | 'procedure' | 'adjustment' | 'transfer' | 'other';
  /** Reference document ID */
  referenceId?: UUID;
  /** Related procedure (for DEDUCTION movements) */
  procedureId?: ProcedureId;
  /** Related goods receipt (for IN movements) */
  goodsReceiptId?: GoodsReceiptId;
  /** Unit cost at time of movement */
  unitCost?: MoneyValue;
  /** Total cost of movement */
  totalCost?: MoneyValue;
  /** Notes */
  notes?: string;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Stock item interface
 *
 * Individual stock item instance (physical inventory).
 *
 * Dental workflow considerations:
 * - Stock items are instances of products
 * - Each item may have unique lot, expiration, location
 * - FIFO/FEFO consumption requires tracking individual items
 * - Sterilizable instruments track cycle count
 *
 * Edge cases:
 * - Partial quantities for opened containers (0.5 tube of composite)
 * - Consignment items (owned by supplier until used)
 * - Loaner instruments (not owned, must be returned)
 * - Items with multiple locations (kits containing multiple items)
 */
export interface StockItem {
  /** Unique stock item identifier */
  id: StockItemId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** Product reference */
  productId: ProductId;
  /** Product variant (if applicable) */
  productVariantId?: ProductVariantId;
  /** Lot/batch reference (if applicable) */
  lotId?: LotId;
  /** Current stock status */
  status: StockStatus;
  /** Current quantity */
  quantity: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Current storage location */
  locationId: StockLocationId;
  /** Unit cost (from goods receipt or purchase order) */
  unitCost: MoneyValue;
  /** Total value (quantity * unitCost) */
  totalValue: MoneyValue;
  /** Expiration date (if applicable) */
  expirationDate?: ISODateString;
  /** Date received */
  receivedAt: ISODateString;
  /** Related goods receipt */
  goodsReceiptId?: GoodsReceiptId;
  /** Supplier reference */
  supplierId?: SupplierId;
  /** Supplier lot number */
  supplierLotNumber?: string;
  /** Whether item is consignment (owned by supplier until used) */
  isConsignment: boolean;
  /** Whether item is loaner (must be returned) */
  isLoaner: boolean;
  /** Loaner return date (if applicable) */
  loanerReturnDate?: ISODateString;
  /** For sterilizable instruments: current cycle count */
  currentSterilizationCycles?: number;
  /** For sterilizable instruments: last sterilization cycle reference */
  lastSterilizationCycleId?: SterilizationCycleId;
  /** For sterilizable instruments: last sterilization date */
  lastSterilizedAt?: ISODateString;
  /** Notes */
  notes?: string;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// LOT & EXPIRATION TRACKING TYPES
// ============================================================================

/**
 * Lot status enumeration
 *
 * Status of lots/batches.
 *
 * Edge cases:
 * - ACTIVE: Normal, available for use
 * - EXPIRED: Past expiration, cannot be used
 * - RECALLED: Manufacturer recall, remove from use immediately
 * - QUARANTINE: Under investigation or hold, cannot be used
 */
export enum LotStatus {
  /** Active and available */
  ACTIVE = 'active',
  /** Expired */
  EXPIRED = 'expired',
  /** Recalled by manufacturer */
  RECALLED = 'recalled',
  /** Quarantined (investigation, hold) */
  QUARANTINE = 'quarantine',
}

/**
 * Lot interface
 *
 * Lot/batch tracking for materials, medications, and consumables.
 *
 * Regulatory compliance considerations:
 * - FDA requires lot tracking for Class II and III devices
 * - Recall management requires complete lot traceability
 * - Expiration compliance critical for patient safety
 * - Controlled substances require enhanced lot tracking
 *
 * Edge cases:
 * - Multiple receipts of same lot (same lot received on different dates)
 * - Lot expiration may differ from product default shelf life
 * - Recalled lots must be tracked to all consumption points
 * - Some suppliers use lot numbers, others use batch numbers
 */
export interface Lot {
  /** Unique lot identifier */
  id: LotId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Product reference */
  productId: ProductId;
  /** Lot number (from manufacturer/supplier) */
  lotNumber: string;
  /** Batch number (alternate identifier) */
  batchNumber?: string;
  /** Lot status */
  status: LotStatus;
  /** Manufacturer name */
  manufacturer: string;
  /** Expiration date */
  expirationDate: ISODateString;
  /** Manufacturing date (if available) */
  manufacturedDate?: ISODateString;
  /** Supplier who provided this lot */
  supplierId: SupplierId;
  /** Total quantity received (all receipts of this lot) */
  totalQuantityReceived: number;
  /** Current quantity remaining */
  currentQuantityRemaining: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Recall information (if recalled) */
  recallInfo?: {
    /** Recall number */
    recallNumber: string;
    /** Recall date */
    recallDate: ISODateString;
    /** Recall reason */
    reason: string;
    /** Recall severity (FDA classification I, II, III) */
    severity: string;
    /** Recall instructions */
    instructions?: string;
  };
  /** Quarantine information (if quarantined) */
  quarantineInfo?: {
    /** Quarantine date */
    quarantineDate: ISODateString;
    /** Quarantine reason */
    reason: string;
    /** Expected release date */
    expectedReleaseDate?: ISODateString;
  };
  /** Certificate of Analysis (COA) file reference */
  coaFileId?: UUID;
  /** Notes */
  notes?: string;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Expiration warning interface
 *
 * Warnings for items approaching expiration.
 *
 * Dental workflow:
 * - Staff need advance warning to use items before expiration
 * - Expired items must be removed from inventory immediately
 * - Typical warning thresholds: 90 days, 30 days, 7 days
 *
 * Edge cases:
 * - Some items have short shelf life (alginate: 6 months)
 * - Some items have long shelf life (instruments: no expiration)
 * - Opened items may have different expiration than sealed
 * - Warnings suppressed for already-ordered replacements
 */
export interface ExpirationWarning {
  /** Warning identifier */
  id: UUID;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** Product reference */
  productId: ProductId;
  /** Lot reference */
  lotId: LotId;
  /** Stock item reference */
  stockItemId: StockItemId;
  /** Expiration date */
  expirationDate: ISODateString;
  /** Days until expiration */
  daysUntilExpiration: number;
  /** Current quantity of expiring items */
  quantity: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Location of expiring items */
  locationId: StockLocationId;
  /** Warning severity (critical < 7 days, warning < 30 days, info < 90 days) */
  severity: 'critical' | 'warning' | 'info';
  /** Whether warning has been acknowledged */
  isAcknowledged: boolean;
  /** Acknowledged by (user ID) */
  acknowledgedBy?: UUID;
  /** Acknowledged at (timestamp) */
  acknowledgedAt?: ISODateString;
  /** Creation timestamp */
  createdAt: ISODateString;
}

/**
 * FEFO (First-Expire-First-Out) rule type
 *
 * Configuration for FEFO inventory management.
 *
 * Dental workflow:
 * - FEFO ensures items closest to expiration are used first
 * - Critical for patient safety and waste reduction
 * - Automated suggestions when selecting items for procedures
 *
 * Edge cases:
 * - FEFO can be overridden for specific clinical needs (shade matching)
 * - Reserved items may not follow FEFO if reserved for specific procedure
 * - Location-based FEFO (use items in operatory before fetching from central)
 */
export interface FEFORule {
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional, null = organization-wide) */
  clinicId?: ClinicId;
  /** Product category this rule applies to (null = all products) */
  productCategory?: ProductCategory;
  /** Specific products this rule applies to (empty = all in category) */
  productIds?: ProductId[];
  /** Whether FEFO is enabled */
  isEnabled: boolean;
  /** Warning threshold in days (warn when item expires in X days) */
  warningThresholdDays: number;
  /** Critical threshold in days (critical alert when item expires in X days) */
  criticalThresholdDays: number;
  /** Whether to allow manual override of FEFO */
  allowManualOverride: boolean;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
}

// ============================================================================
// PROCUREMENT TYPES
// ============================================================================

/**
 * Purchase order status enumeration
 *
 * Lifecycle status of purchase orders.
 *
 * Dental workflow:
 * - DRAFT: Being created, not yet submitted
 * - SUBMITTED: Sent to supplier, awaiting approval
 * - APPROVED: Supplier accepted order
 * - PARTIALLY_RECEIVED: Some items received, awaiting remainder
 * - RECEIVED: All items received, order complete
 * - CANCELLED: Order cancelled before receipt
 * - CLOSED: Order closed (may be partial receipt accepted as final)
 *
 * Edge cases:
 * - PARTIALLY_RECEIVED requires tracking which items received
 * - CANCELLED orders may have restocking fees
 * - CLOSED vs RECEIVED: CLOSED may be partial receipt accepted as complete
 * - Back-orders handled as new purchase orders or delayed line items
 */
export enum PurchaseOrderStatus {
  /** Draft, not yet submitted */
  DRAFT = 'draft',
  /** Submitted to supplier */
  SUBMITTED = 'submitted',
  /** Approved by supplier */
  APPROVED = 'approved',
  /** Partially received */
  PARTIALLY_RECEIVED = 'partially_received',
  /** Fully received */
  RECEIVED = 'received',
  /** Cancelled */
  CANCELLED = 'cancelled',
  /** Closed (may be partial) */
  CLOSED = 'closed',
}

/**
 * Purchase order item interface
 *
 * Individual line item in a purchase order.
 *
 * Edge cases:
 * - Quantity ordered may differ from quantity received
 * - Unit cost may change between order and receipt
 * - Back-ordered items tracked separately
 * - Partial receipts tracked with received/remaining quantities
 */
export interface PurchaseOrderItem {
  /** Item identifier */
  id: UUID;
  /** Product reference */
  productId: ProductId;
  /** Product variant (if applicable) */
  productVariantId?: ProductVariantId;
  /** Product name (snapshot at order time) */
  productName: string;
  /** Supplier SKU/part number */
  supplierSku?: string;
  /** Quantity ordered */
  quantityOrdered: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Unit cost at time of order */
  unitCost: MoneyValue;
  /** Total line cost (quantityOrdered * unitCost) */
  totalCost: MoneyValue;
  /** Quantity received (updated as goods received) */
  quantityReceived: number;
  /** Quantity remaining (quantityOrdered - quantityReceived) */
  quantityRemaining: number;
  /** Expected delivery date */
  expectedDeliveryDate?: ISODateString;
  /** Item notes */
  notes?: string;
}

/**
 * Purchase order entity (aggregate root)
 *
 * Complete purchase order for procurement.
 *
 * Dental workflow considerations:
 * - POs can be auto-generated when stock hits reorder point
 * - POs can be manual for one-time or special orders
 * - Standing orders for regular supplies (monthly glove order)
 * - Emergency orders for urgent needs
 * - POs track approval workflow (if required)
 *
 * Edge cases:
 * - Multi-supplier orders require separate POs
 * - Partial shipments require multiple goods receipts
 * - Back-orders may result in split deliveries
 * - PO amendments (add/remove items before approval)
 * - PO cancellation (before or after approval)
 * - Supplier credit memos linked to original PO
 */
export interface PurchaseOrder {
  /** Unique purchase order identifier */
  id: PurchaseOrderId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** PO number (human-readable, sequential) */
  poNumber: string;
  /** Purchase order status */
  status: PurchaseOrderStatus;
  /** Supplier reference */
  supplierId: SupplierId;
  /** Order date */
  orderDate: ISODateString;
  /** Expected delivery date */
  expectedDeliveryDate?: ISODateString;
  /** Actual delivery date (when all items received) */
  actualDeliveryDate?: ISODateString;
  /** Order line items */
  items: PurchaseOrderItem[];
  /** Subtotal (sum of item totals) */
  subtotal: MoneyValue;
  /** Tax amount */
  taxAmount?: MoneyValue;
  /** Shipping cost */
  shippingCost?: MoneyValue;
  /** Total cost (subtotal + tax + shipping) */
  totalCost: MoneyValue;
  /** Delivery address */
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Delivery instructions */
  deliveryInstructions?: string;
  /** User who created the PO */
  orderedBy: UUID;
  /** User who approved the PO (if required) */
  approvedBy?: UUID;
  /** Approval timestamp */
  approvedAt?: ISODateString;
  /** PO notes/comments */
  notes?: string;
  /** Supplier order reference (supplier's order number) */
  supplierOrderReference?: string;
  /** Supplier invoice reference (when received) */
  supplierInvoiceReference?: string;
  /** Payment terms */
  paymentTerms?: string;
  /** Cancellation reason (if cancelled) */
  cancellationReason?: string;
  /** Cancelled by (user ID) */
  cancelledBy?: UUID;
  /** Cancellation timestamp */
  cancelledAt?: ISODateString;
  /** Attached files (quotes, confirmations, etc.) */
  attachmentIds?: UUID[];
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created order */
  createdBy: UUID;
  /** User who last updated order */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Goods receipt item interface
 *
 * Individual line item in a goods receipt.
 *
 * Edge cases:
 * - Quantity received may differ from quantity ordered (overages, shortages)
 * - Damaged items tracked separately
 * - Lot/expiration captured at receipt time
 * - Unit cost may differ from PO (price changes, discounts)
 */
export interface GoodsReceiptItem {
  /** Item identifier */
  id: UUID;
  /** Related purchase order item (if from PO) */
  purchaseOrderItemId?: UUID;
  /** Product reference */
  productId: ProductId;
  /** Product variant (if applicable) */
  productVariantId?: ProductVariantId;
  /** Product name (snapshot at receipt time) */
  productName: string;
  /** Quantity received */
  quantityReceived: number;
  /** Quantity damaged/rejected */
  quantityDamaged?: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Unit cost (actual cost from invoice) */
  unitCost: MoneyValue;
  /** Total cost (quantityReceived * unitCost) */
  totalCost: MoneyValue;
  /** Lot/batch information */
  lotId?: LotId;
  /** Lot number (from supplier) */
  lotNumber?: string;
  /** Expiration date */
  expirationDate?: ISODateString;
  /** Storage location for received items */
  locationId: StockLocationId;
  /** Item notes */
  notes?: string;
}

/**
 * Goods receipt entity (aggregate root)
 *
 * Records receipt of goods from supplier.
 *
 * Dental workflow considerations:
 * - Goods receipts linked to purchase orders (if ordered)
 * - Goods receipts can be standalone (no PO for walk-in purchases)
 * - Receipt triggers stock increase and stock movement records
 * - Receipt captures lot/expiration at entry point
 * - Receipt may include packing slip/invoice images
 *
 * Edge cases:
 * - Partial receipts (multiple goods receipts for one PO)
 * - Overages (received more than ordered)
 * - Shortages (received less than ordered)
 * - Damaged items (recorded but not added to usable stock)
 * - Returns to supplier (negative goods receipt or separate transaction)
 * - Consignment stock (received but not owned until used)
 */
export interface GoodsReceipt {
  /** Unique goods receipt identifier */
  id: GoodsReceiptId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** Goods receipt number (human-readable, sequential) */
  receiptNumber: string;
  /** Related purchase order (if applicable) */
  purchaseOrderId?: PurchaseOrderId;
  /** Supplier reference */
  supplierId: SupplierId;
  /** Receipt date */
  receiptDate: ISODateString;
  /** Supplier invoice number */
  supplierInvoiceNumber?: string;
  /** Supplier packing slip number */
  packingSlipNumber?: string;
  /** Receipt line items */
  items: GoodsReceiptItem[];
  /** Subtotal (sum of item totals) */
  subtotal: MoneyValue;
  /** Tax amount */
  taxAmount?: MoneyValue;
  /** Shipping cost */
  shippingCost?: MoneyValue;
  /** Total cost (subtotal + tax + shipping) */
  totalCost: MoneyValue;
  /** User who received the goods */
  receivedBy: UUID;
  /** Receipt notes/comments */
  notes?: string;
  /** Discrepancies noted (shortages, damages, etc.) */
  discrepancies?: string;
  /** Attached files (packing slip, invoice images, etc.) */
  attachmentIds?: UUID[];
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created receipt */
  createdBy: UUID;
  /** User who last updated receipt */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Supplier status enumeration
 *
 * Status of suppliers.
 */
export enum SupplierStatus {
  /** Active supplier */
  ACTIVE = 'active',
  /** Inactive (not currently used) */
  INACTIVE = 'inactive',
  /** Suspended (quality issues, payment disputes, etc.) */
  SUSPENDED = 'suspended',
}

/**
 * Supplier interface
 *
 * Supplier/vendor master data.
 *
 * Dental workflow considerations:
 * - Suppliers provide products and materials
 * - Multiple suppliers for same products (competitive pricing)
 * - Preferred suppliers for specific product categories
 * - Supplier terms (payment, delivery, minimum orders)
 *
 * Edge cases:
 * - Multi-location suppliers (different warehouses)
 * - Supplier mergers/acquisitions (update references)
 * - Supplier representatives (account managers, sales reps)
 * - Supplier catalogs (integration for online ordering)
 * - Supplier pricing tiers (volume discounts)
 */
export interface Supplier {
  /** Unique supplier identifier */
  id: SupplierId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Supplier name */
  name: string;
  /** Supplier status */
  status: SupplierStatus;
  /** Supplier type (manufacturer, distributor, wholesaler, etc.) */
  supplierType?: string;
  /** Contact information */
  contact: {
    /** Primary contact name */
    contactName?: string;
    /** Primary phone */
    phone?: string;
    /** Primary email */
    email?: string;
    /** Website */
    website?: string;
    /** Fax */
    fax?: string;
  };
  /** Physical address */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Billing address (if different from physical) */
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Payment terms (Net 30, Net 60, etc.) */
  paymentTerms?: string;
  /** Tax ID / VAT number */
  taxId?: string;
  /** Account number (practice's account with supplier) */
  accountNumber?: string;
  /** Minimum order amount */
  minimumOrderAmount?: MoneyValue;
  /** Shipping cost threshold (free shipping over X) */
  freeShippingThreshold?: MoneyValue;
  /** Standard lead time in days */
  standardLeadTimeDays?: number;
  /** Preferred supplier (for auto-ordering) */
  isPreferred: boolean;
  /** Supplier representatives */
  representatives?: Array<{
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }>;
  /** Supplier notes */
  notes?: string;
  /** Supplier rating (1-5) */
  rating?: number;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created supplier */
  createdBy: UUID;
  /** User who last updated supplier */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// PROCEDURE MATERIALS & COSTING TYPES
// ============================================================================

/**
 * Material usage interface
 *
 * Records materials consumed in a procedure.
 *
 * Dental workflow:
 * - Materials automatically deducted from stock when procedure completed
 * - Usage tracked for procedure costing and profitability analysis
 * - Usage links to specific lot/expiration for compliance
 *
 * Edge cases:
 * - Fractional quantities (0.5 tube of composite)
 * - Material waste (unused portion of opened material)
 * - Material substitution (requested item unavailable, used alternative)
 * - Multiple lots used in single procedure (mixing shades)
 */
export interface MaterialUsage {
  /** Usage identifier */
  id: UUID;
  /** Product used */
  productId: ProductId;
  /** Product variant (if applicable) */
  productVariantId?: ProductVariantId;
  /** Product name (snapshot) */
  productName: string;
  /** Quantity consumed */
  quantityUsed: number;
  /** Unit of measure */
  unitOfMeasure: UnitOfMeasure;
  /** Lot used (if tracked) */
  lotId?: LotId;
  /** Lot number */
  lotNumber?: string;
  /** Stock item consumed from */
  stockItemId?: StockItemId;
  /** Unit cost at time of use */
  unitCost: MoneyValue;
  /** Total material cost (quantityUsed * unitCost) */
  totalCost: MoneyValue;
  /** Whether material was wasted (opened but not fully used) */
  wasWasted: boolean;
  /** Waste quantity (if applicable) */
  wasteQuantity?: number;
  /** Notes */
  notes?: string;
}

/**
 * Procedure bill of materials (BOM) interface
 *
 * Standard materials list for procedures.
 *
 * Dental workflow:
 * - BOMs define expected materials for procedure types
 * - BOMs used for automated stock deduction
 * - BOMs used for procedure costing estimates
 * - BOMs can be templates or procedure-specific
 *
 * Edge cases:
 * - BOMs can have optional materials (based on clinical situation)
 * - BOMs can have alternative materials (different brands, same purpose)
 * - BOMs updated based on actual usage patterns
 * - BOMs may include instrument references (for sterilization tracking)
 */
export interface ProcedureBillOfMaterials {
  /** Unique BOM identifier */
  id: BOMId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional, null = organization-wide) */
  clinicId?: ClinicId;
  /** BOM name */
  name: string;
  /** BOM description */
  description?: string;
  /** Procedure code (ADA/CDT code if procedure-specific) */
  procedureCode?: string;
  /** Procedure category */
  procedureCategory?: string;
  /** Materials in BOM */
  materials: Array<{
    /** Product reference */
    productId: ProductId;
    /** Product variant (if specific variant required) */
    productVariantId?: ProductVariantId;
    /** Product name */
    productName: string;
    /** Standard quantity */
    quantity: number;
    /** Unit of measure */
    unitOfMeasure: UnitOfMeasure;
    /** Whether material is required (vs optional) */
    isRequired: boolean;
    /** Alternative products (if substitution allowed) */
    alternatives?: ProductId[];
    /** Usage notes */
    notes?: string;
  }>;
  /** Instruments used (for sterilization tracking integration) */
  instruments?: Array<{
    /** Product reference (instrument) */
    productId: ProductId;
    /** Instrument name */
    instrumentName: string;
    /** Quantity required */
    quantity: number;
    /** Whether instrument is required (vs optional) */
    isRequired: boolean;
    /** Usage notes */
    notes?: string;
  }>;
  /** Total estimated material cost */
  estimatedMaterialCost: MoneyValue;
  /** Whether BOM is active/in use */
  isActive: boolean;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created BOM */
  createdBy: UUID;
  /** User who last updated BOM */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Cost allocation interface
 *
 * Tracks costs allocated to procedures, patients, or providers.
 *
 * Dental workflow:
 * - Cost allocation for procedure profitability analysis
 * - Cost allocation for provider productivity tracking
 * - Cost allocation for patient lifetime value analysis
 *
 * Edge cases:
 * - Shared costs (overhead, utilities) allocated by percentage
 * - Direct costs (materials, lab fees) allocated 100% to procedure
 * - Staff time allocated based on procedure duration
 * - Equipment depreciation allocated based on usage
 */
export interface CostAllocation {
  /** Allocation identifier */
  id: UUID;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope */
  clinicId: ClinicId;
  /** Allocation date */
  allocationDate: ISODateString;
  /** Procedure reference (if procedure-specific) */
  procedureId?: ProcedureId;
  /** Provider reference (if provider-specific) */
  providerId?: ProviderId;
  /** Cost category (materials, labor, overhead, etc.) */
  costCategory: string;
  /** Cost amount */
  amount: MoneyValue;
  /** Cost description */
  description: string;
  /** Materials used (if materials cost) */
  materials?: MaterialUsage[];
  /** Notes */
  notes?: string;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// STERILIZATION INTEGRATION TYPES (Feature 12)
// ============================================================================

/**
 * Sterilization cycle reference interface
 *
 * References sterilization cycles from Feature 12.
 *
 * Integration considerations:
 * - Instruments tracked through sterilization cycles
 * - Cycle count incremented with each sterilization
 * - Instruments retired when max cycles reached
 * - Failed cycles require re-sterilization (no cycle count increment)
 *
 * Edge cases:
 * - Instruments may have max cycle limits (fatigue, wear)
 * - Some instruments unlimited cycles (stainless steel mirrors)
 * - Failed cycles don't count toward instrument lifecycle
 * - Emergency sterilization (flash sterilization) tracked separately
 */
export interface SterilizationCycleReference {
  /** Cycle identifier (from sterilization service) */
  cycleId: SterilizationCycleId;
  /** Cycle number (human-readable) */
  cycleNumber: string;
  /** Cycle date */
  cycleDate: ISODateString;
  /** Sterilizer used */
  sterilizerId?: UUID;
  /** Cycle type (steam, dry heat, chemical, etc.) */
  cycleType?: string;
  /** Cycle status (passed, failed) */
  cycleStatus: 'passed' | 'failed' | 'pending';
  /** Cycle temperature */
  temperature?: number;
  /** Cycle duration in minutes */
  durationMinutes?: number;
}

/**
 * Sterilizable product interface
 *
 * Extends product with sterilization tracking.
 *
 * Dental workflow:
 * - Reusable instruments require sterilization between uses
 * - Instrument cycle count tracked for lifecycle management
 * - Instruments retired when max cycles reached or damaged
 *
 * Edge cases:
 * - Different instrument types have different max cycles
 * - Some instruments (mirrors) have unlimited cycles
 * - Handpieces have specific sterilization requirements
 * - Composite instruments may have coating that wears
 */
export interface SterilizableProduct {
  /** Product reference */
  productId: ProductId;
  /** Product name */
  productName: string;
  /** Maximum sterilization cycles (null = unlimited) */
  maxSterilizationCycles?: number;
  /** Recommended sterilization method */
  recommendedSterilizationMethod?: string;
  /** Sterilization temperature (if specific) */
  sterilizationTemperature?: number;
  /** Sterilization duration (if specific) */
  sterilizationDurationMinutes?: number;
  /** Special sterilization instructions */
  sterilizationInstructions?: string;
  /** Manufacturer sterilization guidelines URL */
  sterilizationGuidelinesUrl?: string;
}

/**
 * Instrument cycle count tracking
 *
 * Tracks sterilization cycles for individual instruments.
 *
 * Integration with Feature 12:
 * - When sterilization cycle completed, instrument cycle count incremented
 * - When max cycles reached, instrument flagged for retirement
 * - Cycle history maintained for compliance and warranty
 *
 * Edge cases:
 * - Instruments may be re-sharpened (resets some wear but not cycle count)
 * - Instruments may be repaired (may reset cycle count with manufacturer certification)
 * - Lost instruments require removal from tracking
 * - Loaner instruments tracked separately (not owned, cycle count informational)
 */
export interface InstrumentCycleTracking {
  /** Stock item reference (specific instrument instance) */
  stockItemId: StockItemId;
  /** Product reference */
  productId: ProductId;
  /** Current cycle count */
  currentCycles: number;
  /** Maximum cycles (from product or instance-specific) */
  maxCycles?: number;
  /** Last sterilization cycle reference */
  lastCycleId?: SterilizationCycleId;
  /** Last sterilization date */
  lastSterilizedAt?: ISODateString;
  /** Next sterilization due date (if scheduled) */
  nextSterilizationDue?: ISODateString;
  /** Whether instrument is due for retirement */
  isDueForRetirement: boolean;
  /** Cycle history (last N cycles) */
  cycleHistory?: SterilizationCycleReference[];
  /** Maintenance history (sharpening, repairs) */
  maintenanceHistory?: Array<{
    maintenanceDate: ISODateString;
    maintenanceType: string;
    performedBy: UUID;
    notes?: string;
  }>;
  /** Retirement date (if retired) */
  retiredAt?: ISODateString;
  /** Retirement reason */
  retirementReason?: string;
  /** Last update timestamp */
  updatedAt: ISODateString;
}
