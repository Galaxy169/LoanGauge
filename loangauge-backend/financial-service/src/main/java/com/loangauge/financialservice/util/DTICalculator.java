package com.loangauge.financialservice.util;

import java.math.BigDecimal;

import static com.loangauge.financialservice.util.CalculationConstants.*;

/**
 * Calculates Debt-to-Income Ratio (DTI) and maps it to a financial health score.
 */

// DTI -> If the person is able to afford his existing EMI

// DTI ratio = (Total monthly debt payments ÷ gross monthly income) x 100

public class DTICalculator {

    private DTICalculator() {}

    /**
     * Calculates total recurring monthly debt obligations as a percentage of gross monthly income.
     */
    public static BigDecimal calculateDti(BigDecimal grossMonthlyIncome, BigDecimal existingEmi,
                                           BigDecimal proposedEmi, BigDecimal otherObligations) {
        if (grossMonthlyIncome == null || grossMonthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(RATIO_SCALE);
        }
        BigDecimal totalDebt = nz(existingEmi).add(nz(proposedEmi)).add(nz(otherObligations));
        return totalDebt
                .divide(grossMonthlyIncome, MC)
                .multiply(BigDecimal.valueOf(100))
                .setScale(RATIO_SCALE, ROUNDING);
    }

    /**
     * Converts a DTI percentage into a 4-tier sub-score (25–100) based on risk thresholds.
     */
    public static int scoreDti(BigDecimal dti, BigDecimal lowMax, BigDecimal moderateMax, BigDecimal highMax) {
        if (dti.compareTo(lowMax) <= 0) return 100;
        if (dti.compareTo(moderateMax) <= 0) return 75;
        if (dti.compareTo(highMax) <= 0) return 50;
        return 25;
    }

    // Handle Null, null => 0 : the value.
    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}