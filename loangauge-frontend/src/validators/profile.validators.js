import { z } from 'zod';
import { passwordSchema } from './auth.validators';

export const userProfileSchema = z.object({
  // .trim() — see registerSchema in auth.validators.js for why this matters
  // (backend's @NotBlank rejects whitespace-only names, plain .min(1) doesn't).
  firstName: z.string().trim().min(1, 'First name is required').max(100, 'First name cannot exceed 100 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Last name cannot exceed 100 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Phone number must be a 10-digit Indian number starting with 6-9')
    .optional()
    .or(z.literal(''))
    // Backend @Pattern only skips validation on null — an empty string still
    // fails the regex. Normalize blank input to null before it hits the API.
    .transform((val) => (val ? val : null)),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const financialProfileSchema = z.object({
  age: z.coerce.number().int().min(18, 'Age must be at least 18').max(100, 'Age cannot exceed 100'),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], {
    errorMap: () => ({ message: 'Invalid marital status' }),
  }),
  dependents: z.coerce.number().int().min(0, 'Dependents cannot be negative').max(20, 'Dependents cannot exceed 20'),
  cityType: z.enum(['METRO', 'URBAN', 'SEMI_URBAN', 'RURAL'], {
    errorMap: () => ({ message: 'Invalid city type' }),
  }),
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'FREELANCER'], {
    errorMap: () => ({ message: 'Invalid employment type' }),
  }),
  // Backend allows up to 60 years (@Max(60)) — this was capped at 50.
  workExperienceYears: z.coerce.number().min(0, 'Work experience cannot be negative').max(60, 'Work experience cannot exceed 60'),
  incomeStability: z.enum(['STABLE', 'MODERATE', 'UNSTABLE'], {
    errorMap: () => ({ message: 'Invalid income stability' }),
  }),
  // Backend uses @DecimalMin("0.0") on both — 0.0 is an explicitly accepted
  // value, not just "greater than 0". .positive() was rejecting a
  // legitimately valid 0 that the backend would accept.
  monthlyIncome: z.coerce.number().min(0, 'Monthly income cannot be negative'),
  monthlyExpenses: z.coerce.number().min(0, 'Monthly expenses cannot be negative'),
  existingLoans: z.coerce.number().int().min(0, 'Existing loans cannot be negative').max(50, 'Existing loans cannot exceed 50'),
  monthlyEmi: z.coerce.number().min(0, 'Monthly EMI cannot be negative'),
  creditCardBalance: z.coerce.number().min(0, 'Credit card balance cannot be negative'),
  savings: z.coerce.number().min(0, 'Savings cannot be negative'),
  fixedDeposits: z.coerce.number().min(0, 'Fixed deposits cannot be negative').optional(),
  investments: z.coerce.number().min(0, 'Investments cannot be negative').optional(),
  emergencyFund: z.coerce.number().min(0, 'Emergency fund cannot be negative'),
  // Truly optional now: the backend's scoring logic (scoreCreditProfile)
  // explicitly treats a null cibilScore as "unpopulated" and substitutes a
  // neutral base score of 50 — so an unprovided score is a legitimate,
  // meaningful input, not something to fake a value for. Blank input here
  // (NaN, from RHF's valueAsNumber on an empty number field) is normalized
  // to null; if a value *is* entered, it must fall in the real 300–900
  // CIBIL range.
  cibilScore: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isNaN(num) ? null : num;
    },
    z
      .number()
      .int('CIBIL score must be a whole number')
      .min(300, 'CIBIL score must be between 300 and 900')
      .max(900, 'CIBIL score must be between 300 and 900')
      .nullable()
  ),
  creditUtilization: z.coerce.number().min(0, 'Credit utilization cannot be negative').max(100, 'Credit utilization cannot exceed 100'),
  notes: z.string().max(255, 'Notes cannot exceed 255 characters').optional().or(z.literal('')),
});
