package com.loangauge.financialservice.repository;

import com.loangauge.financialservice.entity.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {

    List<FinancialGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Fetch a goal while confirming it belongs to the requesting user — never
    // operate on another user's goal.
    Optional<FinancialGoal> findByGoalIdAndUserId(Long goalId, Long userId);
}
