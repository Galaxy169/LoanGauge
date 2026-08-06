package com.loangauge.financialservice.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequestDto(

        @NotBlank(message = "Goal name is required")
        @Size(max = 150, message = "Goal name must be at most 150 characters")
        String goalName,

        @NotNull(message = "Target amount is required")
        @Positive(message = "Target amount must be greater than zero")
        @Digits(integer = 10, fraction = 2, message = "Target amount has too many digits")
        BigDecimal targetAmount,

        // Current amount is optional on create (defaults to 0) but validated when present.
        @PositiveOrZero(message = "Current amount cannot be negative")
        @Digits(integer = 10, fraction = 2, message = "Current amount has too many digits")
        BigDecimal currentAmount,

        @NotNull(message = "Target date is required")
        @Future(message = "Target date must be in the future")
        LocalDate targetDate,

        @Size(max = 255, message = "Notes must be at most 255 characters")
        String notes
) {
}
