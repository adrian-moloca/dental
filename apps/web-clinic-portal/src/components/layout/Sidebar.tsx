/**
 * Sidebar Component
 *
 * Left navigation sidebar based on Preclinic template design.
 * Features:
 * - Collapsible sidebar with mini mode
 * - Nested menu support with expandable items
 * - Active state highlighting
 * - Mobile responsive with overlay
 */

import { useState, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import clsx from 'clsx';

interface MenuItem {
  title: string;
  path?: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  shortcut?: string;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Menu configuration
const menuSections: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: 'ti ti-dashboard',
        shortcut: 'D'
      },
    ],
  },
  {
    title: 'Pacienti & Programari',
    items: [
      {
        title: 'Programari',
        icon: 'ti ti-calendar',
        shortcut: 'P',
        children: [
          { title: 'Calendar', path: '/appointments', icon: 'ti ti-calendar-event' },
          { title: 'Programare Noua', path: '/appointments/create', icon: 'ti ti-calendar-plus' },
        ],
      },
      {
        title: 'Pacienti',
        icon: 'ti ti-users',
        shortcut: 'C',
        children: [
          { title: 'Lista Pacienti', path: '/patients', icon: 'ti ti-list' },
          { title: 'Pacient Nou', path: '/patients/create', icon: 'ti ti-user-plus' },
        ],
      },
      { title: 'Receptie', path: '/reception', icon: 'ti ti-door-enter', shortcut: 'R' },
    ],
  },
  {
    title: 'Activitate Clinica',
    items: [
      { title: 'Date Clinice', path: '/clinical', icon: 'ti ti-dental', shortcut: 'T' },
      {
        title: 'Facturare',
        icon: 'ti ti-file-invoice',
        shortcut: 'F',
        children: [
          { title: 'Facturi', path: '/billing', icon: 'ti ti-receipt' },
          { title: 'Factura Noua', path: '/billing/invoices/create', icon: 'ti ti-file-plus' },
        ],
      },
      { title: 'Rapoarte', path: '/reports', icon: 'ti ti-chart-bar', shortcut: 'A' },
    ],
  },
  {
    title: 'Operatiuni',
    items: [
      { title: 'Inventar', path: '/inventory', icon: 'ti ti-packages', shortcut: 'I' },
      { title: 'Imagistica', path: '/imaging', icon: 'ti ti-photo-scan' },
      {
        title: 'Echipa',
        icon: 'ti ti-users-group',
        shortcut: 'E',
        children: [
          { title: 'Personal', path: '/staff', icon: 'ti ti-users' },
          { title: 'Program Lucru', path: '/providers/schedule', icon: 'ti ti-calendar-time' },
        ],
      },
    ],
  },
  {
    title: 'Configurare',
    items: [
      { title: 'Module & Abonamente', path: '/modules', icon: 'ti ti-apps', badge: 'Nou', badgeColor: 'success', shortcut: 'M' },
      { title: 'Setari', path: '/settings', icon: 'ti ti-settings', shortcut: 'S' },
    ],
  },
];

interface SidebarMenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  onToggle: () => void;
  level?: number;
}

function SidebarMenuItem({ item, isExpanded, onToggle, level: _level = 0 }: SidebarMenuItemProps) {
  const location = useLocation();
  const { closeMobileSidebar } = useSidebar();

  const isActive = useMemo(() => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  }, [item, location.pathname]);

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = useCallback(() => {
    if (hasChildren) {
      onToggle();
    } else {
      closeMobileSidebar();
    }
  }, [hasChildren, onToggle, closeMobileSidebar]);

  if (hasChildren) {
    return (
      <li className="submenu">
        <a
          href="#"
          className={clsx({ subdrop: isExpanded, active: isActive })}
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <i className={item.icon}></i>
          <span>{item.title}</span>
          {item.shortcut && (
            <span className="menu-shortcut" title={`Scurtatura: Ctrl+${item.shortcut}`}>
              {item.shortcut}
            </span>
          )}
          {item.badge && (
            <span className={`badge badge-soft-${item.badgeColor || 'primary'}`}>
              {item.badge}
            </span>
          )}
          <span className="menu-arrow"></span>
        </a>
        {isExpanded && (
          <ul>
            {item.children?.map((child, idx) => (
              <li key={idx}>
                <NavLink
                  to={child.path || '#'}
                  className={({ isActive }) => clsx({ active: isActive })}
                  onClick={() => closeMobileSidebar()}
                >
                  {child.title}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="submenu">
      <NavLink
        to={item.path || '#'}
        className={({ isActive }) => clsx({ active: isActive })}
        onClick={handleClick}
      >
        <i className={item.icon}></i>
        <span>{item.title}</span>
        {item.shortcut && (
          <span className="menu-shortcut" title={`Scurtatura: Ctrl+${item.shortcut}`}>
            {item.shortcut}
          </span>
        )}
        {item.badge && (
          <span className={`badge badge-soft-${item.badgeColor || 'primary'}`}>
            {item.badge}
          </span>
        )}
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  const { isSidebarOpen, isMiniSidebar: _isMiniSidebar, closeMobileSidebar } = useSidebar();
  const location = useLocation();

  // Track which menu items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // Auto-expand menu items that contain the current route
    const expanded = new Set<string>();
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.some(child => location.pathname === child.path)) {
          expanded.add(item.title);
        }
      });
    });
    return expanded;
  });

  const toggleItem = useCallback((title: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx('sidebar-overlay', { show: isSidebarOpen })}
        onClick={closeMobileSidebar}
      />

      {/* Sidebar */}
      <aside className={clsx('sidebar', { show: isSidebarOpen })}>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <NavLink to="/dashboard" className="logo">
            <span className="fs-xl fw-bold text-primary">Dental</span>
            <span className="fs-xl fw-bold text-secondary">OS</span>
          </NavLink>
          <NavLink to="/dashboard" className="logo-small">
            <span className="fw-bold text-primary">D</span>
          </NavLink>
          <button
            type="button"
            className="sidebar-close"
            onClick={closeMobileSidebar}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Scrollable Menu Area */}
        <div className="sidebar-inner">
          {/* Clinic Selector */}
          <div className="sidebar-top">
            <div className="d-flex gap-3">
              <div className="avatar">
                <i className="ti ti-building-hospital text-primary"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="text-truncate mb-0">Clinica Demo</h6>
                <p className="text-truncate mb-0">Sediu Principal</p>
              </div>
              <i className="ti ti-selector"></i>
            </div>
          </div>

          {/* Menu Sections */}
          <nav className="sidebar-menu">
            <ul>
              {menuSections.map((section, sectionIdx) => (
                <li key={sectionIdx}>
                  <div className="menu-title">
                    <span>{section.title}</span>
                  </div>
                  <ul>
                    {section.items.map((item, itemIdx) => (
                      <SidebarMenuItem
                        key={itemIdx}
                        item={item}
                        isExpanded={expandedItems.has(item.title)}
                        onToggle={() => toggleItem(item.title)}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="trial-item">
            <a href="#" className="close-icon">
              <i className="ti ti-x"></i>
            </a>
            <div className="trial-item-icon d-flex align-items-center justify-content-center mx-auto mb-3">
              <i className="ti ti-sparkles text-primary fs-3xl"></i>
            </div>
            <h6>Extinde Clinica</h6>
            <p>Descopera module premium pentru clinica ta</p>
            <NavLink to="/modules" className="btn btn-primary btn-sm mt-3 w-100" onClick={closeMobileSidebar}>
              <i className="ti ti-apps me-1"></i>
              Vezi Module
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
