/**
 * BalanceCard Component
 *
 * Displays patient's outstanding balance with quick payment action.
 * Shows total invoiced, total paid, and current balance with visual indicator.
 * Integrates with PaymentRecorderModal for recording payments.
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import clsx from 'clsx';
import { PaymentRecorderModal, type PaymentSubmission } from '../billing/PaymentRecorderModal';
import { useRecordPaymentBatch } from '../../hooks/useBilling';

export interface PatientBalanceData {
  patientId: string;
  patientName?: string;
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  overdueDays?: number;
  lastPaymentDate?: string;
  currency?: string;
}

interface BalanceCardProps {
  balance: PatientBalanceData;
  onCollectPayment?: () => void;
  onPaymentRecorded?: () => void;
  isLoading?: boolean;
  enablePaymentModal?: boolean;
}

export function BalanceCard({
  balance,
  onCollectPayment,
  onPaymentRecorded,
  isLoading,
  enablePaymentModal = true,
}: BalanceCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const recordPaymentMutation = useRecordPaymentBatch();

  const currency = balance.currency || 'RON';
  const hasBalance = balance.currentBalance > 0;

  const handleOpenPaymentModal = useCallback(() => {
    if (onCollectPayment) {
      onCollectPayment();
    } else if (enablePaymentModal) {
      setIsPaymentModalOpen(true);
    }
  }, [onCollectPayment, enablePaymentModal]);

  const handleClosePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
  }, []);

  const handleSubmitPayment = useCallback(async (submission: PaymentSubmission) => {
    await recordPaymentMutation.mutateAsync({
      patientId: balance.patientId,
      totalAmount: submission.totalAmount,
      payments: submission.payments,
      notes: submission.notes,
    });
    onPaymentRecorded?.();
  }, [recordPaymentMutation, balance.patientId, onPaymentRecorded]);
  const isOverdue = balance.overdueDays && balance.overdueDays > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card padding="lg" tone="glass">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-8 bg-white/10 rounded w-2/3" />
          <div className="h-10 bg-white/10 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" tone="glass" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Outstanding Balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p
              className={clsx(
                'text-2xl font-bold',
                hasBalance ? 'text-white' : 'text-green-400'
              )}
            >
              {formatCurrency(balance.currentBalance)}
            </p>
            {isOverdue && (
              <Badge tone="warning" className="text-xs">
                {balance.overdueDays} days overdue
              </Badge>
            )}
          </div>
        </div>
        <div
          className={clsx(
            'h-12 w-12 rounded-full flex items-center justify-center',
            hasBalance
              ? 'bg-orange-500/20 border border-orange-400/50'
              : 'bg-green-500/20 border border-green-400/50'
          )}
        >
          <svg
            className={clsx('h-6 w-6', hasBalance ? 'text-orange-400' : 'text-green-400')}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {hasBalance ? (
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-xs text-slate-400">Total Invoiced</p>
          <p className="text-sm font-semibold text-white mt-0.5">
            {formatCurrency(balance.totalInvoiced)}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-xs text-slate-400">Total Paid</p>
          <p className="text-sm font-semibold text-white mt-0.5">
            {formatCurrency(balance.totalPaid)}
          </p>
        </div>
      </div>

      {balance.lastPaymentDate && (
        <div className="text-xs text-slate-400">
          Last payment: {formatDate(balance.lastPaymentDate)}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {hasBalance && (
          <Button onClick={handleOpenPaymentModal} fullWidth>
            Incaseaza Plata
          </Button>
        )}
        <Button
          as={Link}
          to={`/billing?patientId=${balance.patientId}`}
          variant="ghost"
          fullWidth
        >
          Vezi Facturi
        </Button>
      </div>

      {/* Payment Modal */}
      {enablePaymentModal && (
        <PaymentRecorderModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          patientId={balance.patientId}
          patientName={balance.patientName}
          initialBalance={balance.currentBalance}
          currency={currency}
          onSubmit={handleSubmitPayment}
          isSubmitting={recordPaymentMutation.isPending}
        />
      )}
    </Card>
  );
}
