import React from 'react';
import { cn } from '@/utils/cn';

export const Switch = React.forwardRef(function Switch(
  { label, description, className, containerClassName, ...props },
  ref
) {
  return (
    <label className={cn('flex items-center justify-between gap-3 cursor-pointer select-none', containerClassName)}>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-medium text-text-primary">{label}</span>}
          {description && <span className="block text-xs text-text-muted mt-0.5">{description}</span>}
        </span>
      )}
      <span className={cn('relative inline-flex h-6 w-11 shrink-0 items-center', className)}>
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="absolute inset-0 rounded-full bg-ink-300 transition-colors peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
});

export default Switch;
