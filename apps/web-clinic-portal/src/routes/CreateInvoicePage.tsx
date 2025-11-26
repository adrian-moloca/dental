/**
 * Create Invoice Page
 *
 * Complete workflow for creating new patient invoices with:
 * - Patient selection
 * - Line item management
 * - Automatic tax calculation (19% VAT for Romania)
 * - Discount options
 * - Payment terms
 * - Preview before submission
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../hooks/useBilling';
import { InvoiceFormWizard } from '../components/billing/InvoiceFormWizard';
import { Icon } from '../components/ui/Icon';

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoice();

  const handleSubmit = async (data: any) => {
    try {
      const result = await createInvoiceMutation.mutateAsync(data);
      const invoiceId = result.data.id;
      navigate(`/billing/invoices/${invoiceId}`);
    } catch (error) {
      // Error already handled by mutation (toast)
      console.error('Failed to create invoice:', error);
    }
  };

  const handleCancel = () => {
    navigate('/billing');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              aria-label="Back to billing"
            >
              <Icon name="arrow-left" className="w-5 h-5 text-foreground/60" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
              <p className="text-sm text-foreground/60 mt-1">
                Create a new invoice for a patient
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <InvoiceFormWizard
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createInvoiceMutation.isPending}
        />
      </div>
    </div>
  );
}
