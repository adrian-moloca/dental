import { Form, Dropdown, InputGroup, Button } from 'react-bootstrap';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const { isCollapsed, toggleCollapsed, toggleMobile } = useSidebar();
  const { user, logout } = useAuthStore();

  const userInitials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'D'}`;

  return (
    <header className={`navbar-header ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-menu d-flex align-items-center w-100">
        {/* Left side */}
        <div className="d-flex align-items-center gap-3">
          {/* Mobile toggle */}
          <Button
            variant="link"
            className="mobile-btn d-lg-none p-2 text-body"
            onClick={toggleMobile}
            aria-label="Toggle mobile menu"
          >
            <i className="ti ti-menu-2 fs-4" />
          </Button>

          {/* Desktop toggle */}
          <Button
            variant="link"
            className="sidenav-toggle-btn d-none d-lg-flex p-2 text-body"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className={`ti fs-4 ${isCollapsed ? 'ti-menu-2' : 'ti-layout-sidebar-left-collapse'}`} />
          </Button>

          {/* Search */}
          <div className="header-search d-none d-md-block">
            <InputGroup size="sm">
              <InputGroup.Text className="bg-transparent border-end-0">
                <i className="ti ti-search text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search organizations, users..."
                className="border-start-0 ps-0"
                style={{ width: '280px' }}
              />
              <InputGroup.Text className="bg-transparent">
                <kbd className="bg-light border text-muted small px-2 py-0">Ctrl+K</kbd>
              </InputGroup.Text>
            </InputGroup>
          </div>
        </div>

        {/* Right side */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Notifications */}
          <div className="header-item">
            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                className="topbar-link border-0 bg-transparent position-relative"
                id="notifications-dropdown"
              >
                <i className="ti ti-bell fs-5" />
                <span className="notification-badge" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-lg p-0" style={{ minWidth: '300px' }}>
                <div className="p-3 border-bottom bg-light">
                  <h6 className="mb-0 fw-semibold">Notifications</h6>
                </div>
                <div className="notification-body">
                  <div className="p-4 text-center text-muted">
                    <i className="ti ti-bell-off fs-1 d-block mb-2 opacity-50" />
                    <p className="mb-0">No new notifications</p>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* System Status */}
          <div className="header-item">
            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                className="topbar-link border-0 bg-transparent"
                id="status-dropdown"
                title="System Status"
              >
                <i className="ti ti-activity fs-5 text-success" />
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: '240px' }}>
                <div className="px-3 py-2 border-bottom bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-block rounded-circle bg-success" style={{ width: 8, height: 8 }} />
                    <span className="fw-semibold">System Status</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-success fw-medium mb-2">
                    <i className="ti ti-check me-1" />
                    All Systems Operational
                  </div>
                  <small className="text-muted d-block">
                    All services are running normally.
                  </small>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Separator */}
          <div className="vr mx-2 opacity-25" style={{ height: '24px' }} />

          {/* User Menu */}
          <div className="header-item d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-medium lh-sm">
                {user?.firstName} {user?.lastName}
              </div>
              <small className="text-muted">{user?.role || 'Super Admin'}</small>
            </div>

            <Dropdown align="end" className="profile-dropdown">
              <Dropdown.Toggle
                as="button"
                className="border-0 bg-transparent p-0 d-flex align-items-center"
                id="user-dropdown"
              >
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38 }}
                >
                  <span className="fw-medium">{userInitials}</span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#profile">
                  <i className="ti ti-user me-2" /> My Profile
                </Dropdown.Item>
                <Dropdown.Item href="#settings">
                  <i className="ti ti-settings me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => logout()} className="text-danger">
                  <i className="ti ti-logout me-2" /> Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
