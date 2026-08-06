package com.loangauge.financialservice.repository;

import com.loangauge.financialservice.entity.FinancialProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<FinancialProfile, Long> {

    Optional<FinancialProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
