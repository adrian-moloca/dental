/**
 * Invoice Form - Create/Edit invoices
 */

import { useState } from 'react';
import { Icon } from '../ui/Icon';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  procedureCode?: string;
}

interface InvoiceFormData {
  patientId: string;
  patientName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discountAmount: number;
  taxRate: number;
  notes?: string;
}

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSave?: (data: InvoiceFormData) => void;
  onCancel?: () => void;
}

export function InvoiceForm({ initialData, onSave, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    patientId: initialData?.patientId || '',
    patientName: initialData?.patientName || '',
    issueDate: initialData?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: initialData?.items || [],
    discountAmount: initialData?.discountAmount || 0,
    taxRate: initialData?.taxRate || 0,
    notes: initialData?.notes || '',
  });

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      procedureCode: '',
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.amount = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      }),
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = formData.discountAmount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (formData.taxRate / 100);
    const total = afterDiscount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      alert('Please select a patient');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    onSave?.(formData);
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {initialData ? 'Edit Invoice' : 'Create Invoice'}
        </h2>
        <p className="text-sm text-foreground/60">
          {initialData ? 'Update invoice details' : 'Create a new invoice for a patient'}
        </p>
      </div>

      {/* Patient & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patient" className="block text-sm font-medium text-foreground/70 mb-2">
            Patient *
          </label>
          <input
            id="patient"
            type="text"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            placeholder="Search patient..."
            className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="issue-date" className="block text-sm font-medium text-foreground/70 mb-2">
              Issue Date *
            </label>
            <input
              id="issue-date"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>

          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-foreground/70 mb-2">
              Due Date *
            </label>
            <input
              id="due-date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Invoice Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {formData.items.length === 0 ? (
          <div className="p-8 text-center text-foreground/40 border border-dashed border-white/20 rounded-lg">
            No items added yet. Click "Add Item" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 px-3 text-xs font-medium text-foreground/50">
              <div className="col-span-1">Code</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {/* Item Rows */}
            {formData.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Code"
                  value={item.procedureCode || ''}
                  onChange={(e) => updateItem(item.id, { procedureCode: e.target.value })}
                  className="col-span-1 px-3 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="col-span-4 px-3 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                  className="col-span-2 px-3 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                  className="col-span-2 px-3 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <div className="col-span-2 px-3 py-2 text-foreground text-sm font-medium">
                  ${item.amount.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="col-span-1 p-2 text-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adjustments */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-foreground/70 mb-2">
            Discount Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
            <input
              id="discount"
              type="number"
              step="0.01"
              min="0"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tax-rate" className="block text-sm font-medium text-foreground/70 mb-2">
            Tax Rate (%)
          </label>
          <input
            id="tax-rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.taxRate}
            onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="p-6 bg-surface border border-white/10 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Subtotal</span>
          <span className="font-medium text-foreground">${totals.subtotal.toFixed(2)}</span>
        </div>
        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">Discount</span>
            <span className="font-medium text-red-400">-${totals.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Tax ({formData.taxRate}%)</span>
          <span className="font-medium text-foreground">${totals.taxAmount.toFixed(2)}</span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-brand">${totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground/70 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any notes or payment terms..."
          rows={3}
          className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-white/10">
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
          {initialData ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
