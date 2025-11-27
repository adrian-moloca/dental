/**
 * Consumption Summary Component
 *
 * Displays a summary of products to be consumed during a procedure.
 * Features:
 * - List of products with quantities and prices
 * - Total materials cost
 * - Stock warnings section
 * - Confirm/Cancel buttons
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { ProductQuantityInput } from './ProductQuantityInput';
import { StockWarningBanner, StockAvailabilityBadge } from './StockAvailabilityBadge';
import type { ProductConsumption, StockWarning } from '../../types/inventory.types';
import { getUnitLabel } from '../../types/inventory.types';

interface ConsumptionSummaryProps {
  items: ProductConsumption[];
  totalCost: number;
  warnings: StockWarning[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onResetToDefaults?: () => void;
  procedureName?: string;
  className?: string;
}

export function ConsumptionSummary({
  items,
  totalCost,
  warnings,
  isLoading = false,
  isSubmitting = false,
  onQuantityChange,
  onRemoveItem,
  onConfirm,
  onCancel,
  onResetToDefaults,
  procedureName,
  className,
}: ConsumptionSummaryProps) {
  // Separate warnings by severity
  const { errorWarnings, warningAlerts } = useMemo(() => {
    const errors = warnings.filter((w) => w.severity === 'error');
    const alerts = warnings.filter((w) => w.severity === 'warning');
    return { errorWarnings: errors, warningAlerts: alerts };
  }, [warnings]);

  // Check if there are blocking errors (out of stock or insufficient quantity)
  const hasBlockingErrors = errorWarnings.some(
    (w) => w.type === 'out_of_stock' || w.type === 'insufficient_quantity'
  );

  // Check if any quantities were modified from defaults
  const hasModifications = items.some((item) => item.quantity !== item.defaultQuantity);

  if (isLoading) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--surface-card)] rounded w-1/3"></div>
          <div className="h-16 bg-[var(--surface-card)] rounded"></div>
          <div className="h-16 bg-[var(--surface-card)] rounded"></div>
          <div className="h-16 bg-[var(--surface-card)] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Consum Materiale</h3>
          {procedureName && (
            <p className="text-sm text-[var(--text-tertiary)]">{procedureName}</p>
          )}
        </div>
        {onResetToDefaults && hasModifications && (
          <button
            type="button"
            onClick={onResetToDefaults}
            disabled={isSubmitting}
            className="text-sm text-[var(--primary)] hover:underline disabled:opacity-50"
          >
            Reseteaza la standard
          </button>
        )}
      </div>

      {/* Products List */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <ProductQuantityInput
              key={item.id}
              productId={item.productId}
              productName={item.name}
              quantity={item.quantity}
              defaultQuantity={item.defaultQuantity}
              availableStock={item.availableStock}
              unitOfMeasure={item.unitOfMeasure}
              unitPrice={item.unitPrice}
              stockStatus={item.stockStatus}
              onQuantityChange={onQuantityChange}
              onRemove={onRemoveItem}
              disabled={isSubmitting}
              showPrice={true}
              showRemoveButton={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-tertiary)]">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-sm">Nu exista materiale de consumat pentru aceasta procedura</p>
        </div>
      )}

      {/* Stock Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Avertizari Stoc
          </h4>

          {/* Error warnings */}
          {errorWarnings.map((warning, index) => (
            <StockWarningBanner
              key={`error-${warning.productId}-${index}`}
              status={warning.type === 'out_of_stock' ? 'out_of_stock' : 'low_stock'}
              productName={warning.productName}
              quantity={warning.currentStock}
              requestedQuantity={warning.requestedQuantity}
              expirationDate={warning.expirationDate}
            />
          ))}

          {/* Warning alerts */}
          {warningAlerts.map((warning, index) => (
            <StockWarningBanner
              key={`warning-${warning.productId}-${index}`}
              status="low_stock"
              productName={warning.productName}
              quantity={warning.currentStock}
              expirationDate={warning.expirationDate}
            />
          ))}
        </div>
      )}

      {/* Cost Summary */}
      {items.length > 0 && (
        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-medium">Cost Total Materiale</span>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {items.length} {items.length === 1 ? 'produs' : 'produse'}
              </p>
            </div>
            <span className="text-2xl font-bold text-[var(--primary)] tabular-nums">
              {totalCost.toFixed(2)} RON
            </span>
          </div>

          {/* Cost breakdown by category */}
          <div className="mt-3 pt-3 border-t border-[var(--primary)]/20">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(
                items.reduce((acc, item) => {
                  acc[item.category] = (acc[item.category] || 0) + item.totalPrice;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, subtotal]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">{category}</span>
                  <span className="text-[var(--text)] tabular-nums">{subtotal.toFixed(2)} RON</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          fullWidth
        >
          Anuleaza
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={isSubmitting}
          disabled={isSubmitting || items.length === 0 || hasBlockingErrors}
          fullWidth
        >
          {hasBlockingErrors ? 'Stoc Insuficient' : 'Confirma Consum'}
        </Button>
      </div>

      {/* Help text */}
      {hasBlockingErrors && (
        <p className="text-xs text-[var(--danger)] text-center">
          Nu puteti confirma consumul deoarece exista produse fara stoc suficient.
          Ajustati cantitatile sau eliminati produsele problematice.
        </p>
      )}
    </div>
  );
}

/**
 * Compact table view for consumption items
 */
interface ConsumptionTableProps {
  items: ProductConsumption[];
  showActions?: boolean;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ConsumptionTable({
  items,
  showActions = false,
  onQuantityChange,
  onRemoveItem,
  disabled = false,
  className,
}: ConsumptionTableProps) {
  const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-2 px-3 font-medium text-[var(--text-tertiary)]">Produs</th>
            <th className="text-center py-2 px-3 font-medium text-[var(--text-tertiary)]">Cantitate</th>
            <th className="text-right py-2 px-3 font-medium text-[var(--text-tertiary)]">Pret Unit.</th>
            <th className="text-right py-2 px-3 font-medium text-[var(--text-tertiary)]">Total</th>
            <th className="text-center py-2 px-3 font-medium text-[var(--text-tertiary)]">Stoc</th>
            {showActions && <th className="py-2 px-3"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[var(--surface-hover)]">
              <td className="py-2 px-3">
                <div className="font-medium text-[var(--text)]">{item.name}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{item.sku}</div>
              </td>
              <td className="py-2 px-3 text-center">
                {showActions && onQuantityChange ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.productId, parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    min={0}
                    max={item.availableStock}
                    className="w-16 h-7 text-center text-sm rounded border border-[var(--border)] bg-[var(--surface)] disabled:opacity-50"
                  />
                ) : (
                  <span className="tabular-nums">
                    {item.quantity} {getUnitLabel(item.unitOfMeasure)}
                  </span>
                )}
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-[var(--text)]">
                {item.unitPrice.toFixed(2)} RON
              </td>
              <td className="py-2 px-3 text-right tabular-nums font-medium text-[var(--text)]">
                {item.totalPrice.toFixed(2)} RON
              </td>
              <td className="py-2 px-3 text-center">
                <StockAvailabilityBadge
                  status={item.stockStatus}
                  size="sm"
                  quantity={item.availableStock}
                  unitOfMeasure={item.unitOfMeasure}
                  showQuantity
                />
              </td>
              {showActions && onRemoveItem && (
                <td className="py-2 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.productId)}
                    disabled={disabled}
                    className="p-1 text-[var(--text-tertiary)] hover:text-[var(--danger)] disabled:opacity-50"
                    aria-label="Sterge"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[var(--border)]">
            <td colSpan={showActions ? 3 : 3} className="py-3 px-3 text-right font-semibold text-[var(--text)]">
              Total:
            </td>
            <td className="py-3 px-3 text-right font-bold text-lg text-[var(--primary)] tabular-nums">
              {totalCost.toFixed(2)} RON
            </td>
            <td colSpan={showActions ? 2 : 1}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/**
 * Read-only consumption receipt for completed procedures
 */
interface ConsumptionReceiptProps {
  items: ProductConsumption[];
  procedureName: string;
  patientName?: string;
  providerName?: string;
  completedAt: string;
  totalCost: number;
  className?: string;
}

export function ConsumptionReceipt({
  items,
  procedureName,
  patientName,
  providerName,
  completedAt,
  totalCost,
  className,
}: ConsumptionReceiptProps) {
  return (
    <div className={clsx('bg-[var(--surface-card)] rounded-lg border border-[var(--border)] p-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h3 className="font-semibold text-[var(--text)]">Consum Materiale</h3>
          <p className="text-sm text-[var(--text-tertiary)]">{procedureName}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-[var(--text-tertiary)]">
            {new Date(completedAt).toLocaleDateString('ro-RO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Details */}
      {(patientName || providerName) && (
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          {patientName && (
            <div>
              <span className="text-[var(--text-tertiary)]">Pacient:</span>
              <span className="ml-2 text-[var(--text)]">{patientName}</span>
            </div>
          )}
          {providerName && (
            <div>
              <span className="text-[var(--text-tertiary)]">Medic:</span>
              <span className="ml-2 text-[var(--text)]">{providerName}</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="text-[var(--text)]">{item.name}</span>
              <span className="text-[var(--text-tertiary)] ml-2">
                x {item.quantity} {getUnitLabel(item.unitOfMeasure)}
              </span>
            </div>
            <span className="text-[var(--text)] tabular-nums">{item.totalPrice.toFixed(2)} RON</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
        <span className="font-semibold text-[var(--text)]">Total Materiale</span>
        <span className="text-xl font-bold text-[var(--primary)] tabular-nums">
          {totalCost.toFixed(2)} RON
        </span>
      </div>
    </div>
  );
}
