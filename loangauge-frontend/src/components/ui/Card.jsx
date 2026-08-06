import React from 'react';
import { cn } from '@/utils/cn';

export const Card = React.forwardRef(function Card(
  { className, interactive = false, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-surface border border-border rounded-xl',
        interactive && 'cursor-pointer transition-shadow hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
