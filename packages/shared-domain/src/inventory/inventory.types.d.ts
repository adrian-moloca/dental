import type { UUID, ISODateString, OrganizationId, ClinicId, Metadata, Nullable } from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
import type { ProviderId, ProcedureId } from '../clinical';
export type ProductId = UUID & {
    readonly __brand: 'ProductId';
};
export type ProductVariantId = UUID & {
    readonly __brand: 'ProductVariantId';
};
export type SupplierId = UUID & {
    readonly __brand: 'SupplierId';
};
export type PurchaseOrderId = UUID & {
    readonly __brand: 'PurchaseOrderId';
};
export type GoodsReceiptId = UUID & {
    readonly __brand: 'GoodsReceiptId';
};
export type StockItemId = UUID & {
    readonly __brand: 'StockItemId';
};
export type LotId = UUID & {
    readonly __brand: 'LotId';
};
export type StockLocationId = UUID & {
    readonly __brand: 'StockLocationId';
};
export type StockMovementId = UUID & {
    readonly __brand: 'StockMovementId';
};
export type SterilizationCycleId = UUID & {
    readonly __brand: 'SterilizationCycleId';
};
export type BOMId = UUID & {
    readonly __brand: 'BOMId';
};
export type Currency = string & {
    readonly __brand: 'Currency';
};
export declare enum ProductCategory {
    CONSUMABLE = "consumable",
    INSTRUMENT = "instrument",
    MATERIAL = "material",
    MEDICATION = "medication",
    EQUIPMENT = "equipment",
    DISPOSABLE = "disposable"
}
export declare enum UnitOfMeasure {
    UNIT = "unit",
    BOX = "box",
    PACK = "pack",
    BOTTLE = "bottle",
    TUBE = "tube",
    SYRINGE = "syringe",
    VIAL = "vial",
    KG = "kg",
    G = "g",
    ML = "ml",
    L = "l"
}
export declare enum ProductStatus {
    ACTIVE = "active",
    DISCONTINUED = "discontinued",
    OUT_OF_STOCK = "out_of_stock",
    BACKORDERED = "backordered"
}
export interface ProductVariant {
    id: ProductVariantId;
    name: string;
    sku: string;
    attributes: Record<string, string>;
    price?: MoneyValue;
    isAvailable: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export interface Product {
    id: ProductId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    name: string;
    description?: string;
    category: ProductCategory;
    manufacturer?: string;
    manufacturerPartNumber?: string;
    sku: string;
    barcode?: string;
    unitOfMeasure: UnitOfMeasure;
    unitCost: MoneyValue;
    sellingPrice?: MoneyValue;
    status: ProductStatus;
    preferredSupplierId?: SupplierId;
    alternateSupplierIds?: SupplierId[];
    reorderPoint: number;
    reorderQuantity: number;
    maxStockLevel?: number;
    variants?: ProductVariant[];
    requiresLotTracking: boolean;
    hasExpiration: boolean;
    defaultShelfLifeDays?: number;
    requiresSterilization: boolean;
    maxSterilizationCycles?: number;
    imageUrl?: string;
    documentUrls?: string[];
    regulatoryInfo?: {
        fdaClass?: string;
        fda510k?: string;
        deaSchedule?: string;
        notes?: string;
    };
    storageRequirements?: string;
    usageNotes?: string;
    tags?: string[];
    isActive: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum StockStatus {
    AVAILABLE = "available",
    RESERVED = "reserved",
    EXPIRED = "expired",
    DAMAGED = "damaged",
    RECALLED = "recalled",
    IN_TRANSIT = "in_transit"
}
export interface StockLocation {
    id: StockLocationId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    name: string;
    locationType: string;
    parentLocationId?: StockLocationId;
    locationPath?: string;
    isActive: boolean;
    environmentalControls?: {
        temperatureMin?: number;
        temperatureMax?: number;
        humidityMin?: number;
        humidityMax?: number;
        notes?: string;
    };
    notes?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export declare enum MovementType {
    IN = "in",
    OUT = "out",
    TRANSFER = "transfer",
    ADJUSTMENT = "adjustment",
    DEDUCTION = "deduction",
    RETURN = "return",
    WASTE = "waste",
    EXPIRED = "expired"
}
export interface StockMovement {
    id: StockMovementId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    movementType: MovementType;
    productId: ProductId;
    productVariantId?: ProductVariantId;
    lotId?: LotId;
    quantity: number;
    unitOfMeasure: UnitOfMeasure;
    fromLocationId?: StockLocationId;
    toLocationId?: StockLocationId;
    movedAt: ISODateString;
    movedBy: UUID;
    reason?: string;
    referenceType?: 'goods_receipt' | 'purchase_order' | 'procedure' | 'adjustment' | 'transfer' | 'other';
    referenceId?: UUID;
    procedureId?: ProcedureId;
    goodsReceiptId?: GoodsReceiptId;
    unitCost?: MoneyValue;
    totalCost?: MoneyValue;
    notes?: string;
    metadata?: Metadata;
}
export interface StockItem {
    id: StockItemId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    productId: ProductId;
    productVariantId?: ProductVariantId;
    lotId?: LotId;
    status: StockStatus;
    quantity: number;
    unitOfMeasure: UnitOfMeasure;
    locationId: StockLocationId;
    unitCost: MoneyValue;
    totalValue: MoneyValue;
    expirationDate?: ISODateString;
    receivedAt: ISODateString;
    goodsReceiptId?: GoodsReceiptId;
    supplierId?: SupplierId;
    supplierLotNumber?: string;
    isConsignment: boolean;
    isLoaner: boolean;
    loanerReturnDate?: ISODateString;
    currentSterilizationCycles?: number;
    lastSterilizationCycleId?: SterilizationCycleId;
    lastSterilizedAt?: ISODateString;
    notes?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export declare enum LotStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    RECALLED = "recalled",
    QUARANTINE = "quarantine"
}
export interface Lot {
    id: LotId;
    organizationId: OrganizationId;
    productId: ProductId;
    lotNumber: string;
    batchNumber?: string;
    status: LotStatus;
    manufacturer: string;
    expirationDate: ISODateString;
    manufacturedDate?: ISODateString;
    supplierId: SupplierId;
    totalQuantityReceived: number;
    currentQuantityRemaining: number;
    unitOfMeasure: UnitOfMeasure;
    recallInfo?: {
        recallNumber: string;
        recallDate: ISODateString;
        reason: string;
        severity: string;
        instructions?: string;
    };
    quarantineInfo?: {
        quarantineDate: ISODateString;
        reason: string;
        expectedReleaseDate?: ISODateString;
    };
    coaFileId?: UUID;
    notes?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export interface ExpirationWarning {
    id: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    productId: ProductId;
    lotId: LotId;
    stockItemId: StockItemId;
    expirationDate: ISODateString;
    daysUntilExpiration: number;
    quantity: number;
    unitOfMeasure: UnitOfMeasure;
    locationId: StockLocationId;
    severity: 'critical' | 'warning' | 'info';
    isAcknowledged: boolean;
    acknowledgedBy?: UUID;
    acknowledgedAt?: ISODateString;
    createdAt: ISODateString;
}
export interface FEFORule {
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    productCategory?: ProductCategory;
    productIds?: ProductId[];
    isEnabled: boolean;
    warningThresholdDays: number;
    criticalThresholdDays: number;
    allowManualOverride: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export declare enum PurchaseOrderStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    APPROVED = "approved",
    PARTIALLY_RECEIVED = "partially_received",
    RECEIVED = "received",
    CANCELLED = "cancelled",
    CLOSED = "closed"
}
export interface PurchaseOrderItem {
    id: UUID;
    productId: ProductId;
    productVariantId?: ProductVariantId;
    productName: string;
    supplierSku?: string;
    quantityOrdered: number;
    unitOfMeasure: UnitOfMeasure;
    unitCost: MoneyValue;
    totalCost: MoneyValue;
    quantityReceived: number;
    quantityRemaining: number;
    expectedDeliveryDate?: ISODateString;
    notes?: string;
}
export interface PurchaseOrder {
    id: PurchaseOrderId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    poNumber: string;
    status: PurchaseOrderStatus;
    supplierId: SupplierId;
    orderDate: ISODateString;
    expectedDeliveryDate?: ISODateString;
    actualDeliveryDate?: ISODateString;
    items: PurchaseOrderItem[];
    subtotal: MoneyValue;
    taxAmount?: MoneyValue;
    shippingCost?: MoneyValue;
    totalCost: MoneyValue;
    deliveryAddress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    deliveryInstructions?: string;
    orderedBy: UUID;
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    notes?: string;
    supplierOrderReference?: string;
    supplierInvoiceReference?: string;
    paymentTerms?: string;
    cancellationReason?: string;
    cancelledBy?: UUID;
    cancelledAt?: ISODateString;
    attachmentIds?: UUID[];
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export interface GoodsReceiptItem {
    id: UUID;
    purchaseOrderItemId?: UUID;
    productId: ProductId;
    productVariantId?: ProductVariantId;
    productName: string;
    quantityReceived: number;
    quantityDamaged?: number;
    unitOfMeasure: UnitOfMeasure;
    unitCost: MoneyValue;
    totalCost: MoneyValue;
    lotId?: LotId;
    lotNumber?: string;
    expirationDate?: ISODateString;
    locationId: StockLocationId;
    notes?: string;
}
export interface GoodsReceipt {
    id: GoodsReceiptId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    receiptNumber: string;
    purchaseOrderId?: PurchaseOrderId;
    supplierId: SupplierId;
    receiptDate: ISODateString;
    supplierInvoiceNumber?: string;
    packingSlipNumber?: string;
    items: GoodsReceiptItem[];
    subtotal: MoneyValue;
    taxAmount?: MoneyValue;
    shippingCost?: MoneyValue;
    totalCost: MoneyValue;
    receivedBy: UUID;
    notes?: string;
    discrepancies?: string;
    attachmentIds?: UUID[];
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum SupplierStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export interface Supplier {
    id: SupplierId;
    organizationId: OrganizationId;
    name: string;
    status: SupplierStatus;
    supplierType?: string;
    contact: {
        contactName?: string;
        phone?: string;
        email?: string;
        website?: string;
        fax?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    billingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    paymentTerms?: string;
    taxId?: string;
    accountNumber?: string;
    minimumOrderAmount?: MoneyValue;
    freeShippingThreshold?: MoneyValue;
    standardLeadTimeDays?: number;
    isPreferred: boolean;
    representatives?: Array<{
        name: string;
        role: string;
        phone?: string;
        email?: string;
    }>;
    notes?: string;
    rating?: number;
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export interface MaterialUsage {
    id: UUID;
    productId: ProductId;
    productVariantId?: ProductVariantId;
    productName: string;
    quantityUsed: number;
    unitOfMeasure: UnitOfMeasure;
    lotId?: LotId;
    lotNumber?: string;
    stockItemId?: StockItemId;
    unitCost: MoneyValue;
    totalCost: MoneyValue;
    wasWasted: boolean;
    wasteQuantity?: number;
    notes?: string;
}
export interface ProcedureBillOfMaterials {
    id: BOMId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    name: string;
    description?: string;
    procedureCode?: string;
    procedureCategory?: string;
    materials: Array<{
        productId: ProductId;
        productVariantId?: ProductVariantId;
        productName: string;
        quantity: number;
        unitOfMeasure: UnitOfMeasure;
        isRequired: boolean;
        alternatives?: ProductId[];
        notes?: string;
    }>;
    instruments?: Array<{
        productId: ProductId;
        instrumentName: string;
        quantity: number;
        isRequired: boolean;
        notes?: string;
    }>;
    estimatedMaterialCost: MoneyValue;
    isActive: boolean;
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export interface CostAllocation {
    id: UUID;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    allocationDate: ISODateString;
    procedureId?: ProcedureId;
    providerId?: ProviderId;
    costCategory: string;
    amount: MoneyValue;
    description: string;
    materials?: MaterialUsage[];
    notes?: string;
    createdAt: ISODateString;
    metadata?: Metadata;
}
export interface SterilizationCycleReference {
    cycleId: SterilizationCycleId;
    cycleNumber: string;
    cycleDate: ISODateString;
    sterilizerId?: UUID;
    cycleType?: string;
    cycleStatus: 'passed' | 'failed' | 'pending';
    temperature?: number;
    durationMinutes?: number;
}
export interface SterilizableProduct {
    productId: ProductId;
    productName: string;
    maxSterilizationCycles?: number;
    recommendedSterilizationMethod?: string;
    sterilizationTemperature?: number;
    sterilizationDurationMinutes?: number;
    sterilizationInstructions?: string;
    sterilizationGuidelinesUrl?: string;
}
export interface InstrumentCycleTracking {
    stockItemId: StockItemId;
    productId: ProductId;
    currentCycles: number;
    maxCycles?: number;
    lastCycleId?: SterilizationCycleId;
    lastSterilizedAt?: ISODateString;
    nextSterilizationDue?: ISODateString;
    isDueForRetirement: boolean;
    cycleHistory?: SterilizationCycleReference[];
    maintenanceHistory?: Array<{
        maintenanceDate: ISODateString;
        maintenanceType: string;
        performedBy: UUID;
        notes?: string;
    }>;
    retiredAt?: ISODateString;
    retirementReason?: string;
    updatedAt: ISODateString;
}
