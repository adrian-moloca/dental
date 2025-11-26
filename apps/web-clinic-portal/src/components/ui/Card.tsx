import clsx from 'clsx';
import { type PropsWithChildren, type CSSProperties, type HTMLAttributes, forwardRef } from 'react';

type Props = PropsWithChildren<{
  padding?: 'md' | 'lg' | 'none';
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
        padding === 'lg' ? 'p-6' : padding === 'md' ? 'p-4' : '',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// Sub-components for structured card layouts
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex flex-col space-y-1.5 p-4 pb-0', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx('text-sm text-text-secondary', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-4 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-center p-4 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
