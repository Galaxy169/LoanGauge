package com.loangauge.notificationservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AssessmentCompletedEvent {
    private String assessmentId;
    private String userId;
    private String userEmail;
    private String loanType;
    private BigDecimal loanAmount;
    private BigDecimal foir;
    private BigDecimal dti;
    private Integer financialReadinessScore;
    private String riskCategory;
    private BigDecimal eligibleAmount;
}