import { forwardRef, type ReactNode } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, type = 'text', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const inputElement = (
      <Form.Control
        ref={ref}
        id={inputId}
        type={type}
        isInvalid={!!error}
        className={className}
        {...props}
      />
    );

    return (
      <Form.Group className="mb-3">
        {label && (
          <Form.Label htmlFor={inputId} className="text-body fw-medium">
            {label}
          </Form.Label>
        )}

        {leftIcon || rightIcon ? (
          <InputGroup hasValidation>
            {leftIcon && (
              <InputGroup.Text className="bg-white">
                {leftIcon}
              </InputGroup.Text>
            )}
            {inputElement}
            {rightIcon && (
              <InputGroup.Text className="bg-white">
                {rightIcon}
              </InputGroup.Text>
            )}
            {error && (
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            )}
          </InputGroup>
        ) : (
          <>
            {inputElement}
            {error && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {error}
              </Form.Control.Feedback>
            )}
          </>
        )}

        {hint && !error && (
          <Form.Text className="text-muted">
            {hint}
          </Form.Text>
        )}
      </Form.Group>
    );
  }
);

Input.displayName = 'Input';
