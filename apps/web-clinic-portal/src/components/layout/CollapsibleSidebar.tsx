/**
 * Collapsible Sidebar - Advanced left navigation with icon-only mode
 */

import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Icon, type IconName } from '../ui/Icon';
import { useSidebar } from '../../contexts/SidebarContext';

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
  disabled?: boolean;
  description?: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home', description: 'Overview and quick stats' },
  { label: 'Patients', href: '/patients', icon: 'users', description: 'Patient management' },
  { label: 'Appointments', href: '/appointments', icon: 'calendar', description: 'Schedule and bookings' },
  { label: 'Clinical', href: '/clinical', icon: 'clipboard', disabled: true, description: 'Clinical records' },
  { label: 'Billing', href: '/billing', icon: 'cash', description: 'Invoices and payments' },
  { label: 'Inventory', href: '/inventory', icon: 'cube', description: 'Stock management' },
  { label: 'Imaging', href: '/imaging', icon: 'document', description: 'X-rays and DICOM studies' },
  { label: 'Documents', href: '/documents', icon: 'document', disabled: true, description: 'File management' },
  { label: 'Team', href: '/team', icon: 'userGroup', disabled: true, description: 'Staff management' },
  { label: 'Settings', href: '/settings', icon: 'settings', description: 'App configuration' },
];

export function CollapsibleSidebar() {
  const location = useLocation();
  const { leftSidebarCollapsed, toggleLeftSidebar } = useSidebar();

  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col border-r border-border bg-surface/60 backdrop-blur transition-all duration-300',
        leftSidebarCollapsed ? 'w-20' : 'w-64',
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className={clsx('p-6 border-b border-border transition-all', leftSidebarCollapsed && 'px-4')}>
        {leftSidebarCollapsed ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-lg">
              D
            </div>
          </div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Dental OS</div>
            <div className="mt-2 text-xl font-semibold text-foreground">Clinic Portal</div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Primary">
        {navItems.map((item) => {
          const active = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <div
                key={item.href}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-muted/50 cursor-not-allowed',
                  leftSidebarCollapsed && 'justify-center',
                )}
                title={leftSidebarCollapsed ? `${item.label} - Coming soon` : undefined}
              >
                <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
                {!leftSidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted">Soon</span>
                  </>
                )}
                {leftSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-surface border border-border rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                    <div className="font-semibold text-foreground">{item.label}</div>
                    <div className="text-xs text-muted mt-0.5">Coming soon</div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground border border-transparent',
                leftSidebarCollapsed && 'justify-center',
              )}
              aria-current={active ? 'page' : undefined}
              title={leftSidebarCollapsed ? item.label : undefined}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
              {!leftSidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[11px] rounded-full bg-surface px-2 py-0.5 text-muted border border-border">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {leftSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-surface border border-border rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                  <div className="font-semibold text-foreground">{item.label}</div>
                  {item.description && <div className="text-xs text-muted mt-0.5">{item.description}</div>}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className={clsx('p-4 border-t border-border', leftSidebarCollapsed && 'px-2')}>
        <button
          onClick={toggleLeftSidebar}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          aria-label={leftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={leftSidebarCollapsed ? 'chevronRight' : 'chevronLeft'}
            className="w-5 h-5"
            aria-hidden={true}
          />
          {!leftSidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
