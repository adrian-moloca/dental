import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
};

const modalRoot = typeof document !== 'undefined' ? document.body : null;

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={title ?? 'Dialog'}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center p-4">
          <div
            className={`glass-panel relative w-full rounded-xl border border-white/10 p-6 shadow-soft ${
              size === 'lg' ? 'max-w-3xl' : 'max-w-xl'
            }`}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            {title && <div className="text-lg font-semibold text-white mb-3">{title}</div>}
            {children}
          </div>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}
