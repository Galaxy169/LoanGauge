package com.loangauge.notificationservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AssessmentCompletedEvent {

    // --- Identity ---
    private String assessmentId;
    private String userId;
    private String userEmail;
    private String userRole;

    // --- Loan details ---
    private String loanType;
    private BigDecimal loanAmount;
    private Integer tenureMonths;
    private BigDecimal interestRate;
    private BigDecimal proposedEmi;

    // --- Computed metrics ---
    private BigDecimal foir;
    private BigDecimal dti;
    private BigDecimal savingsRatio;
    private BigDecimal emergencyFundCoverageMonths;
    private BigDecimal creditUtilization;
    private BigDecimal disposableIncome;
    private Integer financialReadinessScore;
    private String riskCategory;
    private BigDecimal eligibleAmount;

    // --- Raw profile inputs (for richer, personalised advice) ---
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal existingEmi;
    private BigDecimal savings;
    private BigDecimal fixedDeposits;
    private BigDecimal investments;
    private BigDecimal emergencyFund;
    private Integer cibilScore;
    private Integer existingLoans;
    private String employmentType;
    private String incomeStability;
    private Integer workExperienceYears;
    private Integer age;
    private Integer dependents;
    private String maritalStatus;
}