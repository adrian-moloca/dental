import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef, type ElementType } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  as?: ElementType;
} & Record<string, any>;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    className,
    children,
    disabled,
    as = 'button',
    ...rest
  },
  ref,
) {
  const Component = as as ElementType;

  return (
    <Component
      ref={Component === 'button' ? ref : (undefined as never)}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-disabled={disabled || loading ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-[var(--bg)]',
        {
          // Primary: Teal with white text - 4.5:1 contrast
          'bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] active:scale-[0.98] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed':
            variant === 'primary',
          // Ghost: Transparent with border, teal on hover
          'bg-transparent text-[var(--text)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]':
            variant === 'ghost',
          // Soft: Light teal background with teal text
          'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 hover:border-[var(--primary)]/40':
            variant === 'soft',
          // Danger: Red for destructive actions
          'bg-[var(--danger)] hover:bg-[#b91c1c] active:scale-[0.98] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed':
            variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-3 text-base': size === 'lg',
        },
        { 'w-full': fullWidth },
        { 'opacity-50 cursor-not-allowed pointer-events-none': disabled && !loading },
        className,
      )}
      {...rest}
    >
      {loading && (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden={true}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </>
      )}
      {children}
    </Component>
  );
});
