/**
 * ProviderSelect Component
 *
 * Dropdown select for choosing a provider.
 * Fetches providers from the enterprise service.
 */

import { useClinicStaff } from '../../hooks/useEnterprise';

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
  const { data: providers, isLoading, isError } = useClinicStaff(clinicId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="position-relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled || isLoading || isError}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'provider-error' : undefined}
        >
          <option value="">
            {isLoading
              ? 'Se incarca medici...'
              : isError
              ? 'Eroare la incarcarea medicilor'
              : 'Selecteaza un medic'}
          </option>
          {providers?.map((provider: any) => (
            <option key={provider.id} value={provider.id}>
              {provider.firstName} {provider.lastName}
              {provider.specialization && ` - ${provider.specialization}`}
            </option>
          ))}
        </select>

        {isLoading && (
          <div className="position-absolute end-0 top-50 translate-middle-y pe-3" style={{ pointerEvents: 'none' }}>
            <div className="spinner-border spinner-border-sm text-muted" role="status">
              <span className="visually-hidden">Se incarca...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div id="provider-error" className="invalid-feedback d-block" role="alert">
          <i className="ti ti-alert-circle me-1"></i>
          {error}
        </div>
      )}

      {isError && !error && (
        <div className="form-text text-warning">
          <i className="ti ti-alert-triangle me-1"></i>
          Nu s-au putut incarca medicii. Va rugam incercati din nou.
        </div>
      )}
    </div>
  );
}
