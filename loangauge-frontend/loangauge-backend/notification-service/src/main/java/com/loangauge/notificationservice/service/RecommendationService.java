package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import com.loangauge.notificationservice.entity.Recommendation;

public interface RecommendationService {
    Recommendation generateAndSave(AssessmentCompletedEvent event);
    Recommendation getByAssessmentId(String assessmentId);
}