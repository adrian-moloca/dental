/**
 * Payment Recorder - Record invoice payments
 */

import { useState } from 'react';
import { Icon } from '../ui/Icon';

interface PaymentRecorderProps {
  invoiceId: string;
  balance: number;
  onSave?: (data: PaymentData) => void;
  onCancel?: () => void;
}

export interface PaymentData {
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'ach' | 'check' | 'split';
  reference?: string;
  notes?: string;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: 'cash' },
  { value: 'credit_card', label: 'Credit Card', icon: 'cash' },
  { value: 'debit_card', label: 'Debit Card', icon: 'cash' },
  { value: 'ach', label: 'ACH/Bank Transfer', icon: 'cash' },
  { value: 'check', label: 'Check', icon: 'document' },
  { value: 'split', label: 'Split Payment', icon: 'cash' },
] as const;

export function PaymentRecorder({ invoiceId: _invoiceId, balance, onSave, onCancel }: PaymentRecorderProps) {
  const [amount, setAmount] = useState<string>(balance.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentData['paymentMethod']>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleQuickAmount = (percentage: number) => {
    const calculated = (balance * percentage) / 100;
    setAmount(calculated.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amountNum > balance) {
      const confirm = window.confirm(
        `Payment amount ($${amountNum.toFixed(2)}) exceeds the invoice balance ($${balance.toFixed(2)}). Continue?`
      );
      if (!confirm) return;
    }

    onSave?.({
      amount: amountNum,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Record Payment</h3>
        <p className="text-sm text-foreground/60">
          Invoice Balance: <span className="font-semibold text-brand">${balance.toFixed(2)}</span>
        </p>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-foreground/70 mb-2">
          Payment Amount *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 text-lg">
            $
          </span>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-surface border border-white/10 rounded-lg text-foreground text-lg font-semibold placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleQuickAmount(25)}
            className="flex-1 px-3 py-2 text-xs bg-surface-hover text-foreground/70 hover:text-foreground rounded-lg transition-colors"
          >
            25%
          </button>
          <button
            type="button"
            onClick={() => handleQuickAmount(50)}
            className="flex-1 px-3 py-2 text-xs bg-surface-hover text-foreground/70 hover:text-foreground rounded-lg transition-colors"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => handleQuickAmount(75)}
            className="flex-1 px-3 py-2 text-xs bg-surface-hover text-foreground/70 hover:text-foreground rounded-lg transition-colors"
          >
            75%
          </button>
          <button
            type="button"
            onClick={() => handleQuickAmount(100)}
            className="flex-1 px-3 py-2 text-xs bg-brand text-white hover:bg-brand/90 rounded-lg transition-colors"
          >
            Full Amount
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-foreground/70 mb-2">
          Payment Method *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === method.value
                  ? 'bg-brand text-white'
                  : 'bg-surface-hover text-foreground/70 hover:bg-surface-hover/80'
              }`}
            >
              <Icon name={method.icon as any} className="w-5 h-5" />
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Number */}
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-foreground/70 mb-2">
          Reference Number
        </label>
        <input
          id="reference"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Transaction ID, check number, etc."
          className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground/70 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this payment..."
          rows={3}
          className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
        />
      </div>

      {/* Summary */}
      <div className="p-4 bg-surface-hover rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Invoice Balance</span>
          <span className="font-medium text-foreground">${balance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Payment Amount</span>
          <span className="font-medium text-foreground">
            ${(parseFloat(amount) || 0).toFixed(2)}
          </span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between text-base">
          <span className="font-medium text-foreground/70">Remaining Balance</span>
          <span className="font-bold text-brand">
            ${Math.max(0, balance - (parseFloat(amount) || 0)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-surface-hover text-foreground rounded-lg font-medium hover:bg-surface-hover/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          Record Payment
        </button>
      </div>
    </form>
  );
}
