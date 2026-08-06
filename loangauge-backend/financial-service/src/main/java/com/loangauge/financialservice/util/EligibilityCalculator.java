package com.loangauge.financialservice.util;

import java.math.BigDecimal;

import static com.loangauge.financialservice.util.CalculationConstants.*;

/**
 * Determines max loan eligibility based on FOIR caps, income multipliers, and age limits.
 */

public class EligibilityCalculator {

    private EligibilityCalculator() {}

    /**
     * Calculates maximum borrowing capacity by taking the lower value between 
     * FOIR debt-capacity limits and gross income multiplier caps.
     */
    /** Eligible amount = MIN(FOIR-based, multiplier-based)*/
    public static BigDecimal calculateEligibleAmount(BigDecimal netMonthlyIncome, BigDecimal existingEmi,
                                                       BigDecimal foirCap, BigDecimal annualRatePercent,
                                                       int tenureMonths, BigDecimal incomeMultiplier) {
        if (netMonthlyIncome == null || netMonthlyIncome.compareTo(BigDecimal.ZERO) <= 0
                || foirCap == null || tenureMonths <= 0 || incomeMultiplier == null) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE);
        }

        BigDecimal maxAllowedObligations = netMonthlyIncome
                .multiply(foirCap)
                .divide(BigDecimal.valueOf(100), MONEY_SCALE, ROUNDING);
        BigDecimal availableEmi = maxAllowedObligations.subtract(nz(existingEmi));
        if (availableEmi.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE);
        }

        BigDecimal foirBasedAmount = EMICalculator.calculateMaxPrincipal(availableEmi, annualRatePercent, tenureMonths);
        BigDecimal multiplierBasedAmount = netMonthlyIncome.multiply(incomeMultiplier).setScale(MONEY_SCALE, ROUNDING);

        return foirBasedAmount.min(multiplierBasedAmount).setScale(MONEY_SCALE, ROUNDING);
    }
    
    /**
     * Restricts requested loan duration so the payoff period doesn't cross retirement age.
	Caps tenure so the loan is repaid by age 65 (70 for govt employees). */
    public static int capTenureByAge(int requestedTenureMonths, int currentAge, boolean isGovernmentEmployee) {
        int retirementAge = isGovernmentEmployee ? 70 : 65;
        int maxTenureMonthsByAge = Math.max(0, (retirementAge - currentAge) * 12);
        return Math.min(requestedTenureMonths, maxTenureMonthsByAge);
    }

    // Handle Null, null => 0 : the value.
    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}