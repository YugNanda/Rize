import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      className = '',
      containerClassName = '',
      type = 'text',
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'input-base',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger mt-0.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted mt-0.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
