package com.loangauge.financialservice.dto;

import com.loangauge.financialservice.entity.LoanCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoanTypeResponseDto {
    private Long loanTypeId;
    private String loanName;
    private LoanCategory category;
    private BigDecimal interestRate;
    private BigDecimal minInterestRate;
    private BigDecimal maxInterestRate;
    private Integer maxTenureMonths;
    private BigDecimal minLoanAmount;
    private BigDecimal maxLoanAmount;
    private Integer minTenureMonths;
    private BigDecimal foirExcellentMax;
    private BigDecimal foirAcceptableMax;
    private BigDecimal foirCautionMax;
    private BigDecimal dtiLowMax;
    private BigDecimal dtiModerateMax;
    private BigDecimal dtiHighMax;
    private BigDecimal multiplier;
    private String description;
    private Boolean isActive;
}
