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
                BigDecimal minInterestRate,
                BigDecimal minLoanAmount,
                BigDecimal maxLoanAmount,
                BigDecimal maxInterestRate,
                Integer minTenureMonths,
                Integer maxTenureMonths,
                String description,
                BigDecimal foirExcellentMax,
                BigDecimal foirAcceptableMax,
                BigDecimal foirCautionMax,
                BigDecimal dtiLowMax,
                BigDecimal dtiModerateMax,
                BigDecimal dtiHighMax,
                BigDecimal multiplier,
                Boolean isActive) {
}

// {
// "loanName": "Home Loan",
// "category": "SECURED",
// "interestRate": 8.5,
// "maxTenureMonths": 27,
// "isActive": true,
// "minInterestRate": null,
// "maxInterestRate": null,
// "minLoanAmount": null,
// "maxLoanAmount": null,
// "minTenureMonths": null,
// "description": "Secured against property",
// "foirExcellentMax": null,
// "foirAcceptableMax": null,
// "foirCautionMax": null,
// "dtiLowMax": null,
// "dtiModerateMax": null,
// "dtiHighMax": null,
// "multiplier": null
// }