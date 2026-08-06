package com.loangauge.financialservice.util;

import java.math.BigDecimal;

import static com.loangauge.financialservice.util.CalculationConstants.*;

/**
 * Calculates Fixed Obligation to Income Ratio (FOIR) and maps it to a financial health score.
 * FOIR -> tells if the person can afford the new loan EMI
 */

// FOIR = (Total Monthly Fixed Obligations ÷ Gross Monthly Income) × 100

public class FOIRCalculator {

    private FOIRCalculator() {}

    public static BigDecimal calculateFoir(BigDecimal monthlyIncome, BigDecimal existingEmi,
                                            BigDecimal proposedEmi, BigDecimal otherObligations) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(RATIO_SCALE);
        }
        BigDecimal totalObligations = nz(existingEmi).add(nz(proposedEmi)).add(nz(otherObligations));
        return totalObligations
                .divide(monthlyIncome, MC)
                .multiply(BigDecimal.valueOf(100))
                .setScale(RATIO_SCALE, ROUNDING);
    }

    /**
     * Maps FOIR to a 0-100 sub-score using the SELECTED loan type's own bands (loan-
     * type-aware scoring). Matches the SRS's four-tier interpretation.
     */
    /**
     * Converts a FOIR percentage into a 4-tier sub-score (25–100) based on loan-specific risk thresholds.
     */
    
    public static int scoreFoir(BigDecimal foir, BigDecimal excellentMax, BigDecimal acceptableMax, BigDecimal cautionMax) {
        if (foir.compareTo(excellentMax) <= 0) return 100;
        if (foir.compareTo(acceptableMax) <= 0) return 75;
        if (foir.compareTo(cautionMax) <= 0) return 50;
        return 25;
    }

    // Handle Null, null => 0 : the value.
    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}