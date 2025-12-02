/**
 * FilterDropdown Component
 *
 * Preclinic-style filter dropdown with search, checkboxes, and action buttons.
 * Matches the template pattern from preclinic-template.
 */

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  forwardRef,
} from 'react';
import clsx from 'clsx';

// Filter Option Type
export interface FilterOption {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Optional avatar URL */
  avatar?: string;
  /** Optional secondary text */
  subtitle?: string;
}

// Filter Dropdown Props
export interface FilterDropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Filter label */
  label: string;
  /** Available options */
  options: FilterOption[];
  /** Selected values */
  selectedValues: string[];
  /** Change handler */
  onChange: (values: string[]) => void;
  /** Show search input */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Show reset link */
  showReset?: boolean;
  /** Reset link text */
  resetText?: string;
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom render for option */
  renderOption?: (option: FilterOption) => ReactNode;
}

export const FilterDropdown = forwardRef<HTMLDivElement, FilterDropdownProps>(
  (
    {
      options,
      selectedValues,
      onChange,
      searchable = true,
      searchPlaceholder = 'Cauta...',
      multiple = true,
      placeholder = 'Selecteaza',
      disabled = false,
      renderOption,
      className,
      ...props
    },
    _ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedValues, setTempSelectedValues] = useState<string[]>(selectedValues);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync temp values when selectedValues changes
    useEffect(() => {
      setTempSelectedValues(selectedValues);
    }, [selectedValues]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
          // Reset temp values if closed without applying
          setTempSelectedValues(selectedValues);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedValues]);

    // Filter options based on search term
    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle option toggle
    const handleOptionToggle = (value: string) => {
      if (multiple) {
        setTempSelectedValues((prev) =>
          prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value]
        );
      } else {
        setTempSelectedValues([value]);
      }
    };

    // Handle apply
    const handleApply = () => {
      onChange(tempSelectedValues);
      setIsOpen(false);
      setSearchTerm('');
    };

    // Handle cancel
    const handleCancel = () => {
      setTempSelectedValues(selectedValues);
      setIsOpen(false);
      setSearchTerm('');
    };


    // Get display text
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find((o) => o.value === selectedValues[0]);
        return option?.label || placeholder;
      }
      return `${selectedValues.length} selectate`;
    };

    // Default option renderer
    const defaultRenderOption = (option: FilterOption) => (
      <>
        {option.avatar && (
          <span className="avatar avatar-xs rounded-circle me-2">
            <img src={option.avatar} className="flex-shrink-0 rounded-circle" alt={option.label} />
          </span>
        )}
        <span>
          {option.label}
          {option.subtitle && (
            <small className="d-block text-muted">{option.subtitle}</small>
          )}
        </span>
      </>
    );

    return (
      <div ref={dropdownRef} className={clsx('dropdown', className)} {...props}>
        <button
          type="button"
          className={clsx(
            'dropdown-toggle btn bg-white d-flex align-items-center justify-content-start',
            'fs-13 p-2 fw-normal border',
            { disabled }
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled) setIsOpen(!isOpen);
            } else if (e.key === 'Escape' && isOpen) {
              setIsOpen(false);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          disabled={disabled}
        >
          {getDisplayText()}
          <i className="ti ti-chevron-down ms-auto" aria-hidden="true" />
        </button>

        <div
          className={clsx(
            'dropdown-menu shadow-lg w-100 dropdown-info p-3',
            { show: isOpen }
          )}
          style={{ minWidth: 280 }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="mb-3">
              <div className="input-icon-start input-icon position-relative">
                <span className="input-icon-addon fs-12">
                  <i className="ti ti-search" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-md ps-5"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <ul className="mb-3 list-unstyled" style={{ maxHeight: 200, overflowY: 'auto' }} role="listbox" aria-multiselectable={multiple}>
            {filteredOptions.length === 0 ? (
              <li className="text-center py-2" style={{ color: 'var(--gray-500, #6c757d)' }}>
                Niciun rezultat gasit
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value} className="mb-1">
                  <label
                    className="dropdown-item px-2 d-flex align-items-center"
                    style={{
                      color: 'var(--gray-900, #111827)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      className="form-check-input m-0 me-2"
                      type={multiple ? 'checkbox' : 'radio'}
                      checked={tempSelectedValues.includes(option.value)}
                      onChange={() => handleOptionToggle(option.value)}
                      role="option"
                      aria-selected={tempSelectedValues.includes(option.value)}
                    />
                    {renderOption ? renderOption(option) : defaultRenderOption(option)}
                  </label>
                </li>
              ))
            )}
          </ul>

          {/* Action Buttons */}
          <div className="row g-2">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleCancel}
              >
                Anuleaza
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleApply}
              >
                Selecteaza
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FilterDropdown.displayName = 'FilterDropdown';

// Filter Panel Component
export interface FilterPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Panel title */
  title?: string;
  /** Clear all handler */
  onClearAll?: () => void;
  /** Clear all text */
  clearAllText?: string;
  /** Apply handler */
  onApply?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Children - filter fields */
  children: ReactNode;
}

export const FilterPanel = forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      title = 'Filtre',
      onClearAll,
      clearAllText = 'Sterge tot',
      onApply,
      onClose,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx('dropdown-menu dropdown-lg dropdown-menu-end filter-dropdown p-0', className)}
        {...props}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
          <h5 className="mb-0 fw-bold">{title}</h5>
          {onClearAll && (
            <button
              type="button"
              className="btn btn-link link-danger text-decoration-underline p-0"
              onClick={onClearAll}
            >
              {clearAllText}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="filter-body p-3 pb-0">
          {children}
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-end border-top p-3 gap-2">
          {onClose && (
            <button
              type="button"
              className="btn btn-light btn-md fw-medium"
              onClick={onClose}
            >
              Inchide
            </button>
          )}
          {onApply && (
            <button
              type="button"
              className="btn btn-primary btn-md fw-medium"
              onClick={onApply}
            >
              Filtreaza
            </button>
          )}
        </div>
      </div>
    );
  }
);

FilterPanel.displayName = 'FilterPanel';

// Filter Field Component
export interface FilterFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label: string;
  /** Show reset link */
  showReset?: boolean;
  /** Reset handler */
  onReset?: () => void;
  /** Reset text */
  resetText?: string;
  /** Children - filter input */
  children: ReactNode;
}

export const FilterField = forwardRef<HTMLDivElement, FilterFieldProps>(
  (
    {
      label,
      showReset = true,
      onReset,
      resetText = 'Reset',
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('mb-3', className)} {...props}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <label className="form-label mb-0">{label}</label>
          {showReset && onReset && (
            <button
              type="button"
              className="btn btn-link link-primary p-0 fs-13"
              onClick={onReset}
            >
              {resetText}
            </button>
          )}
        </div>
        {children}
      </div>
    );
  }
);

FilterField.displayName = 'FilterField';

// Quick Filters (inline buttons/badges)
export interface QuickFilter {
  value: string;
  label: string;
  count?: number;
}

export interface QuickFiltersProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Filter options */
  filters: QuickFilter[];
  /** Active filter value */
  activeFilter?: string;
  /** Change handler */
  onChange: (value: string | undefined) => void;
  /** Allow clearing */
  allowClear?: boolean;
}

export const QuickFilters = forwardRef<HTMLDivElement, QuickFiltersProps>(
  ({ filters, activeFilter, onChange, allowClear = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('d-flex flex-wrap gap-2', className)} {...props}>
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={clsx(
              'btn btn-sm',
              activeFilter === filter.value
                ? 'btn-primary'
                : 'btn-outline-secondary'
            )}
            onClick={() => {
              if (activeFilter === filter.value && allowClear) {
                onChange(undefined);
              } else {
                onChange(filter.value);
              }
            }}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className="badge bg-white text-dark ms-1">{filter.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  }
);

QuickFilters.displayName = 'QuickFilters';

export default FilterDropdown;
