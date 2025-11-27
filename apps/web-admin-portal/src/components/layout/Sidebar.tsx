import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useSidebar } from '../../contexts/SidebarContext';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'ti-dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Organizations', href: '/organizations', icon: 'ti-building' },
      { label: 'Cabinets', href: '/cabinets', icon: 'ti-building-hospital' },
      { label: 'Users', href: '/users', icon: 'ti-users' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Subscriptions', href: '/subscriptions', icon: 'ti-credit-card' },
      { label: 'Plans', href: '/plans', icon: 'ti-package' },
      { label: 'Modules', href: '/modules', icon: 'ti-puzzle' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: 'ti-settings' },
      { label: 'Audit Logs', href: '/audit-logs', icon: 'ti-list-check' },
      { label: 'System Health', href: '/system-health', icon: 'ti-heartbeat' },
    ],
  },
];

function NavItemLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

  return (
    <Nav.Item>
      <Link
        to={item.href}
        className={`nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <i className={`ti ${item.icon} fs-5`} />
        {!isCollapsed && (
          <>
            <span className="flex-grow-1">{item.label}</span>
            {item.badge !== undefined && (
              <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    </Nav.Item>
  );
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="logo-icon">
              <i className="ti ti-tooth text-white" />
            </div>
            {!isCollapsed && (
              <div className="logo-text">
                <small className="d-block text-uppercase text-muted letter-spacing-1">DentalOS</small>
                <span className="fw-semibold text-primary">Admin Portal</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="sidebar-menu">
          <Nav as="ul" className="flex-column">
            {navSections.map((section, index) => (
              <div key={index} className="nav-section">
                {section.label && !isCollapsed && (
                  <li className="nav-section-title">
                    <span>{section.label}</span>
                  </li>
                )}
                {section.items.map((item) => (
                  <NavItemLink key={item.href} item={item} isCollapsed={isCollapsed} />
                ))}
              </div>
            ))}
          </Nav>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="d-flex align-items-center gap-2 p-3 border-top">
              <div className="system-status">
                <i className="ti ti-circle-filled text-success fs-6" />
              </div>
              <div className="small">
                <div className="text-muted">System Status</div>
                <div className="fw-medium text-success">All Systems Operational</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
