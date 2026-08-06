package com.loangauge.financialservice.config;

import com.loangauge.financialservice.entity.LoanCategory;
import com.loangauge.financialservice.entity.LoanType;
import com.loangauge.financialservice.repository.LoanTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class LoanTypeSeeder implements CommandLineRunner {

    private final LoanTypeRepository loanTypeRepository;

    @Override
    public void run(String... args) {
        seedLoanTypes();
    }

    private void seedLoanTypes() {
        seedLoanTypeIfNotFound("Home Loan", LoanCategory.SECURED, "8.50", "7.50", "11.50", 240, "100000", "100000000", 12, "45", "60", "70", "35", "50", "60", "55", "Secured against property");
        seedLoanTypeIfNotFound("Auto Loan", LoanCategory.SECURED, "9.50", "7.50", "14.00", 84, "50000", "5000000", 12, "40", "55", "65", "30", "45", "55", "20", "Secured against vehicle");
        seedLoanTypeIfNotFound("Personal Loan", LoanCategory.UNSECURED, "13.00", "10.00", "24.00", 60, "10000", "4000000", 6, "40", "50", "60", "30", "40", "50", "15", "Unsecured, higher rate");
        seedLoanTypeIfNotFound("Education Loan", LoanCategory.SECURED, "10.00", "8.00", "15.00", 180, "50000", "15000000", 12, "40", "55", "65", "30", "45", "55", "20", "Semi-secured, income-based");
    }

    private void seedLoanTypeIfNotFound(
            String name,
            LoanCategory category,
            String interestRate,
            String minRate,
            String maxRate,
            Integer maxTenure,
            String minAmount,
            String maxAmount,
            Integer minTenure,
            String foirExc,
            String foirAcc,
            String foirCau,
            String dtiLow,
            String dtiMod,
            String dtiHigh,
            String multiplier,
            String description) {

        if (!loanTypeRepository.existsByLoanName(name)) {
            LoanType loanType = LoanType.builder()
                    .loanName(name)
                    .category(category)
                    .interestRate(new BigDecimal(interestRate))
                    .minInterestRate(new BigDecimal(minRate))
                    .maxInterestRate(new BigDecimal(maxRate))
                    .maxTenureMonths(maxTenure)
                    .minLoanAmount(new BigDecimal(minAmount))
                    .maxLoanAmount(new BigDecimal(maxAmount))
                    .minTenureMonths(minTenure)
                    .foirExcellentMax(new BigDecimal(foirExc))
                    .foirAcceptableMax(new BigDecimal(foirAcc))
                    .foirCautionMax(new BigDecimal(foirCau))
                    .dtiLowMax(new BigDecimal(dtiLow))
                    .dtiModerateMax(new BigDecimal(dtiMod))
                    .dtiHighMax(new BigDecimal(dtiHigh))
                    .multiplier(new BigDecimal(multiplier))
                    .description(description)
                    .isActive(true)
                    .build();

            loanTypeRepository.save(loanType);
            log.info("Seeded loan type: {}", name);
        }
    }
}
