/**
 * PaymentMethodSelector Component
 *
 * Displays available payment methods as selectable cards.
 * Supports Cash, Card, Check, and Bank Transfer.
 */

import { cn } from '../../utils/cn';

export type PaymentMethod = 'cash' | 'card' | 'check' | 'bank_transfer';

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: JSX.Element;
  requiresReference: boolean;
  referencePlaceholder?: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: 'cash',
    label: 'Numerar',
    description: 'Plata cash la receptie',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    requiresReference: false,
  },
  {
    value: 'card',
    label: 'Card',
    description: 'Plata cu cardul (POS)',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    requiresReference: true,
    referencePlaceholder: 'Ultimele 4 cifre sau ID tranzactie',
  },
  {
    value: 'check',
    label: 'Cec',
    description: 'Plata prin cec bancar',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    requiresReference: true,
    referencePlaceholder: 'Numar cec',
  },
  {
    value: 'bank_transfer',
    label: 'Transfer Bancar',
    description: 'Plata prin virament',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    requiresReference: true,
    referencePlaceholder: 'Referinta transfer / IBAN',
  },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  className,
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {paymentMethods.map((method) => {
        const isSelected = value === method.value;

        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected
                ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900'
            )}
          >
            <div className={cn(
              'p-2 rounded-lg mb-3',
              isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            )}>
              {method.icon}
            </div>
            <span className={cn(
              'font-semibold text-sm',
              isSelected
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-neutral-900 dark:text-neutral-100'
            )}>
              {method.label}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {method.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function getPaymentMethodConfig(method: PaymentMethod): PaymentMethodOption | undefined {
  return paymentMethods.find((m) => m.value === method);
}

export function requiresReference(method: PaymentMethod): boolean {
  const config = getPaymentMethodConfig(method);
  return config?.requiresReference ?? false;
}

export function getReferencePlaceholder(method: PaymentMethod): string {
  const config = getPaymentMethodConfig(method);
  return config?.referencePlaceholder ?? 'Referinta';
}
