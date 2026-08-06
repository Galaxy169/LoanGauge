import React from 'react';
import { cn } from '@/utils/cn';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-surface-sunken px-6 py-12',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border text-text-muted">
          <Icon size={22} />
        </div>
      )}
      {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-text-secondary leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
