import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access toast notifications from anywhere in the app.
 *
 * @example
 * const { success, error } = useToast();
 *
 * try {
 *   await savePatient(data);
 *   success('Patient saved successfully');
 * } catch (err) {
 *   error('Failed to save patient');
 * }
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

/**
 * Toast provider that manages all toast notifications.
 * Place at the root of your app.
 *
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      if (toast.duration !== 0) {
        const duration = toast.duration || 5000;
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'success', message, duration });
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'error', message, duration });
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'warning', message, duration });
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'info', message, duration });
    },
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, warning, info, removeToast }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/**
 * Toast container that renders all active toasts.
 */
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

/**
 * Individual toast item with animations.
 */
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Match animation duration
  };

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      // Auto-close after showing
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          icon: '✓',
          iconBg: 'bg-green-500',
          text: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: '✕',
          iconBg: 'bg-red-500',
          text: 'text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          icon: '⚠',
          iconBg: 'bg-yellow-500',
          text: 'text-yellow-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: 'ℹ',
          iconBg: 'bg-blue-500',
          text: 'text-blue-800',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.text} border-l-4 ${styles.border}
        rounded-lg shadow-lg p-4 flex items-start space-x-3
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        animate-slide-in-right
      `}
    >
      {/* Icon */}
      <div
        className={`${styles.iconBg} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold`}
      >
        {styles.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-semibold underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * Global toast instance for use outside React components.
 * Useful for utility functions, API interceptors, etc.
 */
class GlobalToastManager {
  private listeners: Set<(toast: Omit<Toast, 'id'>) => void> = new Set();

  subscribe(listener: (toast: Omit<Toast, 'id'>) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(toast: Omit<Toast, 'id'>) {
    this.listeners.forEach((listener) => listener(toast));
  }

  success(message: string, duration?: number) {
    this.emit({ type: 'success', message, duration });
  }

  error(message: string, duration?: number) {
    this.emit({ type: 'error', message, duration });
  }

  warning(message: string, duration?: number) {
    this.emit({ type: 'warning', message, duration });
  }

  info(message: string, duration?: number) {
    this.emit({ type: 'info', message, duration });
  }
}

export const globalToast = new GlobalToastManager();

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slide-in-right {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
