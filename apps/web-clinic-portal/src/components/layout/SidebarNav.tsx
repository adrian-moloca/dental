import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Icon, type IconName } from '../ui/Icon';

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Patients', href: '/patients', icon: 'users' },
  { label: 'Appointments', href: '/appointments', icon: 'calendar' },
  { label: 'Clinical', href: '/clinical', icon: 'clipboard', disabled: true },
  { label: 'Documents', href: '/documents', icon: 'document', disabled: true },
  { label: 'Billing', href: '/billing', icon: 'cash', disabled: true },
  { label: 'Inventory', href: '/inventory', icon: 'cube', disabled: true },
  { label: 'Team', href: '/team', icon: 'userGroup', disabled: true },
];

export function SidebarNav() {
  const location = useLocation();

  return (
    <aside
      className="hidden w-64 flex-shrink-0 lg:block border-r border-[var(--border)] bg-[var(--surface)]"
      aria-label="Main navigation"
    >
      <div className="p-6 border-b border-[var(--border)]">
        <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Dental OS</div>
        <div className="mt-2 text-xl font-semibold text-[var(--primary)]">Clinic Portal</div>
      </div>
      <nav className="p-4 space-y-1" role="navigation" aria-label="Primary">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.href);
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <div
                key={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-[var(--text-tertiary)] border border-transparent opacity-50 cursor-not-allowed'
                )}
                aria-disabled="true"
                title={`${item.label} - Coming soon`}
              >
                <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[11px] rounded-full bg-[var(--surface-card)] px-2 py-0.5 text-[var(--text-tertiary)] border border-[var(--border)]">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] border border-transparent',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[11px] rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[var(--accent)] border border-[var(--accent)]/30" aria-label={`${item.badge} notifications`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
