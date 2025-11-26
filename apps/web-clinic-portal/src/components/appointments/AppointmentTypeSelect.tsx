/**
 * AppointmentTypeSelect Component
 *
 * Dropdown select for choosing an appointment type/service.
 * Displays common dental service codes.
 */

import { Icon } from '../ui/Icon';
import clsx from 'clsx';

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
          disabled={disabled}
          className={clsx(
            'w-full rounded-lg border bg-[#1F1F2D] px-3 py-2 pr-10 text-[#F4EFF0] placeholder:text-slate-400 transition-all duration-200',
            'focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'appearance-none',
            error && 'border-red-500/70 focus:ring-red-500',
            !error && 'border-[var(--border)]',
          )}
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

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <span id="appointment-type-error" className="flex items-center gap-1 text-xs text-red-400" role="alert">
          <Icon name="exclamation" className="w-3 h-3" aria-hidden="true" />
          {error}
        </span>
      )}

      {value && (
        <span className="text-xs text-slate-400">
          {APPOINTMENT_TYPES.find((t) => t.code === value)?.duration} minutes duration
        </span>
      )}
    </div>
  );
}
