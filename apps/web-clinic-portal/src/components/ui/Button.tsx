import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef, type ElementType } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'soft';
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
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-400 focus-visible:ring-offset-[var(--bg)]',
        {
          'bg-[var(--brand)] hover:bg-[var(--brand-strong)] active:scale-95 text-white shadow-soft disabled:opacity-60 disabled:cursor-not-allowed':
            variant === 'primary',
          'bg-[var(--surface-strong)] text-slate-200 border border-[var(--border)] hover:border-[var(--brand)] hover:text-white hover:bg-white/5':
            variant === 'ghost',
          'bg-white/5 text-white border border-white/10 hover:border-[var(--brand)]/60 hover:bg-white/10':
            variant === 'soft',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-3 text-base': size === 'lg',
        },
        { 'w-full': fullWidth },
        { 'opacity-60 cursor-not-allowed': disabled && !loading },
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
