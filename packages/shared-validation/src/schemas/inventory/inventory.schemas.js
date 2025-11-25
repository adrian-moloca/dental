"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryInventoryValuationDtoSchema = exports.QueryStockMovementsDtoSchema = exports.BatchConsumeStockDtoSchema = exports.ProcedureBillOfMaterialsSchema = exports.ProcedureMaterialItemSchema = exports.QuerySuppliersDtoSchema = exports.UpdateSupplierDtoSchema = exports.CreateSupplierDtoSchema = exports.QueryGoodsReceiptsDtoSchema = exports.AcceptGoodsReceiptDtoSchema = exports.CreateGoodsReceiptDtoSchema = exports.GoodsReceiptItemSchema = exports.QueryPurchaseOrdersDtoSchema = exports.RejectPurchaseOrderDtoSchema = exports.ApprovePurchaseOrderDtoSchema = exports.UpdatePurchaseOrderDtoSchema = exports.CreatePurchaseOrderDtoSchema = exports.PurchaseOrderItemSchema = exports.QueryStockLevelsDtoSchema = exports.QueryExpiringStockDtoSchema = exports.StockLocationDtoSchema = exports.StockAdjustmentDtoSchema = exports.StockTransferDtoSchema = exports.RestockDtoSchema = exports.DeductStockDtoSchema = exports.QueryProductsDtoSchema = exports.UpdateProductDtoSchema = exports.CreateProductDtoSchema = exports.FutureExpirationDateSchema = exports.ExpirationDateSchema = exports.SKUSchema = exports.SerialNumberSchema = exports.LotNumberSchema = exports.PriceSchema = exports.StockLevelSchema = exports.QuantitySchema = exports.GoodsReceiptStatusSchema = exports.LocationTypeSchema = exports.SupplierStatusSchema = exports.PurchaseOrderStatusSchema = exports.MovementTypeSchema = exports.StockStatusSchema = exports.ProductStatusSchema = exports.UnitOfMeasureSchema = exports.ProductCategorySchema = void 0;
const zod_1 = require("zod");
const shared_types_1 = require("@dentalos/shared-types");
const common_schemas_1 = require("../common.schemas");
exports.ProductCategorySchema = zod_1.z.nativeEnum(shared_types_1.ProductCategory, {
    errorMap: () => ({ message: 'Invalid product category' }),
});
exports.UnitOfMeasureSchema = zod_1.z.nativeEnum(shared_types_1.UnitOfMeasure, {
    errorMap: () => ({ message: 'Invalid unit of measure' }),
});
exports.ProductStatusSchema = zod_1.z.nativeEnum(shared_types_1.ProductStatus, {
    errorMap: () => ({ message: 'Invalid product status' }),
});
exports.StockStatusSchema = zod_1.z.nativeEnum(shared_types_1.StockStatus, {
    errorMap: () => ({ message: 'Invalid stock status' }),
});
exports.MovementTypeSchema = zod_1.z.nativeEnum(shared_types_1.MovementType, {
    errorMap: () => ({ message: 'Invalid movement type' }),
});
exports.PurchaseOrderStatusSchema = zod_1.z.nativeEnum(shared_types_1.PurchaseOrderStatus, {
    errorMap: () => ({ message: 'Invalid purchase order status' }),
});
exports.SupplierStatusSchema = zod_1.z.nativeEnum(shared_types_1.SupplierStatus, {
    errorMap: () => ({ message: 'Invalid supplier status' }),
});
exports.LocationTypeSchema = zod_1.z.nativeEnum(shared_types_1.LocationType, {
    errorMap: () => ({ message: 'Invalid location type' }),
});
exports.GoodsReceiptStatusSchema = zod_1.z.nativeEnum(shared_types_1.GoodsReceiptStatus, {
    errorMap: () => ({ message: 'Invalid goods receipt status' }),
});
exports.QuantitySchema = zod_1.z.number().positive('Quantity must be greater than 0').finite();
exports.StockLevelSchema = zod_1.z
    .number()
    .nonnegative('Stock level cannot be negative')
    .finite();
exports.PriceSchema = zod_1.z
    .number()
    .nonnegative('Price cannot be negative')
    .finite()
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
    message: 'Price must have at most 2 decimal places',
});
exports.LotNumberSchema = zod_1.z
    .string()
    .min(1, 'Lot number cannot be empty')
    .max(100, 'Lot number must be 100 characters or less')
    .regex(/^[A-Za-z0-9\-_]+$/, {
    message: 'Lot number must contain only letters, numbers, hyphens, and underscores',
})
    .trim();
exports.SerialNumberSchema = zod_1.z
    .string()
    .min(1, 'Serial number cannot be empty')
    .max(100, 'Serial number must be 100 characters or less')
    .trim();
exports.SKUSchema = zod_1.z
    .string()
    .min(1, 'SKU cannot be empty')
    .max(50, 'SKU must be 50 characters or less')
    .regex(/^[A-Za-z0-9\-_]+$/, {
    message: 'SKU must contain only letters, numbers, hyphens, and underscores',
})
    .trim()
    .toUpperCase();
exports.ExpirationDateSchema = common_schemas_1.DateOnlySchema;
exports.FutureExpirationDateSchema = common_schemas_1.DateOnlySchema.refine((val) => new Date(val) > new Date(), {
    message: 'Expiration date must be in the future',
});
exports.CreateProductDtoSchema = zod_1.z
    .object({
    sku: exports.SKUSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Product name must be 200 characters or less'),
    description: zod_1.z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    category: exports.ProductCategorySchema,
    unitOfMeasure: exports.UnitOfMeasureSchema,
    costPrice: exports.PriceSchema,
    sellPrice: exports.PriceSchema,
    reorderPoint: exports.StockLevelSchema,
    reorderQuantity: exports.QuantitySchema,
    supplierId: common_schemas_1.UUIDSchema.optional(),
    requiresLot: zod_1.z.boolean().default(false),
    requiresSerial: zod_1.z.boolean().default(false),
    requiresSterilization: zod_1.z.boolean().default(false),
    isActive: zod_1.z.boolean().default(true),
    clinicId: common_schemas_1.UUIDSchema,
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
exports.UpdateProductDtoSchema = zod_1.z
    .object({
    name: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    category: exports.ProductCategorySchema.optional(),
    unitOfMeasure: exports.UnitOfMeasureSchema.optional(),
    costPrice: exports.PriceSchema.optional(),
    sellPrice: exports.PriceSchema.optional(),
    reorderPoint: exports.StockLevelSchema.optional(),
    reorderQuantity: exports.QuantitySchema.optional(),
    supplierId: common_schemas_1.UUIDSchema.optional().nullable(),
    requiresLot: zod_1.z.boolean().optional(),
    requiresSerial: zod_1.z.boolean().optional(),
    requiresSterilization: zod_1.z.boolean().optional(),
    status: exports.ProductStatusSchema.optional(),
})
    .refine((data) => {
    if (data.sellPrice !== undefined && data.costPrice !== undefined) {
        return data.sellPrice >= data.costPrice;
    }
    return true;
}, {
    message: 'Sell price must be greater than or equal to cost price',
    path: ['sellPrice'],
})
    .refine((data) => {
    if (data.reorderQuantity !== undefined && data.reorderPoint !== undefined) {
        return data.reorderQuantity >= data.reorderPoint;
    }
    return true;
}, {
    message: 'Reorder quantity must be greater than or equal to reorder point',
    path: ['reorderQuantity'],
});
exports.QueryProductsDtoSchema = zod_1.z.object({
    category: exports.ProductCategorySchema.optional(),
    status: exports.ProductStatusSchema.optional(),
    supplierId: common_schemas_1.UUIDSchema.optional(),
    search: zod_1.z.string().max(100).optional(),
    requiresSterilization: zod_1.z.boolean().optional(),
    requiresLot: zod_1.z.boolean().optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'sku', 'category', 'createdAt', 'updatedAt']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
exports.DeductStockDtoSchema = zod_1.z.object({
    productId: common_schemas_1.UUIDSchema,
    quantity: exports.QuantitySchema,
    lotNumber: exports.LotNumberSchema.optional(),
    serialNumber: exports.SerialNumberSchema.optional(),
    locationId: common_schemas_1.UUIDSchema,
    procedureId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    reason: common_schemas_1.NonEmptyStringSchema.max(500),
    performedBy: common_schemas_1.UUIDSchema,
    notes: zod_1.z.string().max(1000).optional(),
});
exports.RestockDtoSchema = zod_1.z
    .object({
    productId: common_schemas_1.UUIDSchema,
    quantity: exports.QuantitySchema,
    lotNumber: exports.LotNumberSchema.optional(),
    serialNumber: exports.SerialNumberSchema.optional(),
    expirationDate: exports.ExpirationDateSchema.optional(),
    locationId: common_schemas_1.UUIDSchema,
    goodsReceiptId: common_schemas_1.UUIDSchema.optional(),
    costPerUnit: exports.PriceSchema,
    receivedBy: common_schemas_1.UUIDSchema,
    notes: zod_1.z.string().max(1000).optional(),
})
    .refine((data) => {
    if (data.expirationDate) {
        return new Date(data.expirationDate) > new Date();
    }
    return true;
}, {
    message: 'Expiration date must be in the future',
    path: ['expirationDate'],
});
exports.StockTransferDtoSchema = zod_1.z
    .object({
    productId: common_schemas_1.UUIDSchema,
    quantity: exports.QuantitySchema,
    lotNumber: exports.LotNumberSchema.optional(),
    serialNumber: exports.SerialNumberSchema.optional(),
    fromLocationId: common_schemas_1.UUIDSchema,
    toLocationId: common_schemas_1.UUIDSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500),
    performedBy: common_schemas_1.UUIDSchema,
    notes: zod_1.z.string().max(1000).optional(),
})
    .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: 'Source and destination locations must be different',
    path: ['toLocationId'],
});
exports.StockAdjustmentDtoSchema = zod_1.z.object({
    productId: common_schemas_1.UUIDSchema,
    lotNumber: exports.LotNumberSchema.optional(),
    serialNumber: exports.SerialNumberSchema.optional(),
    locationId: common_schemas_1.UUIDSchema,
    adjustmentType: zod_1.z.enum([
        'INCREASE',
        'DECREASE',
        'STOCKTAKE',
        'DAMAGE',
        'THEFT',
        'EXPIRY',
        'OTHER',
    ]),
    quantity: exports.QuantitySchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500),
    performedBy: common_schemas_1.UUIDSchema,
    notes: zod_1.z.string().max(1000).optional(),
});
exports.StockLocationDtoSchema = zod_1.z.object({
    locationId: common_schemas_1.UUIDSchema.optional(),
    name: common_schemas_1.NonEmptyStringSchema.max(200),
    code: zod_1.z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Z0-9\-_]+$/, {
        message: 'Location code must contain only uppercase letters, numbers, hyphens, and underscores',
    })
        .optional(),
    type: exports.LocationTypeSchema,
    parentLocationId: common_schemas_1.UUIDSchema.optional().nullable(),
    clinicId: common_schemas_1.UUIDSchema,
    isActive: zod_1.z.boolean().default(true),
    description: zod_1.z.string().max(500).optional(),
});
exports.QueryExpiringStockDtoSchema = zod_1.z.object({
    days: zod_1.z.number().int().min(1).max(365).default(30),
    locationId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema,
    productCategory: exports.ProductCategorySchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
});
exports.QueryStockLevelsDtoSchema = zod_1.z.object({
    productId: common_schemas_1.UUIDSchema.optional(),
    locationId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema,
    status: exports.StockStatusSchema.optional(),
    lowStockOnly: zod_1.z.boolean().default(false),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
});
exports.PurchaseOrderItemSchema = zod_1.z.object({
    productId: common_schemas_1.UUIDSchema,
    quantity: exports.QuantitySchema,
    unitPrice: exports.PriceSchema,
    notes: zod_1.z.string().max(500).optional(),
});
exports.CreatePurchaseOrderDtoSchema = zod_1.z
    .object({
    supplierId: common_schemas_1.UUIDSchema,
    items: zod_1.z.array(exports.PurchaseOrderItemSchema).min(1, 'Purchase order must have at least one item'),
    expectedDeliveryDate: common_schemas_1.DateOnlySchema,
    deliveryLocationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema,
    requestedBy: common_schemas_1.UUIDSchema,
    notes: zod_1.z.string().max(2000).optional(),
    referenceNumber: zod_1.z.string().max(100).optional(),
})
    .refine((data) => {
    const deliveryDate = new Date(data.expectedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deliveryDate >= today;
}, {
    message: 'Expected delivery date must be today or in the future',
    path: ['expectedDeliveryDate'],
});
exports.UpdatePurchaseOrderDtoSchema = zod_1.z.object({
    expectedDeliveryDate: common_schemas_1.DateOnlySchema.optional(),
    deliveryLocationId: common_schemas_1.UUIDSchema.optional(),
    notes: zod_1.z.string().max(2000).optional(),
    referenceNumber: zod_1.z.string().max(100).optional(),
});
exports.ApprovePurchaseOrderDtoSchema = zod_1.z.object({
    approvedBy: common_schemas_1.UUIDSchema,
    approvalNotes: zod_1.z.string().max(1000).optional(),
});
exports.RejectPurchaseOrderDtoSchema = zod_1.z.object({
    rejectedBy: common_schemas_1.UUIDSchema,
    rejectionReason: common_schemas_1.NonEmptyStringSchema.max(1000),
});
exports.QueryPurchaseOrdersDtoSchema = zod_1.z.object({
    supplierId: common_schemas_1.UUIDSchema.optional(),
    status: exports.PurchaseOrderStatusSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema,
    requestedBy: common_schemas_1.UUIDSchema.optional(),
    fromDate: common_schemas_1.DateOnlySchema.optional(),
    toDate: common_schemas_1.DateOnlySchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'expectedDeliveryDate', 'totalAmount']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.GoodsReceiptItemSchema = zod_1.z
    .object({
    productId: common_schemas_1.UUIDSchema,
    quantity: exports.QuantitySchema,
    lotNumber: exports.LotNumberSchema.optional(),
    serialNumber: exports.SerialNumberSchema.optional(),
    expirationDate: exports.ExpirationDateSchema.optional(),
    costPerUnit: exports.PriceSchema,
    notes: zod_1.z.string().max(500).optional(),
})
    .refine((data) => {
    if (data.expirationDate) {
        return new Date(data.expirationDate) > new Date();
    }
    return true;
}, {
    message: 'Expiration date must be in the future',
    path: ['expirationDate'],
});
exports.CreateGoodsReceiptDtoSchema = zod_1.z.object({
    purchaseOrderId: common_schemas_1.UUIDSchema.optional(),
    supplierId: common_schemas_1.UUIDSchema,
    items: zod_1.z.array(exports.GoodsReceiptItemSchema).min(1, 'Goods receipt must have at least one item'),
    locationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema,
    receivedBy: common_schemas_1.UUIDSchema,
    receivedDate: common_schemas_1.ISODateStringSchema.default(() => new Date().toISOString()),
    notes: zod_1.z.string().max(2000).optional(),
    invoiceNumber: zod_1.z.string().max(100).optional(),
    deliveryNoteNumber: zod_1.z.string().max(100).optional(),
});
exports.AcceptGoodsReceiptDtoSchema = zod_1.z.object({
    acceptedBy: common_schemas_1.UUIDSchema,
    acceptanceNotes: zod_1.z.string().max(1000).optional(),
});
exports.QueryGoodsReceiptsDtoSchema = zod_1.z.object({
    purchaseOrderId: common_schemas_1.UUIDSchema.optional(),
    supplierId: common_schemas_1.UUIDSchema.optional(),
    status: exports.GoodsReceiptStatusSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema,
    receivedBy: common_schemas_1.UUIDSchema.optional(),
    fromDate: common_schemas_1.DateOnlySchema.optional(),
    toDate: common_schemas_1.DateOnlySchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['receivedDate', 'createdAt']).default('receivedDate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.CreateSupplierDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200),
    code: zod_1.z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Z0-9\-_]+$/, {
        message: 'Supplier code must contain only uppercase letters, numbers, hyphens, and underscores',
    })
        .optional(),
    contactName: common_schemas_1.NonEmptyStringSchema.max(200),
    email: common_schemas_1.EmailSchema,
    phone: common_schemas_1.PhoneNumberSchema.optional(),
    address: zod_1.z
        .object({
        street: common_schemas_1.NonEmptyStringSchema.max(200),
        city: common_schemas_1.NonEmptyStringSchema.max(100),
        state: zod_1.z.string().max(100).optional(),
        postalCode: zod_1.z.string().max(20),
        country: common_schemas_1.NonEmptyStringSchema.max(100),
    })
        .optional(),
    paymentTerms: zod_1.z.string().max(200).optional(),
    taxId: zod_1.z.string().max(50).optional(),
    website: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().max(2000).optional(),
    clinicId: common_schemas_1.UUIDSchema,
});
exports.UpdateSupplierDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    contactName: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    email: common_schemas_1.EmailSchema.optional(),
    phone: common_schemas_1.PhoneNumberSchema.optional().nullable(),
    address: zod_1.z
        .object({
        street: common_schemas_1.NonEmptyStringSchema.max(200),
        city: common_schemas_1.NonEmptyStringSchema.max(100),
        state: zod_1.z.string().max(100).optional(),
        postalCode: zod_1.z.string().max(20),
        country: common_schemas_1.NonEmptyStringSchema.max(100),
    })
        .optional()
        .nullable(),
    paymentTerms: zod_1.z.string().max(200).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
    website: zod_1.z.string().url().optional().nullable(),
    notes: zod_1.z.string().max(2000).optional().nullable(),
    status: exports.SupplierStatusSchema.optional(),
});
exports.QuerySuppliersDtoSchema = zod_1.z.object({
    status: exports.SupplierStatusSchema.optional(),
    search: zod_1.z.string().max(100).optional(),
    clinicId: common_schemas_1.UUIDSchema,
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'code', 'createdAt']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
exports.ProcedureMaterialItemSchema = zod_1.z.object({
    productId: common_schemas_1.UUIDSchema,
    quantity: exports.QuantitySchema,
    lotNumber: exports.LotNumberSchema.optional(),
    serialNumber: exports.SerialNumberSchema.optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.ProcedureBillOfMaterialsSchema = zod_1.z.object({
    procedureId: common_schemas_1.UUIDSchema,
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    patientId: common_schemas_1.UUIDSchema,
    materials: zod_1.z
        .array(exports.ProcedureMaterialItemSchema)
        .min(1, 'At least one material must be specified'),
    performedBy: common_schemas_1.UUIDSchema,
    performedAt: common_schemas_1.ISODateStringSchema.default(() => new Date().toISOString()),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.BatchConsumeStockDtoSchema = zod_1.z.object({
    consumptions: zod_1.z.array(exports.DeductStockDtoSchema).min(1, 'At least one consumption must be specified'),
    transactionId: common_schemas_1.UUIDSchema.optional(),
});
exports.QueryStockMovementsDtoSchema = zod_1.z.object({
    productId: common_schemas_1.UUIDSchema.optional(),
    lotNumber: exports.LotNumberSchema.optional(),
    locationId: common_schemas_1.UUIDSchema.optional(),
    movementType: exports.MovementTypeSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema,
    fromDate: common_schemas_1.ISODateStringSchema.optional(),
    toDate: common_schemas_1.ISODateStringSchema.optional(),
    performedBy: common_schemas_1.UUIDSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'quantity']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.QueryInventoryValuationDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema,
    locationId: common_schemas_1.UUIDSchema.optional(),
    category: exports.ProductCategorySchema.optional(),
    asOfDate: common_schemas_1.DateOnlySchema.default(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }),
});
//# sourceMappingURL=inventory.schemas.js.map