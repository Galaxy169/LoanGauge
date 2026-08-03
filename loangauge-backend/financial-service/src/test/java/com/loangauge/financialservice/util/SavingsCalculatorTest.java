package com.loangauge.financialservice.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class SavingsCalculatorTest {

    @Test
    void calculatesSavingsRatio() {
        // (90000 - 45000) / 90000 * 100 = 50.00
        BigDecimal ratio = SavingsCalculator.calculateSavingsRatio(new BigDecimal("90000"), new BigDecimal("45000"));
        assertEquals(new BigDecimal("50.00"), ratio);
    }

    @Test
    void negativeSavingsFlowsThroughToPoorScore() {
        // expenses > income → negative ratio → lowest score, no crash
        BigDecimal ratio = SavingsCalculator.calculateSavingsRatio(new BigDecimal("40000"), new BigDecimal("50000"));
        assertTrue(ratio.compareTo(BigDecimal.ZERO) < 0);
        assertEquals(25, SavingsCalculator.scoreSavingsRatio(ratio));
    }

    @Test
    void emergencyFundCoverage() {
        // 300000 / 45000 = 6.67 months
        BigDecimal coverage = SavingsCalculator.calculateEmergencyFundCoverage(new BigDecimal("300000"), new BigDecimal("45000"));
        assertEquals(new BigDecimal("6.67"), coverage);
        assertEquals(100, SavingsCalculator.scoreEmergencyFundCoverage(coverage));
    }

    @Test
    void emergencyFundCoverageZeroExpensesDoesNotCrash() {
        assertEquals(0, SavingsCalculator.calculateEmergencyFundCoverage(new BigDecimal("100000"), BigDecimal.ZERO).compareTo(BigDecimal.ZERO));
    }
}