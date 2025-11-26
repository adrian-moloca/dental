/**
 * Table Component
 *
 * Preclinic-style data table component.
 */

import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

// Table Container
export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Card style wrapper */
  card?: boolean;
}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ card = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx({ 'table-container': card }, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TableContainer.displayName = 'TableContainer';

// Table
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hover?: boolean;
  /** Bordered cells */
  bordered?: boolean;
  /** Borderless cells */
  borderless?: boolean;
  /** Small size */
  small?: boolean;
  /** Large size */
  large?: boolean;
  /** Responsive wrapper */
  responsive?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      striped = false,
      hover = false,
      bordered = false,
      borderless = false,
      small = false,
      large = false,
      responsive = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const table = (
      <table
        ref={ref}
        className={clsx(
          'table',
          {
            'table-striped': striped,
            'table-hover': hover,
            'table-bordered': bordered,
            'table-borderless': borderless,
            'table-sm': small,
            'table-lg': large,
          },
          className
        )}
        {...props}
      >
        {children}
      </table>
    );

    if (responsive) {
      return <div className="table-responsive">{table}</div>;
    }

    return table;
  }
);

Table.displayName = 'Table';

// Table Head
export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead ref={ref} className={className} {...props}>
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

// Table Body
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

// Table Row
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Row variant color */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Selected state */
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ variant, selected, className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={clsx(
          {
            [`table-${variant}`]: variant,
            'table-primary': selected,
          },
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

// Table Header Cell
export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Sortable column */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Sort click handler */
  onSort?: () => void;
}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ sortable, sortDirection, onSort, className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={clsx(
          {
            sortable,
            'sorted-asc': sortDirection === 'asc',
            'sorted-desc': sortDirection === 'desc',
          },
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        {children}
        {sortable && (
          <i
            className={clsx('sort-icon ti', {
              'ti-arrows-sort': !sortDirection,
              'ti-sort-ascending': sortDirection === 'asc',
              'ti-sort-descending': sortDirection === 'desc',
            })}
          ></i>
        )}
      </th>
    );
  }
);

TableHeaderCell.displayName = 'TableHeaderCell';

// Table Cell
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td ref={ref} className={className} {...props}>
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

// Table Actions Cell
export interface TableActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const TableActions = forwardRef<HTMLDivElement, TableActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('table-actions', className)} {...props}>
        {children}
      </div>
    );
  }
);

TableActions.displayName = 'TableActions';

// Table Action Button
export interface ActionButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /** Icon class */
  icon: string;
  /** Button type */
  actionType?: 'view' | 'edit' | 'delete' | 'default';
  /** Tooltip text */
  tooltip?: string;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, actionType = 'default', tooltip, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx('action-btn', `action-${actionType}`, className)}
        title={tooltip}
        {...props}
      >
        <i className={icon}></i>
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

// Table User Cell
export interface TableUserProps extends HTMLAttributes<HTMLDivElement> {
  /** User name */
  name: string;
  /** Secondary text (email, role, etc) */
  subtitle?: string;
  /** Avatar URL or null for initials */
  avatar?: string | null;
}

export const TableUser = forwardRef<HTMLDivElement, TableUserProps>(
  ({ name, subtitle, avatar, className, ...props }, ref) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div ref={ref} className={clsx('table-user', className)} {...props}>
        <div className="user-avatar">
          {avatar ? <img src={avatar} alt={name} /> : <span>{initials}</span>}
        </div>
        <div className="user-info">
          <h6>{name}</h6>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
    );
  }
);

TableUser.displayName = 'TableUser';

// Empty State
export interface TableEmptyProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon class */
  icon?: string;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: ReactNode;
}

export const TableEmpty = forwardRef<HTMLDivElement, TableEmptyProps>(
  (
    {
      icon = 'ti ti-database-off',
      title = 'No data found',
      description = 'There are no records to display.',
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('table-empty', className)} {...props}>
        <div className="empty-icon">
          <i className={icon}></i>
        </div>
        <h5>{title}</h5>
        <p>{description}</p>
        {action}
      </div>
    );
  }
);

TableEmpty.displayName = 'TableEmpty';

// DataTable Header
export interface DataTableHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Title */
  title?: string;
  /** Subtitle/count */
  subtitle?: string;
  /** Search component */
  search?: ReactNode;
  /** Action buttons */
  actions?: ReactNode;
}

export const DataTableHeader = forwardRef<HTMLDivElement, DataTableHeaderProps>(
  ({ title, subtitle, search, actions, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('datatable-header', className)} {...props}>
        {(title || subtitle) && (
          <div className="datatable-title">
            {title && <h5>{title}</h5>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
        {search && <div className="datatable-search">{search}</div>}
        {actions && <div className="datatable-actions">{actions}</div>}
        {children}
      </div>
    );
  }
);

DataTableHeader.displayName = 'DataTableHeader';

// DataTable Footer
export interface DataTableFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Info text */
  info?: string;
}

export const DataTableFooter = forwardRef<HTMLDivElement, DataTableFooterProps>(
  ({ info, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('datatable-footer', className)} {...props}>
        {info && <div className="datatable-info">{info}</div>}
        {children}
      </div>
    );
  }
);

DataTableFooter.displayName = 'DataTableFooter';

// Pagination
export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Show first/last buttons */
  showFirstLast?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className={className}>
      <ul className="pagination">
        {showFirstLast && (
          <li className={clsx('page-item', { disabled: currentPage === 1 })}>
            <button
              className="page-link"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <i className="ti ti-chevrons-left"></i>
            </button>
          </li>
        )}
        <li className={clsx('page-item', { disabled: currentPage === 1 })}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="ti ti-chevron-left"></i>
          </button>
        </li>
        {pages.map((page) => (
          <li key={page} className={clsx('page-item', { active: page === currentPage })}>
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={clsx('page-item', { disabled: currentPage === totalPages })}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="ti ti-chevron-right"></i>
          </button>
        </li>
        {showFirstLast && (
          <li className={clsx('page-item', { disabled: currentPage === totalPages })}>
            <button
              className="page-link"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <i className="ti ti-chevrons-right"></i>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Table;
