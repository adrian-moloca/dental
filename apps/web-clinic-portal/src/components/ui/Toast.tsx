/**
 * Toast Notification Component
 *
 * Accessible toast notifications with automatic dismissal and animations
 */

import { useEffect } from 'react';
import clsx from 'clsx';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const typeConfig = {
    success: {
      icon: 'check' as const,
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-100',
    },
    error: {
      icon: 'exclamation' as const,
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400',
      textColor: 'text-red-100',
    },
    warning: {
      icon: 'exclamation' as const,
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50',
      iconColor: 'text-amber-400',
      textColor: 'text-amber-100',
    },
    info: {
      icon: 'info' as const,
      bgColor: 'bg-brand-500/20',
      borderColor: 'border-brand-500/50',
      iconColor: 'text-brand-400',
      textColor: 'text-brand-100',
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={clsx(
        'toast-item',
        'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm',
        'shadow-lg max-w-md w-full',
        config.bgColor,
        config.borderColor,
      )}
    >
      <div className={clsx('flex-shrink-0', config.iconColor)}>
        <Icon name={config.icon} className="w-5 h-5" aria-hidden={true} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('font-semibold text-sm', config.textColor)}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <Icon name="x" className="w-4 h-4" aria-hidden={true} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
