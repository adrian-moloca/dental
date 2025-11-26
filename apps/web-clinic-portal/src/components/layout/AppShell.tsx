/**
 * AppShell Component
 *
 * Main application layout wrapper that includes:
 * - Sidebar navigation
 * - Header/Topbar
 * - Page content area
 * - Responsive behavior
 *
 * Based on Preclinic template design.
 */

import type { ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import clsx from 'clsx';

interface AppShellProps {
  children: ReactNode;
  /** Page title displayed in the header area */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Action buttons displayed in the header area */
  actions?: ReactNode;
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const { isMiniSidebar, isSidebarHidden } = useSidebar();

  return (
    <div
      className={clsx('main-wrapper', {
        'mini-sidebar': isMiniSidebar,
        'hidden-layout': isSidebarHidden,
      })}
    >
      <Sidebar />
      <div className="page-wrapper">
        <Header />
        <main className="page-content">
          <div className="page-container">
            {/* Page Header (optional) */}
            {(title || subtitle || actions) && (
              <div className="page-header">
                <div className="page-title">
                  {title && <h4>{title}</h4>}
                  {subtitle && <p>{subtitle}</p>}
                </div>
                {actions && <div className="page-actions">{actions}</div>}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
