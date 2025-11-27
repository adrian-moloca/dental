/**
 * Floating Action Button (FAB) Component
 *
 * A persistent floating action button with expandable menu for quick access
 * to common actions. Follows Material Design FAB patterns.
 */

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export interface FABAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onClick: () => void;
  shortcut?: string;
}

export interface FloatingActionButtonProps {
  /** Main action icon */
  icon?: string;
  /** Main action label */
  label?: string;
  /** Actions to show in expanded menu */
  actions?: FABAction[];
  /** Position of FAB */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Main action callback */
  onClick?: () => void;
  /** Hide on scroll down, show on scroll up */
  hideOnScroll?: boolean;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export function FloatingActionButton({
  icon = 'ti ti-plus',
  label,
  actions = [],
  position = 'bottom-right',
  onClick,
  hideOnScroll = false,
  variant = 'primary',
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const fabRef = useRef<HTMLDivElement>(null);

  // Handle scroll behavior
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  const handleActionClick = (action: FABAction) => {
    action.onClick();
    setIsExpanded(false);
  };

  const positionClasses = {
    'bottom-right': 'bottom-0 end-0 mb-4 me-4',
    'bottom-left': 'bottom-0 start-0 mb-4 ms-4',
    'top-right': 'top-0 end-0 mt-4 me-4',
    'top-left': 'top-0 start-0 mt-4 ms-4',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
  };

  return (
    <div
      ref={fabRef}
      className={clsx(
        'fab-container position-fixed',
        positionClasses[position],
        !isVisible && 'fab-hidden'
      )}
      style={{
        zIndex: 1040,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Expanded actions menu */}
      {actions.length > 0 && isExpanded && (
        <div
          className="fab-menu mb-3"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: position.includes('right') ? 'flex-end' : 'flex-start',
          }}
        >
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="fab-menu-item d-flex align-items-center gap-2"
              style={{
                animation: `fabSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`,
                flexDirection: position.includes('right') ? 'row-reverse' : 'row',
              }}
            >
              {/* Action label tooltip */}
              <div
                className="fab-tooltip bg-dark text-white px-3 py-2 rounded shadow-sm"
                style={{
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  opacity: 0.95,
                }}
              >
                {action.label}
                {action.shortcut && (
                  <kbd className="ms-2 bg-secondary text-white border-0 small">
                    {action.shortcut}
                  </kbd>
                )}
              </div>

              {/* Action button */}
              <button
                type="button"
                className={clsx(
                  'btn btn-sm shadow',
                  action.color ? `btn-${action.color}` : 'btn-light'
                )}
                onClick={() => handleActionClick(action)}
                title={action.label}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className={clsx(action.icon, 'fs-5')}></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        type="button"
        className={clsx(
          'btn shadow-lg',
          variantClasses[variant],
          'fab-main'
        )}
        onClick={handleMainClick}
        title={label}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        <i className={clsx(icon, 'fs-3')}></i>
      </button>

      {/* Label badge (optional) */}
      {label && !isExpanded && (
        <div
          className="position-absolute top-0 start-100 translate-middle-y bg-dark text-white px-3 py-1 rounded shadow-sm ms-2"
          style={{
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.95';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        >
          {label}
        </div>
      )}

      <style>{`
        @keyframes fabSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .fab-main:hover {
          transform: ${isExpanded ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)'};
        }

        .fab-menu-item button:hover {
          transform: scale(1.15);
        }

        .fab-container:hover .fab-tooltip {
          animation: tooltipFadeIn 0.2s ease-in-out;
        }

        @keyframes tooltipFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fab-hidden {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
