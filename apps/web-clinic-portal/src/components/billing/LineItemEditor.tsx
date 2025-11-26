/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Line Item Editor Component
 *
 * Add, edit, and remove invoice line items with:
 * - Treatment/service/product selection
 * - Quantity and pricing
 * - Discount per line
 * - Tax rate per line
 */

import { useState } from 'react';
import type { InvoiceLineItem } from './InvoiceFormWizard';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { ServiceCatalogModal } from './ServiceCatalogModal';

interface LineItemEditorProps {
  items: InvoiceLineItem[];
  onChange: (items: InvoiceLineItem[]) => void;
  defaultTaxRate: number;
}

export function LineItemEditor({ items, onChange, defaultTaxRate }: LineItemEditorProps) {
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  const addItem = () => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      itemType: 'treatment',
      itemCode: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxRate: defaultTaxRate,
    };
    onChange([...items, newItem]);
  };

  const addItemFromCatalog = (catalogItem: any) => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      itemType: catalogItem.type,
      itemCode: catalogItem.code,
      description: catalogItem.name,
      quantity: 1,
      unitPrice: catalogItem.price || 0,
      discountPercent: 0,
      taxRate: defaultTaxRate,
    };
    onChange([...items, newItem]);
    setCatalogModalOpen(false);
  };

  const updateItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const calculateLineTotal = (item: InvoiceLineItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * (item.discountPercent / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (item.taxRate / 100);
    return afterDiscount + tax;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Line Items</h3>
        <div className="flex gap-2">
          <Button
            variant="soft"
            size="sm"
            onClick={() => setCatalogModalOpen(true)}
          >
            <Icon name="search" className="w-4 h-4 mr-2" />
            Browse Catalog
          </Button>
          <Button variant="primary" size="sm" onClick={addItem}>
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Add Line Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/20 rounded-lg">
          <Icon name="document" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/60 mb-2">
            No Line Items Added
          </h3>
          <p className="text-sm text-foreground/40 mb-4">
            Add treatments, products, or services to this invoice
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="soft" size="sm" onClick={() => setCatalogModalOpen(true)}>
              Browse Catalog
            </Button>
            <Button variant="primary" size="sm" onClick={addItem}>
              Add Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 px-3 text-xs font-medium text-foreground/50">
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Code</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Disc %</div>
            <div className="col-span-1">Tax %</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1"></div>
          </div>

          {/* Item Rows */}
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-start p-3 bg-surface-hover rounded-lg border border-white/10"
            >
              {/* Type */}
              <select
                value={item.itemType}
                onChange={(e) => updateItem(item.id, { itemType: e.target.value as any })}
                className="col-span-1 px-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="treatment">Treatment</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>

              {/* Code */}
              <input
                type="text"
                placeholder="Code"
                value={item.itemCode || ''}
                onChange={(e) => updateItem(item.id, { itemCode: e.target.value })}
                className="col-span-1 px-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
              />

              {/* Description */}
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                className="col-span-3 px-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
                required
              />

              {/* Quantity */}
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                className="col-span-1 px-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand"
              />

              {/* Unit Price */}
              <div className="col-span-2 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground/50 text-xs">
                  RON
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs text-right focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Discount % */}
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={item.discountPercent}
                onChange={(e) => updateItem(item.id, { discountPercent: parseFloat(e.target.value) || 0 })}
                className="col-span-1 px-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand"
              />

              {/* Tax Rate % */}
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={item.taxRate}
                onChange={(e) => updateItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })}
                className="col-span-1 px-2 py-2 bg-surface border border-white/10 rounded-lg text-foreground text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand"
              />

              {/* Total */}
              <div className="col-span-1 px-2 py-2 text-foreground text-xs font-medium text-right">
                {calculateLineTotal(item).toFixed(2)}
              </div>

              {/* Remove Button */}
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

      {/* Service Catalog Modal */}
      {catalogModalOpen && (
        <ServiceCatalogModal
          onSelect={addItemFromCatalog}
          onClose={() => setCatalogModalOpen(false)}
        />
      )}
    </div>
  );
}
