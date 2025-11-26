import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

type Toast = {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info' | 'warning';
};

type ToastContextValue = {
  push: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
          {items.map((t) => (
            <div
              key={t.id}
              className={clsx(
                'rounded-lg px-4 py-3 text-sm shadow-soft border',
                t.tone === 'success' && 'bg-emerald-600 text-white border-emerald-400',
                t.tone === 'error' && 'bg-red-600 text-white border-red-400',
                t.tone === 'warning' && 'bg-amber-600 text-white border-amber-400',
                (!t.tone || t.tone === 'info') && 'bg-ink-800 text-white border-white/10',
              )}
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
