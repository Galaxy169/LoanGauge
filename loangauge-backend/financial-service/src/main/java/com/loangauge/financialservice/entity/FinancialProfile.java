package com.loangauge.financialservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "financial_profile")
public class FinancialProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "age")
    private Integer age;

    @Column(name = "marital_status", length = 30)
    private String maritalStatus;

    @Column(name = "dependents")
    private Integer dependents;

    @Column(name = "city_type", length = 30)
    private String cityType;

    @Column(name = "employment_type", length = 30)
    private String employmentType;

    @Column(name = "work_experience_years")
    private Integer workExperienceYears;

    @Column(name = "income_stability", length = 30)
    private String incomeStability;

    @Column(name = "monthly_income", precision = 12, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "monthly_expenses", precision = 12, scale = 2)
    private BigDecimal monthlyExpenses;

    @Column(name = "existing_loans")
    private Integer existingLoans;

    @Column(name = "monthly_emi", precision = 12, scale = 2)
    private BigDecimal monthlyEmi;

    @Column(name = "credit_card_balance", precision = 12, scale = 2)
    private BigDecimal creditCardBalance;

    @Column(name = "savings", precision = 12, scale = 2)
    private BigDecimal savings;

    @Column(name = "fixed_deposits", precision = 12, scale = 2)
    private BigDecimal fixedDeposits;

    @Column(name = "investments", precision = 12, scale = 2)
    private BigDecimal investments;

    @Column(name = "emergency_fund", precision = 12, scale = 2)
    private BigDecimal emergencyFund;

    @Column(name = "cibil_score")
    private Integer cibilScore;

    @Column(name = "credit_utilization", precision = 5, scale = 2)
    private BigDecimal creditUtilization;

    @Column(name = "notes", length = 255)
    private String notes;

    protected FinancialProfile() {
        // required by JPA
    }

    public FinancialProfile(Long userId) {
        this.userId = userId;
    }

    // Getters and setters

    public Long getProfileId() {
        return profileId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(String maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public Integer getDependents() {
        return dependents;
    }

    public void setDependents(Integer dependents) {
        this.dependents = dependents;
    }

    public String getCityType() {
        return cityType;
    }

    public void setCityType(String cityType) {
        this.cityType = cityType;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Integer getWorkExperienceYears() {
        return workExperienceYears;
    }

    public void setWorkExperienceYears(Integer workExperienceYears) {
        this.workExperienceYears = workExperienceYears;
    }

    public String getIncomeStability() {
        return incomeStability;
    }

    public void setIncomeStability(String incomeStability) {
        this.incomeStability = incomeStability;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public BigDecimal getMonthlyExpenses() {
        return monthlyExpenses;
    }

    public void setMonthlyExpenses(BigDecimal monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

    public Integer getExistingLoans() {
        return existingLoans;
    }

    public void setExistingLoans(Integer existingLoans) {
        this.existingLoans = existingLoans;
    }

    public BigDecimal getMonthlyEmi() {
        return monthlyEmi;
    }

    public void setMonthlyEmi(BigDecimal monthlyEmi) {
        this.monthlyEmi = monthlyEmi;
    }

    public BigDecimal getCreditCardBalance() {
        return creditCardBalance;
    }

    public void setCreditCardBalance(BigDecimal creditCardBalance) {
        this.creditCardBalance = creditCardBalance;
    }

    public BigDecimal getSavings() {
        return savings;
    }

    public void setSavings(BigDecimal savings) {
        this.savings = savings;
    }

    public BigDecimal getFixedDeposits() {
        return fixedDeposits;
    }

    public void setFixedDeposits(BigDecimal fixedDeposits) {
        this.fixedDeposits = fixedDeposits;
    }

    public BigDecimal getInvestments() {
        return investments;
    }

    public void setInvestments(BigDecimal investments) {
        this.investments = investments;
    }

    public BigDecimal getEmergencyFund() {
        return emergencyFund;
    }

    public void setEmergencyFund(BigDecimal emergencyFund) {
        this.emergencyFund = emergencyFund;
    }

    public Integer getCibilScore() {
        return cibilScore;
    }

    public void setCibilScore(Integer cibilScore) {
        this.cibilScore = cibilScore;
    }

    public BigDecimal getCreditUtilization() {
        return creditUtilization;
    }

    public void setCreditUtilization(BigDecimal creditUtilization) {
        this.creditUtilization = creditUtilization;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
