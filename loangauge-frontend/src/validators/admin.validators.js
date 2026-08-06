import { z } from 'zod';

export const subscriptionSchema = z.object({
  planName: z.string().min(1, 'Plan name is required').max(50, 'Plan name cannot exceed 50 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }),
});

// The loan-type entity is a straight admin-entered record — the backend does
// no computation, every field below is copied as-is from this DTO. HTML
// number inputs report blank fields as '' (or NaN if valueAsNumber is used),
// neither of which zod's z.coerce.number() will treat as "not provided" —
// Number('') is 0, which would silently write a very real (and wrong)
// threshold value instead of leaving the field unset. These two helpers
// normalize blank input to `undefined`/`null` *before* the numeric checks run.
const toRequiredNumber = (val) => {
  if (val === '' || val === undefined || val === null) return undefined;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isNaN(num) ? val : num;
};

const toNullableNumber = (val) => {
  if (val === '' || val === undefined || val === null) return null;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isNaN(num) ? val : num;
};

const requiredPercent = (label) =>
  z.preprocess(
    toRequiredNumber,
    z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` })
      .positive(`${label} must be greater than 0`)
      .max(100, `${label} cannot exceed 100`)
  );

const optionalPercent = () =>
  z.preprocess(
    toNullableNumber,
    z.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative').max(100, 'Cannot exceed 100').nullable().optional()
  );

const optionalAmount = () =>
  z.preprocess(
    toNullableNumber,
    z.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative').nullable().optional()
  );

export const loanTypeSchema = z
  .object({
    // --- Required (@NotNull / @NotBlank on the backend) ---
    loanName: z.string().min(1, 'Loan name is required').max(100, 'Loan name cannot exceed 100 characters'),
    category: z.enum(['SECURED', 'UNSECURED'], {
      errorMap: () => ({ message: 'Category must be Secured or Unsecured' }),
    }),
    interestRate: requiredPercent('Interest rate'),
    maxTenureMonths: z.preprocess(
      toRequiredNumber,
      z.number({ required_error: 'Max tenure is required', invalid_type_error: 'Max tenure must be a number' })
        .int('Max tenure must be a whole number')
        .positive('Max tenure must be greater than 0')
    ),
    isActive: z.boolean(),

    // --- Optional — rate & amount limits (nullable, UI display / eligibility bounds) ---
    minInterestRate: optionalPercent(),
    maxInterestRate: optionalPercent(),
    minLoanAmount: optionalAmount(),
    maxLoanAmount: optionalAmount(),
    minTenureMonths: z.preprocess(
      toNullableNumber,
      z.number().int('Must be a whole number').min(0, 'Cannot be negative').nullable().optional()
    ),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val ? val : null)),

    // --- Optional — risk thresholds that drive the assessment engine's FOIR/DTI scoring ---
    foirExcellentMax: optionalPercent(),
    foirAcceptableMax: optionalPercent(),
    foirCautionMax: optionalPercent(),
    dtiLowMax: optionalPercent(),
    dtiModerateMax: optionalPercent(),
    dtiHighMax: optionalPercent(),
    multiplier: z.preprocess(
      toNullableNumber,
      z.number({ invalid_type_error: 'Must be a number' }).positive('Multiplier must be greater than 0').nullable().optional()
    ),
  })
  .refine(
    (data) => data.minInterestRate == null || data.maxInterestRate == null || data.minInterestRate <= data.maxInterestRate,
    { message: 'Min interest rate cannot exceed max interest rate', path: ['minInterestRate'] }
  )
  .refine(
    (data) => data.minLoanAmount == null || data.maxLoanAmount == null || data.minLoanAmount <= data.maxLoanAmount,
    { message: 'Min loan amount cannot exceed max loan amount', path: ['minLoanAmount'] }
  )
  .refine(
    (data) => data.minTenureMonths == null || data.minTenureMonths <= data.maxTenureMonths,
    { message: 'Min tenure cannot exceed max tenure', path: ['minTenureMonths'] }
  )
  .refine(
    (data) => {
      const { foirExcellentMax: a, foirAcceptableMax: b, foirCautionMax: c } = data;
      if (a != null && b != null && a > b) return false;
      if (b != null && c != null && b > c) return false;
      return true;
    },
    { message: 'FOIR thresholds must ascend: Excellent ≤ Acceptable ≤ Caution', path: ['foirAcceptableMax'] }
  )
  .refine(
    (data) => {
      const { dtiLowMax: a, dtiModerateMax: b, dtiHighMax: c } = data;
      if (a != null && b != null && a > b) return false;
      if (b != null && c != null && b > c) return false;
      return true;
    },
    { message: 'DTI thresholds must ascend: Low ≤ Moderate ≤ High', path: ['dtiModerateMax'] }
  );
