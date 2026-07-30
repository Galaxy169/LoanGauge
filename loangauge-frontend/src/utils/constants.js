// Shared enums — must mirror the backend enums exactly. Never hardcode these
// strings anywhere else in the frontend.

export const ROLES = {
  USER: "USER",
  PREMIUM_USER: "PREMIUM_USER",
  FINANCIAL_ADVISOR: "FINANCIAL_ADVISOR",
  ADMINISTRATOR: "ADMINISTRATOR",
};

export const LOAN_CATEGORIES = {
  SECURED: "SECURED",
  UNSECURED: "UNSECURED",
};

export const RISK_LEVELS = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  MODERATE: "MODERATE",
  NEEDS_IMPROVEMENT: "NEEDS_IMPROVEMENT",
  HIGH_RISK: "HIGH_RISK",
};

export const SUBSCRIPTION_TYPES = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
};
