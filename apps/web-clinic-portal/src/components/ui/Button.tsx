import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef, type ElementType } from 'react';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger' | 'success' | 'secondary';
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
  const isDisabled = disabled || loading;

  // Use inline styles for more reliable disabled state
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
  };

  const sizeStyles: Record<Size, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '12px', gap: '6px' },
    md: { padding: '10px 16px', fontSize: '14px', gap: '8px' },
    lg: { padding: '14px 24px', fontSize: '16px', gap: '10px' },
  };

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: isDisabled ? '#9DA4B0' : '#2E37A4',
      color: '#FFFFFF',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    secondary: {
      backgroundColor: isDisabled ? '#9DA4B0' : '#00D3C7',
      color: '#FFFFFF',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    success: {
      backgroundColor: isDisabled ? '#9DA4B0' : '#27AE60',
      color: '#FFFFFF',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: isDisabled ? '#9DA4B0' : '#3B4961',
      border: '1px solid #E7E8EB',
    },
    soft: {
      backgroundColor: isDisabled ? '#F5F6F8' : '#ECEDF7',
      color: isDisabled ? '#9DA4B0' : '#2E37A4',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: isDisabled ? '#9DA4B0' : '#EF1E1E',
      color: '#FFFFFF',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
  };

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(fullWidth ? { width: '100%' } : {}),
  };

  return (
    <Component
      ref={Component === 'button' ? ref : (undefined as never)}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      style={combinedStyles}
      className={className}
      {...rest}
    >
      {loading && (
        <>
          <svg
            style={{ marginRight: '8px', width: '16px', height: '16px' }}
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden={true}
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Se încarcă...</span>
        </>
      )}
      {children}
    </Component>
  );
});
