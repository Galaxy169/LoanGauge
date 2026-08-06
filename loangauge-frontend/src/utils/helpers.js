/** Format a number as Indian Rupee currency */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a number as percentage with optional decimal places */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/** Format a number with commas (Indian numbering) */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Format ISO date string to readable format */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Format ISO date string to readable date-time */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Get risk level color class */
export function getRiskColor(riskLevel) {
  const colors = {
    EXCELLENT: 'text-risk-excellent',
    GOOD: 'text-risk-good',
    MODERATE: 'text-risk-moderate',
    NEEDS_IMPROVEMENT: 'text-risk-needs-improvement',
    HIGH_RISK: 'text-risk-high',
  };
  return colors[riskLevel] || 'text-text-secondary';
}

/** Get risk level background color class */
export function getRiskBgColor(riskLevel) {
  const colors = {
    EXCELLENT: 'bg-risk-excellent',
    GOOD: 'bg-risk-good',
    MODERATE: 'bg-risk-moderate',
    NEEDS_IMPROVEMENT: 'bg-risk-needs-improvement',
    HIGH_RISK: 'bg-risk-high',
  };
  return colors[riskLevel] || 'bg-text-secondary';
}

/** Get a human-readable label for risk level */
export function getRiskLabel(riskLevel) {
  const labels = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    MODERATE: 'Moderate',
    NEEDS_IMPROVEMENT: 'Needs Improvement',
    HIGH_RISK: 'High Risk',
  };
  return labels[riskLevel] || riskLevel;
}

/** Get human readable label for enum values */
export function humanize(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Extract error message from RTK Query error */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred';
  if (error.data?.message) return error.data.message;
  if (error.error) return error.error;
  if (error.message) return error.message;
  if (error.status === 'FETCH_ERROR') return 'Unable to connect to server. Please check your connection.';
  return 'An unexpected error occurred';
}
