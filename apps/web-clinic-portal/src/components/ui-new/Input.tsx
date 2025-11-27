/**
 * Input Component
 *
 * Preclinic-style form input components.
 */

import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

type InputSize = 'sm' | 'md' | 'lg';

// Text Input
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input size */
  inputSize?: InputSize;
  /** Label text */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Show success state */
  success?: boolean;
  /** Left icon */
  icon?: string;
  /** Right icon */
  iconRight?: string;
  /** Full width */
  block?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      label,
      helperText,
      error,
      success,
      icon,
      iconRight,
      block = true,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const sizeClass = inputSize === 'md' ? '' : `form-control-${inputSize}`;

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'form-control',
          sizeClass,
          {
            'is-invalid': error,
            'is-valid': success,
          },
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        required={required}
        {...props}
      />
    );

    const content = icon || iconRight ? (
      <div className="input-group">
        {icon && (
          <span className="input-group-text">
            <i className={icon}></i>
          </span>
        )}
        {inputElement}
        {iconRight && (
          <span className="input-group-text">
            <i className={iconRight}></i>
          </span>
        )}
      </div>
    ) : (
      inputElement
    );

    if (!label && !helperText && !error) {
      return content;
    }

    return (
      <div className={clsx('form-group', { 'w-100': block })}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {content}
        {error && (
          <div id={`${inputId}-error`} className="invalid-feedback d-flex align-items-center gap-1" style={{ display: 'block' }}>
            <i className="ti ti-alert-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && (
          <small id={`${inputId}-helper`} className="form-text text-muted">
            {helperText}
          </small>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Full width */
  block?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, block = true, className, id, required, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const textareaElement = (
      <textarea
        ref={ref}
        id={inputId}
        className={clsx('form-control', { 'is-invalid': error }, className)}
        aria-invalid={error ? 'true' : undefined}
        required={required}
        {...props}
      />
    );

    if (!label && !helperText && !error) {
      return textareaElement;
    }

    return (
      <div className={clsx('form-group', { 'w-100': block })}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {textareaElement}
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

Textarea.displayName = 'Textarea';

// Password Input with toggle
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'iconRight'> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, helperText, error, success, icon, block = true, id, required, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        type={showPassword ? 'text' : 'password'}
        className={clsx(
          'form-control',
          {
            'is-invalid': error,
            'is-valid': success,
          },
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        required={required}
        {...props}
      />
    );

    const content = (
      <div className="input-group">
        {icon && (
          <span className="input-group-text">
            <i className={icon}></i>
          </span>
        )}
        {inputElement}
        <button
          type="button"
          className="input-group-text"
          onClick={togglePassword}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
        >
          <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
        </button>
      </div>
    );

    if (!label && !helperText && !error) {
      return content;
    }

    return (
      <div className={clsx('form-group', { 'w-100': block })}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {content}
        {error && (
          <div id={`${inputId}-error`} className="invalid-feedback d-flex align-items-center gap-1" style={{ display: 'block' }}>
            <i className="ti ti-alert-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && (
          <small id={`${inputId}-helper`} className="form-text text-muted">
            {helperText}
          </small>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// Search Input
export interface SearchInputProps extends Omit<InputProps, 'type' | 'icon'> {
  /** Callback when clear button is clicked */
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, value, className, ...props }, ref) => {
    return (
      <div className="search-input-wrapper">
        <i className="ti ti-search search-icon"></i>
        <Input
          ref={ref}
          type="search"
          value={value}
          className={clsx('ps-5', className)}
          {...props}
        />
        {value && onClear && (
          <button type="button" className="clear-btn" onClick={onClear}>
            <i className="ti ti-x"></i>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default Input;
