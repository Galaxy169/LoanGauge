package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.AssessmentResponseDto;
import com.loangauge.financialservice.dto.ComparisonRequestDto;
import com.loangauge.financialservice.dto.ComparisonResponseDto;
import com.loangauge.financialservice.dto.MetricTrendDto;
import com.loangauge.financialservice.entity.LoanAssessment;
import com.loangauge.financialservice.exception.ValidationFailedException;
import com.loangauge.financialservice.mapper.AssessmentMapper;
import com.loangauge.financialservice.repository.LoanAssessmentRepository;
import com.loangauge.financialservice.service.ComparisonService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComparisonServiceImpl implements ComparisonService {

    private static final Logger log = LoggerFactory.getLogger(ComparisonServiceImpl.class);

    private final LoanAssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;

    @Override
    @Transactional(readOnly = true)
    public ComparisonResponseDto compareAssessments(Long userId, ComparisonRequestDto request) {
        // Fetch only assessments that both match the requested IDs AND belong to the
        // caller — this is the ownership guarantee (never compare another user's data).
        List<LoanAssessment> assessments =
                assessmentRepository.findByAssessmentIdInAndUserId(request.assessmentIds(), userId);

        if (assessments.size() != request.assessmentIds().size()) {
            throw new ValidationFailedException(
                    "One or more selected assessments were not found or do not belong to you.");
        }

        // Oldest-first so charts read left-to-right chronologically.
        assessments.sort(Comparator.comparing(LoanAssessment::getAssessmentDate));

        List<AssessmentResponseDto> dtos = assessments.stream()
                .map(assessmentMapper::toResponseDto)
                .toList();

        List<MetricTrendDto> trends = buildTrends(assessments);
        String summary = buildSummary(assessments);

        log.info("Compared {} assessments for userId={}", assessments.size(), userId);
        return new ComparisonResponseDto(dtos, trends, summary);
    }

    private List<MetricTrendDto> buildTrends(List<LoanAssessment> assessments) {
        List<MetricTrendDto> trends = new ArrayList<>();
        trends.add(new MetricTrendDto("Financial Score",
                assessments.stream().map(a -> toBig(a.getFinancialScore())).toList()));
        trends.add(new MetricTrendDto("FOIR",
                assessments.stream().map(LoanAssessment::getFoir).toList()));
        trends.add(new MetricTrendDto("DTI",
                assessments.stream().map(LoanAssessment::getDti).toList()));
        trends.add(new MetricTrendDto("Savings Ratio",
                assessments.stream().map(LoanAssessment::getSavingsRatio).toList()));
        trends.add(new MetricTrendDto("Emergency Fund Coverage",
                assessments.stream().map(LoanAssessment::getEmergencyFundCoverageMonths).toList()));
        trends.add(new MetricTrendDto("Credit Utilization",
                assessments.stream().map(LoanAssessment::getCreditUtilization).toList()));
        trends.add(new MetricTrendDto("Disposable Income",
                assessments.stream().map(LoanAssessment::getDisposableIncome).toList()));
        trends.add(new MetricTrendDto("Eligible Amount",
                assessments.stream().map(LoanAssessment::getEligibleAmount).toList()));
        return trends;
    }

    private String buildSummary(List<LoanAssessment> assessments) {
        LoanAssessment earliest = assessments.get(0);
        LoanAssessment latest = assessments.get(assessments.size() - 1);

        int scoreDelta = safeInt(latest.getFinancialScore()) - safeInt(earliest.getFinancialScore());

        String direction;
        if (scoreDelta > 0) {
            direction = "improved by " + scoreDelta + " points";
        } else if (scoreDelta < 0) {
            direction = "declined by " + Math.abs(scoreDelta) + " points";
        } else {
            direction = "stayed the same";
        }

        return "Your financial readiness score has " + direction
                + " (from " + safeInt(earliest.getFinancialScore())
                + " to " + safeInt(latest.getFinancialScore())
                + ") across the compared assessments.";
    }

    private BigDecimal toBig(Integer value) {
        return value == null ? BigDecimal.ZERO : BigDecimal.valueOf(value);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}
