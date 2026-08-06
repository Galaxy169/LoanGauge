package com.loangauge.financialservice.util;

import com.loangauge.financialservice.entity.RiskLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FinancialScoreCalculator Tests")
class FinancialScoreCalculatorTest {

    @Test
    @DisplayName("calculateDisposableIncome - standard subtraction")
    void calculateDisposableIncome_valid() {
        BigDecimal income = new BigDecimal("100000.00");
        BigDecimal emi = new BigDecimal("20000.00");
        BigDecimal other = new BigDecimal("5000.00");

        BigDecimal disposable = FinancialScoreCalculator.calculateDisposableIncome(income, emi, other);

        assertThat(disposable).isEqualTo(new BigDecimal("75000.00"));
    }

    @Test
    @DisplayName("scoreCreditUtilization - correct score bands")
    void scoreCreditUtilization_bands() {
        assertThat(FinancialScoreCalculator.scoreCreditUtilization(new BigDecimal("20"))).isEqualTo(100);
        assertThat(FinancialScoreCalculator.scoreCreditUtilization(new BigDecimal("40"))).isEqualTo(75);
        assertThat(FinancialScoreCalculator.scoreCreditUtilization(new BigDecimal("60"))).isEqualTo(50);
        assertThat(FinancialScoreCalculator.scoreCreditUtilization(new BigDecimal("80"))).isEqualTo(25);
    }

    @Test
    @DisplayName("scoreCreditProfile - cibil bands and loan penalty")
    void scoreCreditProfile_cibilAndPenalty() {
        // High CIBIL, <= 2 loans -> 100
        assertThat(FinancialScoreCalculator.scoreCreditProfile(780, 2)).isEqualTo(100);
        // CIBIL 710 -> base 80, 4 loans -> (4-2)*5 = 10 penalty -> 70
        assertThat(FinancialScoreCalculator.scoreCreditProfile(710, 4)).isEqualTo(70);
        // Missing CIBIL -> neutral default 50
        assertThat(FinancialScoreCalculator.scoreCreditProfile(null, 1)).isEqualTo(50);
    }

    @Test
    @DisplayName("scoreEmploymentStability - work experience and stability tier")
    void scoreEmploymentStability_valid() {
        // 5+ yrs exp (40 pts) + STABLE (60 pts) = 100
        assertThat(FinancialScoreCalculator.scoreEmploymentStability(5, "STABLE")).isEqualTo(100);
        // 1 yr exp (10 pts) + UNSTABLE/OTHER (15 pts) = 25
        assertThat(FinancialScoreCalculator.scoreEmploymentStability(1, "VOLATILE")).isEqualTo(25);
    }

    @Test
    @DisplayName("classifyRisk - maps financial scores to risk levels")
    void classifyRisk_mapping() {
        assertThat(FinancialScoreCalculator.classifyRisk(95)).isEqualTo(RiskLevel.EXCELLENT);
        assertThat(FinancialScoreCalculator.classifyRisk(80)).isEqualTo(RiskLevel.GOOD);
        assertThat(FinancialScoreCalculator.classifyRisk(65)).isEqualTo(RiskLevel.MODERATE);
        assertThat(FinancialScoreCalculator.classifyRisk(45)).isEqualTo(RiskLevel.NEEDS_IMPROVEMENT);
        assertThat(FinancialScoreCalculator.classifyRisk(30)).isEqualTo(RiskLevel.HIGH_RISK);
    }

    @Test
    @DisplayName("applyAffordabilityCap - caps score when negative disposable income or high FOIR")
    void applyAffordabilityCap_capsScore() {
        // High weighted score but negative disposable income forces HIGH_RISK (<= 39)
        int capped1 = FinancialScoreCalculator.applyAffordabilityCap(85, new BigDecimal("40"), new BigDecimal("-1000"));
        assertThat(capped1).isEqualTo(39);

        // High weighted score but FOIR > 75% forces <= 55
        int capped2 = FinancialScoreCalculator.applyAffordabilityCap(90, new BigDecimal("80"), new BigDecimal("10000"));
        assertThat(capped2).isEqualTo(55);

        // Unconstrained returns weighted score
        int normal = FinancialScoreCalculator.applyAffordabilityCap(85, new BigDecimal("35"), new BigDecimal("20000"));
        assertThat(normal).isEqualTo(85);
    }
}