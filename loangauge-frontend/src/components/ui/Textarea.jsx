import React, { useId } from 'react';
import { cn } from '@/utils/cn';

export const Textarea = React.forwardRef(function Textarea(
  { label, error, helperText, rows = 4, className, id, containerClassName, ...props },
  ref
) {
  const autoId = useId();
  const textareaId = id || autoId;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-lg border bg-surface p-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors resize-none',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15',
          'disabled:bg-surface-sunken disabled:text-text-muted disabled:cursor-not-allowed',
          error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-border-strong',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
