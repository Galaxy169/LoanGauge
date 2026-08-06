package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.DashboardResponseDto;
import com.loangauge.financialservice.dto.LoanTypeRequestDto;
import com.loangauge.financialservice.dto.AdminLoanTypeResponseDto;
import com.loangauge.financialservice.entity.LoanCategory;
import com.loangauge.financialservice.entity.LoanType;
import com.loangauge.financialservice.exception.ResourceNotFoundException;
import com.loangauge.financialservice.repository.AdvisorConsultationRepository;
import com.loangauge.financialservice.repository.FinancialGoalRepository;
import com.loangauge.financialservice.repository.ProfileRepository;
import com.loangauge.financialservice.repository.LoanAssessmentRepository;
import com.loangauge.financialservice.repository.LoanTypeRepository;
import com.loangauge.financialservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final LoanTypeRepository loanTypeRepository;
    private final LoanAssessmentRepository assessmentRepository;
    private final FinancialGoalRepository goalRepository;
    private final AdvisorConsultationRepository consultationRepository;
    private final ProfileRepository profileRepository;

    @Override
    @Transactional
    public AdminLoanTypeResponseDto createLoanType(LoanTypeRequestDto request) {
        LoanType loanType = LoanType.builder()
                .loanName(request.getLoanName())
                .category(LoanCategory.valueOf(request.getCategory()))
                .interestRate(request.getInterestRate())
                .minInterestRate(request.getMinInterestRate())
                .maxInterestRate(request.getMaxInterestRate())
                .maxTenureMonths(request.getMaxTenureMonths())
                .minLoanAmount(request.getMinLoanAmount())
                .maxLoanAmount(request.getMaxLoanAmount())
                .minTenureMonths(request.getMinTenureMonths())
                .foirExcellentMax(request.getFoirExcellentMax())
                .foirAcceptableMax(request.getFoirAcceptableMax())
                .foirCautionMax(request.getFoirCautionMax())
                .dtiLowMax(request.getDtiLowMax())
                .dtiModerateMax(request.getDtiModerateMax())
                .dtiHighMax(request.getDtiHighMax())
                .multiplier(request.getMultiplier())
                .description(request.getDescription())
                .isActive(request.getIsActive())
                .build();
        
        return mapToAdminResponse(loanTypeRepository.save(loanType));
    }

    @Override
    @Transactional
    public AdminLoanTypeResponseDto updateLoanType(Long id, LoanTypeRequestDto request) {
        LoanType loanType = loanTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan Type not found"));

        loanType.setLoanName(request.getLoanName());
        loanType.setCategory(LoanCategory.valueOf(request.getCategory()));
        loanType.setInterestRate(request.getInterestRate());
        loanType.setMinInterestRate(request.getMinInterestRate());
        loanType.setMaxInterestRate(request.getMaxInterestRate());
        loanType.setMaxTenureMonths(request.getMaxTenureMonths());
        loanType.setMinLoanAmount(request.getMinLoanAmount());
        loanType.setMaxLoanAmount(request.getMaxLoanAmount());
        loanType.setMinTenureMonths(request.getMinTenureMonths());
        loanType.setFoirExcellentMax(request.getFoirExcellentMax());
        loanType.setFoirAcceptableMax(request.getFoirAcceptableMax());
        loanType.setFoirCautionMax(request.getFoirCautionMax());
        loanType.setDtiLowMax(request.getDtiLowMax());
        loanType.setDtiModerateMax(request.getDtiModerateMax());
        loanType.setDtiHighMax(request.getDtiHighMax());
        loanType.setMultiplier(request.getMultiplier());
        loanType.setDescription(request.getDescription());
        loanType.setIsActive(request.getIsActive());

        return mapToAdminResponse(loanTypeRepository.save(loanType));
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboardStats() {
        return DashboardResponseDto.builder()
                .totalAssessments(assessmentRepository.count())
                .totalGoals(goalRepository.count())
                .pendingConsultations(consultationRepository.findByStatus("PENDING").size())
                .totalProfiles(profileRepository.count())
                .build();
    }

    private AdminLoanTypeResponseDto mapToAdminResponse(LoanType loanType) {
        return AdminLoanTypeResponseDto.builder()
                .loanTypeId(loanType.getLoanTypeId())
                .loanName(loanType.getLoanName())
                .category(loanType.getCategory())
                .interestRate(loanType.getInterestRate())
                .minInterestRate(loanType.getMinInterestRate())
                .maxInterestRate(loanType.getMaxInterestRate())
                .maxTenureMonths(loanType.getMaxTenureMonths())
                .minLoanAmount(loanType.getMinLoanAmount())
                .maxLoanAmount(loanType.getMaxLoanAmount())
                .minTenureMonths(loanType.getMinTenureMonths())
                .foirExcellentMax(loanType.getFoirExcellentMax())
                .foirAcceptableMax(loanType.getFoirAcceptableMax())
                .foirCautionMax(loanType.getFoirCautionMax())
                .dtiLowMax(loanType.getDtiLowMax())
                .dtiModerateMax(loanType.getDtiModerateMax())
                .dtiHighMax(loanType.getDtiHighMax())
                .multiplier(loanType.getMultiplier())
                .description(loanType.getDescription())
                .isActive(loanType.getIsActive())
                .build();
    }
}
