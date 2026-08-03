package com.loangauge.financialservice.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.loangauge.financialservice.entity.RiskLevel;

import static com.loangauge.financialservice.util.CalculationConstants.*;

public class FinancialScoreCalculator {

    private FinancialScoreCalculator() {}

    // Weights are fixed across all loan types.
    private static final BigDecimal WEIGHT_FOIR = BigDecimal.valueOf(0.25);
    private static final BigDecimal WEIGHT_DTI = BigDecimal.valueOf(0.20);
    private static final BigDecimal WEIGHT_CREDIT_PROFILE = BigDecimal.valueOf(0.20);
    private static final BigDecimal WEIGHT_SAVINGS_RATIO = BigDecimal.valueOf(0.10);
    private static final BigDecimal WEIGHT_EMPLOYMENT_STABILITY = BigDecimal.valueOf(0.10);
    private static final BigDecimal WEIGHT_EMERGENCY_FUND = BigDecimal.valueOf(0.05);
    private static final BigDecimal WEIGHT_CREDIT_UTILIZATION = BigDecimal.valueOf(0.05);
    private static final BigDecimal WEIGHT_DISPOSABLE_INCOME = BigDecimal.valueOf(0.05);

    /**
     * Calculates net monthly income remaining after accounting for primary loan EMIs and debt obligations.
     */
    
    public static BigDecimal calculateDisposableIncome(BigDecimal monthlyIncome, BigDecimal monthlyEmi, BigDecimal otherObligations) {
        return nz(monthlyIncome).subtract(nz(monthlyEmi)).subtract(nz(otherObligations))
                .setScale(MONEY_SCALE, ROUNDING);
    }

    // income scores 0; a disposable-income-to-income ratio of 40% or more scores 100,
    // scaling linearly in between.
    public static int scoreDisposableIncome(BigDecimal disposableIncome, BigDecimal monthlyIncome) {
        if (disposableIncome == null || monthlyIncome == null
                || disposableIncome.compareTo(BigDecimal.ZERO) <= 0
                || monthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        BigDecimal ratio = disposableIncome.divide(monthlyIncome, MC);
        BigDecimal capped = ratio.min(BigDecimal.valueOf(0.40));
        return capped
                .divide(BigDecimal.valueOf(0.40), MC)
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, ROUNDING)
                .intValue();
    }

    /** Per SRS: <30% Excellent, 30-50% Good, 50-75% High, >75% Poor. */
    public static int scoreCreditUtilization(BigDecimal creditUtilization) {
        if (creditUtilization.compareTo(BigDecimal.valueOf(30)) < 0) return 100;
        if (creditUtilization.compareTo(BigDecimal.valueOf(50)) < 0) return 75;
        if (creditUtilization.compareTo(BigDecimal.valueOf(75)) < 0) return 50;
        return 25;
    }

    // Credit Profile score is CIBIL-driven using standard Indian CIBIL
    // bands (750+ excellent ... <600 very poor), with a small penalty for more than 2
    // active existing loans. A missing CIBIL score is treated as neutral (50), not
    // penalized, since manual self-reporting means it may simply be left blank.
    public static int scoreCreditProfile(Integer cibilScore, Integer existingLoanCount) {
        int base;
        if (cibilScore == null) {
            base = 50; // Neutral default when CIBIL is unpopulated
        } else if (cibilScore >= 750) {
            base = 100;
        } else if (cibilScore >= 700) {
            base = 80;
        } else if (cibilScore >= 650) {
            base = 60;
        } else if (cibilScore >= 600) {
            base = 40;
        } else {
            base = 20;
        }
        int activeLoanPenalty = existingLoanCount != null && existingLoanCount > 2
                ? (existingLoanCount - 2) * 5
                : 0;
        return Math.max(0, base - activeLoanPenalty);
    }

    // work experience contributes up to 40 points, self-reported income stability up to 60.
    /**
     * Evaluates stability using work experience (max 40 pts) and self-reported income stability (max 60 pts).
     */
    public static int scoreEmploymentStability(Integer workExperienceYears, String incomeStability) {
        int experiencePoints;
        if (workExperienceYears == null) {
            experiencePoints = 20;
        } else if (workExperienceYears >= 5) {
            experiencePoints = 40;
        } else if (workExperienceYears >= 2) {
            experiencePoints = 25;
        } else {
            experiencePoints = 10;
        }

        int stabilityPoints;
        if (incomeStability == null) {
            stabilityPoints = 35;
        } else if (incomeStability.equalsIgnoreCase("STABLE")) {
            stabilityPoints = 60;
        } else if (incomeStability.equalsIgnoreCase("MODERATE")) {
            stabilityPoints = 35;
        } else {
            stabilityPoints = 15;
        }

        return Math.min(100, experiencePoints + stabilityPoints);
    }

    /** Combines all 8 weighted sub-scores (each pre-normalized 0-100) into the final score. */
    public static int calculateFinalScore(int foirScore, int dtiScore, int creditProfileScore,
                                           int savingsRatioScore, int employmentStabilityScore,
                                           int emergencyFundScore, int creditUtilizationScore,
                                           int disposableIncomeScore) {
        BigDecimal weighted = BigDecimal.valueOf(foirScore).multiply(WEIGHT_FOIR)
                .add(BigDecimal.valueOf(dtiScore).multiply(WEIGHT_DTI))
                .add(BigDecimal.valueOf(creditProfileScore).multiply(WEIGHT_CREDIT_PROFILE))
                .add(BigDecimal.valueOf(savingsRatioScore).multiply(WEIGHT_SAVINGS_RATIO))
                .add(BigDecimal.valueOf(employmentStabilityScore).multiply(WEIGHT_EMPLOYMENT_STABILITY))
                .add(BigDecimal.valueOf(emergencyFundScore).multiply(WEIGHT_EMERGENCY_FUND))
                .add(BigDecimal.valueOf(creditUtilizationScore).multiply(WEIGHT_CREDIT_UTILIZATION))
                .add(BigDecimal.valueOf(disposableIncomeScore).multiply(WEIGHT_DISPOSABLE_INCOME));

        return weighted.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    /**
     * Classifies a numerical financial score into its corresponding risk tier.
     */
    public static RiskLevel classifyRisk(int financialScore) {
        if (financialScore >= 90) return RiskLevel.EXCELLENT;
        if (financialScore >= 75) return RiskLevel.GOOD;
        if (financialScore >= 60) return RiskLevel.MODERATE;
        if (financialScore >= 40) return RiskLevel.NEEDS_IMPROVEMENT;
        return RiskLevel.HIGH_RISK;
    }
    
    /**
     * Affordability guardrail: no matter how healthy the other metrics are, a loan the
     * user fundamentally cannot afford (obligations far exceeding income, or negative
     * disposable income) must not score as merely "moderate". A weighted average alone
     * lets healthy savings/credit dilute a catastrophic FOIR — this caps that.
     */
    public static int applyAffordabilityCap(int weightedScore, BigDecimal foir, BigDecimal disposableIncome) {
        // Negative disposable income = cannot service the loan at all → hard cap at High Risk band.
        if (disposableIncome != null && disposableIncome.compareTo(BigDecimal.ZERO) < 0) {
            return Math.min(weightedScore, 39); // forces HIGH_RISK
        }
        // FOIR beyond ~75% is unaffordable by any lender's standard → cap at Needs Improvement.
        if (foir != null && foir.compareTo(BigDecimal.valueOf(75)) > 0) {
            return Math.min(weightedScore, 55); // forces NEEDS_IMPROVEMENT or worse
        }
        return weightedScore;
    }
    
    
    // Handle Null, null => 0 : the value.
    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
    
}