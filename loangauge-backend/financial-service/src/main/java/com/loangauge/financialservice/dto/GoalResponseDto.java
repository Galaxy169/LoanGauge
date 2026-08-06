package com.loangauge.financialservice.dto;

import com.loangauge.financialservice.entity.GoalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record GoalResponseDto(
        Long goalId,
        String goalName,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        LocalDate targetDate,
        GoalStatus status,
        String notes,
        // --- computed (not stored) ---
        BigDecimal remainingAmount,
        BigDecimal progressPercentage,
        Integer monthsRemaining,
        BigDecimal requiredMonthlySavings,
        LocalDateTime createdAt
) {
}
