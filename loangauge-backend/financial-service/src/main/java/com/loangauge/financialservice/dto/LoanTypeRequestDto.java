package com.loangauge.financialservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanTypeRequestDto {
    @NotBlank
    private String loanName;
    @NotBlank
    private String category;
    @NotNull
    private BigDecimal interestRate;
    
    private BigDecimal minInterestRate;
    private BigDecimal maxInterestRate;
    
    @NotNull
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
    
    @NotNull
    private Boolean isActive;
}
