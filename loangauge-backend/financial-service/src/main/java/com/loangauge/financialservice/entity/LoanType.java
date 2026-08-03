package com.loangauge.financialservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "loan_type")
public class LoanType extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_type_id")
    private Long loanTypeId;

    @Column(name = "loan_name", nullable = false)
    private String loanName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private LoanCategory category;

    @Column(name = "interest_rate", nullable = false)
    private BigDecimal interestRate;

    @Column(name = "max_tenure_months", nullable = false)
    private Integer maxTenureMonths;
    
    @Column(name = "min_tenure_months")
    private Integer minTenureMonths;
    
    @Column(name = "min_loan_amount")
    private BigDecimal minLoanAmount;

    @Column(name = "max_loan_amount")
    private BigDecimal maxLoanAmount;

    @Column(name = "min_interest_rate")
    private BigDecimal minInterestRate;

    @Column(name = "max_interest_rate")
    private BigDecimal maxInterestRate;

    @Column(name = "foir_excellent_max")
    private BigDecimal foirExcellentMax;

    @Column(name = "foir_acceptable_max")
    private BigDecimal foirAcceptableMax;

    @Column(name = "foir_caution_max")
    private BigDecimal foirCautionMax;

    @Column(name = "dti_low_max")
    private BigDecimal dtiLowMax;

    @Column(name = "dti_moderate_max")
    private BigDecimal dtiModerateMax;

    @Column(name = "dti_high_max")
    private BigDecimal dtiHighMax;

    @Column(name = "multiplier")
    private BigDecimal multiplier;

    @Column(name = "description")
    private String description;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}