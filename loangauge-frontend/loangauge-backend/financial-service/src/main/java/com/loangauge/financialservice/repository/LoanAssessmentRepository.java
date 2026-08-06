package com.loangauge.financialservice.repository;

import com.loangauge.financialservice.entity.LoanAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanAssessmentRepository extends JpaRepository<LoanAssessment, Long> {

    // Full assessment history for a user, most recent first, it is used in both the
    // dashboard history list and the comparison feature (Member 4's module reads
    // this same table for comparison, doesn't duplicate data).
    List<LoanAssessment> findByUserIdOrderByAssessmentDateDesc(Long userId);

    // It is used for Free-tier assessment limit check 
    // "Free users: Only limited number of assessments per period.
    long countByUserId(Long userId);

    // comparison feature needs to fetch specific assessments to confirm they belong to the requesting user
    List<LoanAssessment> findByAssessmentIdInAndUserId(List<Long> assessmentIds, Long userId);
}