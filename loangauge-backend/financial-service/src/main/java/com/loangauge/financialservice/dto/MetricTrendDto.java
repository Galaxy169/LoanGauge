package com.loangauge.financialservice.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * One financial metric tracked across the selected assessments, in the same order
 * as the assessments list in the comparison response. Powers the trend charts.
 */
public record MetricTrendDto(
        String metricName,
        List<BigDecimal> values
) {
}
