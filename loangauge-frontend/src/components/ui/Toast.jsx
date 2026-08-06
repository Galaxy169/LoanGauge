import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const TYPES = {
  success: {
    icon: CheckCircle2,
    className: 'bg-surface border-success/25 text-text-primary',
    iconClassName: 'text-success',
  },
  error: {
    icon: XCircle,
    className: 'bg-surface border-danger/25 text-text-primary',
    iconClassName: 'text-danger',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-surface border-warning/25 text-text-primary',
    iconClassName: 'text-warning',
  },
  info: {
    icon: Info,
    className: 'bg-surface border-info/25 text-text-primary',
    iconClassName: 'text-info',
  },
};

export function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const config = TYPES[toast.type] || TYPES.info;
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-lg border shadow-md px-4 py-3',
              config.className
            )}
          >
            <Icon size={18} className={cn('mt-0.5 shrink-0', config.iconClassName)} />
            <p className="flex-1 text-sm leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
