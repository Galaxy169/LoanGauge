import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary:
    'bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 hover:border-primary-700 active:bg-primary-800 disabled:bg-primary-300 disabled:border-primary-300',
  secondary:
    'bg-ink-900 text-white border border-ink-900 hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-300 disabled:border-ink-300',
  outline:
    'bg-surface text-text-primary border border-border-strong hover:bg-surface-hover hover:border-ink-400 active:bg-ink-100 disabled:text-text-muted disabled:bg-surface',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-surface-hover hover:text-text-primary disabled:text-text-muted',
  danger:
    'bg-white text-danger border border-danger/30 hover:bg-danger-subtle hover:border-danger disabled:text-text-muted disabled:border-border',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-lg',
};

const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = React.forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'button',
    className,
    children,
    ...props
  },
  ref
) {
  const iconSize = ICON_SIZES[size] || 16;
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer select-none',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        LeftIcon && <LeftIcon size={iconSize} />
      )}
      {children}
      {!isLoading && RightIcon && <RightIcon size={iconSize} />}
    </button>
  );
});

export default Button;
