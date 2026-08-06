import React, { useId } from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(function Input(
  { label, error, helperText, leftIcon: LeftIcon, className, id, containerClassName, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 rounded-lg border bg-surface px-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15',
            'disabled:bg-surface-sunken disabled:text-text-muted disabled:cursor-not-allowed',
            error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-border-strong',
            LeftIcon && 'pl-9',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
