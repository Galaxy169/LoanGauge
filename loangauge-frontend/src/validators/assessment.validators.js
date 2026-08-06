import { z } from 'zod';

export const assessmentSchema = z.object({
  loanTypeId: z.coerce.number().int().positive('Loan Type ID is required'),
  // Backend also caps this at @Digits(integer=12, fraction=2) — i.e. under
  // 1 trillion. Not a realistic value to hit by accident, but the backend
  // report explicitly calls out 10000000000000.00 as a rejected example, so
  // catching it client-side avoids a round-trip for that exact case.
  loanAmount: z.coerce.number().positive('Loan amount must be greater than 0').max(999999999999.99, 'Loan amount is too large'),
  // Backend requires @Min(3), not 1 — a 1 or 2 month tenure used to pass
  // here and then get rejected by the backend.
  tenureMonths: z.coerce.number().int().min(3, 'Tenure must be at least 3 months').max(480, 'Tenure cannot exceed 480 months'),
  interestRate: z.coerce.number().min(0.01, 'Interest rate must be at least 0.01').max(100, 'Interest rate cannot exceed 100'),
});

export const comparisonSchema = z.object({
  assessmentIds: z.array(z.coerce.number().int().positive())
    .min(2, 'Please select at least 2 assessments to compare')
    .max(5, 'You can compare up to 5 assessments at a time'),
});
