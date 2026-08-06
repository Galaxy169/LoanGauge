package com.loangauge.financialservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDto {
    private long totalAssessments;
    private long totalGoals;
    private long pendingConsultations;
    private long totalProfiles;
}
