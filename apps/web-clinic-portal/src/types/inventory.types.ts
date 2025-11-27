/**
 * Inventory Types for Stock-Procedure Integration
 *
 * These types support the automatic stock deduction workflow
 * when procedures/interventions are performed on patients.
 */

/**
 * Unit of measure for inventory items
 */
export type UnitOfMeasure = 'buc' | 'ml' | 'g' | 'kg' | 'cutie' | 'set' | 'fiola' | 'comprimat';

/**
 * Stock status classification
 */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Stock item representing a product in inventory with current stock levels
 */
export interface StockItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  currency: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  warningThreshold: number;
  status: StockStatus;
  expirationDate?: string;
  lotNumber?: string;
  lastRestockDate?: string;
}

/**
 * Product consumption line item - represents a single product being consumed
 */
export interface ProductConsumption {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: UnitOfMeasure;
  quantity: number;
  defaultQuantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
  isOptional: boolean;
  hasSubstitutes: boolean;
  substituteIds?: string[];
  stockStatus: StockStatus;
  lotNumber?: string;
  expirationDate?: string;
}

/**
 * Consumption template - defines default materials for a procedure
 */
export interface ConsumptionTemplate {
  id: string;
  procedureCode: string;
  procedureName: string;
  materials: ConsumptionTemplateMaterial[];
  autoDeductOnComplete: boolean;
  estimatedMaterialCost: number;
  lastUpdated: string;
  updatedBy: string;
}

/**
 * Material line in a consumption template
 */
export interface ConsumptionTemplateMaterial {
  catalogItemId: string;
  productName: string;
  sku: string;
  unitOfMeasure: UnitOfMeasure;
  quantityPerUnit: number;
  isOptional: boolean;
  substituteIds?: string[];
}

/**
 * Stock movement record - immutable transaction log entry
 */
export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'receipt' | 'consumption' | 'adjustment' | 'transfer' | 'return' | 'expired';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost: number;
  totalCost: number;
  reference?: string;
  referenceType?: 'appointment' | 'purchase_order' | 'manual' | 'procedure';
  referenceId?: string;
  lotNumber?: string;
  expirationDate?: string;
  locationId?: string;
  locationName?: string;
  notes?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  tenantId: string;
  clinicId: string;
}

/**
 * Stock consumption request - payload for deducting stock
 */
export interface StockConsumptionRequest {
  appointmentId: string;
  patientId: string;
  providerId: string;
  procedureCode: string;
  procedureName: string;
  items: StockConsumptionItem[];
  notes?: string;
  locationId?: string;
}

/**
 * Individual item in a stock consumption request
 */
export interface StockConsumptionItem {
  productId: string;
  quantity: number;
  lotNumber?: string;
  unitPrice: number;
}

/**
 * Stock consumption response
 */
export interface StockConsumptionResponse {
  success: boolean;
  consumptionId: string;
  movements: StockMovement[];
  totalCost: number;
  warnings: StockWarning[];
}

/**
 * Stock warning - issues identified during consumption
 */
export interface StockWarning {
  type: 'low_stock' | 'out_of_stock' | 'near_expiry' | 'insufficient_quantity';
  productId: string;
  productName: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  currentStock?: number;
  requestedQuantity?: number;
  expirationDate?: string;
}

/**
 * Stock availability check request
 */
export interface StockAvailabilityRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  locationId?: string;
}

/**
 * Stock availability check response
 */
export interface StockAvailabilityResponse {
  allAvailable: boolean;
  items: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
    isAvailable: boolean;
    status: StockStatus;
    warnings: StockWarning[];
  }>;
}

/**
 * Procedure consumption summary - for display in UI
 */
export interface ProcedureConsumptionSummary {
  procedureCode: string;
  procedureName: string;
  items: ProductConsumption[];
  subtotal: number;
  totalItems: number;
  hasStockWarnings: boolean;
  warnings: StockWarning[];
}

/**
 * Product catalog item for selection
 */
export interface InventoryProductCatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  currency: string;
  availableStock: number;
  status: StockStatus;
  reorderLevel: number;
  description?: string;
  manufacturer?: string;
  barcode?: string;
}

/**
 * Helper function to get stock status label in Romanian
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'In Stoc';
    case 'low_stock':
      return 'Stoc Redus';
    case 'out_of_stock':
      return 'Lipsa Stoc';
    default:
      return 'Necunoscut';
  }
}

/**
 * Helper function to get unit of measure label in Romanian
 */
export function getUnitLabel(unit: UnitOfMeasure): string {
  switch (unit) {
    case 'buc':
      return 'buc';
    case 'ml':
      return 'ml';
    case 'g':
      return 'g';
    case 'kg':
      return 'kg';
    case 'cutie':
      return 'cutie';
    case 'set':
      return 'set';
    case 'fiola':
      return 'fiola';
    case 'comprimat':
      return 'cpr';
    default:
      return unit;
  }
}

/**
 * Helper function to calculate stock status from quantity and thresholds
 */
export function calculateStockStatus(
  currentStock: number,
  reorderLevel: number,
  warningThreshold?: number
): StockStatus {
  if (currentStock <= 0) {
    return 'out_of_stock';
  }
  const threshold = warningThreshold ?? reorderLevel;
  if (currentStock <= threshold) {
    return 'low_stock';
  }
  return 'in_stock';
}
