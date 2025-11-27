/**
 * Product Quantity Input Component
 *
 * Quantity selector with +/- buttons for stock consumption.
 * Features:
 * - Increment/decrement buttons
 * - Stock availability display
 * - Unit display (buc, ml, g, etc.)
 * - Max quantity based on available stock
 * - Warning when exceeding default quantity
 */

import { useCallback, useId } from 'react';
import clsx from 'clsx';
import type { UnitOfMeasure, StockStatus } from '../../types/inventory.types';
import { getUnitLabel } from '../../types/inventory.types';
import { StockIndicatorDot } from './StockAvailabilityBadge';

interface ProductQuantityInputProps {
  productId: string;
  productName: string;
  quantity: number;
  defaultQuantity: number;
  availableStock: number;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  stockStatus: StockStatus;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
  disabled?: boolean;
  showPrice?: boolean;
  showRemoveButton?: boolean;
  minQuantity?: number;
  step?: number;
  className?: string;
}

export function ProductQuantityInput({
  productId,
  productName,
  quantity,
  defaultQuantity,
  availableStock,
  unitOfMeasure,
  unitPrice,
  stockStatus,
  onQuantityChange,
  onRemove,
  disabled = false,
  showPrice = true,
  showRemoveButton = true,
  minQuantity = 0,
  step = 1,
  className,
}: ProductQuantityInputProps) {
  const inputId = useId();
  const unitLabel = getUnitLabel(unitOfMeasure);
  const totalPrice = quantity * unitPrice;

  // Determine if quantity exceeds default
  const exceedsDefault = defaultQuantity > 0 && quantity > defaultQuantity;

  // Determine if quantity exceeds available stock
  const exceedsStock = quantity > availableStock;

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const newQuantity = Math.min(quantity + step, availableStock);
    onQuantityChange(productId, newQuantity);
  }, [disabled, quantity, step, availableStock, productId, onQuantityChange]);

  // Handle decrement
  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const newQuantity = Math.max(quantity - step, minQuantity);
    onQuantityChange(productId, newQuantity);
  }, [disabled, quantity, step, minQuantity, productId, onQuantityChange]);

  // Handle direct input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const value = parseFloat(e.target.value);
      if (isNaN(value)) {
        onQuantityChange(productId, 0);
        return;
      }
      // Allow values up to available stock
      const newQuantity = Math.max(minQuantity, Math.min(value, availableStock));
      onQuantityChange(productId, newQuantity);
    },
    [disabled, productId, minQuantity, availableStock, onQuantityChange]
  );

  // Handle remove
  const handleRemove = useCallback(() => {
    if (disabled || !onRemove) return;
    onRemove(productId);
  }, [disabled, productId, onRemove]);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
        exceedsStock
          ? 'border-[var(--danger)]/50 bg-[var(--danger)]/5'
          : exceedsDefault
          ? 'border-[var(--warning)]/50 bg-[var(--warning)]/5'
          : 'border-[var(--border)] bg-[var(--surface-card)]',
        disabled && 'opacity-60',
        className
      )}
    >
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <StockIndicatorDot
            status={stockStatus}
            size="sm"
            quantity={availableStock}
            unitOfMeasure={unitOfMeasure}
          />
          <label
            htmlFor={inputId}
            className="font-medium text-[var(--text)] truncate"
            title={productName}
          >
            {productName}
          </label>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
          <span>Stoc: {availableStock} {unitLabel}</span>
          {defaultQuantity > 0 && (
            <>
              <span className="text-[var(--border)]">|</span>
              <span>Standard: {defaultQuantity} {unitLabel}</span>
            </>
          )}
        </div>
        {/* Warnings */}
        {exceedsStock && (
          <p className="text-xs text-[var(--danger)] mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Cantitate depaseste stocul disponibil
          </p>
        )}
        {exceedsDefault && !exceedsStock && (
          <p className="text-xs text-[var(--warning)] mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Cantitate mai mare decat standardul
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || quantity <= minQuantity}
          className={clsx(
            'w-8 h-8 flex items-center justify-center rounded-md border transition-colors',
            'text-[var(--text)] border-[var(--border)]',
            'hover:bg-[var(--surface-hover)] hover:border-[var(--primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[var(--border)]'
          )}
          aria-label="Scade cantitatea"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        {/* Quantity Input */}
        <div className="relative">
          <input
            id={inputId}
            type="number"
            value={quantity}
            onChange={handleInputChange}
            disabled={disabled}
            min={minQuantity}
            max={availableStock}
            step={step}
            className={clsx(
              'w-20 h-8 text-center rounded-md border bg-[var(--surface)] text-[var(--text)]',
              'text-sm font-medium tabular-nums',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]',
              'disabled:bg-[var(--surface-card)] disabled:cursor-not-allowed',
              exceedsStock
                ? 'border-[var(--danger)]'
                : exceedsDefault
                ? 'border-[var(--warning)]'
                : 'border-[var(--border)]',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
            aria-label={`Cantitate ${productName}`}
            aria-describedby={`${inputId}-unit`}
          />
          <span
            id={`${inputId}-unit`}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] pointer-events-none"
          >
            {unitLabel}
          </span>
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || quantity >= availableStock}
          className={clsx(
            'w-8 h-8 flex items-center justify-center rounded-md border transition-colors',
            'text-[var(--text)] border-[var(--border)]',
            'hover:bg-[var(--surface-hover)] hover:border-[var(--primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[var(--border)]'
          )}
          aria-label="Creste cantitatea"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Price */}
      {showPrice && (
        <div className="text-right min-w-[80px]">
          <p className="font-semibold text-[var(--text)] tabular-nums">
            {totalPrice.toFixed(2)} RON
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            @ {unitPrice.toFixed(2)}/{unitLabel}
          </p>
        </div>
      )}

      {/* Remove Button */}
      {showRemoveButton && onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={clsx(
            'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
            'text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10',
            'focus:outline-none focus:ring-2 focus:ring-[var(--danger)]/30',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={`Sterge ${productName}`}
          title="Sterge din lista"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Compact version for table rows
 */
interface CompactQuantityInputProps {
  quantity: number;
  maxQuantity: number;
  unitOfMeasure: UnitOfMeasure;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  step?: number;
  className?: string;
}

export function CompactQuantityInput({
  quantity,
  maxQuantity,
  unitOfMeasure,
  onChange,
  disabled = false,
  step = 1,
  className,
}: CompactQuantityInputProps) {
  const unitLabel = getUnitLabel(unitOfMeasure);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      onChange(0);
      return;
    }
    onChange(Math.max(0, Math.min(value, maxQuantity)));
  };

  return (
    <div className={clsx('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, quantity - step))}
        disabled={disabled || quantity <= 0}
        className="w-6 h-6 flex items-center justify-center rounded border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text)] hover:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Scade"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleChange}
        disabled={disabled}
        min={0}
        max={maxQuantity}
        step={step}
        className={clsx(
          'w-14 h-6 text-center text-xs font-medium tabular-nums rounded border border-[var(--border)] bg-[var(--surface)]',
          'focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
      <span className="text-xs text-[var(--text-tertiary)] min-w-[24px]">{unitLabel}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(maxQuantity, quantity + step))}
        disabled={disabled || quantity >= maxQuantity}
        className="w-6 h-6 flex items-center justify-center rounded border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text)] hover:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Creste"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
