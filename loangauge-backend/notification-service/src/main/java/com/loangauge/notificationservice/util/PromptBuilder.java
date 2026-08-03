package com.loangauge.notificationservice.util;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildRecommendationPrompt(AssessmentCompletedEvent event) {
        return """
            You are a financial advisor. Based on the following loan assessment data,
            give 3-5 short, actionable personalized recommendations (debt reduction,
            savings tips, credit improvement). Keep each tip under 25 words.

            Loan Type: %s
            Loan Amount: %s
            FOIR: %s%%
            DTI: %s%%
            Financial Readiness Score: %s
            Risk Category: %s
            Eligible Amount: %s

            Return ONLY a JSON array of strings, no other text.
            """.formatted(
                event.getLoanType(), event.getLoanAmount(), event.getFoir(),
                event.getDti(), event.getFinancialReadinessScore(),
                event.getRiskCategory(), event.getEligibleAmount()
            );
    }
}