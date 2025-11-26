/**
 * SplitPaymentForm Component
 *
 * Manages multiple payment lines for split payments.
 * Each line has its own amount, payment method, and reference.
 */

import { useState, useCallback, useId } from 'react';
import { cn } from '../../utils/cn';
import {
  type PaymentMethod,
  PaymentMethodSelector,
  requiresReference,
  getReferencePlaceholder,
  getPaymentMethodConfig,
} from './PaymentMethodSelector';

export interface PaymentLine {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
}

interface SplitPaymentFormProps {
  totalBalance: number;
  currency: string;
  lines: PaymentLine[];
  onChange: (lines: PaymentLine[]) => void;
  disabled?: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function SplitPaymentForm({
  totalBalance,
  currency,
  lines,
  onChange,
  disabled = false,
}: SplitPaymentFormProps) {
  const baseId = useId();

  const totalAllocated = lines.reduce((sum, line) => sum + (line.amount || 0), 0);
  const remaining = totalBalance - totalAllocated;

  const addLine = useCallback(() => {
    const newLine: PaymentLine = {
      id: `${baseId}-${Date.now()}`,
      amount: remaining > 0 ? remaining : 0,
      method: 'cash',
      reference: '',
    };
    onChange([...lines, newLine]);
  }, [baseId, lines, onChange, remaining]);

  const removeLine = useCallback((id: string) => {
    if (lines.length <= 1) return;
    onChange(lines.filter((line) => line.id !== id));
  }, [lines, onChange]);

  const updateLine = useCallback((id: string, updates: Partial<PaymentLine>) => {
    onChange(
      lines.map((line) =>
        line.id === id ? { ...line, ...updates } : line
      )
    );
  }, [lines, onChange]);

  return (
    <div className="space-y-4">
      {lines.map((line, index) => (
        <SplitPaymentLine
          key={line.id}
          line={line}
          index={index}
          currency={currency}
          onUpdate={(updates) => updateLine(line.id, updates)}
          onRemove={() => removeLine(line.id)}
          canRemove={lines.length > 1}
          disabled={disabled}
        />
      ))}

      {/* Summary Bar */}
      <div className={cn(
        'flex items-center justify-between p-4 rounded-lg border',
        remaining < 0
          ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'
          : remaining > 0
          ? 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
          : 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
      )}>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total alocat</p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totalAllocated, currency)}
            </p>
          </div>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ramas de alocat</p>
            <p className={cn(
              'font-semibold',
              remaining < 0
                ? 'text-danger-600 dark:text-danger-400'
                : remaining > 0
                ? 'text-warning-600 dark:text-warning-400'
                : 'text-success-600 dark:text-success-400'
            )}>
              {formatCurrency(remaining, currency)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addLine}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
            'hover:bg-neutral-50 dark:hover:bg-neutral-700',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adauga plata
        </button>
      </div>

      {remaining < 0 && (
        <p className="text-sm text-danger-600 dark:text-danger-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Suma totala depaseste soldul de plata
        </p>
      )}
    </div>
  );
}

interface SplitPaymentLineProps {
  line: PaymentLine;
  index: number;
  currency: string;
  onUpdate: (updates: Partial<PaymentLine>) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

function SplitPaymentLine({
  line,
  index,
  currency,
  onUpdate,
  onRemove,
  canRemove,
  disabled = false,
}: SplitPaymentLineProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const showReference = requiresReference(line.method);
  const methodConfig = getPaymentMethodConfig(line.method);

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      'border-neutral-200 dark:border-neutral-700',
      'bg-white dark:bg-neutral-900'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
          <span className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
            'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
          )}>
            {index + 1}
          </span>
          <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
            {methodConfig?.label || 'Plata'}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatCurrency(line.amount || 0, currency)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={cn('w-5 h-5 text-neutral-500 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className={cn(
                'p-1 rounded transition-colors',
                'text-neutral-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Sterge plata"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Suma
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={line.amount || ''}
                onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
                disabled={disabled}
                className={cn(
                  'w-full pl-4 pr-16 py-3 rounded-lg text-lg font-semibold',
                  'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
                  'text-neutral-900 dark:text-neutral-100',
                  'placeholder:text-neutral-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 font-medium">
                {currency}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Metoda de plata
            </label>
            <PaymentMethodSelector
              value={line.method}
              onChange={(method) => onUpdate({ method, reference: '' })}
              disabled={disabled}
            />
          </div>

          {/* Reference (conditional) */}
          {showReference && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Referinta
              </label>
              <input
                type="text"
                value={line.reference}
                onChange={(e) => onUpdate({ reference: e.target.value })}
                disabled={disabled}
                placeholder={getReferencePlaceholder(line.method)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg',
                  'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
                  'text-neutral-900 dark:text-neutral-100',
                  'placeholder:text-neutral-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function createInitialPaymentLine(balance: number): PaymentLine {
  return {
    id: `payment-${Date.now()}`,
    amount: balance,
    method: 'cash',
    reference: '',
  };
}
