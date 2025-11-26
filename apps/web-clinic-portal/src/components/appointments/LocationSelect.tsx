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
      name += ` (Floor ${location.floor})`;
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
              ? 'Select a clinic first'
              : isLoading
              ? 'Loading locations...'
              : isError
              ? 'Error loading locations'
              : locations && locations.length === 0
              ? 'No locations available'
              : 'Select a location'}
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
              <span className="visually-hidden">Loading...</span>
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
          Unable to load locations. Please try again.
        </div>
      )}
    </div>
  );
}
