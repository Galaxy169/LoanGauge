package com.loangauge.financialservice.dto;

import java.math.BigDecimal;

public record ProfileResponseDto(
        Long profileId,
        Long userId,
        Integer age,
        String maritalStatus,
        Integer dependents,
        String cityType,
        String employmentType,
        Integer workExperienceYears,
        String incomeStability,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpenses,
        Integer existingLoans,
        BigDecimal monthlyEmi,
        BigDecimal creditCardBalance,
        BigDecimal savings,
        BigDecimal fixedDeposits,
        BigDecimal investments,
        BigDecimal emergencyFund,
        Integer cibilScore,
        BigDecimal creditUtilization
) {
}