import { z } from "zod";

export const assessmentSchema = z.object({
  loanTypeId: z.coerce
    .number({ required_error: "Select a loan type" })
    .positive("Select a loan type"),
  loanAmount: z.coerce
    .number({ required_error: "Loan amount is required" })
    .positive("Loan amount must be greater than zero"),
  tenureMonths: z.coerce
    .number({ required_error: "Tenure is required" })
    .int("Tenure must be a whole number")
    .min(1, "Tenure must be at least 1 month"),
  interestRate: z.coerce
    .number({ required_error: "Interest rate is required" })
    .positive("Interest rate must be greater than zero"),
});
