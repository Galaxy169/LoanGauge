package com.loangauge.financialservice.mapper;

import com.loangauge.financialservice.dto.ProfileRequestDto;
import com.loangauge.financialservice.dto.ProfileResponseDto;
import com.loangauge.financialservice.entity.FinancialProfile;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public FinancialProfile toEntity(ProfileRequestDto dto, Long userId) {
        FinancialProfile profile = new FinancialProfile(userId);
        applyToEntity(profile, dto);
        return profile;
    }

    public void applyToEntity(FinancialProfile profile, ProfileRequestDto dto) {
        profile.setAge(dto.age());
        profile.setMaritalStatus(dto.maritalStatus());
        profile.setDependents(dto.dependents());
        profile.setCityType(dto.cityType());
        profile.setEmploymentType(dto.employmentType());
        profile.setWorkExperienceYears(dto.workExperienceYears());
        profile.setIncomeStability(dto.incomeStability());
        profile.setMonthlyIncome(dto.monthlyIncome());
        profile.setMonthlyExpenses(dto.monthlyExpenses());
        profile.setExistingLoans(dto.existingLoans());
        profile.setMonthlyEmi(dto.monthlyEmi());
        profile.setCreditCardBalance(dto.creditCardBalance());
        profile.setSavings(dto.savings());
        profile.setFixedDeposits(dto.fixedDeposits());
        profile.setInvestments(dto.investments());
        profile.setEmergencyFund(dto.emergencyFund());
        profile.setCibilScore(dto.cibilScore());
        profile.setCreditUtilization(dto.creditUtilization());
        profile.setNotes(dto.notes());
    }

    public ProfileResponseDto toResponseDto(FinancialProfile profile) {
        return new ProfileResponseDto(
                profile.getProfileId(),
                profile.getUserId(),
                profile.getAge(),
                profile.getMaritalStatus(),
                profile.getDependents(),
                profile.getCityType(),
                profile.getEmploymentType(),
                profile.getWorkExperienceYears(),
                profile.getIncomeStability(),
                profile.getMonthlyIncome(),
                profile.getMonthlyExpenses(),
                profile.getExistingLoans(),
                profile.getMonthlyEmi(),
                profile.getCreditCardBalance(),
                profile.getSavings(),
                profile.getFixedDeposits(),
                profile.getInvestments(),
                profile.getEmergencyFund(),
                profile.getCibilScore(),
                profile.getCreditUtilization(),
                profile.getNotes(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
