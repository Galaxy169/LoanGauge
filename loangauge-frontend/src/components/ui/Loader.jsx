import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Loader({ size = 'md', className }) {
  return (
    <Loader2
      size={SIZES[size] || SIZES.md}
      className={cn('animate-spin text-primary-600', className)}
    />
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 py-16">
      <Loader size="lg" />
      <p className="text-xs font-medium text-text-muted">{label}</p>
    </div>
  );
}

export default Loader;
