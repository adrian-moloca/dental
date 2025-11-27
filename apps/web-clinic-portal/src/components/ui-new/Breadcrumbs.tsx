/**
 * Breadcrumbs Component
 *
 * Navigation breadcrumbs to show current page location in the hierarchy.
 * Automatically integrated into AppShell for consistent navigation.
 */

import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="breadcrumb mb-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.path && !isLast ? (
                <Link to={item.path} className="text-decoration-none">
                  {item.icon && <i className={`${item.icon} me-1`}></i>}
                  {item.label}
                </Link>
              ) : (
                <span>
                  {item.icon && <i className={`${item.icon} me-1`}></i>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
