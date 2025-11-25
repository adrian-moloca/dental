/**
 * Breadcrumb Component
 *
 * Accessible breadcrumb navigation following WCAG guidelines
 */

import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx('flex items-center gap-2 text-sm', className)}
    >
      <ol className="flex items-center gap-2 flex-wrap" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <Icon
                  name="chevronRight"
                  className="w-4 h-4 text-slate-500"
                  aria-hidden={true}
                />
              )}
              {isLast || !item.href ? (
                <span
                  className="text-slate-300 font-medium"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-slate-400 hover:text-brand-400 transition-colors"
                >
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
