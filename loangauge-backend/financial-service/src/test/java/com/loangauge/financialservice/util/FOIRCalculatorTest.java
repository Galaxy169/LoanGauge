package com.loangauge.financialservice.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FOIRCalculatorTest {

    @Test
    void calculatesFoirCorrectly() {
        // (10000 + 20000 + 0) / 100000 * 100 = 30.00
        BigDecimal foir = FOIRCalculator.calculateFoir(
                new BigDecimal("100000"), new BigDecimal("10000"), new BigDecimal("20000"), BigDecimal.ZERO);
        assertEquals(new BigDecimal("30.00"), foir);
    }

    @Test
    void returnsZeroWhenIncomeIsZeroOrNull() {
        assertEquals(0, FOIRCalculator.calculateFoir(BigDecimal.ZERO, new BigDecimal("5000"), BigDecimal.ZERO, BigDecimal.ZERO).compareTo(BigDecimal.ZERO));
        assertEquals(0, FOIRCalculator.calculateFoir(null, new BigDecimal("5000"), BigDecimal.ZERO, BigDecimal.ZERO).compareTo(BigDecimal.ZERO));
    }

    @Test
    void handlesNullObligationsAsZero() {
        // null proposed/other treated as zero → (5000)/50000*100 = 10.00
        BigDecimal foir = FOIRCalculator.calculateFoir(new BigDecimal("50000"), new BigDecimal("5000"), null, null);
        assertEquals(new BigDecimal("10.00"), foir);
    }

    @Test
    void scoresByLoanTypeBands() {
        // Home Loan bands: excellent<=45, acceptable<=60, caution<=70
        BigDecimal ex = new BigDecimal("45"), ac = new BigDecimal("60"), ca = new BigDecimal("70");
        assertEquals(100, FOIRCalculator.scoreFoir(new BigDecimal("40"), ex, ac, ca));
        assertEquals(75, FOIRCalculator.scoreFoir(new BigDecimal("55"), ex, ac, ca));
        assertEquals(50, FOIRCalculator.scoreFoir(new BigDecimal("65"), ex, ac, ca));
        assertEquals(25, FOIRCalculator.scoreFoir(new BigDecimal("90"), ex, ac, ca));
    }
}