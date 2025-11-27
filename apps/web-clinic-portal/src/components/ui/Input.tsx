import clsx from 'clsx';
import { type InputHTMLAttributes, useId } from 'react';
import { Icon } from './Icon';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  success?: boolean;
  icon?: string;
};

export function Input({ label, hint, error, success, fullWidth, className, icon, id: providedId, ...rest }: Props) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={clsx('space-y-2 text-sm', { 'w-full': fullWidth })}>
      {label && (
        <label htmlFor={id} className="block text-[var(--text)] font-medium">
          {label}
          {rest.required && (
            <span className="text-[var(--danger)] ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={clsx(
            'w-full rounded-lg border bg-[var(--surface)] px-3 py-2.5 text-[var(--text)] placeholder:text-[var(--text-tertiary)] transition-all duration-200',
            'focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
            'disabled:cursor-not-allowed disabled:bg-[var(--surface-card)] disabled:text-[var(--text-muted)]', /* WCAG AA: Removed opacity, using solid color */
            error && 'border-[var(--danger)] focus:ring-[var(--danger)]/30 pr-10',
            success && 'border-[var(--success)] focus:ring-[var(--success)]/30 pr-10',
            !error && !success && 'border-[var(--border)]',
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={clsx(
            error && errorId,
            hint && !error && hintId,
          )}
          {...rest}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--danger)]" aria-hidden={true}>
            <Icon name="exclamation" className="w-5 h-5" />
          </div>
        )}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--success)]" aria-hidden={true}>
            <Icon name="check" className="w-5 h-5" />
          </div>
        )}
      </div>
      {hint && !error && (
        <span id={hintId} className="block text-xs text-[var(--text-tertiary)]">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="flex items-center gap-1 text-xs text-[var(--danger)]" role="alert">
          <Icon name="exclamation" className="w-3 h-3" aria-hidden={true} />
          {error}
        </span>
      )}
    </div>
  );
}
