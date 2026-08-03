package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.ProfileResponseDto;
import com.loangauge.financialservice.service.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * TEMPORARY: remove once Member 3's real ProfileService is merged.
 * Returns a fixed, realistic profile so the assessment engine can be built and
 * tested end-to-end. Activated only when the "stub" Spring profile is active
 * (see application.yml note), so it never interferes with the real bean.
 */
@Service
@Primary
@Profile("stub")
public class StubProfileServiceImpl implements ProfileService {

    private static final Logger log = LoggerFactory.getLogger(StubProfileServiceImpl.class);

    @Override
    public ProfileResponseDto getProfileByUserId(Long userId) {
        log.warn("USING STUB PROFILE for userId={} — remove before integration", userId);
        return new ProfileResponseDto(
                1L,                          // profileId
                userId,                      // userId
                32,                          // age
                "MARRIED",                   // maritalStatus
                2,                           // dependents
                "METRO",                     // cityType
                "SALARIED",                  // employmentType
                6,                           // workExperienceYears
                "STABLE",                    // incomeStability
                new BigDecimal("90000"),     // monthlyIncome
                new BigDecimal("45000"),     // monthlyExpenses
                1,                           // existingLoans
                new BigDecimal("12000"),     // monthlyEmi
                new BigDecimal("30000"),     // creditCardBalance
                new BigDecimal("200000"),    // savings
                new BigDecimal("150000"),    // fixedDeposits
                new BigDecimal("100000"),    // investments
                new BigDecimal("300000"),    // emergencyFund
                760,                         // cibilScore
                new BigDecimal("25.00")      // creditUtilization
        );
    }
}