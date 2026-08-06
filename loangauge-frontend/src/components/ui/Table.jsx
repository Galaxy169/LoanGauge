import React from 'react';
import { cn } from '@/utils/cn';

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <thead className={cn('bg-surface-sunken', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-border', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn('hover:bg-surface-sunken/60 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap border-b border-border',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('px-4 py-3.5 text-sm text-text-primary align-middle', className)} {...props}>
      {children}
    </td>
  );
}

export default Table;
