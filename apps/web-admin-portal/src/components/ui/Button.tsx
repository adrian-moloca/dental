import { forwardRef } from 'react';
import { Button as BsButton, Spinner, type ButtonProps as BsButtonProps } from 'react-bootstrap';

export interface ButtonProps extends BsButtonProps {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <BsButton
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="me-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ms-2">{rightIcon}</span>}
          </>
        )}
      </BsButton>
    );
  }
);

Button.displayName = 'Button';
