package com.loangauge.financialservice.repository;

import com.loangauge.financialservice.entity.AdvisorConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvisorConsultationRepository extends JpaRepository<AdvisorConsultation, Long> {
    List<AdvisorConsultation> findByUserId(Long userId);
    List<AdvisorConsultation> findByAdvisorUserId(Long advisorUserId);
    List<AdvisorConsultation> findByStatus(String status);
}
