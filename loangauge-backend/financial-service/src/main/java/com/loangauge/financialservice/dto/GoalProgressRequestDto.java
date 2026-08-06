package com.loangauge.financialservice.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record GoalProgressRequestDto(

        @NotNull(message = "Current amount is required")
        @PositiveOrZero(message = "Current amount cannot be negative")
        @Digits(integer = 10, fraction = 2, message = "Current amount has too many digits")
        BigDecimal currentAmount
) {
}
