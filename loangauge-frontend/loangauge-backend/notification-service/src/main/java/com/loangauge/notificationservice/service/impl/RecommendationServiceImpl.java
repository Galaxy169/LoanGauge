package com.loangauge.notificationservice.service.impl;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import com.loangauge.notificationservice.entity.Recommendation;
import com.loangauge.notificationservice.repository.RecommendationRepository;
import com.loangauge.notificationservice.service.GeminiService;
import com.loangauge.notificationservice.service.RecommendationService;
import com.loangauge.notificationservice.util.RuleBasedRecommender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final GeminiService geminiService;
    private final RuleBasedRecommender ruleBasedRecommender;
    private final RecommendationRepository recommendationRepository;

    @Override
    public Recommendation generateAndSave(AssessmentCompletedEvent event) {
        // Feature Gate: Recommendations (Gemini AI & Rule-based) are exclusive to Premium/Advisor/Admin users.
        // Standard registered users (role: USER) do not get recommendations.
        if ("USER".equalsIgnoreCase(event.getUserRole())) {
            log.info("Recommendations are a Premium feature. Skipping generation for userId={} assessmentId={} (role={})",
                    event.getUserId(), event.getAssessmentId(), event.getUserRole());
            return null;
        }

        List<String> tips;
        String source;

        try {
            tips = geminiService.getRecommendations(event);
            source = "GEMINI";
        } catch (Exception e) {
            log.warn("Gemini API failed for assessmentId={}, falling back to rule-based. Reason: {}",
                    event.getAssessmentId(), e.getMessage());
            tips = ruleBasedRecommender.generate(event);
            source = "RULE_BASED";
        }

        Recommendation recommendation = Recommendation.builder()
                .assessmentId(event.getAssessmentId())
                .userId(event.getUserId())
                .source(source)
                .recommendations(tips)
                .assessmentSnapshot(event)
                .createdAt(LocalDateTime.now())
                .build();

        return recommendationRepository.save(recommendation);
    }

    @Override
    public Recommendation getByAssessmentId(String assessmentId) {
        return recommendationRepository.findByAssessmentId(assessmentId)
                .orElseThrow(() -> new com.loangauge.notificationservice.exception.ResourceNotFoundException(
                        "No recommendations found for assessmentId: " + assessmentId));
    }
}