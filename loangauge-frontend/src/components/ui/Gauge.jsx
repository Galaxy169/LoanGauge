import React from 'react';
import { cn } from '@/utils/cn';

const SIZE_MAP = {
  sm: { box: 52, stroke: 5, valueClass: 'text-sm', labelClass: 'text-[7px]' },
  md: { box: 96, stroke: 7, valueClass: 'text-2xl', labelClass: 'text-[9px]' },
  lg: { box: 168, stroke: 10, valueClass: 'text-4xl', labelClass: 'text-[10px]' },
};

const RISK_COLOR_VAR = {
  // EXCELLENT was wired to the HIGH_RISK (red) variable — a top-tier score
  // rendered the gauge ring red instead of green. Every page using <Gauge />
  // (assessment detail, history table, dashboard) inherited this bug since
  // they all share this one component.
  EXCELLENT: "var(--color-risk-excellent)",
  GOOD: "var(--color-risk-good)",
  MODERATE: "var(--color-risk-moderate)",
  NEEDS_IMPROVEMENT: "var(--color-risk-needs-improvement)",
  HIGH_RISK: "var(--color-risk-high)",
};

function colorForValue(value) {
  
  if (value >= 80) return RISK_COLOR_VAR.EXCELLENT;
  if (value >= 60) return RISK_COLOR_VAR.GOOD;
  if (value >= 40) return RISK_COLOR_VAR.MODERATE;
  if (value >= 20) return RISK_COLOR_VAR.NEEDS_IMPROVEMENT;
  return RISK_COLOR_VAR.HIGH_RISK;
}

export function Gauge({ value = 0, size = 'md', riskLevel, label, showLabel = true, className }) {
  const { box, stroke, valueClass, labelClass } = SIZE_MAP[size] || SIZE_MAP.md;
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;
  const color = RISK_COLOR_VAR[riskLevel] || colorForValue(safeValue);

  return (
    <div className={cn('inline-flex flex-col items-center justify-center', className)}>
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-heading font-bold text-text-primary leading-none', valueClass)}>
            {Math.round(safeValue)}
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span className={cn('mt-1.5 font-semibold uppercase tracking-wide text-text-muted text-center', labelClass)}>
          {label}
        </span>
      )}
    </div>
  );
}

export default Gauge;
