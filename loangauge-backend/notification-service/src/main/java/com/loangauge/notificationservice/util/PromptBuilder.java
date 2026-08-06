package com.loangauge.notificationservice.util;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildRecommendationPrompt(AssessmentCompletedEvent event) {
        return """
                You are a senior financial advisor reviewing a loan assessment for an individual in India.
                Based on the complete financial profile and assessment results below, provide 4-6 short,
                highly personalized, actionable recommendations. Focus on the user's specific weak spots
                (e.g. high FOIR, low savings, poor credit utilization, unstable income). Each tip must be
                under 100 words and directly reference the user's actual numbers where relevant.

                === PERSONAL PROFILE ===
                Age: %s | Marital Status: %s | Dependents: %s
                Employment Type: %s | Work Experience: %s years | Income Stability: %s

                === FINANCIAL INPUTS ===
                Monthly Income:    ₹%s
                Monthly Expenses:  ₹%s
                Existing EMI:      ₹%s
                Savings:           ₹%s
                Fixed Deposits:    ₹%s
                Investments:       ₹%s
                Emergency Fund:    ₹%s
                CIBIL Score:       %s
                Existing Loans:    %s
                Credit Utilization: %s%%

                === LOAN BEING ASSESSED ===
                Type: %s | Amount: ₹%s | Tenure: %s months | Rate: %s%% p.a.
                Proposed Monthly EMI: ₹%s

                === COMPUTED ASSESSMENT METRICS ===
                FOIR (Fixed Obligation to Income Ratio): %s%% — ideally below 40%%
                DTI  (Debt to Income Ratio):             %s%% — ideally below 35%%
                Savings Ratio:                           %s%%
                Emergency Fund Coverage:                 %s months — target is 6+
                Disposable Income after new EMI:         ₹%s
                Eligible Loan Amount:                    ₹%s
                Financial Readiness Score:               %s / 100
                Risk Category:                           %s

                Return ONLY a JSON array of recommendation strings with no other text or markdown.
                Example format: ["Tip one.", "Tip two.", "Tip three."]
                """.formatted(
                // Personal profile
                event.getAge(), event.getMaritalStatus(), event.getDependents(),
                event.getEmploymentType(), event.getWorkExperienceYears(), event.getIncomeStability(),
                // Financial inputs
                event.getMonthlyIncome(), event.getMonthlyExpenses(), event.getExistingEmi(),
                event.getSavings(), event.getFixedDeposits(), event.getInvestments(),
                event.getEmergencyFund(), event.getCibilScore(), event.getExistingLoans(),
                event.getCreditUtilization(),
                // Loan details
                event.getLoanType(), event.getLoanAmount(), event.getTenureMonths(),
                event.getInterestRate(), event.getProposedEmi(),
                // Computed metrics
                event.getFoir(), event.getDti(), event.getSavingsRatio(),
                event.getEmergencyFundCoverageMonths(), event.getDisposableIncome(),
                event.getEligibleAmount(), event.getFinancialReadinessScore(), event.getRiskCategory());
    }
}