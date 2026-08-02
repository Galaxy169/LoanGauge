package com.loangauge.financialservice.dto;

import com.loangauge.financialservice.entity.LoanCategory;

import java.math.BigDecimal;

/*
 * excludes the FOIR/DTI bands and multiplier: 
 * because those columns exist for the scoring engine's internal use only.
 * It is not required to expose calculation criteria
 * 
 */

public record LoanTypeResponseDto(
        Long loanTypeId,
        String loanName,
        LoanCategory category,
        BigDecimal interestRate,
        Integer maxTenureMonths,
        String description
) {
}