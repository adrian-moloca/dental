/**
 * Stock Consumption Modal Component
 *
 * Modal for reviewing and confirming material consumption during procedure completion.
 * Features:
 * - Pre-filled with intervention template defaults
 * - Allows modifications to quantities
 * - Shows stock warnings
 * - Deducts stock on confirmation
 */

import { useEffect, useState, useCallback } from 'react';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { ConsumptionSummary } from './ConsumptionSummary';
import { useStockConsumption } from '../../hooks/useStockConsumption';
import type { StockItem } from '../../types/inventory.types';
import { StockAvailabilityBadge } from './StockAvailabilityBadge';
import { getUnitLabel } from '../../types/inventory.types';

interface StockConsumptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (totalMaterialCost: number) => void;
  appointmentId: string;
  patientId: string;
  providerId: string;
  procedureCodes: string[];
  procedureNames?: string[];
  disabled?: boolean;
}

export function StockConsumptionModal({
  open,
  onClose,
  onConfirm,
  appointmentId,
  patientId,
  providerId,
  procedureCodes,
  procedureNames = [],
  disabled = false,
}: StockConsumptionModalProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    consumptionItems,
    stockItems,
    isLoading,
    isSubmitting,
    totalCost,
    hasStockWarnings,
    warnings,
    summary,
    updateQuantity,
    removeItem,
    addItem,
    resetToDefaults,
    submitConsumption,
  } = useStockConsumption({
    procedureCodes,
    appointmentId,
    patientId,
    providerId,
  });

  // Filter stock items for add product functionality
  const filteredStockItems = stockItems.filter((item) => {
    // Exclude items already in consumption list
    if (consumptionItems.some((c) => c.productId === item.productId)) {
      return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Handle confirm
  const handleConfirm = useCallback(async () => {
    try {
      const result = await submitConsumption();
      if (result?.success) {
        onConfirm(result.totalCost);
        onClose();
      }
    } catch (error) {
      // Error handled by hook
    }
  }, [submitConsumption, onConfirm, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      setShowAddProduct(false);
      setSearchQuery('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Handle add product
  const handleAddProduct = useCallback(
    (item: StockItem) => {
      addItem(item.productId, 1);
      setSearchQuery('');
    },
    [addItem]
  );

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setShowAddProduct(false);
      setSearchQuery('');
    }
  }, [open]);

  const procedureNamesDisplay =
    procedureNames.length > 0 ? procedureNames.join(', ') : procedureCodes.join(', ');

  return (
    <Modal open={open} onClose={handleCancel} title="Consum Materiale" size="lg">
      <div className="space-y-6">
        {/* Procedure Info */}
        <div className="bg-[var(--surface-card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-[var(--text)]">Procedura</h4>
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                {procedureNamesDisplay}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[var(--text-tertiary)]">Cod</span>
              <p className="font-mono text-sm text-[var(--text)]">{procedureCodes.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Add Product Section */}
        <div className="flex items-center justify-between">
          <Button
            variant="soft"
            size="sm"
            onClick={() => setShowAddProduct(!showAddProduct)}
            disabled={disabled || isSubmitting}
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adauga Produs
          </Button>

          {consumptionItems.length > 0 && (
            <span className="text-sm text-[var(--text-tertiary)]">
              {consumptionItems.length} {consumptionItems.length === 1 ? 'produs' : 'produse'}
            </span>
          )}
        </div>

        {/* Add Product Dropdown */}
        {showAddProduct && (
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="p-3 bg-[var(--surface-card)] border-b border-[var(--border)]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cauta produs dupa nume sau cod..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredStockItems.length > 0 ? (
                filteredStockItems.slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddProduct(item)}
                    disabled={item.status === 'out_of_stock'}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {item.sku} | {item.unitPrice.toFixed(2)} RON/{getUnitLabel(item.unitOfMeasure)}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <StockAvailabilityBadge
                        status={item.status}
                        quantity={item.availableStock}
                        unitOfMeasure={item.unitOfMeasure}
                        showQuantity
                        size="sm"
                      />
                      <svg
                        className="w-4 h-4 text-[var(--primary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-[var(--text-tertiary)]">
                  {searchQuery
                    ? 'Nu s-au gasit produse'
                    : 'Toate produsele sunt deja in lista'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Consumption Summary */}
        <ConsumptionSummary
          items={consumptionItems}
          totalCost={totalCost}
          warnings={warnings}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onQuantityChange={updateQuantity}
          onRemoveItem={removeItem}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onResetToDefaults={resetToDefaults}
          procedureName={procedureNamesDisplay}
        />

        {/* Help text */}
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Cantitatile sunt pre-completate conform sablonului standard al procedurii.
          Puteti ajusta cantitatile sau adauga produse suplimentare.
        </p>
      </div>
    </Modal>
  );
}

/**
 * Trigger button for stock consumption modal
 */
interface StockConsumptionTriggerProps {
  onClick: () => void;
  disabled?: boolean;
  hasWarnings?: boolean;
  totalItems?: number;
  estimatedCost?: number;
  className?: string;
}

export function StockConsumptionTrigger({
  onClick,
  disabled = false,
  hasWarnings = false,
  totalItems = 0,
  estimatedCost = 0,
  className,
}: StockConsumptionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
        hasWarnings
          ? 'border-[var(--warning)]/50 bg-[var(--warning)]/5 hover:bg-[var(--warning)]/10'
          : 'border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            hasWarnings ? 'bg-[var(--warning)]/20 text-[var(--warning)]' : 'bg-[var(--primary)]/10 text-[var(--primary)]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div className="text-left">
          <p className="font-medium text-[var(--text)]">Consum Materiale</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {totalItems > 0 ? `${totalItems} produse` : 'Configureaza materialele'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {estimatedCost > 0 && (
          <span className="text-sm font-medium text-[var(--text)] tabular-nums">
            {estimatedCost.toFixed(2)} RON
          </span>
        )}
        {hasWarnings && (
          <span className="w-2 h-2 rounded-full bg-[var(--warning)]" title="Avertizari stoc" />
        )}
        <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
