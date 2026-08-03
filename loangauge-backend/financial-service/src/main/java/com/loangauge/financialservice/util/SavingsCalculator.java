package com.loangauge.financialservice.util;

import java.math.BigDecimal;

import static com.loangauge.financialservice.util.CalculationConstants.*;

public class SavingsCalculator {

    private SavingsCalculator() {}

    /**
     * Savings Ratio = (income - expenses) / income * 100. The profile doesn't collect
     * a separate "amount saved" field, so income-minus-expenses is the standard proxy.
     */
    
    public static BigDecimal calculateSavingsRatio(BigDecimal monthlyIncome, BigDecimal monthlyExpenses) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(RATIO_SCALE);
        }
        BigDecimal monthlySavings = monthlyIncome.subtract(nz(monthlyExpenses));
        return monthlySavings
                .divide(monthlyIncome, MC)
                .multiply(BigDecimal.valueOf(100))
                .setScale(RATIO_SCALE, ROUNDING);
    }

    /** >30% Excellent, 20-30% Good, 10-20% Fair, <10% Poor. */
    public static int scoreSavingsRatio(BigDecimal savingsRatio) {
        if (savingsRatio.compareTo(BigDecimal.valueOf(30)) > 0) return 100;
        if (savingsRatio.compareTo(BigDecimal.valueOf(20)) > 0) return 75;
        if (savingsRatio.compareTo(BigDecimal.valueOf(10)) > 0) return 50;
        return 25;
    }

    /**
     * Calculates how many months of living expenses the emergency fund can sustain.
     */
    public static BigDecimal calculateEmergencyFundCoverage(BigDecimal emergencyFund, BigDecimal monthlyExpenses) {
        if (monthlyExpenses == null || monthlyExpenses.compareTo(BigDecimal.ZERO) <= 0) {
            // No expenses recorded — coverage is effectively unbounded; return 0 so it
            // neither crashes nor fabricates a misleadingly high coverage figure.
            return BigDecimal.ZERO.setScale(RATIO_SCALE);
        }
        return nz(emergencyFund).divide(monthlyExpenses, RATIO_SCALE, ROUNDING);
    }

    /**
     * Converts emergency fund runway (in months) into a 4-tier score (25–100).
     */
    // >=6 months Excellent, 3-6 Adequate, 1-3 Limited, <1 Critical. 
    public static int scoreEmergencyFundCoverage(BigDecimal coverageMonths) {
        if (coverageMonths.compareTo(BigDecimal.valueOf(6)) >= 0) return 100;
        if (coverageMonths.compareTo(BigDecimal.valueOf(3)) >= 0) return 75;
        if (coverageMonths.compareTo(BigDecimal.ONE) >= 0) return 50;
        return 25;
    }

    // Handle Null, null => 0 : the value.
    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}