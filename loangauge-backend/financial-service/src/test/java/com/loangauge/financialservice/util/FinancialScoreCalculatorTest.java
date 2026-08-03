package com.loangauge.financialservice.util;

import com.loangauge.financialservice.entity.RiskLevel;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FinancialScoreCalculatorTest {

    @Test
    void allPerfectSubScoresGive100() {
        int score = FinancialScoreCalculator.calculateFinalScore(100, 100, 100, 100, 100, 100, 100, 100);
        assertEquals(100, score);
    }

    @Test
    void weightedCombinationIsCorrect() {
        // Only FOIR (weight 0.25) is 100, everything else 0 → score 25
        int score = FinancialScoreCalculator.calculateFinalScore(100, 0, 0, 0, 0, 0, 0, 0);
        assertEquals(25, score);
    }

    @Test
    void classifiesRiskByBand() {
        assertEquals(RiskLevel.EXCELLENT, FinancialScoreCalculator.classifyRisk(95));
        assertEquals(RiskLevel.GOOD, FinancialScoreCalculator.classifyRisk(80));
        assertEquals(RiskLevel.MODERATE, FinancialScoreCalculator.classifyRisk(65));
        assertEquals(RiskLevel.NEEDS_IMPROVEMENT, FinancialScoreCalculator.classifyRisk(45));
        assertEquals(RiskLevel.HIGH_RISK, FinancialScoreCalculator.classifyRisk(30));
    }

    @Test
    void affordabilityCapForcesHighRiskOnNegativeDisposableIncome() {
        // Healthy weighted score of 61, but negative disposable income → capped to <=39
        int capped = FinancialScoreCalculator.applyAffordabilityCap(
                61, new BigDecimal("585"), new BigDecimal("-436684"));
        assertTrue(capped <= 39);
        assertEquals(RiskLevel.HIGH_RISK, FinancialScoreCalculator.classifyRisk(capped));
    }

    @Test
    void affordabilityCapForHighFoirWithoutNegativeIncome() {
        // FOIR 80% (>75) but disposable income positive → capped to <=55
        int capped = FinancialScoreCalculator.applyAffordabilityCap(
                70, new BigDecimal("80"), new BigDecimal("5000"));
        assertTrue(capped <= 55);
    }

    @Test
    void noAffordabilityCapWhenHealthy() {
        // Reasonable FOIR, positive disposable income → score unchanged
        int result = FinancialScoreCalculator.applyAffordabilityCap(
                82, new BigDecimal("35"), new BigDecimal("40000"));
        assertEquals(82, result);
    }
}