/**
 * Breadcrumb Component
 *
 * Navigation breadcrumb component for showing current location in the app hierarchy.
 */

import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link URL (optional for current page) */
  href?: string;
  /** Icon class (optional) */
  icon?: string;
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator */
  separator?: ReactNode;
  /** Additional class name */
  className?: string;
}

export function Breadcrumb({
  items,
  separator = <i className="ti ti-chevron-right text-muted"></i>,
  className,
}: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className={clsx('breadcrumb-nav', className)}>
      <ol className="breadcrumb mb-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={clsx('breadcrumb-item', { active: isLast })}
              aria-current={isLast ? 'page' : undefined}
            >
              {isLast || !item.href ? (
                <span className="d-flex align-items-center gap-1">
                  {item.icon && <i className={`${item.icon} fs-14`}></i>}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="d-flex align-items-center gap-1 text-decoration-none"
                >
                  {item.icon && <i className={`${item.icon} fs-14`}></i>}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
