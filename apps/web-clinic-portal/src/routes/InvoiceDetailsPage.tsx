/**
 * Invoice Details Page - View invoice and record payments
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, usePayments, useRecordPaymentBatch, useDownloadInvoicePdf } from '../hooks/useBilling';
import { Icon } from '../components/ui/Icon';
import { PaymentRecorderModal, type PaymentSubmission } from '../components/billing/PaymentRecorderModal';

const statusColors = {
  draft: 'bg-gray-500/20 text-gray-300',
  issued: 'bg-blue-500/20 text-blue-300',
  sent: 'bg-cyan-500/20 text-cyan-300',
  partially_paid: 'bg-yellow-500/20 text-yellow-300',
  paid: 'bg-green-500/20 text-green-300',
  overdue: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

export function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: invoice, isLoading } = useInvoice(id!);
  const { data: payments } = usePayments(id!);
  const recordPaymentMutation = useRecordPaymentBatch();
  const downloadPdf = useDownloadInvoicePdf();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!invoice?.data) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground/60 mb-2">Invoice not found</h3>
        <button onClick={() => navigate('/billing')} className="text-brand hover:text-brand/80">
          Back to Billing
        </button>
      </div>
    );
  }

  const inv = invoice.data;
  const paymentList = payments?.data || [];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleSubmitPayment = useCallback(async (submission: PaymentSubmission) => {
    await recordPaymentMutation.mutateAsync({
      invoiceId: id!,
      patientId: inv.patientId,
      totalAmount: submission.totalAmount,
      payments: submission.payments,
      notes: submission.notes,
    });
    setShowPaymentModal(false);
  }, [recordPaymentMutation, id, inv.patientId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/billing')}
            className="p-2 text-foreground/60 hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Icon name="chevronLeft" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{inv.invoiceNumber}</h1>
            <p className="text-sm text-foreground/60 mt-1">
              Issued on {new Date(inv.issueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadPdf.mutate(id!)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-surface-hover/80 transition-colors"
          >
            <Icon name="document" className="w-5 h-5" />
            Download PDF
          </button>
          {inv.balance > 0 && inv.status !== 'cancelled' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
            >
              <Icon name="cash" className="w-5 h-5" />
              Inregistreaza Plata
            </button>
          )}
        </div>
      </div>

      {/* Payment Recorder Modal */}
      <PaymentRecorderModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={inv}
        onSubmit={handleSubmitPayment}
        isSubmitting={recordPaymentMutation.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <div className="p-6 bg-surface rounded-lg border border-white/10 space-y-6">
            {/* Status & Patient */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-foreground/60 mb-1">Patient</div>
                <div className="text-lg font-semibold text-foreground">{inv.patientName}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[inv.status]}`}>
                {inv.status.replace('_', ' ')}
              </span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-foreground/60 mb-1">Issue Date</div>
                <div className="text-foreground">{new Date(inv.issueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60 mb-1">Due Date</div>
                <div className="text-foreground">{new Date(inv.dueDate).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Invoice Items</h3>
              <div className="space-y-3">
                {inv.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-3 bg-surface-hover rounded-lg">
                    <div>
                      {item.procedureCode && (
                        <div className="text-xs text-foreground/50 mb-1">{item.procedureCode}</div>
                      )}
                      <div className="text-foreground font-medium">{item.description}</div>
                      <div className="text-sm text-foreground/60 mt-1">
                        Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-foreground font-semibold">${item.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Subtotal</span>
                <span className="text-foreground">${inv.subtotal.toFixed(2)}</span>
              </div>
              {inv.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Discount</span>
                  <span className="text-red-400">-${inv.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Tax</span>
                <span className="text-foreground">${inv.taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-brand">${inv.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-foreground">Amount Paid</span>
                <span className="font-bold text-green-400">${inv.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl pt-2">
                <span className="font-bold text-foreground">Balance Due</span>
                <span className={`font-bold ${inv.balance > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  ${inv.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Payment History */}
        <div className="space-y-6">
          <div className="p-6 bg-surface rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
            {paymentList.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-4">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {paymentList.map((payment) => (
                  <div key={payment.id} className="p-3 bg-surface-hover rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-foreground">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        payment.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/60">
                      {payment.paymentMethod.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">
                      {new Date(payment.recordedAt).toLocaleString()}
                    </div>
                    {payment.reference && (
                      <div className="text-xs text-foreground/40 mt-1">
                        Ref: {payment.reference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
