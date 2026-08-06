package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.GoalProgressRequestDto;
import com.loangauge.financialservice.dto.GoalRequestDto;
import com.loangauge.financialservice.dto.GoalResponseDto;
import com.loangauge.financialservice.security.SecurityUtil;
import com.loangauge.financialservice.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@Tag(name = "Financial Goals", description = "Create and track financial savings goals")
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    @Operation(summary = "Create a new financial goal")
    public ResponseEntity<ApiResponse<GoalResponseDto>> createGoal(@Valid @RequestBody GoalRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();
        GoalResponseDto result = goalService.createGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Goal created successfully"));
    }

    @GetMapping
    @Operation(summary = "List all of the caller's goals")
    public ResponseEntity<ApiResponse<List<GoalResponseDto>>> getGoals() {
        Long userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoals(userId)));
    }

    @GetMapping("/{goalId}")
    @Operation(summary = "Get a single goal by ID (only the caller's own)")
    public ResponseEntity<ApiResponse<GoalResponseDto>> getGoal(@PathVariable Long goalId) {
        Long userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoalById(userId, goalId)));
    }

    @PutMapping("/{goalId}")
    @Operation(summary = "Update a goal's details")
    public ResponseEntity<ApiResponse<GoalResponseDto>> updateGoal(
            @PathVariable Long goalId, @Valid @RequestBody GoalRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                goalService.updateGoal(userId, goalId, request), "Goal updated successfully"));
    }

    @PatchMapping("/{goalId}/progress")
    @Operation(summary = "Update a goal's saved amount (progress)")
    public ResponseEntity<ApiResponse<GoalResponseDto>> updateProgress(
            @PathVariable Long goalId, @Valid @RequestBody GoalProgressRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                goalService.updateProgress(userId, goalId, request), "Progress updated"));
    }

    @DeleteMapping("/{goalId}")
    @Operation(summary = "Delete a goal")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long goalId) {
        Long userId = SecurityUtil.getCurrentUserId();
        goalService.deleteGoal(userId, goalId);
        return ResponseEntity.ok(ApiResponse.success(null, "Goal deleted successfully"));
    }
}
