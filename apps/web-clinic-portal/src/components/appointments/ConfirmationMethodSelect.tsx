import { Icon } from '../ui/Icon';
import type { ConfirmationMethod } from '../../types/appointment.types';

interface ConfirmationMethodSelectProps {
  value: ConfirmationMethod;
  onChange: (method: ConfirmationMethod) => void;
  disabled?: boolean;
}

const methods: Array<{
  value: ConfirmationMethod;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: 'phone',
    label: 'Phone Call',
    icon: 'phone',
    description: 'Called patient to confirm',
  },
  {
    value: 'sms',
    label: 'SMS',
    icon: 'chat',
    description: 'Sent SMS confirmation',
  },
  {
    value: 'email',
    label: 'Email',
    icon: 'mail',
    description: 'Sent email confirmation',
  },
  {
    value: 'portal',
    label: 'Patient Portal',
    icon: 'users',
    description: 'Confirmed via portal',
  },
];

export function ConfirmationMethodSelect({
  value,
  onChange,
  disabled = false,
}: ConfirmationMethodSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Confirmation Method</label>
      <div className="grid grid-cols-2 gap-3">
        {methods.map((method) => (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            disabled={disabled}
            className={`
              p-3 rounded-lg border transition-all text-left
              ${
                value === method.value
                  ? 'border-brand bg-brand/10 text-foreground'
                  : 'border-white/10 bg-surface-hover text-foreground/80 hover:border-brand/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-pressed={value === method.value}
          >
            <div className="flex items-start gap-2">
              <div
                className={`
                p-1.5 rounded
                ${value === method.value ? 'bg-brand/20 text-brand' : 'bg-white/5 text-foreground/60'}
              `}
              >
                <Icon name={method.icon as any} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-0.5">{method.label}</div>
                <div className="text-xs text-foreground/60">{method.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
