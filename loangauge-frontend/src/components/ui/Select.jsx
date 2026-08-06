import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Select = React.forwardRef(function Select(
  { label, error, helperText, options = [], placeholder, className, id, containerClassName, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-10 appearance-none rounded-lg border bg-surface pl-3.5 pr-9 text-sm text-text-primary outline-none transition-colors cursor-pointer',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15',
            'disabled:bg-surface-sunken disabled:text-text-muted disabled:cursor-not-allowed',
            error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-border-strong',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
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

export default Select;
