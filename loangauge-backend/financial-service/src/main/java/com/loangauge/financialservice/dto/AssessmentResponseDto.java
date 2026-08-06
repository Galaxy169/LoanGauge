package com.loangauge.financialservice.dto;

import com.loangauge.financialservice.entity.AssessmentStatus;
import com.loangauge.financialservice.entity.RiskLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AssessmentResponseDto(
        Long assessmentId,
        Long loanTypeId,
        String loanTypeName,
        BigDecimal loanAmount,
        Integer tenureMonths,
        BigDecimal interestRate,
        BigDecimal emi,
        BigDecimal foir,
        BigDecimal dti,
        BigDecimal savingsRatio,
        BigDecimal emergencyFundCoverageMonths,
        BigDecimal creditUtilization,
        BigDecimal disposableIncome,
        Integer financialScore,
        RiskLevel riskLevel,
        BigDecimal eligibleAmount,
        AssessmentStatus status,
        LocalDateTime assessmentDate
) {
}