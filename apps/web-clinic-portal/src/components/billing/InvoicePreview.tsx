/**
 * Invoice Preview Component
 *
 * Preview invoice before submission
 */

import { Icon } from '../ui/Icon';

interface InvoicePreviewProps {
  formData: any;
  totals: {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    total: number;
  };
}

export function InvoicePreview({ formData, totals }: InvoicePreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateLineTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * (item.discountPercent / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (item.taxRate / 100);
    return afterDiscount + tax;
  };

  const getPaymentTermsLabel = (terms: string) => {
    const labels: Record<string, string> = {
      due_on_receipt: 'Due on Receipt',
      net_15: 'Net 15',
      net_30: 'Net 30',
    };
    return labels[terms] || terms;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Preview Card */}
      <div className="bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <p className="text-blue-100 text-sm">Preview</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">DentalOS Clinic</p>
              <p className="text-xs text-blue-200 mt-1">123 Dental Street</p>
              <p className="text-xs text-blue-200">Bucharest, Romania</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h2>
              <p className="text-lg font-semibold text-gray-900">{formData.patientName}</p>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-end gap-4">
                  <span className="text-sm text-gray-500">Issue Date:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(formData.issueDate)}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <span className="text-sm text-gray-500">Due Date:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(formData.dueDate)}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <span className="text-sm text-gray-500">Payment Terms:</span>
                  <span className="text-sm font-medium text-gray-900">{getPaymentTermsLabel(formData.paymentTerms)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700 uppercase">Description</th>
                  <th className="text-center py-3 text-sm font-semibold text-gray-700 uppercase w-20">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase w-28">Unit Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase w-20">Disc%</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase w-20">Tax%</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 uppercase w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.description}</p>
                        {item.itemCode && (
                          <p className="text-xs text-gray-500 mt-0.5">Code: {item.itemCode}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 text-gray-900">{item.quantity}</td>
                    <td className="text-right py-3 text-gray-900">{item.unitPrice.toFixed(2)} RON</td>
                    <td className="text-right py-3 text-gray-900">{item.discountPercent}%</td>
                    <td className="text-right py-3 text-gray-900">{item.taxRate}%</td>
                    <td className="text-right py-3 font-medium text-gray-900">
                      {calculateLineTotal(item).toFixed(2)} RON
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between py-2 text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">{totals.subtotal.toFixed(2)} RON</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between py-2 text-gray-700">
                  <span>Discount:</span>
                  <span className="font-medium text-red-600">-{totals.discountTotal.toFixed(2)} RON</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-gray-700">
                <span>Tax (VAT):</span>
                <span className="font-medium">{totals.taxTotal.toFixed(2)} RON</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">{totals.total.toFixed(2)} RON</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {formData.notes && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Thank you for your business!
            </p>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
        <Icon name="info" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground">
            This is a preview of your invoice. Review the details carefully before creating it.
          </p>
          <p className="text-xs text-foreground/60 mt-1">
            Once created, the invoice will be saved as a draft and can be sent to the patient.
          </p>
        </div>
      </div>
    </div>
  );
}
