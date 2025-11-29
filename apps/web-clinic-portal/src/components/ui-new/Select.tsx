/**
 * Select Component
 *
 * Preclinic-style form select/dropdown component.
 * Supports both native select and custom dropdown with search.
 */

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

// Option type
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  avatar?: string;
  subtitle?: string;
}

// Native Select Props
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Options array */
  options: SelectOption[];
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Full width */
  block?: boolean;
  /** Placeholder option */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      helperText,
      error,
      block = true,
      placeholder,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const selectElement = (
      <select
        ref={ref}
        id={selectId}
        className={clsx('form-select', { 'is-invalid': error }, className)}
        aria-invalid={error ? 'true' : undefined}
        required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );

    if (!label && !helperText && !error) {
      return selectElement;
    }

    return (
      <div className={clsx('form-group', { 'w-100': block })}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {selectElement}
        {error && (
          <div className="invalid-feedback d-flex align-items-center gap-1" style={{ display: 'block' }}>
            <i className="ti ti-alert-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && <small className="form-text text-muted">{helperText}</small>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Searchable Select Props
export interface SearchableSelectProps {
  /** Options array */
  options: SelectOption[];
  /** Selected value */
  value?: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Placeholder */
  placeholder?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  block?: boolean;
  /** Required */
  required?: boolean;
  /** Custom option render */
  renderOption?: (option: SelectOption) => ReactNode;
  /** Allow clearing */
  clearable?: boolean;
  /** ID */
  id?: string;
  /** className */
  className?: string;
}

export const SearchableSelect = forwardRef<HTMLDivElement, SearchableSelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      helperText,
      error,
      placeholder = 'Selecteaza...',
      searchPlaceholder = 'Cauta...',
      disabled = false,
      block = true,
      required = false,
      renderOption,
      clearable = false,
      id,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputId = id || `searchable-select-${Math.random().toString(36).substr(2, 9)}`;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected option
    const selectedOption = options.find((o) => o.value === value);

    // Filter options
    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle select
    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setIsOpen(false);
    };

    // Default option renderer
    const defaultRenderOption = (option: SelectOption) => (
      <div className="d-flex align-items-center">
        {option.avatar && (
          <span className="avatar avatar-xs rounded-circle me-2">
            <img src={option.avatar} className="flex-shrink-0 rounded-circle" alt={option.label} />
          </span>
        )}
        <div>
          <span className="fw-medium">{option.label}</span>
          {option.subtitle && (
            <small className="d-block text-muted">{option.subtitle}</small>
          )}
        </div>
      </div>
    );

    const selectContent = (
      <div ref={dropdownRef} className={clsx('dropdown', className)}>
        <button
          type="button"
          className={clsx(
            'form-select text-start d-flex align-items-center',
            { 'is-invalid': error }
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          disabled={disabled}
          id={inputId}
        >
          <span className={clsx('flex-grow-1', { 'text-muted': !selectedOption })}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {clearable && selectedOption && (
            <i
              className="ti ti-x text-muted me-2"
              onClick={handleClear}
              style={{ cursor: 'pointer' }}
            />
          )}
        </button>

        <div
          className={clsx('dropdown-menu shadow-lg w-100 p-0', { show: isOpen })}
          style={{ minWidth: 200 }}
        >
          {/* Search Input */}
          <div className="p-2 border-bottom">
            <div className="input-icon-start input-icon position-relative">
              <span className="input-icon-addon fs-12">
                <i className="ti ti-search" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm ps-5"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <ul className="list-unstyled m-0" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-muted text-center">
                Niciun rezultat gasit
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={clsx(
                      'dropdown-item py-2 px-3',
                      { active: value === option.value },
                      { disabled: option.disabled }
                    )}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                  >
                    {renderOption ? renderOption(option) : defaultRenderOption(option)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    );

    if (!label && !helperText && !error) {
      return selectContent;
    }

    return (
      <div className={clsx('form-group', { 'w-100': block })} ref={ref}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {selectContent}
        {error && (
          <div className="invalid-feedback d-flex align-items-center gap-1" style={{ display: 'block' }}>
            <i className="ti ti-alert-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && <small className="form-text text-muted">{helperText}</small>}
      </div>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';

// Multi-Select Props
export interface MultiSelectProps {
  /** Options array */
  options: SelectOption[];
  /** Selected values */
  value: string[];
  /** Change handler */
  onChange: (values: string[]) => void;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Placeholder */
  placeholder?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  block?: boolean;
  /** Required */
  required?: boolean;
  /** Max visible tags */
  maxTags?: number;
  /** ID */
  id?: string;
  /** className */
  className?: string;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      helperText,
      error,
      placeholder = 'Selecteaza...',
      searchPlaceholder = 'Cauta...',
      disabled = false,
      block = true,
      required = false,
      maxTags = 3,
      id,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputId = id || `multi-select-${Math.random().toString(36).substr(2, 9)}`;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected options
    const selectedOptions = options.filter((o) => value.includes(o.value));

    // Filter options
    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle toggle
    const handleToggle = (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    // Handle remove tag
    const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== optionValue));
    };

    const selectContent = (
      <div ref={dropdownRef} className={clsx('dropdown', className)}>
        <div
          className={clsx(
            'form-select d-flex flex-wrap align-items-center gap-1 h-auto min-h-38',
            { 'is-invalid': error, 'pe-none opacity-75': disabled }
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 38, paddingTop: 6, paddingBottom: 6 }}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-muted">{placeholder}</span>
          ) : (
            <>
              {selectedOptions.slice(0, maxTags).map((option) => (
                <span
                  key={option.value}
                  className="badge bg-primary-transparent text-primary d-inline-flex align-items-center gap-1"
                >
                  {option.label}
                  <i
                    className="ti ti-x fs-12"
                    onClick={(e) => handleRemoveTag(option.value, e)}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              ))}
              {selectedOptions.length > maxTags && (
                <span className="badge bg-secondary-transparent text-secondary">
                  +{selectedOptions.length - maxTags}
                </span>
              )}
            </>
          )}
        </div>

        <div
          className={clsx('dropdown-menu shadow-lg w-100 p-0', { show: isOpen })}
          style={{ minWidth: 200 }}
        >
          {/* Search Input */}
          <div className="p-2 border-bottom">
            <div className="input-icon-start input-icon position-relative">
              <span className="input-icon-addon fs-12">
                <i className="ti ti-search" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm ps-5"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <ul className="list-unstyled m-0" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-muted text-center">
                Niciun rezultat gasit
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <label
                    className={clsx(
                      'dropdown-item py-2 px-3 d-flex align-items-center',
                      { disabled: option.disabled }
                    )}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-2 m-0"
                      checked={value.includes(option.value)}
                      onChange={() => !option.disabled && handleToggle(option.value)}
                      disabled={option.disabled}
                    />
                    {option.avatar && (
                      <span className="avatar avatar-xs rounded-circle me-2">
                        <img src={option.avatar} className="flex-shrink-0 rounded-circle" alt={option.label} />
                      </span>
                    )}
                    <span>{option.label}</span>
                  </label>
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          <div className="border-top p-2 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0"
              onClick={() => onChange([])}
            >
              Sterge tot
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setIsOpen(false)}
            >
              Gata
            </button>
          </div>
        </div>
      </div>
    );

    if (!label && !helperText && !error) {
      return selectContent;
    }

    return (
      <div className={clsx('form-group', { 'w-100': block })} ref={ref}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {selectContent}
        {error && (
          <div className="invalid-feedback d-flex align-items-center gap-1" style={{ display: 'block' }}>
            <i className="ti ti-alert-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && <small className="form-text text-muted">{helperText}</small>}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export default Select;
