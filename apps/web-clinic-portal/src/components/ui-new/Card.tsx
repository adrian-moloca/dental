/**
 * Card Component
 *
 * Preclinic-style card component with header, body, and footer sections.
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

type CardVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card visual style */
  variant?: CardVariant;
  /** Remove border */
  borderless?: boolean;
  /** Disable hover effect */
  flat?: boolean;
  /** Add click hover effect */
  hoverable?: boolean;
  /** Full height */
  fullHeight?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      borderless = false,
      flat = false,
      hoverable = false,
      fullHeight = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'card',
          {
            [`card-${variant}`]: variant !== 'default',
            'card-borderless': borderless,
            'card-flat': flat,
            'hover-card': hoverable,
            'card-full-height': fullHeight,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Title text */
  title?: string;
  /** Icon class name */
  icon?: string;
  /** Action elements */
  actions?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, icon, actions, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('card-header', className)} {...props}>
        {title ? (
          <>
            <div className="card-title">
              {icon && <i className={icon}></i>}
              <h5>{title}</h5>
            </div>
            {actions && <div className="card-actions">{actions}</div>}
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('card-body', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Space items between */
  between?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ between = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('card-footer', { 'modal-footer-between': between }, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
