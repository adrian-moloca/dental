/**
 * PageHeader Component
 *
 * Reusable page header with title, subtitle, breadcrumbs, and action buttons.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="breadcrumb-wrapper">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/dashboard">
                  <i className="ti ti-home"></i>
                </Link>
              </li>
              {breadcrumbs.map((item, index) => (
                <li
                  key={index}
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                  aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {item.path && index !== breadcrumbs.length - 1 ? (
                    <Link to={item.path}>{item.label}</Link>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h4>{title}</h4>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>

      {/* Additional Header Content */}
      {children}
    </>
  );
}

export default PageHeader;
