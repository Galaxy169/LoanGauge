import { z } from "zod";

// Mirrors ProfileRequestDto.java field-for-field. Keep both in sync if the
// backend validation rules change.
export const profileSchema = z.object({
  age: z
    .number({ required_error: "Age is required" })
    .int()
    .min(18, "Age must be at least 18")
    .max(100, "Age must be realistic"),

  maritalStatus: z
    .string({ required_error: "Marital status is required" })
    .trim()
    .min(1, "Marital status is required")
    .max(30),

  dependents: z
    .number({ required_error: "Number of dependents is required" })
    .int()
    .min(0, "Dependents cannot be negative")
    .max(20, "Dependents value looks invalid"),

  cityType: z
    .string({ required_error: "City type is required" })
    .trim()
    .min(1, "City type is required")
    .max(30),

  employmentType: z
    .string({ required_error: "Employment type is required" })
    .trim()
    .min(1, "Employment type is required")
    .max(30),

  workExperienceYears: z
    .number({ required_error: "Work experience is required" })
    .int()
    .min(0, "Work experience cannot be negative")
    .max(60, "Work experience value looks invalid"),

  incomeStability: z
    .string({ required_error: "Income stability is required" })
    .trim()
    .min(1, "Income stability is required")
    .max(30),

  monthlyIncome: z
    .number({ required_error: "Monthly income is required" })
    .min(0, "Monthly income cannot be negative"),

  monthlyExpenses: z
    .number({ required_error: "Monthly expenses is required" })
    .min(0, "Monthly expenses cannot be negative"),

  existingLoans: z
    .number({ required_error: "Existing loans count is required" })
    .int()
    .min(0, "Existing loans cannot be negative"),

  monthlyEmi: z
    .number({ required_error: "Monthly EMI is required" })
    .min(0, "Monthly EMI cannot be negative"),

  creditCardBalance: z
    .number({ required_error: "Credit card balance is required" })
    .min(0, "Credit card balance cannot be negative"),

  savings: z
    .number({ required_error: "Savings is required" })
    .min(0, "Savings cannot be negative"),

  // Optional in the backend DTO (no @NotNull) — default to 0 if left blank.
  fixedDeposits: z
    .number()
    .min(0, "Fixed deposits cannot be negative")
    .optional()
    .default(0),

  investments: z
    .number()
    .min(0, "Investments cannot be negative")
    .optional()
    .default(0),

  emergencyFund: z
    .number({ required_error: "Emergency fund is required" })
    .min(0, "Emergency fund cannot be negative"),

  cibilScore: z
    .number({ required_error: "CIBIL score is required" })
    .int()
    .min(300, "CIBIL score must be between 300 and 900")
    .max(900, "CIBIL score must be between 300 and 900"),

  creditUtilization: z
    .number({ required_error: "Credit utilization is required" })
    .min(0, "Credit utilization must be between 0 and 100")
    .max(100, "Credit utilization must be between 0 and 100"),

  notes: z
    .string()
    .max(255, "Notes must be under 255 characters")
    .optional()
    .default(""),
});
