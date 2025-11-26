import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const modalRoot = typeof document !== 'undefined' ? document.body : null;

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Focus close button when modal opens
    closeButtonRef.current?.focus();

    // Trap focus and handle Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className="modal-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center p-4 pt-16">
          <div
            className={`relative w-full rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl animate-fade-in ${
              size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'
            }`}
          >
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text)] hover:bg-[var(--surface-card)] transition-colors"
              aria-label="Close dialog"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {title && <h2 id="modal-title" className="text-lg font-semibold text-[var(--text)] mb-4 pr-8">{title}</h2>}
            {children}
          </div>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}
