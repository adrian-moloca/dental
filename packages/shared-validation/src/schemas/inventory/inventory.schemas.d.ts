import { z } from 'zod';
import { ProductCategory, UnitOfMeasure, ProductStatus, StockStatus, MovementType, PurchaseOrderStatus, SupplierStatus, LocationType, GoodsReceiptStatus } from '@dentalos/shared-types';
export declare const ProductCategorySchema: z.ZodNativeEnum<typeof ProductCategory>;
export declare const UnitOfMeasureSchema: z.ZodNativeEnum<typeof UnitOfMeasure>;
export declare const ProductStatusSchema: z.ZodNativeEnum<typeof ProductStatus>;
export declare const StockStatusSchema: z.ZodNativeEnum<typeof StockStatus>;
export declare const MovementTypeSchema: z.ZodNativeEnum<typeof MovementType>;
export declare const PurchaseOrderStatusSchema: z.ZodNativeEnum<typeof PurchaseOrderStatus>;
export declare const SupplierStatusSchema: z.ZodNativeEnum<typeof SupplierStatus>;
export declare const LocationTypeSchema: z.ZodNativeEnum<typeof LocationType>;
export declare const GoodsReceiptStatusSchema: z.ZodNativeEnum<typeof GoodsReceiptStatus>;
export declare const QuantitySchema: z.ZodNumber;
export declare const StockLevelSchema: z.ZodNumber;
export declare const PriceSchema: z.ZodEffects<z.ZodNumber, number, number>;
export declare const LotNumberSchema: z.ZodString;
export declare const SerialNumberSchema: z.ZodString;
export declare const SKUSchema: z.ZodString;
export declare const ExpirationDateSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const FutureExpirationDateSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const CreateProductDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodNativeEnum<typeof ProductCategory>;
    unitOfMeasure: z.ZodNativeEnum<typeof UnitOfMeasure>;
    costPrice: z.ZodEffects<z.ZodNumber, number, number>;
    sellPrice: z.ZodEffects<z.ZodNumber, number, number>;
    reorderPoint: z.ZodNumber;
    reorderQuantity: z.ZodNumber;
    supplierId: z.ZodOptional<z.ZodString>;
    requiresLot: z.ZodDefault<z.ZodBoolean>;
    requiresSerial: z.ZodDefault<z.ZodBoolean>;
    requiresSterilization: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    clinicId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    isActive: boolean;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    requiresLot: boolean;
    requiresSerial: boolean;
    requiresSterilization: boolean;
    description?: string | undefined;
    supplierId?: string | undefined;
}, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    supplierId?: string | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    isActive: boolean;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    requiresLot: boolean;
    requiresSerial: boolean;
    requiresSterilization: boolean;
    description?: string | undefined;
    supplierId?: string | undefined;
}, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    supplierId?: string | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    isActive: boolean;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    requiresLot: boolean;
    requiresSerial: boolean;
    requiresSterilization: boolean;
    description?: string | undefined;
    supplierId?: string | undefined;
}, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    supplierId?: string | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    isActive: boolean;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    requiresLot: boolean;
    requiresSerial: boolean;
    requiresSterilization: boolean;
    description?: string | undefined;
    supplierId?: string | undefined;
}, {
    clinicId: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    category: ProductCategory;
    sku: string;
    costPrice: number;
    sellPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    supplierId?: string | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>;
export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;
export declare const UpdateProductDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNativeEnum<typeof ProductCategory>>;
    unitOfMeasure: z.ZodOptional<z.ZodNativeEnum<typeof UnitOfMeasure>>;
    costPrice: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    sellPrice: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    reorderPoint: z.ZodOptional<z.ZodNumber>;
    reorderQuantity: z.ZodOptional<z.ZodNumber>;
    supplierId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    requiresLot: z.ZodOptional<z.ZodBoolean>;
    requiresSerial: z.ZodOptional<z.ZodBoolean>;
    requiresSterilization: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProductStatus>>;
}, "strip", z.ZodTypeAny, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    unitOfMeasure?: UnitOfMeasure | undefined;
    category?: ProductCategory | undefined;
    costPrice?: number | undefined;
    sellPrice?: number | undefined;
    reorderPoint?: number | undefined;
    reorderQuantity?: number | undefined;
    supplierId?: string | null | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    unitOfMeasure?: UnitOfMeasure | undefined;
    category?: ProductCategory | undefined;
    costPrice?: number | undefined;
    sellPrice?: number | undefined;
    reorderPoint?: number | undefined;
    reorderQuantity?: number | undefined;
    supplierId?: string | null | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    unitOfMeasure?: UnitOfMeasure | undefined;
    category?: ProductCategory | undefined;
    costPrice?: number | undefined;
    sellPrice?: number | undefined;
    reorderPoint?: number | undefined;
    reorderQuantity?: number | undefined;
    supplierId?: string | null | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    unitOfMeasure?: UnitOfMeasure | undefined;
    category?: ProductCategory | undefined;
    costPrice?: number | undefined;
    sellPrice?: number | undefined;
    reorderPoint?: number | undefined;
    reorderQuantity?: number | undefined;
    supplierId?: string | null | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    unitOfMeasure?: UnitOfMeasure | undefined;
    category?: ProductCategory | undefined;
    costPrice?: number | undefined;
    sellPrice?: number | undefined;
    reorderPoint?: number | undefined;
    reorderQuantity?: number | undefined;
    supplierId?: string | null | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    unitOfMeasure?: UnitOfMeasure | undefined;
    category?: ProductCategory | undefined;
    costPrice?: number | undefined;
    sellPrice?: number | undefined;
    reorderPoint?: number | undefined;
    reorderQuantity?: number | undefined;
    supplierId?: string | null | undefined;
    requiresLot?: boolean | undefined;
    requiresSerial?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>;
export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;
export declare const QueryProductsDtoSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodNativeEnum<typeof ProductCategory>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProductStatus>>;
    supplierId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    requiresSterilization: z.ZodOptional<z.ZodBoolean>;
    requiresLot: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "sku", "category", "createdAt", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "name" | "createdAt" | "updatedAt" | "category" | "sku";
    sortOrder: "asc" | "desc";
    status?: ProductStatus | undefined;
    search?: string | undefined;
    category?: ProductCategory | undefined;
    supplierId?: string | undefined;
    requiresLot?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}, {
    status?: ProductStatus | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: "name" | "createdAt" | "updatedAt" | "category" | "sku" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    category?: ProductCategory | undefined;
    supplierId?: string | undefined;
    requiresLot?: boolean | undefined;
    requiresSterilization?: boolean | undefined;
}>;
export type QueryProductsDto = z.infer<typeof QueryProductsDtoSchema>;
export declare const DeductStockDtoSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    lotNumber: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    locationId: z.ZodString;
    procedureId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
    performedBy: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    quantity: number;
    productId: string;
    locationId: string;
    performedBy: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    lotNumber?: string | undefined;
}, {
    reason: string;
    quantity: number;
    productId: string;
    locationId: string;
    performedBy: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    lotNumber?: string | undefined;
}>;
export type DeductStockDto = z.infer<typeof DeductStockDtoSchema>;
export declare const RestockDtoSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    lotNumber: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    expirationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    locationId: z.ZodString;
    goodsReceiptId: z.ZodOptional<z.ZodString>;
    costPerUnit: z.ZodEffects<z.ZodNumber, number, number>;
    receivedBy: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    receivedBy: string;
    productId: string;
    locationId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
    goodsReceiptId?: string | undefined;
}, {
    quantity: number;
    receivedBy: string;
    productId: string;
    locationId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
    goodsReceiptId?: string | undefined;
}>, {
    quantity: number;
    receivedBy: string;
    productId: string;
    locationId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
    goodsReceiptId?: string | undefined;
}, {
    quantity: number;
    receivedBy: string;
    productId: string;
    locationId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
    goodsReceiptId?: string | undefined;
}>;
export type RestockDto = z.infer<typeof RestockDtoSchema>;
export declare const StockTransferDtoSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    lotNumber: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    fromLocationId: z.ZodString;
    toLocationId: z.ZodString;
    reason: z.ZodString;
    performedBy: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    quantity: number;
    productId: string;
    performedBy: string;
    fromLocationId: string;
    toLocationId: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}, {
    reason: string;
    quantity: number;
    productId: string;
    performedBy: string;
    fromLocationId: string;
    toLocationId: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}>, {
    reason: string;
    quantity: number;
    productId: string;
    performedBy: string;
    fromLocationId: string;
    toLocationId: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}, {
    reason: string;
    quantity: number;
    productId: string;
    performedBy: string;
    fromLocationId: string;
    toLocationId: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}>;
export type StockTransferDto = z.infer<typeof StockTransferDtoSchema>;
export declare const StockAdjustmentDtoSchema: z.ZodObject<{
    productId: z.ZodString;
    lotNumber: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    locationId: z.ZodString;
    adjustmentType: z.ZodEnum<["INCREASE", "DECREASE", "STOCKTAKE", "DAMAGE", "THEFT", "EXPIRY", "OTHER"]>;
    quantity: z.ZodNumber;
    reason: z.ZodString;
    performedBy: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    quantity: number;
    productId: string;
    locationId: string;
    performedBy: string;
    adjustmentType: "OTHER" | "DAMAGE" | "EXPIRY" | "INCREASE" | "DECREASE" | "STOCKTAKE" | "THEFT";
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}, {
    reason: string;
    quantity: number;
    productId: string;
    locationId: string;
    performedBy: string;
    adjustmentType: "OTHER" | "DAMAGE" | "EXPIRY" | "INCREASE" | "DECREASE" | "STOCKTAKE" | "THEFT";
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}>;
export type StockAdjustmentDto = z.infer<typeof StockAdjustmentDtoSchema>;
export declare const StockLocationDtoSchema: z.ZodObject<{
    locationId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    type: z.ZodNativeEnum<typeof LocationType>;
    parentLocationId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    clinicId: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: LocationType;
    clinicId: string;
    name: string;
    isActive: boolean;
    code?: string | undefined;
    description?: string | undefined;
    parentLocationId?: string | null | undefined;
    locationId?: string | undefined;
}, {
    type: LocationType;
    clinicId: string;
    name: string;
    code?: string | undefined;
    description?: string | undefined;
    parentLocationId?: string | null | undefined;
    isActive?: boolean | undefined;
    locationId?: string | undefined;
}>;
export type StockLocationDto = z.infer<typeof StockLocationDtoSchema>;
export declare const QueryExpiringStockDtoSchema: z.ZodObject<{
    days: z.ZodDefault<z.ZodNumber>;
    locationId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodString;
    productCategory: z.ZodOptional<z.ZodNativeEnum<typeof ProductCategory>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    limit: number;
    days: number;
    page: number;
    locationId?: string | undefined;
    productCategory?: ProductCategory | undefined;
}, {
    clinicId: string;
    limit?: number | undefined;
    days?: number | undefined;
    page?: number | undefined;
    locationId?: string | undefined;
    productCategory?: ProductCategory | undefined;
}>;
export type QueryExpiringStockDto = z.infer<typeof QueryExpiringStockDtoSchema>;
export declare const QueryStockLevelsDtoSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodString;
    status: z.ZodOptional<z.ZodNativeEnum<typeof StockStatus>>;
    lowStockOnly: z.ZodDefault<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    limit: number;
    page: number;
    lowStockOnly: boolean;
    status?: StockStatus | undefined;
    productId?: string | undefined;
    locationId?: string | undefined;
}, {
    clinicId: string;
    status?: StockStatus | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    productId?: string | undefined;
    locationId?: string | undefined;
    lowStockOnly?: boolean | undefined;
}>;
export type QueryStockLevelsDto = z.infer<typeof QueryStockLevelsDtoSchema>;
export declare const PurchaseOrderItemSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodEffects<z.ZodNumber, number, number>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    unitPrice: number;
    productId: string;
    notes?: string | undefined;
}, {
    quantity: number;
    unitPrice: number;
    productId: string;
    notes?: string | undefined;
}>;
export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;
export declare const CreatePurchaseOrderDtoSchema: z.ZodEffects<z.ZodObject<{
    supplierId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodEffects<z.ZodNumber, number, number>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        unitPrice: number;
        productId: string;
        notes?: string | undefined;
    }, {
        quantity: number;
        unitPrice: number;
        productId: string;
        notes?: string | undefined;
    }>, "many">;
    expectedDeliveryDate: z.ZodEffects<z.ZodString, string, string>;
    deliveryLocationId: z.ZodString;
    clinicId: z.ZodString;
    requestedBy: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    referenceNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    items: {
        quantity: number;
        unitPrice: number;
        productId: string;
        notes?: string | undefined;
    }[];
    supplierId: string;
    expectedDeliveryDate: string;
    deliveryLocationId: string;
    requestedBy: string;
    notes?: string | undefined;
    referenceNumber?: string | undefined;
}, {
    clinicId: string;
    items: {
        quantity: number;
        unitPrice: number;
        productId: string;
        notes?: string | undefined;
    }[];
    supplierId: string;
    expectedDeliveryDate: string;
    deliveryLocationId: string;
    requestedBy: string;
    notes?: string | undefined;
    referenceNumber?: string | undefined;
}>, {
    clinicId: string;
    items: {
        quantity: number;
        unitPrice: number;
        productId: string;
        notes?: string | undefined;
    }[];
    supplierId: string;
    expectedDeliveryDate: string;
    deliveryLocationId: string;
    requestedBy: string;
    notes?: string | undefined;
    referenceNumber?: string | undefined;
}, {
    clinicId: string;
    items: {
        quantity: number;
        unitPrice: number;
        productId: string;
        notes?: string | undefined;
    }[];
    supplierId: string;
    expectedDeliveryDate: string;
    deliveryLocationId: string;
    requestedBy: string;
    notes?: string | undefined;
    referenceNumber?: string | undefined;
}>;
export type CreatePurchaseOrderDto = z.infer<typeof CreatePurchaseOrderDtoSchema>;
export declare const UpdatePurchaseOrderDtoSchema: z.ZodObject<{
    expectedDeliveryDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    deliveryLocationId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    referenceNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
    referenceNumber?: string | undefined;
    expectedDeliveryDate?: string | undefined;
    deliveryLocationId?: string | undefined;
}, {
    notes?: string | undefined;
    referenceNumber?: string | undefined;
    expectedDeliveryDate?: string | undefined;
    deliveryLocationId?: string | undefined;
}>;
export type UpdatePurchaseOrderDto = z.infer<typeof UpdatePurchaseOrderDtoSchema>;
export declare const ApprovePurchaseOrderDtoSchema: z.ZodObject<{
    approvedBy: z.ZodString;
    approvalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    approvedBy: string;
    approvalNotes?: string | undefined;
}, {
    approvedBy: string;
    approvalNotes?: string | undefined;
}>;
export type ApprovePurchaseOrderDto = z.infer<typeof ApprovePurchaseOrderDtoSchema>;
export declare const RejectPurchaseOrderDtoSchema: z.ZodObject<{
    rejectedBy: z.ZodString;
    rejectionReason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rejectionReason: string;
    rejectedBy: string;
}, {
    rejectionReason: string;
    rejectedBy: string;
}>;
export type RejectPurchaseOrderDto = z.infer<typeof RejectPurchaseOrderDtoSchema>;
export declare const QueryPurchaseOrdersDtoSchema: z.ZodObject<{
    supplierId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PurchaseOrderStatus>>;
    clinicId: z.ZodString;
    requestedBy: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    toDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "expectedDeliveryDate", "totalAmount"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    limit: number;
    page: number;
    sortBy: "createdAt" | "totalAmount" | "expectedDeliveryDate";
    sortOrder: "asc" | "desc";
    status?: PurchaseOrderStatus | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    supplierId?: string | undefined;
    requestedBy?: string | undefined;
}, {
    clinicId: string;
    status?: PurchaseOrderStatus | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "totalAmount" | "expectedDeliveryDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    supplierId?: string | undefined;
    requestedBy?: string | undefined;
}>;
export type QueryPurchaseOrdersDto = z.infer<typeof QueryPurchaseOrdersDtoSchema>;
export declare const GoodsReceiptItemSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    lotNumber: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    expirationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    costPerUnit: z.ZodEffects<z.ZodNumber, number, number>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    productId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
}, {
    quantity: number;
    productId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
}>, {
    quantity: number;
    productId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
}, {
    quantity: number;
    productId: string;
    costPerUnit: number;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    expirationDate?: string | undefined;
    lotNumber?: string | undefined;
}>;
export type GoodsReceiptItem = z.infer<typeof GoodsReceiptItemSchema>;
export declare const CreateGoodsReceiptDtoSchema: z.ZodObject<{
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    supplierId: z.ZodString;
    items: z.ZodArray<z.ZodEffects<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        lotNumber: z.ZodOptional<z.ZodString>;
        serialNumber: z.ZodOptional<z.ZodString>;
        expirationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        costPerUnit: z.ZodEffects<z.ZodNumber, number, number>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        productId: string;
        costPerUnit: number;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        expirationDate?: string | undefined;
        lotNumber?: string | undefined;
    }, {
        quantity: number;
        productId: string;
        costPerUnit: number;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        expirationDate?: string | undefined;
        lotNumber?: string | undefined;
    }>, {
        quantity: number;
        productId: string;
        costPerUnit: number;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        expirationDate?: string | undefined;
        lotNumber?: string | undefined;
    }, {
        quantity: number;
        productId: string;
        costPerUnit: number;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        expirationDate?: string | undefined;
        lotNumber?: string | undefined;
    }>, "many">;
    locationId: z.ZodString;
    clinicId: z.ZodString;
    receivedBy: z.ZodString;
    receivedDate: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    invoiceNumber: z.ZodOptional<z.ZodString>;
    deliveryNoteNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    items: {
        quantity: number;
        productId: string;
        costPerUnit: number;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        expirationDate?: string | undefined;
        lotNumber?: string | undefined;
    }[];
    receivedBy: string;
    supplierId: string;
    locationId: string;
    receivedDate: string;
    invoiceNumber?: string | undefined;
    notes?: string | undefined;
    purchaseOrderId?: string | undefined;
    deliveryNoteNumber?: string | undefined;
}, {
    clinicId: string;
    items: {
        quantity: number;
        productId: string;
        costPerUnit: number;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        expirationDate?: string | undefined;
        lotNumber?: string | undefined;
    }[];
    receivedBy: string;
    supplierId: string;
    locationId: string;
    invoiceNumber?: string | undefined;
    notes?: string | undefined;
    purchaseOrderId?: string | undefined;
    receivedDate?: string | undefined;
    deliveryNoteNumber?: string | undefined;
}>;
export type CreateGoodsReceiptDto = z.infer<typeof CreateGoodsReceiptDtoSchema>;
export declare const AcceptGoodsReceiptDtoSchema: z.ZodObject<{
    acceptedBy: z.ZodString;
    acceptanceNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    acceptedBy: string;
    acceptanceNotes?: string | undefined;
}, {
    acceptedBy: string;
    acceptanceNotes?: string | undefined;
}>;
export type AcceptGoodsReceiptDto = z.infer<typeof AcceptGoodsReceiptDtoSchema>;
export declare const QueryGoodsReceiptsDtoSchema: z.ZodObject<{
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    supplierId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof GoodsReceiptStatus>>;
    clinicId: z.ZodString;
    receivedBy: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    toDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["receivedDate", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    limit: number;
    page: number;
    sortBy: "createdAt" | "receivedDate";
    sortOrder: "asc" | "desc";
    status?: GoodsReceiptStatus | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    receivedBy?: string | undefined;
    supplierId?: string | undefined;
    purchaseOrderId?: string | undefined;
}, {
    clinicId: string;
    status?: GoodsReceiptStatus | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "receivedDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    receivedBy?: string | undefined;
    supplierId?: string | undefined;
    purchaseOrderId?: string | undefined;
}>;
export type QueryGoodsReceiptsDto = z.infer<typeof QueryGoodsReceiptsDtoSchema>;
export declare const CreateSupplierDtoSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    contactName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    }, {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    }>>;
    paymentTerms: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    name: string;
    email: string;
    contactName: string;
    code?: string | undefined;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    } | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    notes?: string | undefined;
    taxId?: string | undefined;
    paymentTerms?: string | undefined;
}, {
    clinicId: string;
    name: string;
    email: string;
    contactName: string;
    code?: string | undefined;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    } | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    notes?: string | undefined;
    taxId?: string | undefined;
    paymentTerms?: string | undefined;
}>;
export type CreateSupplierDto = z.infer<typeof CreateSupplierDtoSchema>;
export declare const UpdateSupplierDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    }, {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    }>>>;
    paymentTerms: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    website: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof SupplierStatus>>;
}, "strip", z.ZodTypeAny, {
    status?: SupplierStatus | undefined;
    name?: string | undefined;
    email?: string | undefined;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    } | null | undefined;
    phone?: string | null | undefined;
    website?: string | null | undefined;
    notes?: string | null | undefined;
    taxId?: string | null | undefined;
    paymentTerms?: string | null | undefined;
    contactName?: string | undefined;
}, {
    status?: SupplierStatus | undefined;
    name?: string | undefined;
    email?: string | undefined;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
    } | null | undefined;
    phone?: string | null | undefined;
    website?: string | null | undefined;
    notes?: string | null | undefined;
    taxId?: string | null | undefined;
    paymentTerms?: string | null | undefined;
    contactName?: string | undefined;
}>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierDtoSchema>;
export declare const QuerySuppliersDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof SupplierStatus>>;
    search: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodString;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "code", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    limit: number;
    page: number;
    sortBy: "code" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    status?: SupplierStatus | undefined;
    search?: string | undefined;
}, {
    clinicId: string;
    status?: SupplierStatus | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: "code" | "name" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type QuerySuppliersDto = z.infer<typeof QuerySuppliersDtoSchema>;
export declare const ProcedureMaterialItemSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    lotNumber: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    productId: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}, {
    quantity: number;
    productId: string;
    notes?: string | undefined;
    serialNumber?: string | undefined;
    lotNumber?: string | undefined;
}>;
export type ProcedureMaterialItem = z.infer<typeof ProcedureMaterialItemSchema>;
export declare const ProcedureBillOfMaterialsSchema: z.ZodObject<{
    procedureId: z.ZodString;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodString;
    materials: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        lotNumber: z.ZodOptional<z.ZodString>;
        serialNumber: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        productId: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        lotNumber?: string | undefined;
    }, {
        quantity: number;
        productId: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        lotNumber?: string | undefined;
    }>, "many">;
    performedBy: z.ZodString;
    performedAt: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    procedureId: string;
    performedBy: string;
    materials: {
        quantity: number;
        productId: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        lotNumber?: string | undefined;
    }[];
    performedAt: string;
    notes?: string | undefined;
    treatmentPlanId?: string | undefined;
}, {
    patientId: string;
    procedureId: string;
    performedBy: string;
    materials: {
        quantity: number;
        productId: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        lotNumber?: string | undefined;
    }[];
    notes?: string | undefined;
    treatmentPlanId?: string | undefined;
    performedAt?: string | undefined;
}>;
export type ProcedureBillOfMaterialsDto = z.infer<typeof ProcedureBillOfMaterialsSchema>;
export declare const BatchConsumeStockDtoSchema: z.ZodObject<{
    consumptions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        lotNumber: z.ZodOptional<z.ZodString>;
        serialNumber: z.ZodOptional<z.ZodString>;
        locationId: z.ZodString;
        procedureId: z.ZodOptional<z.ZodString>;
        treatmentPlanId: z.ZodOptional<z.ZodString>;
        reason: z.ZodString;
        performedBy: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        quantity: number;
        productId: string;
        locationId: string;
        performedBy: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        treatmentPlanId?: string | undefined;
        procedureId?: string | undefined;
        lotNumber?: string | undefined;
    }, {
        reason: string;
        quantity: number;
        productId: string;
        locationId: string;
        performedBy: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        treatmentPlanId?: string | undefined;
        procedureId?: string | undefined;
        lotNumber?: string | undefined;
    }>, "many">;
    transactionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    consumptions: {
        reason: string;
        quantity: number;
        productId: string;
        locationId: string;
        performedBy: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        treatmentPlanId?: string | undefined;
        procedureId?: string | undefined;
        lotNumber?: string | undefined;
    }[];
    transactionId?: string | undefined;
}, {
    consumptions: {
        reason: string;
        quantity: number;
        productId: string;
        locationId: string;
        performedBy: string;
        notes?: string | undefined;
        serialNumber?: string | undefined;
        treatmentPlanId?: string | undefined;
        procedureId?: string | undefined;
        lotNumber?: string | undefined;
    }[];
    transactionId?: string | undefined;
}>;
export type BatchConsumeStockDto = z.infer<typeof BatchConsumeStockDtoSchema>;
export declare const QueryStockMovementsDtoSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    lotNumber: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    movementType: z.ZodOptional<z.ZodNativeEnum<typeof MovementType>>;
    clinicId: z.ZodString;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    performedBy: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "quantity"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    limit: number;
    page: number;
    sortBy: "createdAt" | "quantity";
    sortOrder: "asc" | "desc";
    fromDate?: string | undefined;
    toDate?: string | undefined;
    productId?: string | undefined;
    lotNumber?: string | undefined;
    locationId?: string | undefined;
    performedBy?: string | undefined;
    movementType?: MovementType | undefined;
}, {
    clinicId: string;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "quantity" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    productId?: string | undefined;
    lotNumber?: string | undefined;
    locationId?: string | undefined;
    performedBy?: string | undefined;
    movementType?: MovementType | undefined;
}>;
export type QueryStockMovementsDto = z.infer<typeof QueryStockMovementsDtoSchema>;
export declare const QueryInventoryValuationDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    locationId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNativeEnum<typeof ProductCategory>>;
    asOfDate: z.ZodDefault<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    asOfDate: string;
    category?: ProductCategory | undefined;
    locationId?: string | undefined;
}, {
    clinicId: string;
    category?: ProductCategory | undefined;
    asOfDate?: string | undefined;
    locationId?: string | undefined;
}>;
export type QueryInventoryValuationDto = z.infer<typeof QueryInventoryValuationDtoSchema>;
