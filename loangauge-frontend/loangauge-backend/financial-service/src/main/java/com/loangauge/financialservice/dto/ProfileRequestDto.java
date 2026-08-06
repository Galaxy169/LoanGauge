package com.loangauge.financialservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProfileRequestDto(

                @NotNull(message = "Age is required") @Min(value = 18, message = "Age must be at least 18") @Max(value = 100, message = "Age must be realistic") Integer age,

                @NotBlank(message = "Marital status is required") @Size(max = 30) String maritalStatus,

                @NotNull(message = "Number of dependents is required") @Min(value = 0, message = "Dependents cannot be negative") @Max(value = 20, message = "Dependents value looks invalid") Integer dependents,

                @NotBlank(message = "City type is required") @Size(max = 30) String cityType,

                @NotBlank(message = "Employment type is required") @Size(max = 30) String employmentType,

                @NotNull(message = "Work experience is required") @Min(value = 0, message = "Work experience cannot be negative") @Max(value = 60, message = "Work experience value looks invalid") Integer workExperienceYears,

                @NotBlank(message = "Income stability is required") @Size(max = 30) String incomeStability,

                @NotNull(message = "Monthly income is required") @DecimalMin(value = "0.0", inclusive = true, message = "Monthly income cannot be negative") BigDecimal monthlyIncome,

                @NotNull(message = "Monthly expenses is required") @DecimalMin(value = "0.0", inclusive = true, message = "Monthly expenses cannot be negative") BigDecimal monthlyExpenses,

                @NotNull(message = "Existing loans count is required") @Min(value = 0, message = "Existing loans cannot be negative") Integer existingLoans,

                @NotNull(message = "Monthly EMI is required") @DecimalMin(value = "0.0", inclusive = true, message = "Monthly EMI cannot be negative") BigDecimal monthlyEmi,

                @NotNull(message = "Credit card balance is required") @DecimalMin(value = "0.0", inclusive = true, message = "Credit card balance cannot be negative") BigDecimal creditCardBalance,

                @NotNull(message = "Savings is required") @DecimalMin(value = "0.0", inclusive = true, message = "Savings cannot be negative") BigDecimal savings,

                @DecimalMin(value = "0.0", inclusive = true, message = "Fixed deposits cannot be negative") BigDecimal fixedDeposits,

                @DecimalMin(value = "0.0", inclusive = true, message = "Investments cannot be negative") BigDecimal investments,

                @NotNull(message = "Emergency fund is required") @DecimalMin(value = "0.0", inclusive = true, message = "Emergency fund cannot be negative") BigDecimal emergencyFund,

                @PositiveOrZero @Min(value = 300, message = "CIBIL score must be between 300 and 900") @Max(value = 900, message = "CIBIL score must be between 300 and 900") Integer cibilScore,

                @NotNull(message = "Credit utilization is required") @DecimalMin(value = "0.0", inclusive = true, message = "Credit utilization must be between 0 and 100") @DecimalMax(value = "100.0", inclusive = true, message = "Credit utilization must be between 0 and 100") BigDecimal creditUtilization,

                @Size(max = 255, message = "Notes must be under 255 characters") String notes

) {
}
