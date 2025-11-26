/**
 * AppointmentTypeSelect Component
 *
 * Dropdown select for choosing an appointment type/service.
 * Displays common dental service codes.
 */

interface AppointmentTypeSelectProps {
  value?: string;
  onChange: (serviceCode: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Common dental service codes
// In production, these would come from an API endpoint
const APPOINTMENT_TYPES = [
  { code: 'EXAM', name: 'Routine Examination', duration: 30 },
  { code: 'CLEANING', name: 'Teeth Cleaning', duration: 60 },
  { code: 'XRAY', name: 'X-Ray', duration: 15 },
  { code: 'FILLING', name: 'Filling', duration: 60 },
  { code: 'EXTRACTION', name: 'Tooth Extraction', duration: 45 },
  { code: 'ROOT_CANAL', name: 'Root Canal', duration: 90 },
  { code: 'CROWN', name: 'Crown Placement', duration: 90 },
  { code: 'WHITENING', name: 'Teeth Whitening', duration: 60 },
  { code: 'ORTHODONTIC', name: 'Orthodontic Consultation', duration: 45 },
  { code: 'EMERGENCY', name: 'Emergency Visit', duration: 30 },
  { code: 'FOLLOW_UP', name: 'Follow-up Visit', duration: 30 },
  { code: 'CONSULT', name: 'Consultation', duration: 30 },
];

export function AppointmentTypeSelect({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
}: AppointmentTypeSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const selectedType = APPOINTMENT_TYPES.find((t) => t.code === value);

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
          disabled={disabled}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'appointment-type-error' : undefined}
        >
          <option value="">Select appointment type</option>
          {APPOINTMENT_TYPES.map((type) => (
            <option key={type.code} value={type.code}>
              {type.name} ({type.duration} min)
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div id="appointment-type-error" className="invalid-feedback d-block" role="alert">
          <i className="ti ti-alert-circle me-1"></i>
          {error}
        </div>
      )}

      {selectedType && (
        <div className="form-text">
          <i className="ti ti-clock me-1"></i>
          {selectedType.duration} minutes duration
        </div>
      )}
    </div>
  );
}
