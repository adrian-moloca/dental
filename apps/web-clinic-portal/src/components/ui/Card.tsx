import clsx from 'clsx';
import { type PropsWithChildren, type CSSProperties } from 'react';

type Props = PropsWithChildren<{
  padding?: 'md' | 'lg';
  className?: string;
  tone?: 'default' | 'glass';
  style?: CSSProperties;
}>;

export function Card({ children, className, padding = 'md', tone = 'default', style }: Props) {
  return (
    <div
      className={clsx(
        tone === 'glass' ? 'glass-panel' : 'surface-card',
        'rounded-xl',
        padding === 'lg' ? 'p-6' : 'p-4',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
