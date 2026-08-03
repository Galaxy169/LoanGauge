package com.loangauge.financialservice.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EligibilityCalculatorTest {

    @Test
    void eligibleAmountTakesLowerOfFoirAndMultiplier() {
        // High multiplier so FOIR-based amount is the binding (lower) constraint
        BigDecimal eligible = EligibilityCalculator.calculateEligibleAmount(
                new BigDecimal("90000"),   // income
                new BigDecimal("12000"),   // existing EMI
                new BigDecimal("60"),      // FOIR cap %
                new BigDecimal("10"),      // rate
                60,                        // tenure
                new BigDecimal("100"));    // absurdly high multiplier → not the binding one
        // available EMI = 90000*0.60 - 12000 = 42000; principal for 42000 over 60mo @10% > 0
        assertTrue(eligible.compareTo(BigDecimal.ZERO) > 0);
        // multiplier-based would be 9,000,000 — so FOIR-based must be the smaller chosen value
        assertTrue(eligible.compareTo(new BigDecimal("9000000")) < 0);
    }

    @Test
    void returnsZeroWhenExistingObligationsExceedFoirCap() {
        // existing EMI already above the FOIR-allowed ceiling → no room → 0
        BigDecimal eligible = EligibilityCalculator.calculateEligibleAmount(
                new BigDecimal("50000"), new BigDecimal("40000"),
                new BigDecimal("50"), new BigDecimal("10"), 60, new BigDecimal("15"));
        assertEquals(0, eligible.compareTo(BigDecimal.ZERO));
    }

    @Test
    void capsTenureByAge() {
        // age 60, non-govt → retires at 65 → max 5 years = 60 months; requested 120 capped to 60
        assertEquals(60, EligibilityCalculator.capTenureByAge(120, 60, false));
        // govt employee retires at 70 → 10 years = 120 months; requested 120 stays 120
        assertEquals(120, EligibilityCalculator.capTenureByAge(120, 60, true));
        // requested shorter than the cap → unchanged
        assertEquals(36, EligibilityCalculator.capTenureByAge(36, 40, false));
    }
}