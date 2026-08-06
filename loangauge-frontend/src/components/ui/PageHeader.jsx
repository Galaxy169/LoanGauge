import React from 'react';
import { cn } from '@/utils/cn';

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-5 border-b border-border sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-1 text-2xl font-bold font-heading text-text-primary flex items-center flex-wrap gap-2">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-text-secondary max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export default PageHeader;
