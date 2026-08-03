package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.config.RabbitMQConfig;
import com.loangauge.financialservice.dto.AssessmentRequestDto;
import com.loangauge.financialservice.dto.AssessmentResponseDto;
import com.loangauge.financialservice.dto.ProfileResponseDto; // Member 3's DTO
import com.loangauge.financialservice.entity.LoanAssessment;
import com.loangauge.financialservice.entity.LoanType;
import com.loangauge.financialservice.entity.RiskLevel;
import com.loangauge.financialservice.exception.AssessmentLimitExceededException;
import com.loangauge.financialservice.exception.ResourceNotFoundException;
import com.loangauge.financialservice.exception.ValidationFailedException;
import com.loangauge.financialservice.mapper.AssessmentMapper;
import com.loangauge.financialservice.repository.LoanAssessmentRepository;
import com.loangauge.financialservice.repository.LoanTypeRepository;
import com.loangauge.financialservice.service.AssessmentService;
import com.loangauge.financialservice.service.ProfileService; // Member 3's service
import com.loangauge.financialservice.util.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentServiceImpl.class);

    private final LoanTypeRepository loanTypeRepository;
    private final LoanAssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;
    private final ProfileService profileService;       // Member 3's module (same service)
    private final RabbitTemplate rabbitTemplate;

    @org.springframework.beans.factory.annotation.Value("${loangauge.free-tier-assessment-limit}")
    private int freeTierLimit;

    @Override
    @Transactional
    public AssessmentResponseDto createAssessment(Long userId, AssessmentRequestDto request) {
        log.info("Starting assessment for userId={} loanTypeId={}", userId, request.loanTypeId());

        // 1. Load the selected loan type
        LoanType loanType = loanTypeRepository.findById(request.loanTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan type not found: " + request.loanTypeId()));

        // 2. Business validation against this loan type's configured bounds
        validateAgainstLoanType(request, loanType);

        // 3. Free-tier assessment limit
        // NOTE: this counts ALL past assessments. When subscription-tier info is
        // available (from JWT role or a call to auth/subscription), gate this so only
        // FREE users are limited. For now it enforces the limit for everyone.
        long existingCount = assessmentRepository.countByUserId(userId);
        if (existingCount >= freeTierLimit) {
            throw new AssessmentLimitExceededException(
                    "Free-tier assessment limit of " + freeTierLimit + " reached. Upgrade to Premium for unlimited assessments.");
        }

        // 4. Pull the user's financial profile (Member 3's module).
        //    Confirm this method name + DTO getters with Member 3.
        ProfileResponseDto profile = profileService.getProfileByUserId(userId);
        if (profile == null) {
            throw new ValidationFailedException("Complete your financial profile before running an assessment.");
        }

        // 5. Run all calculators
        LoanAssessment assessment = runCalculations(userId, request, loanType, profile);

        // 6. Persist (immutable history — never updated after creation)
        LoanAssessment saved = assessmentRepository.save(assessment);
        log.info("Saved assessmentId={} score={} risk={}", saved.getAssessmentId(), saved.getFinancialScore(), saved.getRiskLevel());

        // 7. Publish async event → notification-service (AI recommendations, PDF, email)
        publishAssessmentCompleted(saved, userId);

        return assessmentMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentResponseDto getAssessmentById(Long userId, Long assessmentId) {
        LoanAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + assessmentId));
        // Ownership check — never return another user's assessment
        if (!assessment.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Assessment not found: " + assessmentId);
        }
        return assessmentMapper.toResponseDto(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResponseDto> getAssessmentHistory(Long userId) {
        return assessmentRepository.findByUserIdOrderByAssessmentDateDesc(userId)
                .stream()
                .map(assessmentMapper::toResponseDto)
                .toList();
    }

    // ---------- private helpers ----------

    private void validateAgainstLoanType(AssessmentRequestDto request, LoanType loanType) {
        if (request.loanAmount().compareTo(loanType.getMinLoanAmount()) < 0
                || request.loanAmount().compareTo(loanType.getMaxLoanAmount()) > 0) {
            throw new ValidationFailedException(
                    "Loan amount must be between " + loanType.getMinLoanAmount() + " and "
                            + loanType.getMaxLoanAmount() + " for " + loanType.getLoanName());
        }
        if (request.tenureMonths() < loanType.getMinTenureMonths()
                || request.tenureMonths() > loanType.getMaxTenureMonths()) {
            throw new ValidationFailedException(
                    "Tenure must be between " + loanType.getMinTenureMonths() + " and "
                            + loanType.getMaxTenureMonths() + " months for " + loanType.getLoanName());
        }
        if (request.interestRate().compareTo(loanType.getMinInterestRate()) < 0
                || request.interestRate().compareTo(loanType.getMaxInterestRate()) > 0) {
            throw new ValidationFailedException(
                    "Interest rate must be between " + loanType.getMinInterestRate() + "% and "
                            + loanType.getMaxInterestRate() + "% for " + loanType.getLoanName());
        }
    }

    private LoanAssessment runCalculations(Long userId, AssessmentRequestDto request,
                                           LoanType loanType, ProfileResponseDto profile) {
        // --- profile inputs (confirm getter names with Member 3) ---
        BigDecimal monthlyIncome   = profile.monthlyIncome();
        BigDecimal monthlyExpenses = profile.monthlyExpenses();
        BigDecimal existingEmi     = profile.monthlyEmi();
        BigDecimal emergencyFund   = profile.emergencyFund();
        BigDecimal creditUtil      = profile.creditUtilization();
        Integer cibilScore         = profile.cibilScore();
        Integer existingLoans      = profile.existingLoans();
        Integer workExpYears       = profile.workExperienceYears();
        String incomeStability     = profile.incomeStability();
        BigDecimal otherObligations = BigDecimal.ZERO; // profile has no separate field for this yet

        // --- proposed EMI for the requested loan ---
        BigDecimal proposedEmi = EMICalculator.calculateEmi(
                request.loanAmount(), request.interestRate(), request.tenureMonths());

        // --- individual metrics ---
        BigDecimal foir = FOIRCalculator.calculateFoir(monthlyIncome, existingEmi, proposedEmi, otherObligations);
        BigDecimal dti = DTICalculator.calculateDti(monthlyIncome, existingEmi, proposedEmi, otherObligations);
        BigDecimal savingsRatio = SavingsCalculator.calculateSavingsRatio(monthlyIncome, monthlyExpenses);
        BigDecimal emergencyCoverage = SavingsCalculator.calculateEmergencyFundCoverage(emergencyFund, monthlyExpenses);
        BigDecimal disposableIncome = FinancialScoreCalculator.calculateDisposableIncome(monthlyIncome, existingEmi.add(proposedEmi), otherObligations);

        // --- sub-scores (loan-type-aware where applicable) ---
        int foirScore = FOIRCalculator.scoreFoir(foir, loanType.getFoirExcellentMax(), loanType.getFoirAcceptableMax(), loanType.getFoirCautionMax());
        int dtiScore = DTICalculator.scoreDti(dti, loanType.getDtiLowMax(), loanType.getDtiModerateMax(), loanType.getDtiHighMax());
        int savingsScore = SavingsCalculator.scoreSavingsRatio(savingsRatio);
        int emergencyScore = SavingsCalculator.scoreEmergencyFundCoverage(emergencyCoverage);
        int creditUtilScore = FinancialScoreCalculator.scoreCreditUtilization(creditUtil);
        int creditProfileScore = FinancialScoreCalculator.scoreCreditProfile(cibilScore, existingLoans);
        int employmentScore = FinancialScoreCalculator.scoreEmploymentStability(workExpYears, incomeStability);
        int disposableScore = FinancialScoreCalculator.scoreDisposableIncome(disposableIncome, monthlyIncome);

        int finalScore = FinancialScoreCalculator.calculateFinalScore(
                foirScore, dtiScore, creditProfileScore, savingsScore,
                employmentScore, emergencyScore, creditUtilScore, disposableScore);
        RiskLevel riskLevel = FinancialScoreCalculator.classifyRisk(finalScore);

        // --- eligible loan amount ---
        BigDecimal eligibleAmount = EligibilityCalculator.calculateEligibleAmount(
                monthlyIncome, existingEmi,
                loanType.getFoirCautionMax(), // FOIR cap for eligibility = this loan type's caution ceiling
                request.interestRate(), request.tenureMonths(),
                loanType.getMultiplier());

        return LoanAssessment.builder()
                .userId(userId)
                .loanType(loanType)
                .loanAmount(request.loanAmount())
                .tenureMonths(request.tenureMonths())
                .interestRate(request.interestRate())
                .emi(proposedEmi)
                .foir(foir)
                .dti(dti)
                .savingsRatio(savingsRatio)
                .emergencyFundCoverageMonths(emergencyCoverage)
                .creditUtilization(creditUtil)
                .disposableIncome(disposableIncome)
                .financialScore(finalScore)
                .riskLevel(riskLevel)
                .eligibleAmount(eligibleAmount)
                .build();
    }

    private void publishAssessmentCompleted(LoanAssessment saved, Long userId) {
        try {
            Map<String, Object> event = Map.of(
                    "assessmentId", saved.getAssessmentId(),
                    "userId", userId,
                    "financialScore", saved.getFinancialScore(),
                    "riskLevel", saved.getRiskLevel().name()
            );
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ASSESSMENT_COMPLETED_ROUTING_KEY,
                    event);
            log.info("Published assessment.completed event for assessmentId={}", saved.getAssessmentId());
        } catch (Exception e) {
            // Async publish failure must not fail the assessment itself — the user's
            // result is already saved. Log and move on; the AI/PDF/email just won't fire.
            log.error("Failed to publish assessment.completed for assessmentId={}", saved.getAssessmentId(), e);
        }
    }
}