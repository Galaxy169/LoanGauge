package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.GoalProgressRequestDto;
import com.loangauge.financialservice.dto.GoalRequestDto;
import com.loangauge.financialservice.dto.GoalResponseDto;
import com.loangauge.financialservice.entity.FinancialGoal;
import com.loangauge.financialservice.entity.GoalStatus;
import com.loangauge.financialservice.exception.ResourceNotFoundException;
import com.loangauge.financialservice.mapper.GoalMapper;
import com.loangauge.financialservice.repository.FinancialGoalRepository;
import com.loangauge.financialservice.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private static final Logger log = LoggerFactory.getLogger(GoalServiceImpl.class);

    private final FinancialGoalRepository goalRepository;
    private final GoalMapper goalMapper;

    @Override
    @Transactional
    public GoalResponseDto createGoal(Long userId, GoalRequestDto request) {
        BigDecimal current = request.currentAmount() == null ? BigDecimal.ZERO : request.currentAmount();

        FinancialGoal goal = FinancialGoal.builder()
                .userId(userId)
                .goalName(request.goalName())
                .targetAmount(request.targetAmount())
                .currentAmount(current)
                .targetDate(request.targetDate())
                .status(resolveStatus(current, request.targetAmount()))
                .notes(request.notes())
                .build();

        FinancialGoal saved = goalRepository.save(goal);
        log.info("Created goalId={} for userId={}", saved.getGoalId(), userId);
        return goalMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponseDto> getGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(goalMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponseDto getGoalById(Long userId, Long goalId) {
        return goalMapper.toResponseDto(findOwnedGoal(userId, goalId));
    }

    @Override
    @Transactional
    public GoalResponseDto updateGoal(Long userId, Long goalId, GoalRequestDto request) {
        FinancialGoal goal = findOwnedGoal(userId, goalId);

        BigDecimal current = request.currentAmount() == null ? goal.getCurrentAmount() : request.currentAmount();

        goal.setGoalName(request.goalName());
        goal.setTargetAmount(request.targetAmount());
        goal.setCurrentAmount(current);
        goal.setTargetDate(request.targetDate());
        goal.setNotes(request.notes());
        goal.setStatus(resolveStatus(current, request.targetAmount()));

        FinancialGoal saved = goalRepository.save(goal);
        log.info("Updated goalId={} for userId={}", goalId, userId);
        return goalMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public GoalResponseDto updateProgress(Long userId, Long goalId, GoalProgressRequestDto request) {
        FinancialGoal goal = findOwnedGoal(userId, goalId);
        goal.setCurrentAmount(request.currentAmount());
        goal.setStatus(resolveStatus(request.currentAmount(), goal.getTargetAmount()));
        FinancialGoal saved = goalRepository.save(goal);
        log.info("Updated progress on goalId={} for userId={}", goalId, userId);
        return goalMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        FinancialGoal goal = findOwnedGoal(userId, goalId);
        goalRepository.delete(goal);
        log.info("Deleted goalId={} for userId={}", goalId, userId);
    }

    // ---------- helpers ----------

    private FinancialGoal findOwnedGoal(Long userId, Long goalId) {
        return goalRepository.findByGoalIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found: " + goalId));
    }

    private GoalStatus resolveStatus(BigDecimal current, BigDecimal target) {
        if (current != null && target != null && current.compareTo(target) >= 0) {
            return GoalStatus.COMPLETED;
        }
        return GoalStatus.IN_PROGRESS;
    }
}
