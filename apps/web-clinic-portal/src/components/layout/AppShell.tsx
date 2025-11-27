/**
 * AppShell Component
 *
 * Main application layout wrapper that includes:
 * - Skip to content link (WCAG 2.4.1)
 * - Sidebar navigation
 * - Header/Topbar
 * - Page content area with proper landmarks
 * - Responsive behavior
 *
 * WCAG 2.1 AA Compliance:
 * - WCAG 2.4.1: Bypass Blocks (skip navigation link)
 * - WCAG 1.3.1: Info and Relationships (semantic HTML, landmarks)
 * - WCAG 2.4.6: Headings and Labels (proper heading hierarchy)
 *
 * Based on Preclinic template design.
 */

import type { ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from '@/components/ui-new';
import type { BreadcrumbItem } from '@/components/ui-new/Breadcrumbs';
import clsx from 'clsx';

interface AppShellProps {
  children: ReactNode;
  /** Page title displayed in the header area */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Action buttons displayed in the header area */
  actions?: ReactNode;
  /** Breadcrumb items for navigation */
  breadcrumbs?: BreadcrumbItem[];
}

export function AppShell({ children, title, subtitle, actions, breadcrumbs }: AppShellProps) {
  const { isMiniSidebar, isSidebarHidden } = useSidebar();

  return (
    <div
      className={clsx('main-wrapper', {
        'mini-sidebar': isMiniSidebar,
        'hidden-layout': isSidebarHidden,
      })}
    >
      {/* Skip to main content link - WCAG 2.4.1 */}
      <a href="#main-content" className="skip-to-main-content">
        Sari la continut
      </a>

      <Sidebar />
      <div className="page-wrapper">
        <Header />
        {/* Main landmark with proper ID for skip link */}
        <main id="main-content" className="page-content" aria-label="Continut principal">
          <div className="page-container">
            {/* Breadcrumbs Navigation */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="mb-3">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            )}

            {/* Page Header (optional) */}
            {(title || subtitle || actions) && (
              <div className="page-header" role="region" aria-label="Antet pagina">
                <div className="page-title">
                  {/* Ensure heading hierarchy: h1 for page title */}
                  {title && <h1 className="h4">{title}</h1>}
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
