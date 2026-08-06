package com.loangauge.financialservice.mapper;

import com.loangauge.financialservice.dto.AssessmentResponseDto;
import com.loangauge.financialservice.entity.LoanAssessment;
import org.springframework.stereotype.Component;

/**
 * Converts LoanAssessment database entities into AssessmentResponseDto objects for API responses.
 */

@Component
public class AssessmentMapper {

    public AssessmentResponseDto toResponseDto(LoanAssessment assessment) {
        return new AssessmentResponseDto(
                assessment.getAssessmentId(),
                assessment.getLoanType().getLoanTypeId(),
                assessment.getLoanType().getLoanName(),
                assessment.getLoanAmount(),
                assessment.getTenureMonths(),
                assessment.getInterestRate(),
                assessment.getEmi(),
                assessment.getFoir(),
                assessment.getDti(),
                assessment.getSavingsRatio(),
                assessment.getEmergencyFundCoverageMonths(),
                assessment.getCreditUtilization(),
                assessment.getDisposableIncome(),
                assessment.getFinancialScore(),
                assessment.getRiskLevel(),
                assessment.getEligibleAmount(),
                assessment.getStatus(),
                assessment.getAssessmentDate()
        );
    }
}