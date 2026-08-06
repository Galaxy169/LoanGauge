package com.loangauge.financialservice.mapper;

import com.loangauge.financialservice.dto.LoanTypeResponseDto;
import com.loangauge.financialservice.entity.LoanType;
import org.springframework.stereotype.Component;

/**
 * Converts LoanType database entities into AssessmentResponseDto objects for
 * API responses.
 */
@Component
public class LoanTypeMapper {

    public LoanTypeResponseDto toResponseDto(LoanType loanType) {
        return new LoanTypeResponseDto(
                loanType.getLoanTypeId(),
                loanType.getLoanName(),
                loanType.getCategory(),
                loanType.getInterestRate(),
                loanType.getMinInterestRate(),
                loanType.getMinLoanAmount(),
                loanType.getMaxLoanAmount(),
                loanType.getMaxInterestRate(),
                loanType.getMinTenureMonths(),
                loanType.getMaxTenureMonths(),
                loanType.getDescription(),
                loanType.getFoirExcellentMax(),
                loanType.getFoirAcceptableMax(),
                loanType.getFoirCautionMax(),
                loanType.getDtiLowMax(),
                loanType.getDtiModerateMax(),
                loanType.getDtiHighMax(),
                loanType.getMultiplier(),
                loanType.getIsActive());
    }
}