package com.loangauge.financialservice.util;

import java.math.BigDecimal;

import static com.loangauge.financialservice.util.CalculationConstants.*;

public class EMICalculator {

    private EMICalculator() {}

    /** EMI = P * r * (1+r)^n / ((1+r)^n - 1), where r = monthly rate, n = tenure months. */
    public static BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRatePercent, int tenureMonths) {
        if (principal == null || principal.compareTo(BigDecimal.ZERO) <= 0 || tenureMonths <= 0) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE);
        }
        BigDecimal monthlyRate = safeMonthlyRate(annualRatePercent);

        // 0% interest: EMI is just principal spread evenly across the tenure.
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), MONEY_SCALE, ROUNDING);
        }

        BigDecimal onePlusRPowN = BigDecimal.ONE.add(monthlyRate).pow(tenureMonths, MC);
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(onePlusRPowN);
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, MONEY_SCALE, ROUNDING);
    }

    /**
     * Inverse of the EMI formula — solves for the max principal a given EMI can
     * service. Used by EligibilityCalculator for the FOIR-based eligible amount.
     */
    
    public static BigDecimal calculateMaxPrincipal(BigDecimal availableEmi, BigDecimal annualRatePercent, int tenureMonths) {
        if (availableEmi == null || availableEmi.compareTo(BigDecimal.ZERO) <= 0 || tenureMonths <= 0) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE);
        }
        BigDecimal monthlyRate = safeMonthlyRate(annualRatePercent);

        // 0% interest: max principal is simply the EMI times the number of months.
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return availableEmi.multiply(BigDecimal.valueOf(tenureMonths)).setScale(MONEY_SCALE, ROUNDING);
        }

        BigDecimal onePlusRPowN = BigDecimal.ONE.add(monthlyRate).pow(tenureMonths, MC);
        BigDecimal numerator = availableEmi.multiply(onePlusRPowN.subtract(BigDecimal.ONE));
        BigDecimal denominator = monthlyRate.multiply(onePlusRPowN);

        return numerator.divide(denominator, MONEY_SCALE, ROUNDING);
    }

    // Handle null and negative input
    private static BigDecimal safeMonthlyRate(BigDecimal annualRatePercent) {
        if (annualRatePercent == null || annualRatePercent.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return annualRatePercent.divide(BigDecimal.valueOf(1200), MC);
    }
}