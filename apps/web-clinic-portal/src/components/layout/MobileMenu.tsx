/**
 * Mobile Menu Component
 *
 * Accessible mobile navigation drawer
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Icon, type IconName } from '../ui/Icon';
import { Button } from '../ui/Button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userEmail?: string;
}

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Patients', href: '/patients', icon: 'users' },
  { label: 'Appointments', href: '/appointments', icon: 'calendar' },
  { label: 'Clinical', href: '/clinical', icon: 'clipboard', disabled: true },
  { label: 'Documents', href: '/documents', icon: 'document', disabled: true },
  { label: 'Billing', href: '/billing', icon: 'cash', disabled: true },
  { label: 'Inventory', href: '/inventory', icon: 'cube', disabled: true },
  { label: 'Team', href: '/team', icon: 'userGroup', disabled: true },
];

export function MobileMenu({ isOpen, onClose, onLogout, userEmail }: MobileMenuProps) {
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink-900/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden={true}
      />

      {/* Menu Panel */}
      <div
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw]',
          'bg-ink-900 border-r border-white/5 lg:hidden',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Dental OS</div>
            <div className="text-lg font-semibold text-white">Clinic Portal</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <Icon name="x" className="w-5 h-5" aria-hidden={true} />
          </button>
        </div>

        {/* User Info */}
        {userEmail && (
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-500/40 border border-brand-300/40 text-white text-sm font-semibold flex items-center justify-center">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{userEmail}</div>
                <div className="text-xs text-slate-400">Central Clinic</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2" role="navigation" aria-label="Mobile primary navigation">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.href);
            const isDisabled = item.disabled;

            if (isDisabled) {
              return (
                <div
                  key={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium',
                    'text-slate-500 border border-transparent opacity-50 cursor-not-allowed',
                  )}
                  aria-disabled="true"
                  title={`${item.label} - Coming soon`}
                >
                  <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500">Soon</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-brand-500/20 text-white border border-brand-300/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-ink-900">
          <Button
            variant="ghost"
            fullWidth
            onClick={onLogout}
            className="justify-start"
          >
            <Icon name="logout" className="w-5 h-5 mr-2" aria-hidden={true} />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
