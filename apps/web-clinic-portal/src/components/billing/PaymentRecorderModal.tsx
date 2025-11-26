/**
 * PaymentRecorderModal Component
 *
 * Full-featured modal for recording payments against invoices.
 * Supports:
 * - Single and split payments
 * - Multiple payment methods (Cash, Card, Check, Bank Transfer)
 * - Reference number tracking
 * - Real-time balance calculation
 * - Success state with receipt option
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Modal } from '../overlay/Modal';
import { type PaymentMethod, PaymentMethodSelector, requiresReference, getReferencePlaceholder } from './PaymentMethodSelector';
import { SplitPaymentForm, type PaymentLine, createInitialPaymentLine } from './SplitPaymentForm';
import type { InvoiceDto } from '../../api/billingClient';

export interface PaymentRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: InvoiceDto | null;
  patientId?: string;
  patientName?: string;
  initialBalance?: number;
  currency?: string;
  onSubmit: (payment: PaymentSubmission) => Promise<void>;
  isSubmitting?: boolean;
}

export interface PaymentSubmission {
  invoiceId?: string;
  patientId?: string;
  totalAmount: number;
  payments: Array<{
    amount: number;
    method: PaymentMethod;
    reference?: string;
  }>;
  notes?: string;
}

type PaymentMode = 'single' | 'split';
type ViewState = 'form' | 'success';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PaymentRecorderModal({
  isOpen,
  onClose,
  invoice,
  patientId,
  patientName,
  initialBalance,
  currency = 'RON',
  onSubmit,
  isSubmitting = false,
}: PaymentRecorderModalProps) {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('single');

  // Single payment state
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Split payment state
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);

  // Recorded payment info for success state
  const [recordedPayment, setRecordedPayment] = useState<PaymentSubmission | null>(null);

  // Derived values
  const balance = invoice?.balance ?? initialBalance ?? 0;
  const invoiceNumber = invoice?.invoiceNumber;
  const displayPatientName = invoice?.patientName ?? patientName;
  const displayCurrency = invoice?.currency ?? currency;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewState('form');
      setPaymentMode('single');
      setAmount(balance.toFixed(2));
      setMethod('cash');
      setReference('');
      setNotes('');
      setPaymentLines([createInitialPaymentLine(balance)]);
      setRecordedPayment(null);
    }
  }, [isOpen, balance]);

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];

    if (paymentMode === 'single') {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.push('Suma trebuie sa fie mai mare de 0');
      }
      if (amountNum > balance) {
        errors.push('Suma depaseste soldul de plata');
      }
      if (requiresReference(method) && !reference.trim()) {
        errors.push('Referinta este necesara pentru aceasta metoda de plata');
      }
    } else {
      const totalAllocated = paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0);
      if (totalAllocated <= 0) {
        errors.push('Suma totala trebuie sa fie mai mare de 0');
      }
      if (totalAllocated > balance) {
        errors.push('Suma totala depaseste soldul de plata');
      }
      for (const line of paymentLines) {
        if (requiresReference(line.method) && !line.reference.trim()) {
          errors.push(`Referinta lipseste pentru plata ${paymentLines.indexOf(line) + 1}`);
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [paymentMode, amount, method, reference, paymentLines, balance]);

  // Quick amount buttons
  const handleQuickAmount = useCallback((percentage: number) => {
    const calculated = (balance * percentage) / 100;
    setAmount(calculated.toFixed(2));
  }, [balance]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validation.isValid || isSubmitting) return;

    let submission: PaymentSubmission;

    if (paymentMode === 'single') {
      submission = {
        invoiceId: invoice?.id,
        patientId: patientId ?? invoice?.patientId,
        totalAmount: parseFloat(amount),
        payments: [{
          amount: parseFloat(amount),
          method,
          reference: reference.trim() || undefined,
        }],
        notes: notes.trim() || undefined,
      };
    } else {
      const totalAmount = paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0);
      submission = {
        invoiceId: invoice?.id,
        patientId: patientId ?? invoice?.patientId,
        totalAmount,
        payments: paymentLines.map((line) => ({
          amount: line.amount,
          method: line.method,
          reference: line.reference.trim() || undefined,
        })),
        notes: notes.trim() || undefined,
      };
    }

    try {
      await onSubmit(submission);
      setRecordedPayment(submission);
      setViewState('success');
    } catch {
      // Error handled by parent via toast
    }
  }, [validation.isValid, isSubmitting, paymentMode, amount, method, reference, notes, paymentLines, invoice, patientId, onSubmit]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Render success state
  if (viewState === 'success' && recordedPayment) {
    return (
      <Modal open={isOpen} onClose={handleClose} size="md">
        <div className="text-center space-y-6 py-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          {/* Success Message */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">
              Plata inregistrata cu succes
            </h2>
            <p className="text-[var(--text-secondary)]">
              {formatCurrency(recordedPayment.totalAmount, displayCurrency)} a fost incasat
            </p>
          </div>

          {/* Payment Summary */}
          <div className="bg-[var(--surface-card)] rounded-lg p-4 text-left space-y-3 border border-[var(--border)]">
            {invoiceNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Factura</span>
                <span className="text-[var(--text)] font-medium">{invoiceNumber}</span>
              </div>
            )}
            {displayPatientName && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Pacient</span>
                <span className="text-[var(--text)] font-medium">{displayPatientName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Suma platita</span>
              <span className="text-[var(--success)] font-semibold">
                {formatCurrency(recordedPayment.totalAmount, displayCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Sold ramas</span>
              <span className="text-[var(--text)] font-medium">
                {formatCurrency(Math.max(0, balance - recordedPayment.totalAmount), displayCurrency)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg font-medium transition-colors',
                'bg-[var(--surface-card)] text-[var(--text)] border border-[var(--border)]',
                'hover:bg-[var(--surface-hover)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30'
              )}
            >
              Inchide
            </button>
            <button
              type="button"
              onClick={() => {
                // TODO: Implement receipt printing/download
                console.log('Print receipt for', recordedPayment);
              }}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg font-medium transition-colors',
                'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
                'flex items-center justify-center gap-2'
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Printeaza chitanta
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Render form state
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Inregistrare Plata"
      size="lg"
    >
      {invoice && (
        <p className="text-[var(--text-secondary)] text-sm mb-4 -mt-2">
          Factura {invoice.invoiceNumber} - {displayPatientName}
        </p>
      )}

      <div className="space-y-6">
        {/* Invoice Details Card */}
        {invoice && (
          <div className="bg-[var(--surface-card)] rounded-lg p-4 space-y-3 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text)]">Detalii Factura</h3>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium',
                invoice.status === 'paid' && 'bg-[var(--success)]/20 text-[var(--success)]',
                invoice.status === 'partially_paid' && 'bg-[var(--warning)]/20 text-[var(--warning)]',
                invoice.status === 'overdue' && 'bg-[var(--danger)]/20 text-[var(--danger)]',
                (invoice.status === 'issued' || invoice.status === 'sent') && 'bg-[var(--primary)]/20 text-[var(--primary)]'
              )}>
                {invoice.status === 'paid' && 'Platita'}
                {invoice.status === 'partially_paid' && 'Partial platita'}
                {invoice.status === 'overdue' && 'Restanta'}
                {invoice.status === 'issued' && 'Emisa'}
                {invoice.status === 'sent' && 'Trimisa'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)]">Total factura</p>
                <p className="font-semibold text-[var(--text)]">{formatCurrency(invoice.total, displayCurrency)}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">Platit deja</p>
                <p className="font-semibold text-[var(--success)]">{formatCurrency(invoice.amountPaid, displayCurrency)}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">Data scadenta</p>
                <p className="font-medium text-[var(--text)]">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">Sold de plata</p>
                <p className="font-bold text-lg text-[var(--primary)]">{formatCurrency(balance, displayCurrency)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Balance display for patient-level payments */}
        {!invoice && initialBalance !== undefined && (
          <div className="bg-[var(--surface-card)] rounded-lg p-4 flex items-center justify-between border border-[var(--border)]">
            <div>
              <p className="text-[var(--text-secondary)] text-sm">Sold de plata</p>
              {displayPatientName && (
                <p className="text-[var(--text)] font-medium">{displayPatientName}</p>
              )}
            </div>
            <p className="font-bold text-2xl text-[var(--primary)]">
              {formatCurrency(balance, displayCurrency)}
            </p>
          </div>
        )}

        {/* Payment Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Tip plata
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode('single')}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
                paymentMode === 'single'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface-card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-hover)]'
              )}
            >
              Plata simpla
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('split')}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
                paymentMode === 'split'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface-card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-hover)]'
              )}
            >
              Plata mixta
            </button>
          </div>
        </div>

        {/* Single Payment Form */}
        {paymentMode === 'single' && (
          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Suma de plata
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    'w-full pl-4 pr-16 py-4 rounded-lg text-2xl font-bold',
                    'bg-[var(--surface)] border border-[var(--border)]',
                    'text-[var(--text)] placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-semibold">
                  {displayCurrency}
                </span>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickAmount(pct)}
                    disabled={isSubmitting}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
                      pct === 100
                        ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                        : 'bg-[var(--surface-card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-hover)]',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {pct === 100 ? 'Total' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Metoda de plata
              </label>
              <PaymentMethodSelector
                value={method}
                onChange={(m) => {
                  setMethod(m);
                  setReference('');
                }}
                disabled={isSubmitting}
              />
            </div>

            {/* Reference (conditional) */}
            {requiresReference(method) && (
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Referinta *
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  disabled={isSubmitting}
                  placeholder={getReferencePlaceholder(method)}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-[var(--surface)] border border-[var(--border)]',
                    'text-[var(--text)] placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Split Payment Form */}
        {paymentMode === 'split' && (
          <SplitPaymentForm
            totalBalance={balance}
            currency={displayCurrency}
            lines={paymentLines}
            onChange={setPaymentLines}
            disabled={isSubmitting}
          />
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Note (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            rows={2}
            placeholder="Adauga note despre aceasta plata..."
            className={cn(
              'w-full px-4 py-3 rounded-lg resize-none',
              'bg-[var(--surface)] border border-[var(--border)]',
              'text-[var(--text)] placeholder:text-[var(--text-tertiary)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {/* Summary */}
        <div className="bg-[var(--surface-card)] rounded-lg p-4 space-y-3 border border-[var(--border)]">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Sold factura</span>
            <span className="text-[var(--text)] font-medium">{formatCurrency(balance, displayCurrency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Suma de plata</span>
            <span className="text-[var(--text)] font-medium">
              {formatCurrency(
                paymentMode === 'single'
                  ? parseFloat(amount) || 0
                  : paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0),
                displayCurrency
              )}
            </span>
          </div>
          <div className="h-px bg-[var(--border)]" />
          <div className="flex justify-between">
            <span className="font-medium text-[var(--text)]">Sold dupa plata</span>
            <span className="font-bold text-lg text-[var(--primary)]">
              {formatCurrency(
                Math.max(
                  0,
                  balance - (paymentMode === 'single'
                    ? parseFloat(amount) || 0
                    : paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0))
                ),
                displayCurrency
              )}
            </span>
          </div>
        </div>

        {/* Validation Errors */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg p-4">
            <ul className="space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm text-[var(--danger)] flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={cn(
              'flex-1 px-6 py-3 rounded-lg font-medium transition-colors',
              'bg-[var(--surface-card)] text-[var(--text)] border border-[var(--border)]',
              'hover:bg-[var(--surface-hover)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Anuleaza
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!validation.isValid || isSubmitting}
            className={cn(
              'flex-1 px-6 py-3 rounded-lg font-medium transition-colors',
              'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Se proceseaza...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Inregistreaza Plata
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
