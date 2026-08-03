package com.loangauge.financialservice.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EMICalculatorTest {

    @Test
    void calculatesEmiForStandardLoan() {
        // ₹10,00,000 at 10% for 120 months → known EMI ≈ 13,215.07
        BigDecimal emi = EMICalculator.calculateEmi(new BigDecimal("1000000"), new BigDecimal("10"), 120);
        assertEquals(new BigDecimal("13215.07"), emi);
    }

    @Test
    void zeroInterestSplitsPrincipalEvenly() {
        // 0% → EMI is just principal / tenure, no crash
        BigDecimal emi = EMICalculator.calculateEmi(new BigDecimal("120000"), BigDecimal.ZERO, 12);
        assertEquals(new BigDecimal("10000.00"), emi);
    }

    @Test
    void returnsZeroForInvalidPrincipalOrTenure() {
        assertEquals(0, EMICalculator.calculateEmi(BigDecimal.ZERO, new BigDecimal("10"), 12).compareTo(BigDecimal.ZERO));
        assertEquals(0, EMICalculator.calculateEmi(new BigDecimal("100000"), new BigDecimal("10"), 0).compareTo(BigDecimal.ZERO));
        assertEquals(0, EMICalculator.calculateEmi(null, new BigDecimal("10"), 12).compareTo(BigDecimal.ZERO));
    }

    @Test
    void maxPrincipalIsInverseOfEmi() {
        // If EMI for P is X, then max principal for EMI X should be ~P
        BigDecimal principal = new BigDecimal("500000");
        BigDecimal emi = EMICalculator.calculateEmi(principal, new BigDecimal("12"), 60);
        BigDecimal recovered = EMICalculator.calculateMaxPrincipal(emi, new BigDecimal("12"), 60);
        // allow ₹1 tolerance for rounding
        assertTrue(recovered.subtract(principal).abs().compareTo(BigDecimal.ONE) <= 0);
    }

    @Test
    void maxPrincipalZeroInterest() {
        // 0% → max principal = EMI * tenure
        BigDecimal result = EMICalculator.calculateMaxPrincipal(new BigDecimal("10000"), BigDecimal.ZERO, 12);
        assertEquals(new BigDecimal("120000.00"), result);
    }
}