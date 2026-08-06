package com.loangauge.notificationservice.controller;

import com.loangauge.notificationservice.dto.ApiResponse;
import com.loangauge.notificationservice.entity.Recommendation;
import com.loangauge.notificationservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * GET /api/recommendations/{assessmentId}
     *
     * Returns the AI (or rule-based fallback) recommendations for a completed assessment.
     * The frontend calls this after an assessment is created to display personalised tips.
     * Returns 404 if the async event has not been processed yet (rare race condition —
     * the frontend should retry briefly if that happens).
     */
    @GetMapping("/{assessmentId}")
    public ApiResponse<Recommendation> getRecommendations(@PathVariable String assessmentId) {
        return ApiResponse.success(recommendationService.getByAssessmentId(assessmentId));
    }
}
