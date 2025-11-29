/**
 * ViewToggle Component
 *
 * Toggle between list and grid views, matching preclinic-template pattern.
 */

import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ViewMode = 'list' | 'grid';

export interface ViewToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current view mode */
  value: ViewMode;
  /** Change handler */
  onChange: (mode: ViewMode) => void;
  /** List icon */
  listIcon?: string;
  /** Grid icon */
  gridIcon?: string;
  /** List tooltip */
  listTooltip?: string;
  /** Grid tooltip */
  gridTooltip?: string;
}

export const ViewToggle = forwardRef<HTMLDivElement, ViewToggleProps>(
  (
    {
      value,
      onChange,
      listIcon = 'ti ti-list',
      gridIcon = 'ti ti-layout-grid',
      listTooltip = 'Vezi ca lista',
      gridTooltip = 'Vezi ca grila',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white border shadow-sm rounded px-1 pb-0 d-flex align-items-center justify-content-center',
          className
        )}
        {...props}
      >
        <button
          type="button"
          className={clsx(
            'rounded p-1 d-flex align-items-center justify-content-center border-0',
            value === 'list' ? 'bg-light' : 'bg-white'
          )}
          onClick={() => onChange('list')}
          title={listTooltip}
        >
          <i className={clsx(listIcon, 'fs-14', value === 'list' ? 'text-dark' : 'text-body')} />
        </button>
        <button
          type="button"
          className={clsx(
            'rounded p-1 d-flex align-items-center justify-content-center border-0',
            value === 'grid' ? 'bg-light' : 'bg-white'
          )}
          onClick={() => onChange('grid')}
          title={gridTooltip}
        >
          <i className={clsx(gridIcon, 'fs-14', value === 'grid' ? 'text-dark' : 'text-body')} />
        </button>
      </div>
    );
  }
);

ViewToggle.displayName = 'ViewToggle';

// Sort Dropdown Component
export interface SortOption {
  value: string;
  label: string;
}

export interface SortDropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Sort options */
  options: SortOption[];
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Label prefix */
  labelPrefix?: string;
}

export const SortDropdown = forwardRef<HTMLDivElement, SortDropdownProps>(
  (
    {
      options,
      value,
      onChange,
      labelPrefix = 'Sorteaza:',
      className,
      ...props
    },
    ref
  ) => {
    const selectedOption = options.find((o) => o.value === value);

    return (
      <div ref={ref} className={clsx('dropdown', className)} {...props}>
        <button
          type="button"
          className="dropdown-toggle btn bg-white btn-md d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14"
          data-bs-toggle="dropdown"
        >
          <span className="me-1">{labelPrefix}</span>
          <span className="fw-medium">{selectedOption?.label || 'Selecteaza'}</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end p-2">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={clsx('dropdown-item rounded-1', {
                  active: value === option.value,
                })}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

SortDropdown.displayName = 'SortDropdown';

// Export Dropdown Component
export interface ExportOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ExportDropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Export options */
  options?: ExportOption[];
  /** Select handler */
  onSelect: (value: string) => void;
  /** Button label */
  label?: string;
  /** Button icon */
  icon?: string;
}

const defaultExportOptions: ExportOption[] = [
  { value: 'pdf', label: 'Descarca ca PDF', icon: 'ti ti-file-type-pdf' },
  { value: 'excel', label: 'Descarca ca Excel', icon: 'ti ti-file-spreadsheet' },
  { value: 'csv', label: 'Descarca ca CSV', icon: 'ti ti-file-type-csv' },
];

export const ExportDropdown = forwardRef<HTMLDivElement, ExportDropdownProps>(
  (
    {
      options = defaultExportOptions,
      onSelect,
      label = 'Export',
      icon = 'ti ti-download',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('dropdown', className)} {...props}>
        <button
          type="button"
          className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
          data-bs-toggle="dropdown"
        >
          {icon && <i className={clsx(icon, 'me-1')} />}
          {label}
          <i className="ti ti-chevron-down ms-2" />
        </button>
        <ul className="dropdown-menu p-2">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center"
                onClick={() => onSelect(option.value)}
              >
                {option.icon && <i className={clsx(option.icon, 'me-2')} />}
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

ExportDropdown.displayName = 'ExportDropdown';

// Page Header Actions Wrapper
export interface PageHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageHeaderActions = forwardRef<HTMLDivElement, PageHeaderActionsProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('text-end d-flex gap-2', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PageHeaderActions.displayName = 'PageHeaderActions';

export default ViewToggle;
