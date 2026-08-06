package com.loangauge.financialservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "loan_assessment")
public class LoanAssessment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long assessmentId;

    // Plain Long, not a @ManyToOne to a User entity — financial-service never maps
    // an entity onto a table another service owns (see CLAUDE.md Global Rules #6),
    // even though MySQL physically hosts both in one instance.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_type_id", nullable = false)
    private LoanType loanType;

    @Column(name = "loan_amount", nullable = false)
    private BigDecimal loanAmount;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(name = "interest_rate", nullable = false)
    private BigDecimal interestRate;

    @Column(name = "emi")
    private BigDecimal emi;

    @Column(name = "foir")
    private BigDecimal foir;

    @Column(name = "dti")
    private BigDecimal dti;

    @Column(name = "savings_ratio")
    private BigDecimal savingsRatio;

    @Column(name = "emergency_fund_coverage_months")
    private BigDecimal emergencyFundCoverageMonths;

    @Column(name = "credit_utilization")
    private BigDecimal creditUtilization;

    @Column(name = "disposable_income")
    private BigDecimal disposableIncome;

    @Column(name = "financial_score")
    private Integer financialScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "eligible_amount")
    private BigDecimal eligibleAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AssessmentStatus status = AssessmentStatus.COMPLETED;

    @Builder.Default
    @Column(name = "assessment_date")
    private LocalDateTime assessmentDate = LocalDateTime.now();
}