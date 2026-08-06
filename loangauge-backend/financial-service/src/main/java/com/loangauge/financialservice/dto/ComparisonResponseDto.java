package com.loangauge.financialservice.dto;

import java.util.List;

public record ComparisonResponseDto(
        // The compared assessments, oldest-first, so charts read left-to-right in time.
        List<AssessmentResponseDto> assessments,
        // Per-metric trend series (financial score, FOIR, DTI, savings ratio, etc.).
        List<MetricTrendDto> trends,
        // Plain-language summary of how the latest compares to the earliest.
        String summary
) {
}
