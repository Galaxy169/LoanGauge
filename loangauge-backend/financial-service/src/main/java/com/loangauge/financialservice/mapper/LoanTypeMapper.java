package com.loangauge.financialservice.mapper;

import com.loangauge.financialservice.dto.LoanTypeResponseDto;
import com.loangauge.financialservice.entity.LoanType;
import org.springframework.stereotype.Component;
/**
 * Converts LoanType database entities into AssessmentResponseDto objects for API responses.
 */
@Component
public class LoanTypeMapper {

    public LoanTypeResponseDto toResponseDto(LoanType loanType) {
        return new LoanTypeResponseDto(
                loanType.getLoanTypeId(),
                loanType.getLoanName(),
                loanType.getCategory(),
                loanType.getInterestRate(),
                loanType.getMaxTenureMonths(),
                loanType.getDescription()
        );
    }
}