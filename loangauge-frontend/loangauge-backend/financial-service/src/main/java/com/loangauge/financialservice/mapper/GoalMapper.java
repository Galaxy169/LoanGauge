package com.loangauge.financialservice.mapper;

import com.loangauge.financialservice.dto.GoalResponseDto;
import com.loangauge.financialservice.entity.FinancialGoal;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Converts FinancialGoal entities into GoalResponseDto objects, computing the
 * derived planning fields (remaining amount, progress %, months left, required
 * monthly savings) on the fly — these are calculated, never stored.
 */
@Component
public class GoalMapper {

    public GoalResponseDto toResponseDto(FinancialGoal goal) {
        BigDecimal target = goal.getTargetAmount();
        BigDecimal current = goal.getCurrentAmount() == null ? BigDecimal.ZERO : goal.getCurrentAmount();

        BigDecimal remaining = target.subtract(current).max(BigDecimal.ZERO);

        BigDecimal progressPct = BigDecimal.ZERO;
        if (target.compareTo(BigDecimal.ZERO) > 0) {
            progressPct = current.divide(target, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .min(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // Whole months from today until the target date (never negative).
        long months = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
        int monthsRemaining = (int) Math.max(0, months);

        // Required monthly savings to reach the goal on time. If the target date is
        // within the current month (0 months left), the whole remaining amount is due.
        BigDecimal requiredMonthly;
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            requiredMonthly = BigDecimal.ZERO;
        } else if (monthsRemaining <= 0) {
            requiredMonthly = remaining;
        } else {
            requiredMonthly = remaining.divide(BigDecimal.valueOf(monthsRemaining), 2, RoundingMode.HALF_UP);
        }

        return new GoalResponseDto(
                goal.getGoalId(),
                goal.getGoalName(),
                target,
                current,
                goal.getTargetDate(),
                goal.getStatus(),
                goal.getNotes(),
                remaining,
                progressPct,
                monthsRemaining,
                requiredMonthly,
                goal.getCreatedAt()
        );
    }
}
