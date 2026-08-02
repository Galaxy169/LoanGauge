package com.loangauge.notificationservice.util;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class RuleBasedRecommender {

    public List<String> generate(AssessmentCompletedEvent event) {
        List<String> tips = new ArrayList<>();

        if (event.getFoir() != null && event.getFoir().compareTo(BigDecimal.valueOf(50)) > 0) {
            tips.add("Your FOIR is above 50% — consider reducing existing EMIs before taking a new loan.");
        }
        if (event.getDti() != null && event.getDti().compareTo(BigDecimal.valueOf(40)) > 0) {
            tips.add("Your debt-to-income ratio is high — focus on paying down existing liabilities.");
        }
        if (event.getFinancialReadinessScore() != null && event.getFinancialReadinessScore() < 50) {
            tips.add("Build an emergency fund covering at least 3 months of expenses to improve your readiness score.");
        }
        if (tips.isEmpty()) {
            tips.add("Your financial profile looks healthy for this loan type. Maintain your current savings discipline.");
        }
        return tips;
    }
}