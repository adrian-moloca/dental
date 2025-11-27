/**
 * Stock Consumption Hook
 *
 * Custom hook for managing stock consumption during procedure completion.
 * Handles fetching product catalog, getting default consumption templates,
 * calculating costs, checking availability, and submitting consumption.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { inventoryKeys } from './useInventory';
import type {
  ProductConsumption,
  StockItem,
  ConsumptionTemplate,
  StockConsumptionRequest,
  StockConsumptionResponse,
  StockAvailabilityResponse,
  StockWarning,
  StockStatus,
  ProcedureConsumptionSummary,
  StockMovement,
} from '../types/inventory.types';

// ============================================================================
// Mock Data for Demo
// ============================================================================

const MOCK_STOCK_ITEMS: StockItem[] = [
  {
    id: 'stock-001',
    productId: 'prod-001',
    name: 'Compozit Universal A2',
    sku: 'COMP-A2-001',
    category: 'Materiale Restaurative',
    unitOfMeasure: 'g',
    unitPrice: 45.00,
    currency: 'RON',
    currentStock: 250,
    reservedStock: 20,
    availableStock: 230,
    reorderLevel: 50,
    warningThreshold: 75,
    status: 'in_stock',
    expirationDate: '2025-12-31',
    lotNumber: 'LOT-2024-A2-001',
  },
  {
    id: 'stock-002',
    productId: 'prod-002',
    name: 'Adeziv Dentinar Universal',
    sku: 'ADZ-UNI-001',
    category: 'Adezivi',
    unitOfMeasure: 'ml',
    unitPrice: 120.00,
    currency: 'RON',
    currentStock: 15,
    reservedStock: 0,
    availableStock: 15,
    reorderLevel: 10,
    warningThreshold: 20,
    status: 'low_stock',
    expirationDate: '2025-06-30',
    lotNumber: 'LOT-2024-ADZ-001',
  },
  {
    id: 'stock-003',
    productId: 'prod-003',
    name: 'Acid Gravaj 37%',
    sku: 'ACID-37-001',
    category: 'Materiale Auxiliare',
    unitOfMeasure: 'ml',
    unitPrice: 25.00,
    currency: 'RON',
    currentStock: 45,
    reservedStock: 5,
    availableStock: 40,
    reorderLevel: 20,
    warningThreshold: 30,
    status: 'in_stock',
    expirationDate: '2025-09-15',
    lotNumber: 'LOT-2024-ACID-001',
  },
  {
    id: 'stock-004',
    productId: 'prod-004',
    name: 'Anestezie Articaina 4%',
    sku: 'ANEST-ART-001',
    category: 'Anestezice',
    unitOfMeasure: 'fiola',
    unitPrice: 8.50,
    currency: 'RON',
    currentStock: 85,
    reservedStock: 10,
    availableStock: 75,
    reorderLevel: 30,
    warningThreshold: 50,
    status: 'in_stock',
    expirationDate: '2025-08-20',
    lotNumber: 'LOT-2024-ANEST-001',
  },
  {
    id: 'stock-005',
    productId: 'prod-005',
    name: 'Manusi Latex M',
    sku: 'MAN-LAT-M',
    category: 'Consumabile',
    unitOfMeasure: 'buc',
    unitPrice: 0.35,
    currency: 'RON',
    currentStock: 450,
    reservedStock: 0,
    availableStock: 450,
    reorderLevel: 100,
    warningThreshold: 200,
    status: 'in_stock',
  },
  {
    id: 'stock-006',
    productId: 'prod-006',
    name: 'Masca Protectie FFP2',
    sku: 'MASK-FFP2',
    category: 'Consumabile',
    unitOfMeasure: 'buc',
    unitPrice: 2.50,
    currency: 'RON',
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    reorderLevel: 50,
    warningThreshold: 100,
    status: 'out_of_stock',
  },
  {
    id: 'stock-007',
    productId: 'prod-007',
    name: 'Hemostatic Gel',
    sku: 'HEMO-GEL-001',
    category: 'Materiale Auxiliare',
    unitOfMeasure: 'ml',
    unitPrice: 65.00,
    currency: 'RON',
    currentStock: 8,
    reservedStock: 0,
    availableStock: 8,
    reorderLevel: 10,
    warningThreshold: 15,
    status: 'low_stock',
    expirationDate: '2025-04-30',
    lotNumber: 'LOT-2024-HEMO-001',
  },
  {
    id: 'stock-008',
    productId: 'prod-008',
    name: 'Ciment Ionomer de Sticla',
    sku: 'CEM-GIC-001',
    category: 'Cimenturi',
    unitOfMeasure: 'g',
    unitPrice: 85.00,
    currency: 'RON',
    currentStock: 120,
    reservedStock: 0,
    availableStock: 120,
    reorderLevel: 30,
    warningThreshold: 50,
    status: 'in_stock',
    expirationDate: '2026-01-15',
    lotNumber: 'LOT-2024-GIC-001',
  },
];

const MOCK_CONSUMPTION_TEMPLATES: Record<string, ConsumptionTemplate> = {
  'D2391': {
    id: 'tmpl-001',
    procedureCode: 'D2391',
    procedureName: 'Obturatie Compozit 1 Suprafata',
    autoDeductOnComplete: true,
    estimatedMaterialCost: 78.50,
    lastUpdated: '2024-11-01T10:00:00Z',
    updatedBy: 'admin',
    materials: [
      { catalogItemId: 'prod-001', productName: 'Compozit Universal A2', sku: 'COMP-A2-001', unitOfMeasure: 'g', quantityPerUnit: 0.5, isOptional: false },
      { catalogItemId: 'prod-002', productName: 'Adeziv Dentinar Universal', sku: 'ADZ-UNI-001', unitOfMeasure: 'ml', quantityPerUnit: 0.1, isOptional: false },
      { catalogItemId: 'prod-003', productName: 'Acid Gravaj 37%', sku: 'ACID-37-001', unitOfMeasure: 'ml', quantityPerUnit: 0.2, isOptional: false },
      { catalogItemId: 'prod-004', productName: 'Anestezie Articaina 4%', sku: 'ANEST-ART-001', unitOfMeasure: 'fiola', quantityPerUnit: 1, isOptional: true },
    ],
  },
  'D2392': {
    id: 'tmpl-002',
    procedureCode: 'D2392',
    procedureName: 'Obturatie Compozit 2 Suprafete',
    autoDeductOnComplete: true,
    estimatedMaterialCost: 115.00,
    lastUpdated: '2024-11-01T10:00:00Z',
    updatedBy: 'admin',
    materials: [
      { catalogItemId: 'prod-001', productName: 'Compozit Universal A2', sku: 'COMP-A2-001', unitOfMeasure: 'g', quantityPerUnit: 0.8, isOptional: false },
      { catalogItemId: 'prod-002', productName: 'Adeziv Dentinar Universal', sku: 'ADZ-UNI-001', unitOfMeasure: 'ml', quantityPerUnit: 0.15, isOptional: false },
      { catalogItemId: 'prod-003', productName: 'Acid Gravaj 37%', sku: 'ACID-37-001', unitOfMeasure: 'ml', quantityPerUnit: 0.3, isOptional: false },
      { catalogItemId: 'prod-004', productName: 'Anestezie Articaina 4%', sku: 'ANEST-ART-001', unitOfMeasure: 'fiola', quantityPerUnit: 1, isOptional: true },
    ],
  },
  'D7140': {
    id: 'tmpl-003',
    procedureCode: 'D7140',
    procedureName: 'Extractie Simpla',
    autoDeductOnComplete: true,
    estimatedMaterialCost: 45.00,
    lastUpdated: '2024-11-01T10:00:00Z',
    updatedBy: 'admin',
    materials: [
      { catalogItemId: 'prod-004', productName: 'Anestezie Articaina 4%', sku: 'ANEST-ART-001', unitOfMeasure: 'fiola', quantityPerUnit: 2, isOptional: false },
      { catalogItemId: 'prod-007', productName: 'Hemostatic Gel', sku: 'HEMO-GEL-001', unitOfMeasure: 'ml', quantityPerUnit: 0.5, isOptional: true },
      { catalogItemId: 'prod-005', productName: 'Manusi Latex M', sku: 'MAN-LAT-M', unitOfMeasure: 'buc', quantityPerUnit: 2, isOptional: false },
    ],
  },
  'D0120': {
    id: 'tmpl-004',
    procedureCode: 'D0120',
    procedureName: 'Examinare Periodica',
    autoDeductOnComplete: true,
    estimatedMaterialCost: 5.50,
    lastUpdated: '2024-11-01T10:00:00Z',
    updatedBy: 'admin',
    materials: [
      { catalogItemId: 'prod-005', productName: 'Manusi Latex M', sku: 'MAN-LAT-M', unitOfMeasure: 'buc', quantityPerUnit: 2, isOptional: false },
    ],
  },
};

// ============================================================================
// Query Keys
// ============================================================================

export const stockConsumptionKeys = {
  all: ['stock-consumption'] as const,
  catalog: () => [...stockConsumptionKeys.all, 'catalog'] as const,
  template: (procedureCode: string) => [...stockConsumptionKeys.all, 'template', procedureCode] as const,
  availability: (items: string) => [...stockConsumptionKeys.all, 'availability', items] as const,
};

// ============================================================================
// API Simulation Functions
// ============================================================================

async function fetchProductCatalog(): Promise<StockItem[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_STOCK_ITEMS;
}

async function fetchConsumptionTemplate(procedureCode: string): Promise<ConsumptionTemplate | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_CONSUMPTION_TEMPLATES[procedureCode] || null;
}

async function checkStockAvailability(
  items: Array<{ productId: string; quantity: number }>
): Promise<StockAvailabilityResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const results = items.map((item) => {
    const stockItem = MOCK_STOCK_ITEMS.find((s) => s.productId === item.productId);
    if (!stockItem) {
      return {
        productId: item.productId,
        productName: 'Produs Necunoscut',
        requestedQuantity: item.quantity,
        availableQuantity: 0,
        isAvailable: false,
        status: 'out_of_stock' as StockStatus,
        warnings: [{
          type: 'out_of_stock' as const,
          productId: item.productId,
          productName: 'Produs Necunoscut',
          message: 'Produsul nu a fost gasit in catalog',
          severity: 'error' as const,
        }],
      };
    }

    const isAvailable = stockItem.availableStock >= item.quantity;
    const warnings: StockWarning[] = [];

    if (!isAvailable) {
      warnings.push({
        type: 'insufficient_quantity',
        productId: item.productId,
        productName: stockItem.name,
        message: `Stoc insuficient. Disponibil: ${stockItem.availableStock} ${stockItem.unitOfMeasure}`,
        severity: 'error',
        currentStock: stockItem.availableStock,
        requestedQuantity: item.quantity,
      });
    } else if (stockItem.status === 'low_stock') {
      warnings.push({
        type: 'low_stock',
        productId: item.productId,
        productName: stockItem.name,
        message: `Stoc redus. Ramane: ${stockItem.availableStock - item.quantity} ${stockItem.unitOfMeasure}`,
        severity: 'warning',
        currentStock: stockItem.availableStock,
      });
    }

    if (stockItem.expirationDate) {
      const expDate = new Date(stockItem.expirationDate);
      const daysUntilExpiry = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30) {
        warnings.push({
          type: 'near_expiry',
          productId: item.productId,
          productName: stockItem.name,
          message: `Expira in ${daysUntilExpiry} zile (${new Date(stockItem.expirationDate).toLocaleDateString('ro-RO')})`,
          severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
          expirationDate: stockItem.expirationDate,
        });
      }
    }

    return {
      productId: item.productId,
      productName: stockItem.name,
      requestedQuantity: item.quantity,
      availableQuantity: stockItem.availableStock,
      isAvailable,
      status: stockItem.status,
      warnings,
    };
  });

  return {
    allAvailable: results.every((r) => r.isAvailable),
    items: results,
  };
}

async function submitStockConsumption(
  request: StockConsumptionRequest
): Promise<StockConsumptionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate all items are available
  const availabilityCheck = await checkStockAvailability(
    request.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
  );

  if (!availabilityCheck.allAvailable) {
    const unavailableItems = availabilityCheck.items.filter((i) => !i.isAvailable);
    throw new Error(
      `Stoc insuficient pentru: ${unavailableItems.map((i) => i.productName).join(', ')}`
    );
  }

  // Simulate stock deduction and movement creation
  const movements: StockMovement[] = request.items.map((item, index) => {
    const stockItem = MOCK_STOCK_ITEMS.find((s) => s.productId === item.productId);
    return {
      id: `mov-${Date.now()}-${index}`,
      productId: item.productId,
      productName: stockItem?.name || 'Unknown',
      type: 'consumption' as const,
      quantity: item.quantity,
      previousQuantity: stockItem?.availableStock || 0,
      newQuantity: (stockItem?.availableStock || 0) - item.quantity,
      unitCost: item.unitPrice,
      totalCost: item.quantity * item.unitPrice,
      reference: request.appointmentId,
      referenceType: 'appointment' as const,
      referenceId: request.appointmentId,
      lotNumber: stockItem?.lotNumber,
      performedBy: request.providerId,
      performedByName: 'Provider',
      performedAt: new Date().toISOString(),
      tenantId: 'tenant-001',
      clinicId: 'clinic-001',
    };
  });

  const totalCost = movements.reduce((sum, m) => sum + m.totalCost, 0);
  const warnings = availabilityCheck.items.flatMap((i) => i.warnings);

  return {
    success: true,
    consumptionId: `cons-${Date.now()}`,
    movements,
    totalCost,
    warnings,
  };
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch the product catalog
 */
export function useProductCatalog() {
  return useQuery({
    queryKey: stockConsumptionKeys.catalog(),
    queryFn: fetchProductCatalog,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to fetch consumption template for a procedure
 */
export function useConsumptionTemplate(procedureCode: string) {
  return useQuery({
    queryKey: stockConsumptionKeys.template(procedureCode),
    queryFn: () => fetchConsumptionTemplate(procedureCode),
    enabled: !!procedureCode,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * Hook to check stock availability for a list of items
 */
export function useStockAvailabilityCheck() {
  return useMutation({
    mutationFn: checkStockAvailability,
  });
}

/**
 * Hook to submit stock consumption
 */
export function useSubmitConsumption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStockConsumption,
    onSuccess: () => {
      // Invalidate stock-related queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      queryClient.invalidateQueries({ queryKey: stockConsumptionKeys.catalog() });
      toast.success('Consumul de materiale a fost inregistrat');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Eroare la inregistrarea consumului');
    },
  });
}

// ============================================================================
// Main Composite Hook
// ============================================================================

export interface UseStockConsumptionOptions {
  procedureCodes: string[];
  appointmentId: string;
  patientId: string;
  providerId: string;
}

export interface UseStockConsumptionReturn {
  // Data
  consumptionItems: ProductConsumption[];
  stockItems: StockItem[];
  isLoading: boolean;
  isSubmitting: boolean;

  // Computed
  totalCost: number;
  hasStockWarnings: boolean;
  warnings: StockWarning[];
  summary: ProcedureConsumptionSummary | null;

  // Actions
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  addItem: (productId: string, quantity: number) => void;
  resetToDefaults: () => void;
  checkAvailability: () => Promise<StockAvailabilityResponse | undefined>;
  submitConsumption: () => Promise<StockConsumptionResponse | undefined>;
}

/**
 * Main composite hook for managing stock consumption during procedure completion
 */
export function useStockConsumption({
  procedureCodes,
  appointmentId,
  patientId,
  providerId,
}: UseStockConsumptionOptions): UseStockConsumptionReturn {
  const _queryClient = useQueryClient();

  // State for consumption items
  const [consumptionItems, setConsumptionItems] = useState<ProductConsumption[]>([]);

  // Fetch product catalog
  const { data: stockItems = [], isLoading: isLoadingCatalog } = useProductCatalog();

  // Fetch templates for all procedure codes
  const templateQueries = procedureCodes.map((code) => ({
    code,
    query: useConsumptionTemplate(code),
  }));

  const isLoadingTemplates = templateQueries.some((t) => t.query.isLoading);

  // Availability check mutation
  const availabilityMutation = useStockAvailabilityCheck();

  // Submit consumption mutation
  const submitMutation = useSubmitConsumption();

  // Build consumption items from templates when loaded
  const buildConsumptionItems = useCallback(() => {
    const items: ProductConsumption[] = [];

    templateQueries.forEach(({ query }) => {
      if (query.data) {
        query.data.materials.forEach((material) => {
          const stockItem = stockItems.find((s) => s.productId === material.catalogItemId);
          if (stockItem) {
            // Check if item already exists (from another procedure)
            const existingIndex = items.findIndex((i) => i.productId === material.catalogItemId);
            if (existingIndex >= 0) {
              // Add to existing quantity
              items[existingIndex].quantity += material.quantityPerUnit;
              items[existingIndex].defaultQuantity += material.quantityPerUnit;
              items[existingIndex].totalPrice = items[existingIndex].quantity * items[existingIndex].unitPrice;
            } else {
              items.push({
                id: `cons-${material.catalogItemId}-${Date.now()}`,
                productId: material.catalogItemId,
                name: stockItem.name,
                sku: stockItem.sku,
                category: stockItem.category,
                unitOfMeasure: stockItem.unitOfMeasure,
                quantity: material.quantityPerUnit,
                defaultQuantity: material.quantityPerUnit,
                unitPrice: stockItem.unitPrice,
                totalPrice: material.quantityPerUnit * stockItem.unitPrice,
                availableStock: stockItem.availableStock,
                isOptional: material.isOptional,
                hasSubstitutes: (material.substituteIds?.length || 0) > 0,
                substituteIds: material.substituteIds,
                stockStatus: stockItem.status,
                lotNumber: stockItem.lotNumber,
                expirationDate: stockItem.expirationDate,
              });
            }
          }
        });
      }
    });

    return items;
  }, [templateQueries, stockItems]);

  // Initialize consumption items when templates are loaded
  useMemo(() => {
    if (!isLoadingTemplates && !isLoadingCatalog && consumptionItems.length === 0) {
      const items = buildConsumptionItems();
      if (items.length > 0) {
        setConsumptionItems(items);
      }
    }
  }, [isLoadingTemplates, isLoadingCatalog, buildConsumptionItems, consumptionItems.length]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return consumptionItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [consumptionItems]);

  // Calculate warnings
  const warnings = useMemo((): StockWarning[] => {
    const result: StockWarning[] = [];

    consumptionItems.forEach((item) => {
      if (item.quantity > item.availableStock) {
        result.push({
          type: 'insufficient_quantity',
          productId: item.productId,
          productName: item.name,
          message: `Stoc insuficient. Disponibil: ${item.availableStock} ${item.unitOfMeasure}`,
          severity: 'error',
          currentStock: item.availableStock,
          requestedQuantity: item.quantity,
        });
      } else if (item.stockStatus === 'low_stock') {
        result.push({
          type: 'low_stock',
          productId: item.productId,
          productName: item.name,
          message: `Stoc redus dupa consum: ${item.availableStock - item.quantity} ${item.unitOfMeasure}`,
          severity: 'warning',
          currentStock: item.availableStock,
        });
      } else if (item.stockStatus === 'out_of_stock') {
        result.push({
          type: 'out_of_stock',
          productId: item.productId,
          productName: item.name,
          message: 'Lipsa stoc',
          severity: 'error',
          currentStock: 0,
        });
      }

      if (item.expirationDate) {
        const expDate = new Date(item.expirationDate);
        const daysUntilExpiry = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30) {
          result.push({
            type: 'near_expiry',
            productId: item.productId,
            productName: item.name,
            message: `Expira in ${daysUntilExpiry} zile`,
            severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
            expirationDate: item.expirationDate,
          });
        }
      }
    });

    return result;
  }, [consumptionItems]);

  const hasStockWarnings = warnings.length > 0;

  // Build summary
  const summary = useMemo((): ProcedureConsumptionSummary | null => {
    if (consumptionItems.length === 0) return null;

    const procedureNames = templateQueries
      .filter((t) => t.query.data)
      .map((t) => t.query.data!.procedureName);

    return {
      procedureCode: procedureCodes.join(', '),
      procedureName: procedureNames.join(', '),
      items: consumptionItems,
      subtotal: totalCost,
      totalItems: consumptionItems.length,
      hasStockWarnings,
      warnings,
    };
  }, [consumptionItems, procedureCodes, templateQueries, totalCost, hasStockWarnings, warnings]);

  // Actions
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setConsumptionItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(0, quantity),
              totalPrice: Math.max(0, quantity) * item.unitPrice,
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setConsumptionItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const addItem = useCallback(
    (productId: string, quantity: number) => {
      const stockItem = stockItems.find((s) => s.productId === productId);
      if (!stockItem) return;

      // Check if already exists
      const existingIndex = consumptionItems.findIndex((i) => i.productId === productId);
      if (existingIndex >= 0) {
        updateQuantity(productId, consumptionItems[existingIndex].quantity + quantity);
        return;
      }

      const newItem: ProductConsumption = {
        id: `cons-${productId}-${Date.now()}`,
        productId,
        name: stockItem.name,
        sku: stockItem.sku,
        category: stockItem.category,
        unitOfMeasure: stockItem.unitOfMeasure,
        quantity,
        defaultQuantity: 0, // Manual addition has no default
        unitPrice: stockItem.unitPrice,
        totalPrice: quantity * stockItem.unitPrice,
        availableStock: stockItem.availableStock,
        isOptional: true,
        hasSubstitutes: false,
        stockStatus: stockItem.status,
        lotNumber: stockItem.lotNumber,
        expirationDate: stockItem.expirationDate,
      };

      setConsumptionItems((prev) => [...prev, newItem]);
    },
    [stockItems, consumptionItems, updateQuantity]
  );

  const resetToDefaults = useCallback(() => {
    const items = buildConsumptionItems();
    setConsumptionItems(items);
  }, [buildConsumptionItems]);

  const checkAvailability = useCallback(async () => {
    if (consumptionItems.length === 0) return undefined;

    const items = consumptionItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    return availabilityMutation.mutateAsync(items);
  }, [consumptionItems, availabilityMutation]);

  const submitConsumption = useCallback(async () => {
    if (consumptionItems.length === 0) return undefined;

    const request: StockConsumptionRequest = {
      appointmentId,
      patientId,
      providerId,
      procedureCode: procedureCodes.join(', '),
      procedureName: templateQueries
        .filter((t) => t.query.data)
        .map((t) => t.query.data!.procedureName)
        .join(', '),
      items: consumptionItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        lotNumber: item.lotNumber,
        unitPrice: item.unitPrice,
      })),
    };

    return submitMutation.mutateAsync(request);
  }, [consumptionItems, appointmentId, patientId, providerId, procedureCodes, templateQueries, submitMutation]);

  return {
    consumptionItems,
    stockItems,
    isLoading: isLoadingCatalog || isLoadingTemplates,
    isSubmitting: submitMutation.isPending,
    totalCost,
    hasStockWarnings,
    warnings,
    summary,
    updateQuantity,
    removeItem,
    addItem,
    resetToDefaults,
    checkAvailability,
    submitConsumption,
  };
}
