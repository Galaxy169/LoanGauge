package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import java.util.List;

public interface GeminiService {
    List<String> getRecommendations(AssessmentCompletedEvent event) throws Exception;
}