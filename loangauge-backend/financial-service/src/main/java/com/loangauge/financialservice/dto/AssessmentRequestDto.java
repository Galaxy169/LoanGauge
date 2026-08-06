package com.loangauge.financialservice.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record AssessmentRequestDto(

        @NotNull(message = "Loan type is required")
        Long loanTypeId,

        @NotNull(message = "Loan amount is required")
        @Positive(message = "Loan amount must be greater than zero")
        @Digits(integer = 12, fraction = 2, message = "Loan amount has too many digits")
        BigDecimal loanAmount,

        @NotNull(message = "Tenure is required")
        @Min(value = 3, message = "Tenure must be at least 3 month")
        Integer tenureMonths,

        @NotNull(message = "Interest rate is required")
        @Positive(message = "Interest rate must be greater than zero")
        @Digits(integer = 3, fraction = 2, message = "Interest rate has too many digits")
        BigDecimal interestRate
) {
}