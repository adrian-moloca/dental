import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';
import { MobileMenu } from './MobileMenu';
import { Button } from '../ui/Button';
import { SkipNav } from '../a11y/SkipNav';
import { Icon } from '../ui/Icon';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function AppShell({ children, title, subtitle, actions }: Props) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SkipNav />
      <div
        className="fixed inset-0 bg-[radial-gradient(circle_at_5%_10%,rgba(24,106,175,0.06),transparent_25%),radial-gradient(circle_at_90%_20%,rgba(84,179,215,0.08),transparent_25%)]"
        aria-hidden={true}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
        userEmail={user?.email}
      />

      <div className="relative flex min-h-screen">
        <SidebarNav />

        <div className="flex-1">
          <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

          <main
            id="main-content"
            className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
            role="main"
            aria-label="Main content"
          >
            {(title || subtitle || actions) && (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title && <h1 className="text-2xl font-semibold text-[var(--foreground)]">{title}</h1>}
                  {subtitle && <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {actions}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="text-right leading-tight">
                      <div className="text-[var(--foreground)] font-semibold">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email ?? 'Signed in'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {user?.roles?.[0] || 'User'} • {location.pathname.replace('/', '') || 'dashboard'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => logout()}
                      aria-label="Logout from application"
                    >
                      <Icon name="logout" className="w-4 h-4 sm:mr-1" aria-hidden={true} />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
