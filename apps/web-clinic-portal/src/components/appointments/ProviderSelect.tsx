/**
 * ProviderSelect Component
 *
 * Dropdown select for choosing a provider.
 * Fetches providers from the enterprise service.
 */

import { useClinicProviders } from '../../hooks/useEnterprise';
import { Icon } from '../ui/Icon';
import clsx from 'clsx';

interface ProviderSelectProps {
  value?: string;
  onChange: (providerId: string) => void;
  clinicId?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ProviderSelect({
  value,
  onChange,
  clinicId,
  label,
  error,
  required,
  disabled,
}: ProviderSelectProps) {
  const { data: providers, isLoading, isError } = useClinicProviders(clinicId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2 text-sm">
      {label && (
        <label className="block text-[var(--foreground)] font-medium">
          {label}
          {required && (
            <span className="text-red-400 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled || isLoading || isError}
          className={clsx(
            'w-full rounded-lg border bg-[#1F1F2D] px-3 py-2 pr-10 text-[#F4EFF0] placeholder:text-slate-400 transition-all duration-200',
            'focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'appearance-none',
            error && 'border-red-500/70 focus:ring-red-500',
            !error && 'border-[var(--border)]',
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'provider-error' : undefined}
        >
          <option value="">
            {isLoading
              ? 'Loading providers...'
              : isError
              ? 'Error loading providers'
              : 'Select a provider'}
          </option>
          {providers?.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.firstName} {provider.lastName}
              {provider.specialization && ` - ${provider.specialization}`}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Icon name="spinner" className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {error && (
        <span id="provider-error" className="flex items-center gap-1 text-xs text-red-400" role="alert">
          <Icon name="exclamation" className="w-3 h-3" aria-hidden="true" />
          {error}
        </span>
      )}

      {isError && !error && (
        <span className="text-xs text-amber-400">
          Unable to load providers. Please try again.
        </span>
      )}
    </div>
  );
}
