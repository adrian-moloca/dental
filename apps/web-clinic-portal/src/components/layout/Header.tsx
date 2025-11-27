/**
 * Header Component
 *
 * Top navigation bar based on Preclinic template design.
 * Features:
 * - Global search
 * - Notifications dropdown
 * - Theme toggle (light/dark)
 * - User profile dropdown
 * - Mobile menu toggle
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'payment' | 'alert' | 'info';
  read: boolean;
}

// Mock notifications - replace with real data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Programare Noua',
    message: 'Ion Popescu programat pentru maine la 10:00',
    time: 'Acum 5 min',
    type: 'appointment',
    read: false,
  },
  {
    id: '2',
    title: 'Plata Primita',
    message: 'Factura #INV-2024-0042 achitata - 250 RON',
    time: 'Acum 1 ora',
    type: 'payment',
    read: false,
  },
  {
    id: '3',
    title: 'Alerta Stoc Scazut',
    message: 'Compozit Dentar stoc scazut (5 unitati)',
    time: 'Acum 2 ore',
    type: 'alert',
    read: true,
  },
];

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const iconMap = {
    appointment: { icon: 'ti ti-calendar-check', color: 'primary' },
    payment: { icon: 'ti ti-credit-card', color: 'success' },
    alert: { icon: 'ti ti-alert-triangle', color: 'warning' },
    info: { icon: 'ti ti-info-circle', color: 'info' },
  };

  const { icon, color } = iconMap[type];

  return (
    <div className={`notification-icon bg-${color}-transparent`}>
      <i className={icon}></i>
    </div>
  );
}

export function Header() {
  const { toggleSidebar: _toggleSidebar, toggleMiniSidebar, openMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const userInitials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="header">
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={openMobileSidebar}
      >
        <i className="ti ti-menu-2"></i>
      </button>

      {/* Left Section */}
      <div className="header-left">
        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          className="header-icon-btn d-none d-lg-flex"
          onClick={toggleMiniSidebar}
        >
          <i className="ti ti-layout-sidebar-left-collapse"></i>
        </button>

        {/* Global Search */}
        <div className="header-search">
          <i className="ti ti-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Cauta pacienti, programari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        {/* Mobile Search Button */}
        <button type="button" className="mobile-search-btn">
          <i className="ti ti-search"></i>
        </button>
      </div>

      {/* Right Section */}
      <div className="header-right">
        {/* Theme Toggle */}
        <button
          type="button"
          className="header-icon-btn theme-toggle"
          onClick={toggleTheme}
          title={`Comuta la modul ${theme === 'light' ? 'inchis' : 'luminos'}`}
        >
          <i className="ti ti-sun light-icon"></i>
          <i className="ti ti-moon dark-icon"></i>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          className="header-icon-btn fullscreen-toggle"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Iesire ecran complet' : 'Intrare ecran complet'}
        >
          <i className={`ti ti-${isFullscreen ? 'arrows-minimize' : 'arrows-maximize'}`}></i>
        </button>

        {/* Notifications */}
        <div className="notifications-dropdown" ref={notificationsRef}>
          <button
            type="button"
            className={clsx('header-icon-btn', { active: showNotifications })}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="ti ti-bell"></i>
            {unreadCount > 0 && (
              <span className="badge-indicator">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu show">
              <div className="dropdown-header">
                <h6>Notificari</h6>
                <span className="badge badge-primary">{unreadCount} Noi</span>
              </div>
              <div className="notifications-list">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={clsx('notification-item', { unread: !notification.read })}
                  >
                    <NotificationIcon type={notification.type} />
                    <div className="notification-content">
                      <h6>{notification.title}</h6>
                      <p>{notification.message}</p>
                      <span>{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <Link to="/notifications">Vezi Toate Notificarile</Link>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="user-dropdown" ref={userMenuRef}>
          <button
            type="button"
            className="dropdown-toggle"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <span>{userInitials}</span>
            </div>
            <div className="user-info">
              <h6>{user?.email?.split('@')[0] || 'Utilizator'}</h6>
              <span>{user?.roles?.[0] || 'Personal'}</span>
            </div>
            <i className="ti ti-chevron-down dropdown-icon"></i>
          </button>

          {showUserMenu && (
            <div className="dropdown-menu show">
              <Link to="/profile" className="dropdown-item">
                <i className="ti ti-user"></i>
                Profilul Meu
              </Link>
              <Link to="/settings/security" className="dropdown-item">
                <i className="ti ti-settings"></i>
                Setari
              </Link>
              <Link to="/settings/sessions" className="dropdown-item">
                <i className="ti ti-device-laptop"></i>
                Sesiuni Active
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="ti ti-logout"></i>
                Deconectare
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
