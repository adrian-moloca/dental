/**
 * Advanced AppShell - With collapsible sidebars, theme toggle, notifications
 * ENHANCED: Now includes Command Palette, Keyboard Shortcuts, and global keyboard navigation
 */

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { RightSidebar } from './RightSidebar';
import { MobileMenu } from './MobileMenu';
import { Button } from '../ui/Button';
import { SkipNav } from '../a11y/SkipNav';
import { Icon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationCenter, type Notification } from '../notifications/NotificationCenter';
import { EnhancedCommandPalette } from '../command/EnhancedCommandPalette';
import { KeyboardShortcutsOverlay } from '../keyboard/KeyboardShortcutsOverlay';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  rightSidebarTitle?: string;
};

// Mock notifications - replace with real data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'New Appointment',
    message: 'John Doe scheduled for tomorrow at 10:00 AM',
    time: '5m ago',
    timestamp: Date.now() - 300000,
    read: false,
    actionLabel: 'View',
  },
  {
    id: '2',
    type: 'patient',
    title: 'Patient Checked In',
    message: 'Sarah Smith has arrived for her 2:00 PM appointment',
    time: '15m ago',
    timestamp: Date.now() - 900000,
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'New features available. Update when convenient.',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    read: true,
  },
];

export function NewAppShell({ children, title, subtitle, actions, rightSidebar, rightSidebarTitle }: Props) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const _location = useLocation();
  const { rightSidebarOpen, toggleRightSidebar } = useSidebar();
  const { toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOverlayOpen, setShortcutsOverlayOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Initialize global keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
    onOpenShortcutsOverlay: () => setShortcutsOverlayOpen(true),
    onToggleTheme: toggleTheme,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg text-foreground transition-colors">
      <SkipNav />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
        userEmail={user?.email}
      />

      {/* Notification Center */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
      />

      {/* Enhanced Command Palette - GAME CHANGER FEATURE */}
      <EnhancedCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay
        open={shortcutsOverlayOpen}
        onClose={() => setShortcutsOverlayOpen(false)}
      />

      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <CollapsibleSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header
            className="sticky top-0 z-20 border-b border-border bg-surface/70 backdrop-blur"
            role="banner"
          >
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile menu button */}
                <Button
                  variant="soft"
                  size="md"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden flex-shrink-0"
                  aria-label="Open navigation menu"
                >
                  <Icon name="menu" className="w-5 h-5" />
                </Button>

                {/* Title on mobile */}
                <div className="lg:hidden font-semibold text-foreground truncate">{title || 'Dental OS'}</div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Command Palette Trigger - GAME CHANGER */}
                <Button
                  variant="soft"
                  size="md"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="hidden md:flex items-center gap-2"
                  aria-label="Open command palette"
                >
                  <Icon name="search" className="w-5 h-5" />
                  <span className="text-xs text-muted">Search...</span>
                  <kbd className="px-1.5 py-0.5 text-xs bg-surface-hover border border-border rounded font-mono">
                    ⌘K
                  </kbd>
                </Button>

                {/* Keyboard Shortcuts Button */}
                <Button
                  variant="soft"
                  size="md"
                  onClick={() => setShortcutsOverlayOpen(true)}
                  className="hidden lg:flex"
                  aria-label="Show keyboard shortcuts"
                  title="Keyboard shortcuts (Press ?)"
                >
                  <Icon name="command" className="w-5 h-5" />
                </Button>

                {/* Theme Toggle */}
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>

                {/* Notifications */}
                <Button
                  variant="soft"
                  size="md"
                  onClick={() => setNotificationCenterOpen(true)}
                  className="relative"
                  aria-label={`Notifications${unreadCount > 0 ? ` - ${unreadCount} unread` : ''}`}
                >
                  <Icon name="bell" className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* User Menu */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
                  <div className="h-8 w-8 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 font-semibold flex items-center justify-center text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => logout()} aria-label="Logout">
                    <Icon name="logout" className="w-4 h-4" />
                  </Button>
                </div>

                {/* Right sidebar toggle (if content provided) */}
                {rightSidebar && (
                  <Button
                    variant="soft"
                    size="md"
                    onClick={toggleRightSidebar}
                    className="hidden md:flex"
                    aria-label="Toggle details panel"
                  >
                    <Icon name="info" className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main
            id="main-content"
            className="flex-1 overflow-auto"
            role="main"
            aria-label="Main content"
          >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {(title || subtitle || actions) && (
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      {title && (
                        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                      )}
                      {subtitle && (
                        <p className="text-sm text-muted mt-1">{subtitle}</p>
                      )}
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                  </div>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>

        {/* Right Sidebar */}
        {rightSidebar && rightSidebarOpen && (
          <RightSidebar title={rightSidebarTitle}>{rightSidebar}</RightSidebar>
        )}
      </div>
    </div>
  );
}
