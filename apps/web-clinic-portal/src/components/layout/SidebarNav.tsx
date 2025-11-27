import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon, type IconName } from '../ui/Icon';

// Storage keys for persistence
const STORAGE_KEY_EXPANDED = 'sidebar-expanded-items';
const STORAGE_KEY_SCROLL = 'sidebar-scroll-position';

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  badge?: number | string;
  badgeVariant?: 'default' | 'warning' | 'error';
  disabled?: boolean;
  children?: NavItem[];
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'home' },
      { label: 'Pacienti', href: '/patients', icon: 'users' },
      { label: 'Programari', href: '/appointments', icon: 'calendar' },
    ],
  },
  {
    label: 'Operatiuni Clinice',
    items: [
      { label: 'Date Clinice', href: '/clinical', icon: 'clipboard' },
      { label: 'Interventii', href: '/clinical/interventions', icon: 'stethoscope' },
      { label: 'Imagistica', href: '/imaging', icon: 'photo' },
      { label: 'Documente', href: '/documents', icon: 'document', disabled: true },
    ],
  },
  {
    label: 'Gestiune',
    items: [
      {
        label: 'Facturare',
        href: '/billing',
        icon: 'cash',
        badge: 3,
        badgeVariant: 'warning',
      },
      {
        label: 'Inventar',
        href: '/inventory',
        icon: 'cube',
        badge: 5,
        badgeVariant: 'error',
      },
    ],
  },
  {
    label: 'Raportare',
    items: [
      { label: 'Rapoarte', href: '/reports', icon: 'chartBar' },
    ],
  },
  {
    label: 'Echipa',
    items: [
      { label: 'Angajati', href: '/staff', icon: 'userGroup' },
    ],
  },
  {
    label: 'Setari',
    items: [
      {
        label: 'Setari',
        href: '/settings',
        icon: 'cog',
        children: [
          { label: 'Profil', href: '/settings/profile', icon: 'user' },
          { label: 'Securitate', href: '/settings/security', icon: 'lock' },
          { label: 'Clinica', href: '/settings/clinic', icon: 'building' },
        ],
      },
    ],
  },
  {
    label: 'Ajutor',
    items: [
      { label: 'Suport', href: '/support', icon: 'questionMarkCircle' },
    ],
  },
];

// Helper to get expanded items from localStorage
const getStoredExpandedItems = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_EXPANDED);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore localStorage errors
  }
  return new Set();
};

// Helper to save expanded items to localStorage
const saveExpandedItems = (items: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify([...items]));
  } catch {
    // Ignore localStorage errors
  }
};

interface NavItemLinkProps {
  item: NavItem;
  depth?: number;
  expandedItems: Set<string>;
  onToggleExpand: (href: string, expanded: boolean) => void;
}

function NavItemLink({ item, depth = 0, expandedItems, onToggleExpand }: NavItemLinkProps) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  // Use persisted state or fallback to checking if child is active
  const [isExpanded, setIsExpanded] = useState(() => {
    if (expandedItems.has(item.href)) {
      return true;
    }
    // Auto-expand if any child is active
    if (hasChildren) {
      return item.children!.some(child => location.pathname.startsWith(child.href));
    }
    return false;
  });

  const isActive = hasChildren
    ? location.pathname.startsWith(item.href)
    : location.pathname === item.href || location.pathname.startsWith(item.href + '/');
  const isDisabled = item.disabled;

  const paddingLeft = depth === 0 ? 'pl-3' : 'pl-9';

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      onToggleExpand(item.href, newExpanded);
    }
  };

  const getBadgeClasses = () => {
    const variant = item.badgeVariant || 'default';
    const baseClasses = 'text-[11px] rounded-full px-2 py-0.5 font-medium';

    switch (variant) {
      case 'warning':
        return `${baseClasses} bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30`;
      case 'error':
        return `${baseClasses} bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30`;
      default:
        return `${baseClasses} bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30`;
    }
  };

  if (isDisabled) {
    return (
      <div>
        <div
          className={clsx(
            'flex items-center gap-3 rounded-lg pr-3 py-2.5 text-sm font-medium',
            paddingLeft,
            'text-[var(--text-muted)] border border-transparent cursor-not-allowed' /* Removed opacity, using solid text-muted for WCAG AA */
          )}
          aria-disabled="true"
          title={`${item.label} - In curand`}
        >
          <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="text-[11px] rounded-full bg-[var(--surface-card)] px-2 py-0.5 text-[var(--text-secondary)] border border-[var(--border)]">
              {item.badge}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={item.href}
        onClick={handleToggle}
        className={clsx(
          'flex items-center gap-3 rounded-lg pr-3 py-2.5 text-sm font-medium transition-all duration-200',
          paddingLeft,
          isActive
            ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] border border-transparent',
        )}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" aria-hidden={true} />
        <span className="flex-1">{item.label}</span>
        {item.badge !== undefined && (
          <span
            className={getBadgeClasses()}
            aria-label={typeof item.badge === 'number' ? `${item.badge} items` : item.badge.toString()}
          >
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <Icon
            name="chevronDown"
            className={clsx(
              'w-4 h-4 flex-shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
            aria-hidden={true}
          />
        )}
      </Link>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1" role="group" aria-label={`${item.label} submenu`}>
          {item.children!.map((child) => (
            <NavItemLink
              key={child.href}
              item={child}
              depth={depth + 1}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav() {
  const navRef = useRef<HTMLElement>(null);

  // State for expanded items with persistence
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => getStoredExpandedItems());

  // Handle toggle expand with persistence
  const handleToggleExpand = useCallback((href: string, expanded: boolean) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (expanded) {
        next.add(href);
      } else {
        next.delete(href);
      }
      saveExpandedItems(next);
      return next;
    });
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(STORAGE_KEY_SCROLL);
    if (savedScroll && navRef.current) {
      const navElement = navRef.current.querySelector('nav');
      if (navElement) {
        navElement.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, []);

  // Save scroll position on scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    sessionStorage.setItem(STORAGE_KEY_SCROLL, String(target.scrollTop));
  }, []);

  return (
    <aside
      ref={navRef}
      className="hidden w-64 flex-shrink-0 lg:block border-r border-[var(--border)] bg-[var(--surface)]"
      aria-label="Main navigation"
    >
      <div className="p-6 border-b border-[var(--border)]">
        <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Dental OS</div>
        <div className="mt-2 text-xl font-semibold text-[var(--primary)]">Clinic Portal</div>
      </div>

      <nav
        className="p-4 space-y-6 overflow-y-auto"
        role="navigation"
        aria-label="Primary"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
        onScroll={handleScroll}
      >
        {navSections.map((section, index) => (
          <div key={index}>
            {section.label && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  expandedItems={expandedItems}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
