/**
 * Modal Component
 *
 * Preclinic-style modal/dialog component.
 */

import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Title icon */
  icon?: string;
  /** Modal size */
  size?: ModalSize;
  /** Show close button */
  closable?: boolean;
  /** Close on overlay click */
  closeOnOverlay?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
  /** Footer content */
  footer?: ReactNode;
  /** Center modal vertically */
  centered?: boolean;
  /** Side drawer mode */
  drawer?: boolean;
  /** Drawer position */
  drawerPosition?: 'left' | 'right';
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      icon,
      size = 'md',
      closable = true,
      closeOnOverlay = true,
      closeOnEscape = true,
      footer,
      centered = true,
      drawer = false,
      drawerPosition = 'right',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closeOnEscape, onClose]);

    // Lock body scroll when open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    // Handle overlay click
    const handleOverlayClick = (e: MouseEvent) => {
      if (closeOnOverlay && e.target === overlayRef.current) {
        onClose();
      }
    };

    if (!open) return null;

    const sizeClass = size === 'md' ? '' : `modal-${size}`;

    const modalContent = (
      <div
        ref={overlayRef}
        className={clsx('modal-overlay', { show: open })}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          ref={ref}
          className={clsx(
            'modal',
            sizeClass,
            {
              'modal-side': drawer,
              'modal-side-left': drawer && drawerPosition === 'left',
            },
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || closable) && (
            <div className="modal-header">
              {title && (
                <h5 id="modal-title" className="modal-title">
                  {icon && <i className={icon}></i>}
                  {title}
                </h5>
              )}
              {closable && (
                <button
                  type="button"
                  className="modal-close"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <i className="ti ti-x"></i>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="modal-body">{children}</div>

          {/* Footer */}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

// Confirmation Modal
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmModalProps) {
  const iconMap = {
    warning: 'ti ti-alert-triangle',
    danger: 'ti ti-trash',
    success: 'ti ti-check',
    info: 'ti ti-info-circle',
  };

  const buttonVariant = {
    warning: 'warning',
    danger: 'danger',
    success: 'success',
    info: 'primary',
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" closable={false}>
      <div className="modal-confirm">
        <div className={`confirm-icon icon-${type}`}>
          <i className={iconMap[type]}></i>
        </div>
        <h5 className="confirm-title">{title}</h5>
        <p className="confirm-text">{message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${buttonVariant[type]}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="btn-loading"></span>}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default Modal;
