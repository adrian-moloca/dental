/**
 * Inventory & Procurement Validation Schemas
 * @module shared-validation/schemas/inventory
 *
 * Comprehensive Zod validation schemas for:
 * - Product/Catalog Management
 * - Stock Operations (FEFO/FIFO consumption, restock, transfers)
 * - Purchase Orders & Goods Receipts
 * - Supplier Management
 * - Procedure Materials Tracking
 */

import { z } from 'zod';
import {
  ProductCategory,
  UnitOfMeasure,
  ProductStatus,
  StockStatus,
  MovementType,
  PurchaseOrderStatus,
  SupplierStatus,
  LocationType,
  GoodsReceiptStatus,
} from '@dentalos/shared-types';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  ISODateStringSchema,
  DateOnlySchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
} from '../common.schemas';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

/**
 * Product category enum schema
 */
export const ProductCategorySchema = z.nativeEnum(ProductCategory, {
  errorMap: (): { message: string } => ({ message: 'Invalid product category' }),
});

/**
 * Unit of measure enum schema
 */
export const UnitOfMeasureSchema = z.nativeEnum(UnitOfMeasure, {
  errorMap: (): { message: string } => ({ message: 'Invalid unit of measure' }),
});

/**
 * Product status enum schema
 */
export const ProductStatusSchema = z.nativeEnum(ProductStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid product status' }),
});

/**
 * Stock status enum schema
 */
export const StockStatusSchema = z.nativeEnum(StockStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid stock status' }),
});

/**
 * Movement type enum schema
 */
export const MovementTypeSchema = z.nativeEnum(MovementType, {
  errorMap: (): { message: string } => ({ message: 'Invalid movement type' }),
});

/**
 * Purchase order status enum schema
 */
export const PurchaseOrderStatusSchema = z.nativeEnum(PurchaseOrderStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid purchase order status' }),
});

/**
 * Supplier status enum schema
 */
export const SupplierStatusSchema = z.nativeEnum(SupplierStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid supplier status' }),
});

/**
 * Location type enum schema
 */
export const LocationTypeSchema = z.nativeEnum(LocationType, {
  errorMap: (): { message: string } => ({ message: 'Invalid location type' }),
});

/**
 * Goods receipt status enum schema
 */
export const GoodsReceiptStatusSchema = z.nativeEnum(GoodsReceiptStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid goods receipt status' }),
});

// ============================================================================
// VALUE OBJECT SCHEMAS
// ============================================================================

/**
 * Quantity schema with positive validation
 * Used for all stock quantities (must be > 0 for operations)
 */
export const QuantitySchema = z.number().positive('Quantity must be greater than 0').finite();

/**
 * Non-negative quantity schema
 * Used for stock levels (can be 0)
 */
export const StockLevelSchema = z
  .number()
  .nonnegative('Stock level cannot be negative')
  .finite();

/**
 * Price/Cost schema (non-negative, max 2 decimal places)
 */
export const PriceSchema = z
  .number()
  .nonnegative('Price cannot be negative')
  .finite()
  .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
    message: 'Price must have at most 2 decimal places',
  });

/**
 * Lot number schema (alphanumeric with hyphens/underscores)
 */
export const LotNumberSchema = z
  .string()
  .min(1, 'Lot number cannot be empty')
  .max(100, 'Lot number must be 100 characters or less')
  .regex(/^[A-Za-z0-9\-_]+$/, {
    message: 'Lot number must contain only letters, numbers, hyphens, and underscores',
  })
  .trim();

/**
 * Serial number schema
 */
export const SerialNumberSchema = z
  .string()
  .min(1, 'Serial number cannot be empty')
  .max(100, 'Serial number must be 100 characters or less')
  .trim();

/**
 * SKU (Stock Keeping Unit) schema
 */
export const SKUSchema = z
  .string()
  .min(1, 'SKU cannot be empty')
  .max(50, 'SKU must be 50 characters or less')
  .regex(/^[A-Za-z0-9\-_]+$/, {
    message: 'SKU must contain only letters, numbers, hyphens, and underscores',
  })
  .trim()
  .toUpperCase();

/**
 * Expiration date schema (must be in the future for new lots)
 */
export const ExpirationDateSchema = DateOnlySchema;

/**
 * Future expiration date schema with validation
 */
export const FutureExpirationDateSchema = DateOnlySchema.refine(
  (val) => new Date(val) > new Date(),
  {
    message: 'Expiration date must be in the future',
  }
);

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

/**
 * Create Product DTO Schema
 * For creating new products in the catalog
 */
export const CreateProductDtoSchema = z
  .object({
    sku: SKUSchema,
    name: NonEmptyStringSchema.max(200, 'Product name must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    category: ProductCategorySchema,
    unitOfMeasure: UnitOfMeasureSchema,
    costPrice: PriceSchema,
    sellPrice: PriceSchema,
    reorderPoint: StockLevelSchema,
    reorderQuantity: QuantitySchema,
    supplierId: UUIDSchema.optional(),
    requiresLot: z.boolean().default(false),
    requiresSerial: z.boolean().default(false),
    requiresSterilization: z.boolean().default(false),
    isActive: z.boolean().default(true),
    clinicId: UUIDSchema,
  })
  .refine((data) => data.sellPrice >= data.costPrice, {
    message: 'Sell price must be greater than or equal to cost price',
    path: ['sellPrice'],
  })
  .refine((data) => data.reorderQuantity >= data.reorderPoint, {
    message: 'Reorder quantity must be greater than or equal to reorder point',
    path: ['reorderQuantity'],
  })
  .refine((data) => !(data.requiresLot && data.requiresSerial), {
    message: 'Product cannot require both lot tracking and serial tracking',
    path: ['requiresSerial'],
  });

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;

/**
 * Update Product DTO Schema
 * For partial updates to existing products
 */
export const UpdateProductDtoSchema = z
  .object({
    name: NonEmptyStringSchema.max(200).optional(),
    description: z.string().max(1000).optional(),
    category: ProductCategorySchema.optional(),
    unitOfMeasure: UnitOfMeasureSchema.optional(),
    costPrice: PriceSchema.optional(),
    sellPrice: PriceSchema.optional(),
    reorderPoint: StockLevelSchema.optional(),
    reorderQuantity: QuantitySchema.optional(),
    supplierId: UUIDSchema.optional().nullable(),
    requiresLot: z.boolean().optional(),
    requiresSerial: z.boolean().optional(),
    requiresSterilization: z.boolean().optional(),
    status: ProductStatusSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.sellPrice !== undefined && data.costPrice !== undefined) {
        return data.sellPrice >= data.costPrice;
      }
      return true;
    },
    {
      message: 'Sell price must be greater than or equal to cost price',
      path: ['sellPrice'],
    }
  )
  .refine(
    (data) => {
      if (data.reorderQuantity !== undefined && data.reorderPoint !== undefined) {
        return data.reorderQuantity >= data.reorderPoint;
      }
      return true;
    },
    {
      message: 'Reorder quantity must be greater than or equal to reorder point',
      path: ['reorderQuantity'],
    }
  );

export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;

/**
 * Query Products DTO Schema
 * For filtering and paginating product listings
 */
export const QueryProductsDtoSchema = z.object({
  category: ProductCategorySchema.optional(),
  status: ProductStatusSchema.optional(),
  supplierId: UUIDSchema.optional(),
  search: z.string().max(100).optional(),
  requiresSterilization: z.boolean().optional(),
  requiresLot: z.boolean().optional(),
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'sku', 'category', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryProductsDto = z.infer<typeof QueryProductsDtoSchema>;

// ============================================================================
// STOCK OPERATION SCHEMAS
// ============================================================================

/**
 * Deduct Stock DTO Schema
 * For consuming stock during procedures or manual deductions
 * FEFO/FIFO logic is applied server-side
 */
export const DeductStockDtoSchema = z.object({
  productId: UUIDSchema,
  quantity: QuantitySchema,
  lotNumber: LotNumberSchema.optional(),
  serialNumber: SerialNumberSchema.optional(),
  locationId: UUIDSchema,
  procedureId: UUIDSchema.optional(),
  treatmentPlanId: UUIDSchema.optional(),
  reason: NonEmptyStringSchema.max(500),
  performedBy: UUIDSchema,
  notes: z.string().max(1000).optional(),
});

export type DeductStockDto = z.infer<typeof DeductStockDtoSchema>;

/**
 * Restock DTO Schema
 * For receiving stock (usually from goods receipt)
 */
export const RestockDtoSchema = z
  .object({
    productId: UUIDSchema,
    quantity: QuantitySchema,
    lotNumber: LotNumberSchema.optional(),
    serialNumber: SerialNumberSchema.optional(),
    expirationDate: ExpirationDateSchema.optional(),
    locationId: UUIDSchema,
    goodsReceiptId: UUIDSchema.optional(),
    costPerUnit: PriceSchema,
    receivedBy: UUIDSchema,
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      // If expiration date provided, validate it's in the future
      if (data.expirationDate) {
        return new Date(data.expirationDate) > new Date();
      }
      return true;
    },
    {
      message: 'Expiration date must be in the future',
      path: ['expirationDate'],
    }
  );

export type RestockDto = z.infer<typeof RestockDtoSchema>;

/**
 * Stock Transfer DTO Schema
 * For transferring stock between locations
 */
export const StockTransferDtoSchema = z
  .object({
    productId: UUIDSchema,
    quantity: QuantitySchema,
    lotNumber: LotNumberSchema.optional(),
    serialNumber: SerialNumberSchema.optional(),
    fromLocationId: UUIDSchema,
    toLocationId: UUIDSchema,
    reason: NonEmptyStringSchema.max(500),
    performedBy: UUIDSchema,
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: 'Source and destination locations must be different',
    path: ['toLocationId'],
  });

export type StockTransferDto = z.infer<typeof StockTransferDtoSchema>;

/**
 * Stock Adjustment DTO Schema
 * For manual stock corrections (stocktake, damage, theft)
 */
export const StockAdjustmentDtoSchema = z.object({
  productId: UUIDSchema,
  lotNumber: LotNumberSchema.optional(),
  serialNumber: SerialNumberSchema.optional(),
  locationId: UUIDSchema,
  adjustmentType: z.enum([
    'INCREASE',
    'DECREASE',
    'STOCKTAKE',
    'DAMAGE',
    'THEFT',
    'EXPIRY',
    'OTHER',
  ]),
  quantity: QuantitySchema,
  reason: NonEmptyStringSchema.max(500),
  performedBy: UUIDSchema,
  notes: z.string().max(1000).optional(),
});

export type StockAdjustmentDto = z.infer<typeof StockAdjustmentDtoSchema>;

/**
 * Stock Location DTO Schema
 * For defining storage locations
 */
export const StockLocationDtoSchema = z.object({
  locationId: UUIDSchema.optional(), // Optional for creation
  name: NonEmptyStringSchema.max(200),
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z0-9\-_]+$/, {
      message: 'Location code must contain only uppercase letters, numbers, hyphens, and underscores',
    })
    .optional(),
  type: LocationTypeSchema,
  parentLocationId: UUIDSchema.optional().nullable(),
  clinicId: UUIDSchema,
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export type StockLocationDto = z.infer<typeof StockLocationDtoSchema>;

/**
 * Query Expiring Stock DTO Schema
 * For finding stock that will expire soon
 */
export const QueryExpiringStockDtoSchema = z.object({
  days: z.number().int().min(1).max(365).default(30),
  locationId: UUIDSchema.optional(),
  clinicId: UUIDSchema,
  productCategory: ProductCategorySchema.optional(),
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type QueryExpiringStockDto = z.infer<typeof QueryExpiringStockDtoSchema>;

/**
 * Query Stock Levels DTO Schema
 * For checking current stock availability
 */
export const QueryStockLevelsDtoSchema = z.object({
  productId: UUIDSchema.optional(),
  locationId: UUIDSchema.optional(),
  clinicId: UUIDSchema,
  status: StockStatusSchema.optional(),
  lowStockOnly: z.boolean().default(false),
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type QueryStockLevelsDto = z.infer<typeof QueryStockLevelsDtoSchema>;

// ============================================================================
// PURCHASE ORDER SCHEMAS
// ============================================================================

/**
 * Purchase Order Item Schema
 * Individual line item in a purchase order
 */
export const PurchaseOrderItemSchema = z.object({
  productId: UUIDSchema,
  quantity: QuantitySchema,
  unitPrice: PriceSchema,
  notes: z.string().max(500).optional(),
});

export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;

/**
 * Create Purchase Order DTO Schema
 */
export const CreatePurchaseOrderDtoSchema = z
  .object({
    supplierId: UUIDSchema,
    items: z.array(PurchaseOrderItemSchema).min(1, 'Purchase order must have at least one item'),
    expectedDeliveryDate: DateOnlySchema,
    deliveryLocationId: UUIDSchema,
    clinicId: UUIDSchema,
    requestedBy: UUIDSchema,
    notes: z.string().max(2000).optional(),
    referenceNumber: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      // Expected delivery date must be in the future
      const deliveryDate = new Date(data.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deliveryDate >= today;
    },
    {
      message: 'Expected delivery date must be today or in the future',
      path: ['expectedDeliveryDate'],
    }
  );

export type CreatePurchaseOrderDto = z.infer<typeof CreatePurchaseOrderDtoSchema>;

/**
 * Update Purchase Order DTO Schema
 */
export const UpdatePurchaseOrderDtoSchema = z.object({
  expectedDeliveryDate: DateOnlySchema.optional(),
  deliveryLocationId: UUIDSchema.optional(),
  notes: z.string().max(2000).optional(),
  referenceNumber: z.string().max(100).optional(),
});

export type UpdatePurchaseOrderDto = z.infer<typeof UpdatePurchaseOrderDtoSchema>;

/**
 * Approve Purchase Order DTO Schema
 */
export const ApprovePurchaseOrderDtoSchema = z.object({
  approvedBy: UUIDSchema,
  approvalNotes: z.string().max(1000).optional(),
});

export type ApprovePurchaseOrderDto = z.infer<typeof ApprovePurchaseOrderDtoSchema>;

/**
 * Reject Purchase Order DTO Schema
 */
export const RejectPurchaseOrderDtoSchema = z.object({
  rejectedBy: UUIDSchema,
  rejectionReason: NonEmptyStringSchema.max(1000),
});

export type RejectPurchaseOrderDto = z.infer<typeof RejectPurchaseOrderDtoSchema>;

/**
 * Query Purchase Orders DTO Schema
 */
export const QueryPurchaseOrdersDtoSchema = z.object({
  supplierId: UUIDSchema.optional(),
  status: PurchaseOrderStatusSchema.optional(),
  clinicId: UUIDSchema,
  requestedBy: UUIDSchema.optional(),
  fromDate: DateOnlySchema.optional(),
  toDate: DateOnlySchema.optional(),
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'expectedDeliveryDate', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryPurchaseOrdersDto = z.infer<typeof QueryPurchaseOrdersDtoSchema>;

// ============================================================================
// GOODS RECEIPT SCHEMAS
// ============================================================================

/**
 * Goods Receipt Item Schema
 * Individual line item received in a goods receipt
 */
export const GoodsReceiptItemSchema = z
  .object({
    productId: UUIDSchema,
    quantity: QuantitySchema,
    lotNumber: LotNumberSchema.optional(),
    serialNumber: SerialNumberSchema.optional(),
    expirationDate: ExpirationDateSchema.optional(),
    costPerUnit: PriceSchema,
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // If expiration date provided, validate it's in the future
      if (data.expirationDate) {
        return new Date(data.expirationDate) > new Date();
      }
      return true;
    },
    {
      message: 'Expiration date must be in the future',
      path: ['expirationDate'],
    }
  );

export type GoodsReceiptItem = z.infer<typeof GoodsReceiptItemSchema>;

/**
 * Create Goods Receipt DTO Schema
 * Can be linked to a PO or standalone (ad-hoc receipt)
 */
export const CreateGoodsReceiptDtoSchema = z.object({
  purchaseOrderId: UUIDSchema.optional(),
  supplierId: UUIDSchema,
  items: z.array(GoodsReceiptItemSchema).min(1, 'Goods receipt must have at least one item'),
  locationId: UUIDSchema,
  clinicId: UUIDSchema,
  receivedBy: UUIDSchema,
  receivedDate: ISODateStringSchema.default(() => new Date().toISOString()),
  notes: z.string().max(2000).optional(),
  invoiceNumber: z.string().max(100).optional(),
  deliveryNoteNumber: z.string().max(100).optional(),
});

export type CreateGoodsReceiptDto = z.infer<typeof CreateGoodsReceiptDtoSchema>;

/**
 * Accept Goods Receipt DTO Schema
 * For quality control acceptance
 */
export const AcceptGoodsReceiptDtoSchema = z.object({
  acceptedBy: UUIDSchema,
  acceptanceNotes: z.string().max(1000).optional(),
});

export type AcceptGoodsReceiptDto = z.infer<typeof AcceptGoodsReceiptDtoSchema>;

/**
 * Query Goods Receipts DTO Schema
 */
export const QueryGoodsReceiptsDtoSchema = z.object({
  purchaseOrderId: UUIDSchema.optional(),
  supplierId: UUIDSchema.optional(),
  status: GoodsReceiptStatusSchema.optional(),
  clinicId: UUIDSchema,
  receivedBy: UUIDSchema.optional(),
  fromDate: DateOnlySchema.optional(),
  toDate: DateOnlySchema.optional(),
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['receivedDate', 'createdAt']).default('receivedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryGoodsReceiptsDto = z.infer<typeof QueryGoodsReceiptsDtoSchema>;

// ============================================================================
// SUPPLIER SCHEMAS
// ============================================================================

/**
 * Create Supplier DTO Schema
 */
export const CreateSupplierDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200),
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z0-9\-_]+$/, {
      message: 'Supplier code must contain only uppercase letters, numbers, hyphens, and underscores',
    })
    .optional(),
  contactName: NonEmptyStringSchema.max(200),
  email: EmailSchema,
  phone: PhoneNumberSchema.optional(),
  address: z
    .object({
      street: NonEmptyStringSchema.max(200),
      city: NonEmptyStringSchema.max(100),
      state: z.string().max(100).optional(),
      postalCode: z.string().max(20),
      country: NonEmptyStringSchema.max(100),
    })
    .optional(),
  paymentTerms: z.string().max(200).optional(),
  taxId: z.string().max(50).optional(),
  website: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
  clinicId: UUIDSchema,
});

export type CreateSupplierDto = z.infer<typeof CreateSupplierDtoSchema>;

/**
 * Update Supplier DTO Schema
 */
export const UpdateSupplierDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200).optional(),
  contactName: NonEmptyStringSchema.max(200).optional(),
  email: EmailSchema.optional(),
  phone: PhoneNumberSchema.optional().nullable(),
  address: z
    .object({
      street: NonEmptyStringSchema.max(200),
      city: NonEmptyStringSchema.max(100),
      state: z.string().max(100).optional(),
      postalCode: z.string().max(20),
      country: NonEmptyStringSchema.max(100),
    })
    .optional()
    .nullable(),
  paymentTerms: z.string().max(200).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  website: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: SupplierStatusSchema.optional(),
});

export type UpdateSupplierDto = z.infer<typeof UpdateSupplierDtoSchema>;

/**
 * Query Suppliers DTO Schema
 */
export const QuerySuppliersDtoSchema = z.object({
  status: SupplierStatusSchema.optional(),
  search: z.string().max(100).optional(),
  clinicId: UUIDSchema,
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type QuerySuppliersDto = z.infer<typeof QuerySuppliersDtoSchema>;

// ============================================================================
// PROCEDURE MATERIALS SCHEMAS
// ============================================================================

/**
 * Procedure Material Item Schema
 * Single material used in a procedure
 */
export const ProcedureMaterialItemSchema = z.object({
  productId: UUIDSchema,
  quantity: QuantitySchema,
  lotNumber: LotNumberSchema.optional(),
  serialNumber: SerialNumberSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type ProcedureMaterialItem = z.infer<typeof ProcedureMaterialItemSchema>;

/**
 * Procedure Bill of Materials Schema
 * Complete list of materials consumed in a procedure
 */
export const ProcedureBillOfMaterialsSchema = z.object({
  procedureId: UUIDSchema,
  treatmentPlanId: UUIDSchema.optional(),
  patientId: UUIDSchema,
  materials: z
    .array(ProcedureMaterialItemSchema)
    .min(1, 'At least one material must be specified'),
  performedBy: UUIDSchema,
  performedAt: ISODateStringSchema.default(() => new Date().toISOString()),
  notes: z.string().max(1000).optional(),
});

export type ProcedureBillOfMaterialsDto = z.infer<typeof ProcedureBillOfMaterialsSchema>;

/**
 * Batch Consume Stock DTO Schema
 * For consuming multiple products in a single transaction
 */
export const BatchConsumeStockDtoSchema = z.object({
  consumptions: z.array(DeductStockDtoSchema).min(1, 'At least one consumption must be specified'),
  transactionId: UUIDSchema.optional(), // Optional idempotency key
});

export type BatchConsumeStockDto = z.infer<typeof BatchConsumeStockDtoSchema>;

// ============================================================================
// STOCK MOVEMENT HISTORY SCHEMAS
// ============================================================================

/**
 * Query Stock Movements DTO Schema
 * For audit trail and movement history
 */
export const QueryStockMovementsDtoSchema = z.object({
  productId: UUIDSchema.optional(),
  lotNumber: LotNumberSchema.optional(),
  locationId: UUIDSchema.optional(),
  movementType: MovementTypeSchema.optional(),
  clinicId: UUIDSchema,
  fromDate: ISODateStringSchema.optional(),
  toDate: ISODateStringSchema.optional(),
  performedBy: UUIDSchema.optional(),
  page: PositiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'quantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryStockMovementsDto = z.infer<typeof QueryStockMovementsDtoSchema>;

// ============================================================================
// INVENTORY VALUATION SCHEMAS
// ============================================================================

/**
 * Query Inventory Valuation DTO Schema
 * For financial reporting (FIFO cost basis)
 */
export const QueryInventoryValuationDtoSchema = z.object({
  clinicId: UUIDSchema,
  locationId: UUIDSchema.optional(),
  category: ProductCategorySchema.optional(),
  asOfDate: DateOnlySchema.default(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }),
});

export type QueryInventoryValuationDto = z.infer<typeof QueryInventoryValuationDtoSchema>;
