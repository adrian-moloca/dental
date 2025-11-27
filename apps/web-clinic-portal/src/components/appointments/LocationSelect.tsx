/**
 * LocationSelect Component
 *
 * Dropdown select for choosing a clinic location (treatment room/chair).
 * Fetches locations from the enterprise service.
 */

import { useLocations } from '../../hooks/useEnterprise';
import type { ClinicLocation } from '../../api/enterpriseClient';

interface LocationSelectProps {
  value?: string;
  onChange: (locationId: string) => void;
  clinicId?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  filterType?: string; // Filter by location type (e.g., 'TREATMENT_ROOM')
}

export function LocationSelect({
  value,
  onChange,
  clinicId,
  label,
  error,
  required,
  disabled,
  filterType,
}: LocationSelectProps) {
  const { data: locationsData, isLoading, isError } = useLocations(clinicId);

  // Filter locations by type if specified
  const locations: ClinicLocation[] = filterType
    ? (locationsData || []).filter((loc) => loc.type === filterType)
    : locationsData || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const formatLocationName = (location: ClinicLocation) => {
    let name = location.name;
    if (location.floor) {
      name += ` (Etaj ${location.floor})`;
    }
    return name;
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
          disabled={disabled || isLoading || isError || !clinicId}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'location-error' : undefined}
        >
          <option value="">
            {!clinicId
              ? 'Selecteaza mai intai o clinica'
              : isLoading
              ? 'Se incarca locatii...'
              : isError
              ? 'Eroare la incarcarea locatiilor'
              : locations && locations.length === 0
              ? 'Nicio locatie disponibila'
              : 'Selecteaza o locatie'}
          </option>
          {locations?.map((location) => (
            <option key={location.id} value={location.id}>
              {formatLocationName(location)}
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
        <div id="location-error" className="invalid-feedback d-block" role="alert">
          <i className="ti ti-alert-circle me-1"></i>
          {error}
        </div>
      )}

      {isError && !error && (
        <div className="form-text text-warning">
          <i className="ti ti-alert-triangle me-1"></i>
          Nu s-au putut incarca locatiile. Va rugam incercati din nou.
        </div>
      )}
    </div>
  );
}
