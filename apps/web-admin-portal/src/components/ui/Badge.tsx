import type { ReactNode } from 'react';
import { Badge as BsBadge } from 'react-bootstrap';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pill?: boolean;
  className?: string;
}

const variantToBs: Record<BadgeVariant, string> = {
  default: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  primary: 'primary',
  secondary: 'secondary',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  pill = true,
  className = ''
}: BadgeProps) {
  const sizeClass = size === 'sm' ? 'fs-xs' : '';
  const bgVariant = variantToBs[variant];

  return (
    <BsBadge
      bg={`${bgVariant}-subtle`}
      text={bgVariant}
      pill={pill}
      className={`${sizeClass} ${className}`}
    >
      {dot && (
        <span className={`d-inline-block rounded-circle me-1 bg-${bgVariant}`} style={{ width: 6, height: 6 }} />
      )}
      {children}
    </BsBadge>
  );
}
