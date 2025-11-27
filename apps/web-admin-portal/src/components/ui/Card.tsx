import type { ReactNode, HTMLAttributes } from 'react';
import { Card as BsCard } from 'react-bootstrap';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ children, hover = false, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <BsCard
      className={`border shadow-sm ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      <BsCard.Body className={paddingClasses[padding]}>
        {children}
      </BsCard.Body>
    </BsCard>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="d-flex align-items-start justify-content-between mb-3">
      <div className="d-flex align-items-center gap-3">
        {icon && (
          <div className="stats-icon primary">
            {icon}
          </div>
        )}
        <div>
          <h5 className="mb-0 fw-semibold">{title}</h5>
          {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-3 pt-3 border-top ${className}`}>
      {children}
    </div>
  );
}
