package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.GoalProgressRequestDto;
import com.loangauge.financialservice.dto.GoalRequestDto;
import com.loangauge.financialservice.dto.GoalResponseDto;

import java.util.List;

public interface GoalService {

    GoalResponseDto createGoal(Long userId, GoalRequestDto request);

    List<GoalResponseDto> getGoals(Long userId);

    GoalResponseDto getGoalById(Long userId, Long goalId);

    GoalResponseDto updateGoal(Long userId, Long goalId, GoalRequestDto request);

    GoalResponseDto updateProgress(Long userId, Long goalId, GoalProgressRequestDto request);

    void deleteGoal(Long userId, Long goalId);
}
