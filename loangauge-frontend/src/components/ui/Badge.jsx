import React from "react";
import { cn } from "@/utils/cn";

const VARIANTS = {
  default: "bg-ink-100 text-ink-700 border-ink-200",
  primary: "bg-primary-50 text-primary-700 border-primary-200",
  success: "bg-success-subtle text-success border-success/20",
  warning: "bg-warning-subtle text-warning border-warning/20",
  danger: "bg-danger-subtle text-danger border-danger/20",
  info: "bg-info-subtle text-info border-info/20",
  outline: "bg-transparent text-text-secondary border-border-strong",
  EXCELLENT: "bg-risk-excellent/10 text-risk-excellent border-risk-excellent/20",
  GOOD: "bg-risk-good/10 text-risk-good border-risk-good/20",
  MODERATE: "bg-risk-moderate/10 text-risk-moderate border-risk-moderate/20",
  NEEDS_IMPROVEMENT: "bg-risk-needs-improvement/10 text-risk-needs-improvement border-risk-needs-improvement/20",
  HIGH_RISK: "bg-risk-high/10 text-risk-high border-risk-high/20",
};

export function Badge({ variant = "default", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide leading-none",
        VARIANTS[variant] || VARIANTS.default,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
