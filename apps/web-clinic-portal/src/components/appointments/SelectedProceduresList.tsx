/**
 * Selected Procedures List
 * Displays and allows editing of selected procedures
 */

import { Input } from '../ui/Input';
import type { SelectedProcedure } from './CompleteAppointmentModal';

interface SelectedProceduresListProps {
  procedures: SelectedProcedure[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SelectedProcedure>) => void;
  disabled?: boolean;
}

export function SelectedProceduresList({
  procedures,
  onRemove,
  onUpdate,
  disabled = false,
}: SelectedProceduresListProps) {
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onUpdate(id, { quantity });
    }
  };

  const handlePriceChange = (id: string, value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      onUpdate(id, { price });
    }
  };

  const handleToothChange = (id: string, value: string) => {
    onUpdate(id, { tooth: value || undefined });
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {procedures.map((procedure) => (
        <div
          key={procedure.id}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-[var(--brand)] font-semibold">
                  {procedure.code}
                </span>
                <span className="text-sm text-white">
                  {procedure.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(procedure.id)}
              disabled={disabled}
              className="text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Remove procedure"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor={`qty-${procedure.id}`}
                className="block text-xs text-slate-400 mb-1"
              >
                Quantity
              </label>
              <Input
                id={`qty-${procedure.id}`}
                type="number"
                min="1"
                value={procedure.quantity}
                onChange={(e) => handleQuantityChange(procedure.id, e.target.value)}
                disabled={disabled}
                className="text-sm"
              />
            </div>

            <div>
              <label
                htmlFor={`price-${procedure.id}`}
                className="block text-xs text-slate-400 mb-1"
              >
                Unit Price ($)
              </label>
              <Input
                id={`price-${procedure.id}`}
                type="number"
                min="0"
                step="0.01"
                value={procedure.price}
                onChange={(e) => handlePriceChange(procedure.id, e.target.value)}
                disabled={disabled}
                className="text-sm"
              />
            </div>

            <div>
              <label
                htmlFor={`tooth-${procedure.id}`}
                className="block text-xs text-slate-400 mb-1"
              >
                Tooth # (Optional)
              </label>
              <Input
                id={`tooth-${procedure.id}`}
                type="text"
                placeholder="e.g., 11"
                value={procedure.tooth || ''}
                onChange={(e) => handleToothChange(procedure.id, e.target.value)}
                disabled={disabled}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-slate-400">Line Total</span>
            <span className="text-sm font-semibold text-emerald-400">
              ${(procedure.price * procedure.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
