/**
 * Invoice Form Wizard
 *
 * Multi-step form for creating invoices with:
 * - Patient selection
 * - Line item editor
 * - Tax calculation (19% VAT for Romania)
 * - Discount management
 * - Payment terms
 * - Preview before submission
 */

import { useState, useCallback, useMemo } from 'react';
import { PatientSelector } from './PatientSelector';
import { LineItemEditor } from './LineItemEditor';
import { InvoicePreview } from './InvoicePreview';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface InvoiceLineItem {
  id: string;
  itemType: 'treatment' | 'product' | 'service';
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}

interface InvoiceFormData {
  patientId: string;
  patientName: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: 'due_on_receipt' | 'net_15' | 'net_30';
  items: InvoiceLineItem[];
  notes?: string;
}

interface InvoiceFormWizardProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_TAX_RATE = 19; // Romania VAT

export function InvoiceFormWizard({ onSubmit, onCancel, isSubmitting }: InvoiceFormWizardProps) {
  const [step, setStep] = useState<'patient' | 'items' | 'preview'>('patient');

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<InvoiceFormData>({
    patientId: '',
    patientName: '',
    issueDate: today,
    dueDate: thirtyDaysLater,
    paymentTerms: 'net_30',
    items: [],
    notes: '',
  });

  const updateFormData = useCallback((updates: Partial<InvoiceFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePatientSelect = useCallback((patientId: string, patientName: string) => {
    updateFormData({ patientId, patientName });
    setStep('items');
  }, [updateFormData]);

  const handleItemsUpdate = useCallback((items: InvoiceLineItem[]) => {
    updateFormData({ items });
  }, [updateFormData]);

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    formData.items.forEach((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineDiscount = lineSubtotal * (item.discountPercent / 100);
      const afterDiscount = lineSubtotal - lineDiscount;
      const lineTax = afterDiscount * (item.taxRate / 100);

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
      taxTotal += lineTax;
    });

    const total = subtotal - discountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      total,
    };
  }, [formData.items]);

  const handleSubmit = async () => {
    // Transform to API format
    const payload = {
      patientId: formData.patientId,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      paymentTerms: formData.paymentTerms,
      currency: 'RON',
      items: formData.items.map((item) => {
        const lineSubtotal = item.quantity * item.unitPrice;
        const lineDiscount = lineSubtotal * (item.discountPercent / 100);
        const afterDiscount = lineSubtotal - lineDiscount;
        const lineTax = afterDiscount * (item.taxRate / 100);

        return {
          description: item.description,
          itemCode: item.itemCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: lineDiscount,
          taxRate: item.taxRate,
          amount: afterDiscount + lineTax,
          procedureCode: item.itemType === 'treatment' ? item.itemCode : undefined,
        };
      }),
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      notes: formData.notes,
    };

    await onSubmit(payload);
  };

  const canProceedToItems = formData.patientId && formData.patientName;
  const canProceedToPreview = formData.items.length > 0;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4">
        <StepIndicator
          number={1}
          label="Patient"
          isActive={step === 'patient'}
          isCompleted={step === 'items' || step === 'preview'}
        />
        <div className="h-px w-16 bg-white/10" />
        <StepIndicator
          number={2}
          label="Line Items"
          isActive={step === 'items'}
          isCompleted={step === 'preview'}
        />
        <div className="h-px w-16 bg-white/10" />
        <StepIndicator
          number={3}
          label="Preview"
          isActive={step === 'preview'}
          isCompleted={false}
        />
      </div>

      {/* Step Content */}
      <div className="bg-surface rounded-lg border border-white/10">
        {step === 'patient' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Select Patient
            </h2>
            <PatientSelector
              selectedPatientId={formData.patientId}
              onSelect={handlePatientSelect}
            />
          </div>
        )}

        {step === 'items' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Invoice Details
              </h2>
              <p className="text-sm text-foreground/60 mt-1">
                Patient: <span className="text-foreground font-medium">{formData.patientName}</span>
              </p>
            </div>

            {/* Invoice Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="issue-date" className="block text-sm font-medium text-foreground/70 mb-2">
                  Issue Date
                </label>
                <input
                  id="issue-date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => updateFormData({ issueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-foreground/70 mb-2">
                  Due Date
                </label>
                <input
                  id="due-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateFormData({ dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label htmlFor="payment-terms" className="block text-sm font-medium text-foreground/70 mb-2">
                  Payment Terms
                </label>
                <select
                  id="payment-terms"
                  value={formData.paymentTerms}
                  onChange={(e) => updateFormData({ paymentTerms: e.target.value as any })}
                  className="w-full px-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="due_on_receipt">Due on Receipt</option>
                  <option value="net_15">Net 15</option>
                  <option value="net_30">Net 30</option>
                </select>
              </div>
            </div>

            {/* Line Items Editor */}
            <LineItemEditor
              items={formData.items}
              onChange={handleItemsUpdate}
              defaultTaxRate={DEFAULT_TAX_RATE}
            />

            {/* Totals Summary */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-md space-y-2 p-4 bg-surface-hover rounded-lg border border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-medium text-foreground">{totals.subtotal.toFixed(2)} RON</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Discount</span>
                    <span className="font-medium text-red-400">-{totals.discountTotal.toFixed(2)} RON</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Tax (VAT)</span>
                  <span className="font-medium text-foreground">{totals.taxTotal.toFixed(2)} RON</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-brand">{totals.total.toFixed(2)} RON</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-foreground/70 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder="Add any notes or payment instructions..."
                rows={3}
                className="w-full px-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Preview Invoice
            </h2>
            <InvoicePreview
              formData={formData}
              totals={totals}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>

        <div className="flex gap-3">
          {step !== 'patient' && (
            <Button
              variant="soft"
              onClick={() => {
                if (step === 'items') setStep('patient');
                if (step === 'preview') setStep('items');
              }}
              disabled={isSubmitting}
            >
              <Icon name="arrow-left" className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {step === 'patient' && (
            <Button
              variant="primary"
              onClick={() => setStep('items')}
              disabled={!canProceedToItems}
            >
              Next: Line Items
              <Icon name="arrow-right" className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 'items' && (
            <Button
              variant="primary"
              onClick={() => setStep('preview')}
              disabled={!canProceedToPreview}
            >
              Preview Invoice
              <Icon name="arrow-right" className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 'preview' && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <Icon name="check" className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

function StepIndicator({ number, label, isActive, isCompleted }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
          isCompleted
            ? 'bg-brand text-white'
            : isActive
            ? 'bg-brand text-white'
            : 'bg-surface-hover text-foreground/40 border border-white/10'
        }`}
      >
        {isCompleted ? <Icon name="check" className="w-5 h-5" /> : number}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? 'text-foreground' : 'text-foreground/40'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
