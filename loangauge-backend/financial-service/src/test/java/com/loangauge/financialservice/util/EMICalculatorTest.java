package com.loangauge.financialservice.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EMICalculator Tests")
class EMICalculatorTest {

    @Test
    @DisplayName("calculateEmi - standard loan calculation")
    void calculateEmi_standardLoan() {
        BigDecimal principal = new BigDecimal("100000");
        BigDecimal annualRate = new BigDecimal("12");
        int tenure = 12;

        BigDecimal emi = EMICalculator.calculateEmi(principal, annualRate, tenure);

        assertThat(emi).isNotNull();
        assertThat(emi.doubleValue()).isBetween(8880.0, 8890.0);
    }

    @Test
    @DisplayName("calculateEmi - zero interest rate")
    void calculateEmi_zeroInterest() {
        BigDecimal principal = new BigDecimal("120000");
        BigDecimal annualRate = BigDecimal.ZERO;
        int tenure = 12;

        BigDecimal emi = EMICalculator.calculateEmi(principal, annualRate, tenure);

        assertThat(emi).isEqualTo(new BigDecimal("10000.00"));
    }

    @Test
    @DisplayName("calculateEmi - invalid or zero input returns 0.00")
    void calculateEmi_invalidInput() {
        assertThat(EMICalculator.calculateEmi(null, new BigDecimal("10"), 12))
                .isEqualTo(new BigDecimal("0.00"));
        assertThat(EMICalculator.calculateEmi(new BigDecimal("100000"), new BigDecimal("10"), 0))
                .isEqualTo(new BigDecimal("0.00"));
        assertThat(EMICalculator.calculateEmi(new BigDecimal("-5000"), new BigDecimal("10"), 12))
                .isEqualTo(new BigDecimal("0.00"));
    }

    @Test
    @DisplayName("calculateMaxPrincipal - inverse EMI formula")
    void calculateMaxPrincipal_valid() {
        BigDecimal availableEmi = new BigDecimal("10000");
        BigDecimal annualRate = BigDecimal.ZERO;
        int tenure = 12;

        BigDecimal maxPrincipal = EMICalculator.calculateMaxPrincipal(availableEmi, annualRate, tenure);

        assertThat(maxPrincipal).isEqualTo(new BigDecimal("120000.00"));
    }
}