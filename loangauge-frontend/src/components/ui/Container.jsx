import React from 'react';
import { cn } from '@/utils/cn';

const SIZES = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};

export function Container({ size = 'xl', className, children, ...props }) {
  return (
    <div className={cn('w-full mx-auto px-4 sm:px-6', SIZES[size] || SIZES.xl, className)} {...props}>
      {children}
    </div>
  );
}

export default Container;
